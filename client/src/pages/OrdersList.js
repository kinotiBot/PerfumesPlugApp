import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
} from '@mui/material';
import { ShoppingBag } from '@mui/icons-material';
import { getUserOrders } from '../features/order/orderSlice';

const OrdersList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { orders, loading, error } = useSelector((state) => state.order);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=orders');
      return;
    }
    
    dispatch(getUserOrders());
  }, [dispatch, isAuthenticated, navigate]);

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

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading your orders...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Orders
        </Typography>
        <Paper sx={{ p: 3 }}>
          <Typography color="error" paragraph>
            {error}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/perfumes"
          >
            Continue Shopping
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Orders
        </Typography>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <ShoppingBag sx={{ fontSize: 60, color: 'grey.500', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            You haven't placed any orders yet
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            When you place an order, it will appear here.
          </Typography>
          <Button
            component={RouterLink}
            to="/perfumes"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Start Shopping
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Orders
      </Typography>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Payment Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>#{order.id}</TableCell>
                  <TableCell>
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>${order.total_price.toFixed(2)}</TableCell>
                  <TableCell>
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
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        order.payment_status === 'pending'
                          ? 'Pending'
                          : order.payment_status === 'paid'
                          ? 'Paid'
                          : order.payment_status === 'failed'
                          ? 'Failed'
                          : 'Refunded'
                      }
                      color={
                        order.payment_status === 'pending'
                          ? 'warning'
                          : order.payment_status === 'paid'
                          ? 'success'
                          : order.payment_status === 'failed'
                          ? 'error'
                          : 'info'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      size="small"
                      component={RouterLink}
                      to={`/orders/${order.id}`}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box sx={{ mt: 3, textAlign: 'right' }}>
        <Button
          variant="contained"
          color="primary"
          component={RouterLink}
          to="/perfumes"
        >
          Continue Shopping
        </Button>
      </Box>
    </Container>
  );
};

export default OrdersList;