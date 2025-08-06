import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Rating,
  Divider,
  TextField,
  Card,
  CardMedia,
  Chip,
  Skeleton,
  IconButton,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  ShoppingCart,
  Add,
  Remove,
  Favorite,
  FavoriteBorder,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import {
  getPerfumeDetails,
  clearPerfumeDetails,
} from '../features/perfume/perfumeSlice';
import { addToCart } from '../features/cart/cartSlice';
import { getImageUrl } from '../utils/api';

// Remove the unused StyledRating variable:
// const StyledRating = styled(Rating)({
//   '& .MuiRating-iconFilled': {
//     color: '#ff6d75',
//   },
//   '& .MuiRating-iconHover': {
//     color: '#ff3d47',
//   },
// });

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const PerfumeDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { perfume, loading, error } = useSelector((state) => state.perfume);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { loading: cartLoading, error: cartError, success: cartSuccess } = useSelector((state) => state.cart);

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const [favorite, setFavorite] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(getPerfumeDetails(id));
    }

    return () => {
      dispatch(clearPerfumeDetails());
    };
  }, [dispatch, id]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= (perfume?.stock || 10)) {
      setQuantity(value);
    }
  };

  const handleIncreaseQuantity = () => {
    if (quantity < (perfume?.stock || 10)) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    if (isAuthenticated) {
      dispatch(addToCart({ perfumeId: perfume.id, quantity }));
    } else {
      navigate('/login?redirect=perfumes/' + id);
    }
  };

  // Handle cart success/error feedback
  useEffect(() => {
    if (cartSuccess) {
      setShowSuccess(true);
      dispatch({ type: 'cart/resetCartSuccess' });
    }
    if (cartError) {
      setShowError(true);
    }
  }, [cartSuccess, cartError, dispatch]);

  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  const handleCloseError = () => {
    setShowError(false);
    dispatch({ type: 'cart/clearCartError' });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFavoriteToggle = () => {
    setFavorite(!favorite);
    // TODO: Implement add to favorites functionality
  };

  if (loading || !perfume) {
    return (
      <Container sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={400} />
            <Box sx={{ display: 'flex', mt: 2 }}>
              {[...Array(4)].map((_, index) => (
                <Skeleton
                  key={index}
                  variant="rectangular"
                  width={80}
                  height={80}
                  sx={{ mr: 1 }}
                />
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="text" height={60} />
            <Skeleton variant="text" height={30} width="60%" />
            <Skeleton variant="text" height={50} width="40%" />
            <Skeleton variant="text" height={100} />
            <Skeleton variant="rectangular" height={50} sx={{ mt: 2 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h5" color="error" align="center">
          Error: {error}
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/perfumes')}
          sx={{ mt: 2, display: 'block', mx: 'auto' }}
        >
          Back to Perfumes
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            {perfume.on_sale && (
              <Chip
                label={`${Math.round(
                  ((perfume.price - perfume.discount_price) / perfume.price) * 100
                )}% OFF`}
                color="error"
                size="small"
                className="price-badge sale-badge"
              />
            )}
            {perfume.featured && (
              <Chip
                label="Featured"
                color="warning"
                size="small"
                className="price-badge featured-badge"
                sx={{ right: perfume.on_sale ? '80px' : '10px' }}
              />
            )}
            <CardMedia
              component="img"
              image={
                perfume.images && perfume.images.length > 0
                  ? getImageUrl(perfume.images[activeImage].image)
                  : getImageUrl(perfume.image)
              }
              alt={perfume.name}
              sx={{ height: 400, objectFit: 'contain' }}
            />
          </Card>
          {perfume.images && perfume.images.length > 1 && (
            <Box sx={{ display: 'flex', mt: 2, overflowX: 'auto' }}>
              {perfume.images.map((image, index) => (
                <Box
                  key={index}
                  onClick={() => setActiveImage(index)}
                  sx={{
                    width: 80,
                    height: 80,
                    mr: 1,
                    border: activeImage === index ? '2px solid' : '1px solid',
                    borderColor: activeImage === index ? 'primary.main' : 'grey.300',
                    cursor: 'pointer',
                  }}
                >
                  <img
                    src={getImageUrl(image.image)}
                    alt={`${perfume.name} - ${index + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>
              ))}
            </Box>
          )}
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" component="h1" gutterBottom className="elegant-title">
              {perfume.name}
            </Typography>
            <IconButton
              color="secondary"
              onClick={handleFavoriteToggle}
              aria-label="add to favorites"
            >
              {favorite ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
          </Box>

          <Typography variant="h6" color="text.secondary" gutterBottom className="brand-name" sx={{ fontSize: '1.1rem' }}>
            {perfume.brand ? perfume.brand.name : ''}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Rating value={4.5} precision={0.5} readOnly />
            <Typography variant="body2" sx={{ ml: 1 }}>
              (4.5) - 24 Reviews
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" color="primary" className="price-text" sx={{ fontWeight: 600 }}>
              RWF {(perfume.discount_price || perfume.price).toLocaleString()}
            </Typography>
            {perfume.on_sale && (
              <Typography
                variant="h6"
                className="price-text"
                sx={{ ml: 2, textDecoration: 'line-through', color: '#A0AEC0', fontWeight: 400 }}
              >
                RWF {perfume.price.toLocaleString()}
              </Typography>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="body1" paragraph>
            {perfume.description}
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Category: {perfume.category ? perfume.category.name : 'N/A'}
            </Typography>
            <Typography variant="subtitle2" gutterBottom>
              Availability: {perfume.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mr: 2 }}>
              Quantity:
            </Typography>
            <IconButton
              size="small"
              onClick={handleDecreaseQuantity}
              disabled={quantity <= 1}
            >
              <Remove />
            </IconButton>
            <TextField
              size="small"
              value={quantity}
              onChange={handleQuantityChange}
              inputProps={{ min: 1, max: perfume.stock, type: 'number' }}
              sx={{ width: 60, mx: 1 }}
            />
            <IconButton
              size="small"
              onClick={handleIncreaseQuantity}
              disabled={quantity >= perfume.stock}
            >
              <Add />
            </IconButton>
          </Box>

          <Button
            variant="contained"
            size="large"
            startIcon={cartLoading ? <CircularProgress size={20} color="inherit" /> : <ShoppingCart />}
            onClick={handleAddToCart}
            disabled={perfume.stock <= 0 || cartLoading}
            fullWidth
          >
            {cartLoading ? 'Adding...' : perfume.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </Grid>
      </Grid>

      <Paper sx={{ mt: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Description" />
          <Tab label="Details" />
          <Tab label="Reviews" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="body1">{perfume.description}</Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <List>
            <ListItem>
              <ListItemText
                primary="Brand"
                secondary={perfume.brand ? perfume.brand.name : 'N/A'}
              />
            </ListItem>
            <Divider component="li" />
            <ListItem>
              <ListItemText
                primary="Category"
                secondary={perfume.category ? perfume.category.name : 'N/A'}
              />
            </ListItem>
            <Divider component="li" />
            <ListItem>
              <ListItemText primary="Volume" secondary="100ml" />
            </ListItem>
            <Divider component="li" />
            <ListItem>
              <ListItemText
                primary="Fragrance Family"
                secondary="Oriental"
              />
            </ListItem>
            <Divider component="li" />
            <ListItem>
              <ListItemText
                primary="Concentration"
                secondary="Eau de Parfum"
              />
            </ListItem>
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="body1" paragraph>
            No reviews yet. Be the first to review this product.
          </Typography>
          <Button variant="outlined" color="primary">
            Write a Review
          </Button>
        </TabPanel>
      </Paper>

      {/* Related Products section would go here */}
      
      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
          Item added to cart successfully!
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {cartError || 'Failed to add item to cart'}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PerfumeDetail;