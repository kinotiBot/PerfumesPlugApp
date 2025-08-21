import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardMedia,
  Chip,
  Container,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
} from '@mui/material';
import { getOrderDetails, cancelOrder, updatePaymentReceived } from '../features/order/orderSlice';
import { getImageUrl } from '../utils/api';

const OrderDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { order, loading, error } = useSelector((state) => state.order);
  const { isAuthenticated, userInfo: user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (id) {
      dispatch(getOrderDetails(id));
    }
  }, [dispatch, id, isAuthenticated, navigate]);

  const handleCancelOrder = () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      dispatch(cancelOrder(id));
    }
  };

  const handlePaymentStatusChange = (event) => {
    const paymentReceived = event.target.value === 'paid';
    
    dispatch(updatePaymentReceived({
      orderId: order.id,
      paymentReceived: paymentReceived
    })).then((result) => {
      // Refresh order details after update
      dispatch(getOrderDetails(id));
    }).catch((error) => {
      console.error('Payment status update error:', error);
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'paid':
        return 'success';
      case 'failed':
        return 'error';
      case 'refunded':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading order details...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Order Details
        </Typography>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error" paragraph>
            {error}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/orders"
          >
            Back to Orders
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Order Details
        </Typography>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Order not found
          </Typography>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/orders"
          >
            Back to Orders
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Order #{order.id}
        </Typography>
        <Button
          variant="outlined"
          component={RouterLink}
          to="/orders"
        >
          Back to Orders
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Order Status</Typography>
              <Chip
                label={
                  order.status === 'pending'
                    ? 'Pending'
                    : order.status === 'processing'
                    ? 'Processing'
                    : order.status === 'shipped'
                    ? 'Shipped'
                    : order.status === 'delivered'
                    ? 'Delivered'
                    : 'Cancelled'
                }
                color={getStatusColor(order.status)}
              />
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Order Date
            </Typography>
            <Typography variant="body1" paragraph>
              {new Date(order.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Typography>

            <Typography variant="subtitle1" gutterBottom>
              Payment Method
            </Typography>
            <Typography variant="body1" paragraph>
              {order.payment_method === 'mobile_money'
                ? 'Mobile Money (+250 798 288 739)'
                : order.payment_method === 'credit_card'
                ? 'Credit Card'
                : order.payment_method === 'paypal'
                ? 'PayPal'
                : 'Cash on Delivery'}
            </Typography>

            <Typography variant="subtitle1" gutterBottom>
              Payment Status
            </Typography>
            {user && user.is_staff ? (
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Payment Status</InputLabel>
                <Select
                  value={order.payment_status === true ? 'paid' : order.payment_status === false ? 'pending' : order.payment_status}
                  label="Payment Status"
                  onChange={handlePaymentStatusChange}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                  <MenuItem value="refunded">Refunded</MenuItem>
                </Select>
              </FormControl>
            ) : (
              <Chip
                label={
                  order.payment_status === 'pending' || order.payment_status === false
                    ? 'Pending'
                    : order.payment_status === 'paid' || order.payment_status === true
                    ? 'Paid'
                    : order.payment_status === 'failed'
                    ? 'Failed'
                    : 'Refunded'
                }
                color={getPaymentStatusColor(order.payment_status)}
                size="small"
              />
            )}
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Shipping Address
            </Typography>
            <Typography variant="body1">
              {order.shipping_address.street_address}
            </Typography>
            <Typography variant="body1">
              {order.shipping_address.city}, {order.shipping_address.state}{' '}
              {order.shipping_address.postal_code}
            </Typography>
            <Typography variant="body1">
              {order.shipping_address.country}
            </Typography>
            <Typography variant="body1">
              Phone: {order.shipping_address.phone}
            </Typography>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Items
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="center">Quantity</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Card sx={{ width: 60, height: 60, mr: 2, flexShrink: 0 }}>
                            <CardMedia
                              component="img"
                              height="60"
                              image={getImageUrl(item.perfume.image)}
                              alt={item.perfume.name}
                              sx={{ objectFit: 'contain' }}
                            />
                          </Card>
                          <Box>
                            <Link
                              component={RouterLink}
                              to={`/perfumes/${item.perfume.id}`}
                              underline="hover"
                              color="inherit"
                            >
                              <Typography variant="subtitle2" className="product-name">
                                {item.perfume.name}
                              </Typography>
                            </Link>
                            <Typography variant="body2" color="textSecondary" className="brand-name" sx={{ fontSize: '0.9rem' }}>
                              {item.perfume.brand ? item.perfume.brand.name : ''}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right" className="price-text">RWF {item.price.toLocaleString()}</TableCell>
                      <TableCell align="center">{item.quantity}</TableCell>
                      <TableCell align="right" className="price-text" sx={{ fontWeight: 600 }}>
                        RWF {(item.price * item.quantity).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mb: 1,
              }}
            >
              <Typography variant="body1">Subtotal</Typography>
              <Typography variant="body1" className="price-text">
                RWF {order.total_price.toLocaleString()}
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mb: 1,
              }}
            >
              <Typography variant="body1">Shipping</Typography>
              <Typography variant="body1">$0.00</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mb: 1,
              }}
            >
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6" color="primary" className="price-text" sx={{ fontWeight: 600 }}>
                RWF {order.total_price.toLocaleString()}
              </Typography>
            </Box>
          </Paper>

          {order.status === 'pending' && (
            <Button
              variant="outlined"
              color="error"
              fullWidth
              onClick={handleCancelOrder}
              sx={{ mb: 2 }}
            >
              Cancel Order
            </Button>
          )}

          <Button
            variant="contained"
            color="primary"
            fullWidth
            component={RouterLink}
            to="/perfumes"
          >
            Continue Shopping
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OrderDetail;