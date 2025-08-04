import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Rating,
  Chip,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Pagination,
  Drawer,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Skeleton,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Search as SearchIcon,
  ShoppingCart,
  FilterList,
  Close,
} from '@mui/icons-material';
import {
  getPerfumes,
  getCategories,
  getBrands,
} from '../features/perfume/perfumeSlice';
import { addToCart } from '../features/cart/cartSlice';
import { getImageUrl } from '../utils/api';

const PerfumeList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { perfumes, categories, brands, loading, page, pages, count } = useSelector(
    (state) => state.perfume
  );
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [ordering, setOrdering] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);

  // Parse query parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const search = queryParams.get('search');
    const category = queryParams.get('category');
    const brand = queryParams.get('brand');
    const sort = queryParams.get('ordering');
    const featured = queryParams.get('featured');
    const onSale = queryParams.get('on_sale');
    const pageParam = queryParams.get('page');

    if (search) setSearchTerm(search);
    if (category) setSelectedCategory(category);
    if (brand) setSelectedBrand(brand);
    if (sort) setOrdering(sort);
    if (featured === 'true') setFeaturedOnly(true);
    if (onSale === 'true') setOnSaleOnly(true);
    if (pageParam) setCurrentPage(parseInt(pageParam));

    // Fetch categories and brands
    dispatch(getCategories());
    dispatch(getBrands());
  }, [dispatch, location.search]);

  // Fetch perfumes when filters change
  useEffect(() => {
    const params = {
      page: currentPage,
    };

    if (searchTerm) params.search = searchTerm;
    if (selectedCategory) params.category = selectedCategory;
    if (selectedBrand) params.brand = selectedBrand;
    if (ordering) params.ordering = ordering;
    if (featuredOnly) params.featured = true;
    if (onSaleOnly) params.on_sale = true;

    dispatch(getPerfumes(params));

    // Update URL with query parameters
    const queryParams = new URLSearchParams();
    if (searchTerm) queryParams.append('search', searchTerm);
    if (selectedCategory) queryParams.append('category', selectedCategory);
    if (selectedBrand) queryParams.append('brand', selectedBrand);
    if (ordering) queryParams.append('ordering', ordering);
    if (featuredOnly) queryParams.append('featured', 'true');
    if (onSaleOnly) queryParams.append('on_sale', 'true');
    if (currentPage > 1) queryParams.append('page', currentPage.toString());

    navigate({
      pathname: '/perfumes',
      search: queryParams.toString(),
    }, { replace: true });
  }, [
    dispatch,
    currentPage,
    searchTerm,
    selectedCategory,
    selectedBrand,
    ordering,
    featuredOnly,
    onSaleOnly,
    navigate,
  ]);

  const handleAddToCart = (perfumeId) => {
    if (isAuthenticated) {
      dispatch(addToCart({ perfumeId, quantity: 1 }));
    } else {
      navigate('/login?redirect=perfumes');
    }
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo(0, 0);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  const handleBrandChange = (e) => {
    setSelectedBrand(e.target.value);
    setCurrentPage(1);
  };

  const handleOrderingChange = (e) => {
    setOrdering(e.target.value);
    setCurrentPage(1);
  };

  const handleFeaturedChange = (e) => {
    setFeaturedOnly(e.target.checked);
    setCurrentPage(1);
  };

  const handleOnSaleChange = (e) => {
    setOnSaleOnly(e.target.checked);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedBrand('');
    setOrdering('');
    setFeaturedOnly(false);
    setOnSaleOnly(false);
    setCurrentPage(1);
  };

  const toggleFilterDrawer = () => {
    setFilterDrawerOpen(!filterDrawerOpen);
  };

  const filterDrawer = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
        <Typography variant="h6">Filters</Typography>
        <IconButton onClick={toggleFilterDrawer}>
          <Close />
        </IconButton>
      </Box>
      <Divider />
      <List>
        <ListItem>
          <FormControl fullWidth size="small">
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              id="category-select"
              value={selectedCategory}
              label="Category"
              onChange={handleCategoryChange}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </ListItem>
        <ListItem>
          <FormControl fullWidth size="small">
            <InputLabel id="brand-label">Brand</InputLabel>
            <Select
              labelId="brand-label"
              id="brand-select"
              value={selectedBrand}
              label="Brand"
              onChange={handleBrandChange}
            >
              <MenuItem value="">All Brands</MenuItem>
              {brands.map((brand) => (
                <MenuItem key={brand.id} value={brand.id}>
                  {brand.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </ListItem>
        <ListItem>
          <FormControl fullWidth size="small">
            <InputLabel id="sort-label">Sort By</InputLabel>
            <Select
              labelId="sort-label"
              id="sort-select"
              value={ordering}
              label="Sort By"
              onChange={handleOrderingChange}
            >
              <MenuItem value="">Default</MenuItem>
              <MenuItem value="price">Price: Low to High</MenuItem>
              <MenuItem value="-price">Price: High to Low</MenuItem>
              <MenuItem value="name">Name: A to Z</MenuItem>
              <MenuItem value="-name">Name: Z to A</MenuItem>
            </Select>
          </FormControl>
        </ListItem>
        <ListItem>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={featuredOnly}
                  onChange={handleFeaturedChange}
                />
              }
              label="Featured Only"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={onSaleOnly}
                  onChange={handleOnSaleChange}
                />
              }
              label="On Sale Only"
            />
          </FormGroup>
        </ListItem>
        <ListItem>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleClearFilters}
            fullWidth
          >
            Clear Filters
          </Button>
        </ListItem>
      </List>
    </Box>
  );

  const renderPerfumeCard = (perfume) => (
    <Grid item xs={12} sm={6} md={4} lg={3} key={perfume.id}>
      <Card className="product-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
          height="200"
          image={perfume.images && perfume.images.length > 0 ? getImageUrl(perfume.images[0].image) : getImageUrl(perfume.image)}
          alt={perfume.name}
          onClick={() => navigate(`/perfumes/${perfume.id}`)}
          sx={{ cursor: 'pointer' }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography
            variant="subtitle1"
            component="div"
            noWrap
            sx={{ cursor: 'pointer', mb: 0.5 }}
            onClick={() => navigate(`/perfumes/${perfume.id}`)}
          >
            <span className="brand-name">{perfume.brand_name || (perfume.brand ? perfume.brand.name : '')}</span>
            <br />
            <span className="product-name">{perfume.name}</span>
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Rating
              name={`rating-${perfume.id}`}
              value={4.5}
              precision={0.5}
              size="small"
              readOnly
            />
            <Typography variant="body2" sx={{ ml: 1 }}>
              (4.5)
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              variant="h6"
              color="primary"
              className="price-text"
              sx={{ fontWeight: 600 }}
            >
              RWF {(perfume.discount_price || perfume.price).toLocaleString()}
            </Typography>
            {perfume.on_sale && (
              <Typography
                variant="body2"
                className="price-text"
                sx={{ ml: 1, textDecoration: 'line-through', color: '#A0AEC0', fontWeight: 400 }}
              >
                RWF {perfume.price.toLocaleString()}
              </Typography>
            )}
          </Box>
        </CardContent>
        <CardActions>
          <Button
            size="small"
            variant="contained"
            startIcon={<ShoppingCart />}
            onClick={() => handleAddToCart(perfume.id)}
            fullWidth
          >
            Add to Cart
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );

  const renderSkeletonCard = (index) => (
    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
      <Card sx={{ height: '100%' }}>
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
    </Grid>
  );

  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Perfumes
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <form onSubmit={handleSearch}>
              <TextField
                fullWidth
                placeholder="Search perfumes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button type="submit" variant="contained" size="small">
                        Search
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />
            </form>
          </Grid>

          {isMobile ? (
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                onClick={toggleFilterDrawer}
              >
                Filters
              </Button>
              <Drawer
                anchor="left"
                open={filterDrawerOpen}
                onClose={toggleFilterDrawer}
              >
                {filterDrawer}
              </Drawer>
            </Grid>
          ) : (
            <>
              <Grid item md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    id="category-select"
                    value={selectedCategory}
                    label="Category"
                    onChange={handleCategoryChange}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel id="brand-label">Brand</InputLabel>
                  <Select
                    labelId="brand-label"
                    id="brand-select"
                    value={selectedBrand}
                    label="Brand"
                    onChange={handleBrandChange}
                  >
                    <MenuItem value="">All Brands</MenuItem>
                    {brands.map((brand) => (
                      <MenuItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel id="sort-label">Sort By</InputLabel>
                  <Select
                    labelId="sort-label"
                    id="sort-select"
                    value={ordering}
                    label="Sort By"
                    onChange={handleOrderingChange}
                  >
                    <MenuItem value="">Default</MenuItem>
                    <MenuItem value="price">Price: Low to High</MenuItem>
                    <MenuItem value="-price">Price: High to Low</MenuItem>
                    <MenuItem value="name">Name: A to Z</MenuItem>
                    <MenuItem value="-name">Name: Z to A</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}
        </Grid>

        {!isMobile && (
          <Box sx={{ display: 'flex', mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={featuredOnly}
                  onChange={handleFeaturedChange}
                />
              }
              label="Featured Only"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={onSaleOnly}
                  onChange={handleOnSaleChange}
                />
              }
              label="On Sale Only"
            />
            <Button
              variant="text"
              color="primary"
              onClick={handleClearFilters}
              sx={{ ml: 2 }}
            >
              Clear Filters
            </Button>
          </Box>
        )}

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {count} {count === 1 ? 'result' : 'results'} found
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {loading
            ? [...Array(8)].map((_, index) => renderSkeletonCard(index))
            : perfumes.map((perfume) => renderPerfumeCard(perfume))}
        </Grid>

        {pages > 1 && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mt: 4,
            }}
          >
            <Pagination
              count={pages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size={isMobile ? 'small' : 'medium'}
            />
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default PerfumeList;
// Remove unused import:
// import { ListItemText } from '@mui/material';

// And remove the unused 'page' variable or use it properly