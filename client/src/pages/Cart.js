import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardMedia,
  Container,
  Divider,
  Grid,
  IconButton,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Add, Delete, Remove, ShoppingCart } from '@mui/icons-material';
import { toast } from 'react-toastify';
import {
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  loadGuestCart,
  updateGuestCartItemAction,
  removeFromGuestCartAction,
  clearGuestCartAction,
} from '../features/cart/cartSlice';
import { getImageUrl } from '../utils/api';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems, cartTotal, loading, error, isGuestCart } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getCart());
    } else {
      // Load guest cart from localStorage
      dispatch(loadGuestCart());
    }
  }, [dispatch, isAuthenticated]);

  const handleQuantityChange = (itemId, currentQuantity, stock, newQuantity) => {
    if (newQuantity < 1) {
      return;
    }

    if (newQuantity > stock) {
      toast.error(`Sorry, only ${stock} items available in stock`);
      return;
    }

    if (newQuantity !== currentQuantity) {
      if (isAuthenticated) {
        dispatch(updateCartItem({ itemId, quantity: newQuantity }));
      } else {
        dispatch(updateGuestCartItemAction({ itemId, quantity: newQuantity }));
      }
    }
  };

  const handleRemoveItem = (itemId) => {
    if (isAuthenticated) {
      dispatch(removeFromCart(itemId));
    } else {
      dispatch(removeFromGuestCartAction(itemId));
    }
  };

  const handleClearCart = () => {
    if (isAuthenticated) {
      dispatch(clearCart());
    } else {
      dispatch(clearGuestCartAction());
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Shopping Cart
        </Typography>
        <Typography>Loading your cart...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Shopping Cart
        </Typography>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Shopping Cart
        </Typography>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <ShoppingCart sx={{ fontSize: 60, color: 'grey.500', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Your cart is empty
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Looks like you haven't added any perfumes to your cart yet.
          </Typography>
          <Button
            component={RouterLink}
            to="/perfumes"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
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
        Shopping Cart
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="center">Quantity</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cartItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Card sx={{ width: 80, height: 80, mr: 2, flexShrink: 0 }}>
                          <CardMedia
                            component="img"
                            height="80"
                            image={
                              (item.perfume_details?.images?.length > 0)
                                ? getImageUrl(item.perfume_details.images[0].image)
                                : (item.perfume?.images?.length > 0)
                                ? getImageUrl(item.perfume.images[0].image)
                                : (item.perfume_details?.image)
                                ? getImageUrl(item.perfume_details.image)
                                : (item.perfume?.image)
                                ? getImageUrl(item.perfume.image)
                                : '/images/placeholder.svg'
                            }
                            alt={(item.perfume_details?.name || item.perfume?.name) || 'Product'}
                            sx={{ objectFit: 'contain' }}
                          />
                        </Card>
                        <Box>
                          <Link
                            component={RouterLink}
                            to={`/perfumes/${(item.perfume_details?.id || item.perfume?.id) || '#'}`}
                            underline="hover"
                            color="inherit"
                          >
                            <Typography variant="subtitle1" className="product-name">
                              {(item.perfume_details || item.perfume) ? (item.perfume_details?.name || item.perfume?.name) : 'Unknown Product'}
                            </Typography>
                          </Link>
                          <Typography variant="body2" color="textSecondary" className="brand-name" sx={{ fontSize: '0.9rem' }}>
                            {(item.perfume_details?.brand?.name || item.perfume?.brand?.name) || ''}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" className="price-text">
                        RWF {((item.perfume_details?.discount_price || item.perfume?.discount_price) || (item.perfume_details?.price || item.perfume?.price) || 0).toLocaleString()}
                      </Typography>
                      {((item.perfume_details?.discount_price || item.perfume?.discount_price)) && (
                        <Typography
                            variant="body2"
                            color="textSecondary"
                            className="price-text"
                            sx={{ textDecoration: 'line-through' }}
                          >
                            RWF {(item.perfume_details?.price || item.perfume?.price || 0).toLocaleString()}
                          </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleQuantityChange(
                              item.id,
                              item.quantity,
                              (item.perfume_details?.stock || item.perfume?.stock) || 0,
                              item.quantity - 1
                            )
                          }
                          disabled={item.quantity <= 1}
                        >
                          <Remove />
                        </IconButton>
                        <TextField
                          size="small"
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              item.id,
                              item.quantity,
                              (item.perfume_details?.stock || item.perfume?.stock) || 0,
                              parseInt(e.target.value) || 1
                            )
                          }
                          inputProps={{
                            min: 1,
                            max: (item.perfume_details?.stock || item.perfume?.stock) || 0,
                            type: 'number',
                            style: { textAlign: 'center' },
                          }}
                          sx={{ width: 60, mx: 1 }}
                        />
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleQuantityChange(
                              item.id,
                              item.quantity,
                              (item.perfume_details?.stock || item.perfume?.stock) || 0,
                              item.quantity + 1
                            )
                          }
                          disabled={item.quantity >= ((item.perfume_details?.stock || item.perfume?.stock) || 0)}
                        >
                          <Add />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" fontWeight="bold" className="price-text">
                        RWF {(
                          item.total || 
                          (item.quantity * ((item.perfume_details?.discount_price || item.perfume?.discount_price) || 
                                           (item.perfume_details?.price || item.perfume?.price) || 0))
                        ).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              component={RouterLink}
              to="/perfumes"
              variant="outlined"
              sx={{ mt: 2 }}
            >
              Continue Shopping
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleClearCart}
              sx={{ mt: 2 }}
            >
              Clear Cart
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
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
                RWF {cartTotal.toLocaleString()}
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
                mb: 2,
              }}
            >
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6" color="primary" className="price-text" sx={{ fontWeight: 600 }}>
                RWF {cartTotal.toLocaleString()}
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              onClick={handleCheckout}
              disabled={cartItems.length === 0}
            >
              Proceed to Checkout
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Cart;