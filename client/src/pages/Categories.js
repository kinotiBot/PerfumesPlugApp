import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Container,
  Skeleton,
  Chip,
} from '@mui/material';
import { 
  Category as CategoryIcon,
  Man as ManIcon,
  Woman as WomanIcon,
  People as PeopleIcon,
  Diamond as LuxuryIcon
} from '@mui/icons-material';
import { getCategories, getPerfumes } from '../features/perfume/perfumeSlice';

const Categories = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { categories, loading } = useSelector((state) => state.perfume);

  useEffect(() => {
    dispatch(getCategories());
    // Fetch perfumes to get category counts
    dispatch(getPerfumes({ page: 1 }));
  }, [dispatch]);

  // Category icon mapping
  const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();
    switch (name) {
      case 'men':
        return <ManIcon sx={{ fontSize: 40, color: 'white' }} />;
      case 'women':
        return <WomanIcon sx={{ fontSize: 40, color: 'white' }} />;
      case 'unisex':
        return <PeopleIcon sx={{ fontSize: 40, color: 'white' }} />;
      case 'luxury':
        return <LuxuryIcon sx={{ fontSize: 40, color: 'white' }} />;
      default:
        return <CategoryIcon sx={{ fontSize: 40, color: 'white' }} />;
    }
  };

  // Sample product counts for demonstration
  const getSampleCount = (categoryName) => {
    const name = categoryName.toLowerCase();
    switch (name) {
      case 'men':
        return 15;
      case 'women':
        return 12;
      case 'unisex':
        return 8;
      case 'luxury':
        return 6;
      default:
        return 5;
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/perfumes?category=${categoryId}`);
  };

  const renderSkeletonCard = (index) => (
    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1, textAlign: 'center', py: 4 }}>
          <Skeleton variant="circular" width={80} height={80} sx={{ mx: 'auto', mb: 2 }} />
          <Skeleton variant="text" height={32} width="80%" sx={{ mx: 'auto', mb: 1 }} />
          <Skeleton variant="text" height={24} width="60%" sx={{ mx: 'auto' }} />
        </CardContent>
        <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Skeleton variant="rectangular" height={36} width={120} />
        </CardActions>
      </Card>
    </Grid>
  );

  const renderCategoryCard = (category) => (
    <Grid item xs={12} sm={6} md={4} lg={3} key={category.id}>
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          }
        }}
      >
        <CardContent sx={{ flexGrow: 1, textAlign: 'center', py: 4 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            {getCategoryIcon(category.name)}
          </Box>
          <Typography 
            variant="h6" 
            component="h3" 
            gutterBottom
            sx={{ fontWeight: 600, color: 'text.primary' }}
          >
            {category.name}
          </Typography>
          
          <Chip
            label={`${getSampleCount(category.name)} Products`}
            size="small"
            sx={{
              mb: 2,
              background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
              color: 'white',
              fontWeight: 500,
            }}
          />
          
          {category.description && (
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              {category.description}
            </Typography>
          )}
        </CardContent>
        <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant="contained"
            onClick={() => handleCategoryClick(category.id)}
            sx={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)',
              },
              borderRadius: 2,
              px: 3,
            }}
          >
            Browse Products
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontFamily: '"Cormorant Garamond", serif',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            Perfume Categories
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto' }}
          >
            Discover our curated collection of fragrances organized by category. 
            Find the perfect scent that matches your style and personality.
          </Typography>
        </Box>

        {/* Categories Grid */}
        <Grid container spacing={3}>
          {loading ? (
            // Show skeleton cards while loading
            Array.from({ length: 4 }).map((_, index) => renderSkeletonCard(index))
          ) : categories.length > 0 ? (
            // Show actual categories
            categories.map((category) => renderCategoryCard(category))
          ) : (
            // Show empty state
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <CategoryIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h5" color="text.secondary" gutterBottom>
                  No Categories Available
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Categories will appear here once they are added to the system.
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
        
        {/* Sample Products Preview */}
        {categories.length > 0 && (
          <Box sx={{ mt: 8 }}>
            <Typography 
              variant="h4" 
              component="h2" 
              gutterBottom
              sx={{ 
                fontFamily: '"Cormorant Garamond", serif',
                fontWeight: 600,
                textAlign: 'center',
                mb: 4,
              }}
            >
              Featured Products by Category
            </Typography>
            
            <Grid container spacing={3}>
              {/* Sample products for each category */}
              {categories.slice(0, 2).map((category) => (
                <Grid item xs={12} md={6} key={`sample-${category.id}`}>
                  <Card 
                    sx={{ 
                      p: 3,
                      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)',
                      border: '1px solid rgba(139, 92, 246, 0.1)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2,
                        }}
                      >
                        {getCategoryIcon(category.name)}
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {category.name} Collection
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Discover our curated selection of {category.name.toLowerCase()} fragrances, 
                      featuring premium brands and exclusive scents.
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                      {category.name.toLowerCase() === 'men' && [
                        'Tom Ford Oud Wood',
                        'Creed Royal Oud',
                        'Amouage Interlude'
                      ].map((product) => (
                        <Chip 
                          key={product}
                          label={product}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                      
                      {category.name.toLowerCase() === 'women' && [
                        'Chanel No. 5',
                        'Dior J\'adore',
                        'Yves Saint Laurent'
                      ].map((product) => (
                        <Chip 
                          key={product}
                          label={product}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                      
                      {category.name.toLowerCase() === 'luxury' && [
                        'Amouage Jubilation XXV',
                        'Tom Ford Private Blend',
                        'Creed Aventus'
                      ].map((product) => (
                        <Chip 
                          key={product}
                          label={product}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                      
                      {category.name.toLowerCase() === 'unisex' && [
                        'Le Labo Santal 33',
                        'Byredo Gypsy Water',
                        'Maison Margiela REPLICA'
                      ].map((product) => (
                        <Chip 
                          key={product}
                          label={product}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                    
                    <Button
                      variant="outlined"
                      onClick={() => handleCategoryClick(category.id)}
                      sx={{
                        borderColor: '#8B5CF6',
                        color: '#8B5CF6',
                        '&:hover': {
                          borderColor: '#7C3AED',
                          backgroundColor: 'rgba(139, 92, 246, 0.08)',
                        },
                      }}
                    >
                      View All {category.name} Products
                    </Button>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Categories;