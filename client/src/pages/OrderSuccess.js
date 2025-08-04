import React, { useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Divider,
  CheckCircleOutline,
} from '@mui/material';
import { green } from '@mui/material/colors';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { order, success } = useSelector((state) => state.order);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!success && !order) {
      navigate('/cart');
    }
  }, [isAuthenticated, navigate, success, order]);

  if (!order) {
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <CheckCircleOutline
          sx={{ fontSize: 80, color: green[500], mb: 2 }}
        />
        <Typography variant="h4" gutterBottom>
          Thank You for Your Order!
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" paragraph>
          Your order has been placed successfully. We've sent a confirmation
          email with all the details.
        </Typography>

        <Box
          sx={{
            backgroundColor: 'grey.100',
            p: 3,
            borderRadius: 1,
            mt: 3,
            mb: 4,
            textAlign: 'left',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Order Summary
          </Typography>
          <Typography variant="body1" gutterBottom>
            Order Number: <strong>#{order.id}</strong>
          </Typography>
          <Typography variant="body1" gutterBottom>
            Order Date:{' '}
            <strong>
              {new Date(order.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </strong>
          </Typography>
          <Typography variant="body1" gutterBottom>
            Payment Method:{' '}
            <strong>
              {order.payment_method === 'credit_card'
                ? 'Credit Card'
                : order.payment_method === 'paypal'
                ? 'PayPal'
                : 'Cash on Delivery'}
            </strong>
          </Typography>
          <Typography variant="body1" gutterBottom>
            Order Status:{' '}
            <strong>
              {order.status === 'pending'
                ? 'Pending'
                : order.status === 'processing'
                ? 'Processing'
                : order.status === 'shipped'
                ? 'Shipped'
                : order.status === 'delivered'
                ? 'Delivered'
                : 'Cancelled'}
            </strong>
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Order Items
          </Typography>
          {order.items.map((item) => (
            <Box
              key={item.id}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mb: 1,
              }}
            >
              <Typography variant="body1">
                {item.perfume.name} x {item.quantity}
              </Typography>
              <Typography variant="body1">
                ${(item.price * item.quantity).toFixed(2)}
              </Typography>
            </Box>
          ))}

          <Divider sx={{ my: 2 }} />

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mb: 1,
            }}
          >
            <Typography variant="body1">Subtotal</Typography>
            <Typography variant="body1">
              ${order.total_price.toFixed(2)}
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
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mt: 2,
            }}
          >
            <Typography variant="h6">Total</Typography>
            <Typography variant="h6" color="primary">
              ${order.total_price.toFixed(2)}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to={`/orders/${order.id}`}
          >
            View Order Details
          </Button>
          <Button
            variant="outlined"
            color="primary"
            component={RouterLink}
            to="/perfumes"
          >
            Continue Shopping
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default OrderSuccess;