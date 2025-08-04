import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Paper,
  Radio,
  RadioGroup,
  Step,
  StepLabel,
  Stepper,
  Typography,
  CircularProgress,
} from '@mui/material';
import { getCart } from '../features/cart/cartSlice';
import { createOrder, clearOrderError, resetOrderSuccess } from '../features/order/orderSlice';

const steps = ['Payment Method', 'Review Order'];

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('mobile_money');
  
  const { cartItems, cartTotal, loading: cartLoading } = useSelector((state) => state.cart);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { loading: orderLoading, success: orderSuccess, error: orderError } = useSelector((state) => state.order);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=checkout');
      return;
    }
    
    // Clear any previous order state when entering checkout
    dispatch(clearOrderError());
    dispatch(resetOrderSuccess());
    dispatch(getCart());
  }, [dispatch, isAuthenticated, navigate]);

  useEffect(() => {
    if (orderSuccess) {
      // Show confirmation message
      toast.success('Order placed successfully! Thank you for your purchase.');
      // Reset success state
      dispatch(resetOrderSuccess());
      // Redirect to home page
      navigate('/');
    }
  }, [orderSuccess, navigate, dispatch]);

  useEffect(() => {
    if (orderError) {
      // Show error message
      toast.error(`Order failed: ${orderError}`);
      
      // Clear error state after showing
      dispatch(clearOrderError());
      
      // If session expired, redirect to login
      if (orderError.includes('session has expired') || orderError.includes('log in')) {
        navigate('/login?redirect=checkout');
      }
    }
  }, [orderError, navigate, dispatch]);

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handlePlaceOrder();
      return;
    }
    
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handlePlaceOrder = () => {
    console.log('handlePlaceOrder called');
    console.log('cartItems:', cartItems);
    console.log('cartTotal:', cartTotal);
    console.log('paymentMethod:', paymentMethod);
    
    // Calculate order totals - ensure cartTotal is a number
    const subtotal = Number(cartTotal) || 0;
    const tax = subtotal * 0.1; // 10% tax
    const shipping = 0; // Free shipping
    const total = subtotal + tax + shipping;

    const orderData = {
      payment_method: paymentMethod,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      shipping: shipping.toFixed(2),
      total: total.toFixed(2),
    };
    
    console.log('Order data:', orderData);
    console.log('Dispatching createOrder...');
    
    dispatch(createOrder(orderData));
  };



  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Payment Method
            </Typography>
            <FormControl component="fieldset">
              <FormLabel component="legend">Select a payment method</FormLabel>
              <RadioGroup
                aria-label="payment method"
                name="payment_method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <FormControlLabel
                  value="mobile_money"
                  control={<Radio />}
                  label="Mobile Money (Rwanda: +250 798 288 739, *182*1*1#)"
                />
              </RadioGroup>
            </FormControl>
            {paymentMethod === 'mobile_money' && (
              <Paper sx={{ mt: 3, p: 2, bgcolor: '#f8f9fa' }}>
                <Typography variant="subtitle1" gutterBottom color="primary">
                  Mobile Money Payment Instructions
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Payment Number:</strong> +250 798 288 739
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>USSD Code:</strong> *182*1*1#
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  After placing your order, you will receive payment instructions via SMS. 
                  Please complete the mobile money payment within 30 minutes to confirm your order.
                </Typography>
              </Paper>
            )}

          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            {cartItems && cartItems.length > 0 && (
              <>
                <Paper sx={{ p: 2, mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Items ({cartItems.length})
                  </Typography>
                  {cartItems.map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 1,
                      }}
                    >
                      <Typography variant="body1">
                        {item.perfume_details.name} x {item.quantity}
                      </Typography>
                      <Typography variant="body1">
                        RWF {item.total.toLocaleString()}
                      </Typography>
                    </Box>
                  ))}
                </Paper>

                <Paper sx={{ p: 2, mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Payment Method
                  </Typography>
                  <Typography variant="body1">
                    Mobile Money (+250 798 288 739)
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Order Total
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography variant="body1">Subtotal</Typography>
                    <Typography variant="body1">
                      RWF {Number(cartTotal || 0).toLocaleString()}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 1 }} />
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography variant="h6">Total</Typography>
                    <Typography variant="h6" color="primary">
                      RWF {Number(cartTotal || 0).toLocaleString()}
                    </Typography>
                  </Box>
                </Paper>
              </>
            )}
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  if (cartLoading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading your cart...
        </Typography>
      </Container>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Checkout
        </Typography>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Your cart is empty
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/perfumes')}
          >
            Continue Shopping
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Checkout
      </Typography>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper sx={{ p: 3, mb: 3 }}>{getStepContent(activeStep)}</Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        {activeStep !== 0 && (
          <Button onClick={handleBack} sx={{ mr: 1 }}>
            Back
          </Button>
        )}
        <Button
          variant="contained"
          color="primary"
          onClick={handleNext}
          disabled={orderLoading}
        >
          {orderLoading ? (
            <CircularProgress size={24} />
          ) : activeStep === steps.length - 1 ? (
            'Place Order'
          ) : (
            'Next'
          )}
        </Button>
      </Box>
    </Container>
  );
};

export default Checkout;