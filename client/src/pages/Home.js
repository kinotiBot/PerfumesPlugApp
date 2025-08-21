import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Rating,
  Chip,
  Skeleton,
  Container,
  Paper,
} from '@mui/material';
// Remove this unused import:
// import { Favorite } from '@mui/icons-material';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import {
  getFeaturedPerfumes,
  getOnSalePerfumes,
} from '../features/perfume/perfumeSlice';
import { addToCart, addToGuestCartAction } from '../features/cart/cartSlice';

import OptimizedImage from '../components/common/OptimizedImage';
import { LocalShipping, VerifiedUser, SupportAgent, Security, ShoppingCart } from '@mui/icons-material';
import AdminWelcome from '../components/admin/AdminWelcome';

const Home = () => {
  const dispatch = useDispatch();
  const { featuredPerfumes, onSalePerfumes, loading } = useSelector(
    (state) => state.perfume
  );
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getFeaturedPerfumes());
    dispatch(getOnSalePerfumes());
  }, [dispatch]);

  const handleAddToCart = (perfume) => {
    if (isAuthenticated) {
      dispatch(addToCart({ perfumeId: perfume.id, quantity: 1 }));
    } else {
      dispatch(addToGuestCartAction({ perfume, quantity: 1 }));
    }
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 900,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
        },
      },
    ],
  };

  const renderPerfumeCard = (perfume) => (
    <Card
      key={perfume.id}
      className="product-card luxury-transition"
      sx={{ 
        m: 1, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        border: '1px solid rgba(255, 215, 0, 0.2)',
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-4px) scale(1.01)',
          boxShadow: '0 10px 20px rgba(255, 215, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.1)',
          borderColor: 'rgba(255, 215, 0, 0.3)',
        }
      }}
    >
      {perfume.on_sale && (
        <Chip
          label={`${Math.round(
            ((perfume.regular_price - perfume.price) / perfume.regular_price) * 100
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
      <OptimizedImage
        src={perfume.image}
        alt={perfume.name}
        height={200}
        sx={{
          transition: 'transform 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)',
          }
        }}
      />
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography variant="h6" component="div" sx={{ mb: 1, lineHeight: 1.3 }}>
          <span className="brand-name" style={{ color: '#FFD700', fontWeight: 600, fontSize: '0.9rem' }}>
            {perfume.brand ? perfume.brand.name : ''}
          </span>
          <br />
          <span className="product-name" style={{ color: '#1F2937', fontWeight: 700 }}>
            {perfume.name}
          </span>
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Rating
            name={`rating-${perfume.id}`}
            value={4.5}
            precision={0.5}
            size="small"
            readOnly
            sx={{
              '& .MuiRating-iconFilled': {
                color: '#FFD700',
              }
            }}
          />
          <Typography variant="body2" sx={{ ml: 1, color: '#6B7280', fontWeight: 500 }}>
            (4.5)
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography
            variant="h5"
            className="price-text"
            sx={{ 
              fontWeight: 700,
              color: '#FFD700',
              textShadow: '0 2px 4px rgba(255, 215, 0, 0.2)'
            }}
          >
            RWF {perfume.price.toLocaleString()}
          </Typography>
          {perfume.on_sale && (
            <Typography
              variant="body2"
              className="price-text"
              sx={{ 
                ml: 2, 
                textDecoration: 'line-through', 
                color: '#B0B0B0', 
                fontWeight: 500,
                fontSize: '0.9rem'
              }}
            >
              RWF {perfume.regular_price.toLocaleString()}
            </Typography>
          )}
        </Box>
      </CardContent>
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          size="large"
          variant="contained"
          startIcon={<ShoppingCart />}
          onClick={() => handleAddToCart(perfume)}
          fullWidth
          sx={{
            backgroundColor: '#1A1A1A',
            color: '#FFD700',
            border: '2px solid #FFD700',
            fontWeight: 700,
            py: 1,
            borderRadius: 2,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              backgroundColor: '#2A2A2A',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(255, 215, 0, 0.4)',
            },
            '&:active': {
              transform: 'translateY(0)',
            }
          }}
        >
          Add to Cart
        </Button>
      </CardActions>
    </Card>
  );

  const renderSkeletonCard = () => (
    <Card sx={{ m: 1, height: '100%' }}>
      <Skeleton variant="rectangular" height={200} />
      <CardContent>
        <Skeleton variant="text" height={30} />
        <Skeleton variant="text" height={30} width="60%" />
        <Skeleton variant="text" height={30} width="40%" />
      </CardContent>
      <CardActions>
        <Skeleton variant="rectangular" height={36} width="100%" />
      </CardActions>
    </Card>
  );

  return (
    <Box>
      {/* Admin Welcome Section for Staff Users */}
      <AdminWelcome />
      {/* Hero Section */}
      <Paper
        sx={{
          position: 'relative',
          backgroundColor: '#000000',
          color: '#fff',
          mb: 6,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          background: 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 50%, #1A1A1A 100%)',
          borderRadius: 3,
          overflow: 'hidden',
          minHeight: 500,
        }}
      >
        <div className="hero-particles"></div>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            backgroundColor: 'rgba(0,0,0,.4)',
          }}
        />
        <Grid container>
          <Grid item md={6}>
            <Box
              sx={{
                position: 'relative',
                p: { xs: 3, md: 6 },
                pr: { md: 0 },
                minHeight: 300,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <Typography
                component="h1"
                variant="h1"
                color="inherit"
                gutterBottom
                className="elegant-title"
                sx={{ 
                  fontSize: { xs: '2rem', md: '3rem' },
                  background: 'linear-gradient(135deg, #FFD700, #FFED4A)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  textShadow: '0 4px 8px rgba(0,0,0,0.3)'
                }}
              >
                Discover Your <span style={{ color: '#FFD700' }}>Signature</span> Scent
              </Typography>
              <Typography 
                variant="h5" 
                color="inherit" 
                paragraph
                className="subtitle-elegant"
                sx={{ 
                  color: '#F8F8F8', 
                  fontWeight: 400, 
                  fontSize: { xs: '0.95rem', md: '1.2rem' },
                  lineHeight: 1.4,
                  mb: 4
                }}
              >
                Explore our collection of <span style={{ color: '#FFD700', fontWeight: 600 }}>premium fragrances</span> at unbeatable prices.
                Find the perfect perfume that tells your unique story.
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                component={RouterLink}
                to="/perfumes"
                sx={{ mt: 2, alignSelf: 'flex-start' }}
              >
                Shop Now
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Featured Products */}
      <Box sx={{ mb: 8 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Typography 
            variant="h4" 
            component="h2"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #FFD700, #F59E0B)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Featured Products
          </Typography>
          <Button
            component={RouterLink}
            to="/perfumes?featured=true"
            variant="outlined"
            sx={{
              borderColor: '#FFD700',
              color: '#FFD700',
              '&:hover': {
                borderColor: '#FFED4A',
                backgroundColor: 'rgba(255, 215, 0, 0.1)',
              }
            }}
          >
            View All
          </Button>
        </Box>
        {loading ? (
          <Slider {...sliderSettings}>
            {[...Array(4)].map((_, index) => (
              <div key={index}>{renderSkeletonCard()}</div>
            ))}
          </Slider>
        ) : (
          <Slider {...sliderSettings}>
            {featuredPerfumes.map((perfume) => (
              <div key={perfume.id}>{renderPerfumeCard(perfume)}</div>
            ))}
          </Slider>
        )}
      </Box>

      {/* Gold Divider */}
      <div className="gold-divider"></div>

      {/* On Sale Products */}
      <Box sx={{ mb: 8 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Typography 
            variant="h4" 
            component="h2"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #FFD700, #F59E0B)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            On Sale
          </Typography>
          <Button
            component={RouterLink}
            to="/perfumes?on_sale=true"
            variant="outlined"
            sx={{
              borderColor: '#FFD700',
              color: '#FFD700',
              '&:hover': {
                borderColor: '#FFED4A',
                backgroundColor: 'rgba(255, 215, 0, 0.1)',
              }
            }}
          >
            View All
          </Button>
        </Box>
        {loading ? (
          <Slider {...sliderSettings}>
            {[...Array(4)].map((_, index) => (
              <div key={index}>{renderSkeletonCard()}</div>
            ))}
          </Slider>
        ) : (
          <Slider {...sliderSettings}>
            {onSalePerfumes.map((perfume) => (
              <div key={perfume.id}>{renderPerfumeCard(perfume)}</div>
            ))}
          </Slider>
        )}
      </Box>

      {/* Categories Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
          Shop by Category
        </Typography>
        <Grid container spacing={3}>
          {[
            { name: 'Men', image: '/images/men-category.svg' },
            { name: 'Women', image: '/images/women-category.svg' },
            { name: 'Unisex', image: '/images/unisex-category.svg' },
            { name: 'Luxury', image: '/images/luxury-category.svg' }
          ].map((category) => (
            <Grid item xs={12} sm={6} md={3} key={category.name}>
              <Paper
                sx={{
                  position: 'relative',
                  height: 200,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundImage: `url(${category.image})`,
                  borderRadius: 2,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
                component={RouterLink}
                to={`/perfumes?category=${category.name.toLowerCase()}`}
              >
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Benefits Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
          Why Choose Us
        </Typography>
        <Grid container spacing={3}>
          {[
            {
              title: 'Authentic Products',
              description: '100% authentic products sourced directly from brands',
            },
            {
              title: 'Free Shipping',
              description: 'Free shipping on all orders over $50',
            },
            {
              title: 'Easy Returns',
              description: '30-day hassle-free return policy',
            },
            {
              title: 'Secure Payment',
              description: 'Multiple secure payment options',
            },
          ].map((benefit, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 3,
                  textAlign: 'center',
                }}
              >
                <Typography variant="h6" component="h3" gutterBottom>
                  {benefit.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {benefit.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Value Proposition Section - Add this after hero section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ pr: { md: 4 } }}>
              <Typography
                variant="h4"
                component="h2"
                className="elegant-title"
                sx={{ mb: 3, color: 'text.primary' }}
              >
                Why Choose Perfumes Plug Rwanda?
              </Typography>
              <Typography
                variant="body1"
                className="subtitle-elegant"
                sx={{ mb: 4, lineHeight: 1.6 }}
              >
                We're committed to bringing you authentic, premium fragrances 
                at unbeatable prices, with exceptional service that makes 
                every purchase a delightful experience.
              </Typography>
              <Button
                variant="contained"
                size="large"
                component={RouterLink}
                to="/perfumes"
                sx={{
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                  color: '#0A0A0A',
                  py: 1.5,
                  px: 4,
                  borderRadius: 2,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #FFED4A 0%, #FF8C00 100%)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Explore Collection
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Grid container spacing={3}>
              {[
                {
                  icon: <LocalShipping sx={{ fontSize: 40, color: 'primary.main' }} />,
                  title: 'Free Delivery',
                  subtitle: 'On orders over 50,000 RWF',
                  description: 'Fast and reliable delivery across Rwanda'
                },
                {
                  icon: <VerifiedUser sx={{ fontSize: 40, color: 'primary.main' }} />,
                  title: '100% Authentic',
                  subtitle: 'Genuine products guaranteed',
                  description: 'Sourced directly from authorized distributors'
                },
                {
                  icon: <SupportAgent sx={{ fontSize: 40, color: 'primary.main' }} />,
                  title: 'Expert Support',
                  subtitle: 'Fragrance consultations available',
                  description: 'Get personalized recommendations from our experts'
                },
                {
                  icon: <Security sx={{ fontSize: 40, color: 'primary.main' }} />,
                  title: 'Secure Payment',
                  subtitle: 'Multiple payment options',
                  description: 'Safe and secure checkout process'
                }
              ].map((feature, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card
                    sx={{
                      p: 3,
                      height: '100%',
                      border: '1px solid rgba(0, 0, 0, 0.06)',
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
                        borderColor: 'primary.main',
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                      <Box sx={{ mb: 2 }}>
                        {feature.icon}
                      </Box>
                      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 500 }}>
                        {feature.subtitle}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                        {feature.description}
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;