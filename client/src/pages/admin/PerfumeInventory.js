import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Fab,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  Search,
  Clear,
  CheckCircle,
  Cancel,
  Inventory,
  TrendingUp,
  Warning,
  PhotoCamera,
} from '@mui/icons-material';
import { getAllPerfumes, getCategories, getBrands } from '../../features/perfume/perfumeSlice';
import AdminLayout from '../../components/admin/AdminLayout';

const PerfumeInventory = () => {
  const dispatch = useDispatch();
  
  const { perfumes, categories, brands, loading, error } = useSelector(
    (state) => state.perfume
  );

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPerfume, setSelectedPerfume] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterStock, setFilterStock] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder] = useState('asc');
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    price: '',
    regular_price: '',
    stock: '',
    description: '',
    featured: false,
    on_sale: false,
    image: null,
  });

  useEffect(() => {
    dispatch(getAllPerfumes());
    dispatch(getCategories());
    dispatch(getBrands());
  }, [dispatch]);

  // Filter and sort perfumes
  const filteredPerfumes = React.useMemo(() => {
    if (!Array.isArray(perfumes)) return [];
    
    let filtered = perfumes.filter((perfume) => {
      const matchesSearch = perfume.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (perfume.brand?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !filterCategory || perfume.category?.id === parseInt(filterCategory);
      const matchesBrand = !filterBrand || perfume.brand?.id === parseInt(filterBrand);
      const matchesStock = filterStock === 'all' || 
                          (filterStock === 'low' && perfume.stock <= 10) ||
                          (filterStock === 'out' && perfume.stock === 0) ||
                          (filterStock === 'available' && perfume.stock > 0);
      
      return matchesSearch && matchesCategory && matchesBrand && matchesStock;
    });

    // Sort perfumes
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = parseFloat(a.price);
          bValue = parseFloat(b.price);
          break;
        case 'stock':
          aValue = a.stock;
          bValue = b.stock;
          break;
        case 'brand':
          aValue = (a.brand?.name || '').toLowerCase();
          bValue = (b.brand?.name || '').toLowerCase();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [perfumes, searchTerm, filterCategory, filterBrand, filterStock, sortBy, sortOrder]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setFilterBrand('');
    setFilterStock('all');
    setPage(0);
  };

  const handleOpenDialog = (perfume = null) => {
    if (perfume) {
      setFormData({
        name: perfume.name || '',
        brand: perfume.brand?.id || '',
        category: perfume.category?.id || '',
        price: perfume.price || '',
        regular_price: perfume.regular_price || '',
        stock: perfume.stock || '',
        description: perfume.description || '',
        featured: perfume.featured || false,
        on_sale: perfume.on_sale || false,
        image: null,
      });
    } else {
      setFormData({
        name: '',
        brand: '',
        category: '',
        price: '',
        regular_price: '',
        stock: '',
        description: '',
        featured: false,
        on_sale: false,
        image: null,
      });
    }
    setSelectedPerfume(perfume);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPerfume(null);
    setFormData({
      name: '',
      brand: '',
      category: '',
      price: '',
      regular_price: '',
      stock: '',
      description: '',
      featured: false,
      on_sale: false,
      image: null,
    });
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSavePerfume = () => {
    // TODO: Implement save perfume functionality
    console.log('Save perfume:', formData);
    handleCloseDialog();
  };

  const handleDeletePerfume = (id) => {
    if (window.confirm('Are you sure you want to delete this perfume?')) {
      // TODO: Implement delete perfume functionality
      console.log('Delete perfume with ID:', id);
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { color: 'error', label: 'Out of Stock', icon: <Cancel /> };
    if (stock <= 10) return { color: 'warning', label: 'Low Stock', icon: <Warning /> };
    return { color: 'success', label: 'In Stock', icon: <CheckCircle /> };
  };

  const paginatedPerfumes = filteredPerfumes.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <AdminLayout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={60} />
        </Container>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Inventory color="primary" />
              Perfume Inventory
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your perfume collection, stock levels, and product details
            </Typography>
          </Box>
          <Fab
            color="primary"
            aria-label="add perfume"
            onClick={() => handleOpenDialog()}
            sx={{ ml: 2 }}
          >
            <Add />
          </Fab>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Total Products
                    </Typography>
                    <Typography variant="h4">
                      {Array.isArray(perfumes) ? perfumes.length : 0}
                    </Typography>
                  </Box>
                  <Inventory color="primary" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Low Stock
                    </Typography>
                    <Typography variant="h4" color="warning.main">
                      {Array.isArray(perfumes) ? perfumes.filter(p => p.stock <= 10 && p.stock > 0).length : 0}
                    </Typography>
                  </Box>
                  <Warning color="warning" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Out of Stock
                    </Typography>
                    <Typography variant="h4" color="error.main">
                      {Array.isArray(perfumes) ? perfumes.filter(p => p.stock === 0).length : 0}
                    </Typography>
                  </Box>
                  <Cancel color="error" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Featured
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      {Array.isArray(perfumes) ? perfumes.filter(p => p.featured).length : 0}
                    </Typography>
                  </Box>
                  <TrendingUp color="success" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Search Products"
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setSearchTerm('')} edge="end">
                        <Clear />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filterCategory}
                  label="Category"
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {Array.isArray(categories) && categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Brand</InputLabel>
                <Select
                  value={filterBrand}
                  label="Brand"
                  onChange={(e) => setFilterBrand(e.target.value)}
                >
                  <MenuItem value="">All Brands</MenuItem>
                  {Array.isArray(brands) && brands.map((brand) => (
                    <MenuItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Stock Status</InputLabel>
                <Select
                  value={filterStock}
                  label="Stock Status"
                  onChange={(e) => setFilterStock(e.target.value)}
                >
                  <MenuItem value="all">All Stock</MenuItem>
                  <MenuItem value="available">Available</MenuItem>
                  <MenuItem value="low">Low Stock</MenuItem>
                  <MenuItem value="out">Out of Stock</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="brand">Brand</MenuItem>
                  <MenuItem value="price">Price</MenuItem>
                  <MenuItem value="stock">Stock</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={1}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleClearFilters}
                sx={{ height: '56px' }}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Products Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Brand</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="center">Stock</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Featured</TableCell>
                <TableCell align="center">On Sale</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedPerfumes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <Box sx={{ py: 4 }}>
                      <Typography variant="h6" color="text.secondary">
                        No perfumes found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Try adjusting your filters or add a new perfume
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPerfumes.map((perfume) => {
                  const stockStatus = getStockStatus(perfume.stock);
                  return (
                    <TableRow key={perfume.id} hover>
                      <TableCell>
                        <Card sx={{ width: 60, height: 60 }}>
                          <CardMedia
                            component="img"
                            height="60"
                            image={perfume.image || 'https://via.placeholder.com/60?text=No+Image'}
                            alt={perfume.name}
                            sx={{ objectFit: 'contain' }}
                          />
                        </Card>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1" fontWeight="medium">
                          {perfume.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ID: {perfume.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {perfume.brand ? perfume.brand.name : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {perfume.category ? perfume.category.name : 'N/A'}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body1" fontWeight="medium">
                          ${perfume.price}
                        </Typography>
                        {perfume.on_sale && perfume.regular_price && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ textDecoration: 'line-through' }}
                          >
                            ${perfume.regular_price}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="h6" fontWeight="bold">
                          {perfume.stock}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          icon={stockStatus.icon}
                          label={stockStatus.label}
                          color={stockStatus.color}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        {perfume.featured ? (
                          <CheckCircle color="success" />
                        ) : (
                          <Cancel color="disabled" />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {perfume.on_sale ? (
                          <CheckCircle color="success" />
                        ) : (
                          <Cancel color="disabled" />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit">
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenDialog(perfume)}
                            size="small"
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            color="error"
                            onClick={() => handleDeletePerfume(perfume.id)}
                            size="small"
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredPerfumes.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>

        {/* Add/Edit Perfume Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedPerfume ? 'Edit Perfume' : 'Add New Perfume'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Product Name"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Brand</InputLabel>
                  <Select
                    value={formData.brand}
                    label="Brand"
                    onChange={(e) => handleFormChange('brand', e.target.value)}
                  >
                    <MenuItem value="">Select Brand</MenuItem>
                    {Array.isArray(brands) && brands.map((brand) => (
                      <MenuItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    label="Category"
                    onChange={(e) => handleFormChange('category', e.target.value)}
                  >
                    <MenuItem value="">Select Category</MenuItem>
                    {Array.isArray(categories) && categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Stock Quantity"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => handleFormChange('stock', e.target.value)}
                  InputProps={{ inputProps: { min: 0 } }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleFormChange('price', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                    inputProps: { min: 0, step: 0.01 },
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Regular Price"
                  type="number"
                  value={formData.regular_price}
                  onChange={(e) => handleFormChange('regular_price', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                    inputProps: { min: 0, step: 0.01 },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.featured}
                      onChange={(e) => handleFormChange('featured', e.target.checked)}
                    />
                  }
                  label="Featured Product"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.on_sale}
                      onChange={(e) => handleFormChange('on_sale', e.target.checked)}
                    />
                  }
                  label="On Sale"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<PhotoCamera />}
                  fullWidth
                >
                  Upload Product Image
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => handleFormChange('image', e.target.files[0])}
                  />
                </Button>
                {formData.image && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Selected: {formData.image.name}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSavePerfume} variant="contained">
              {selectedPerfume ? 'Update' : 'Create'} Perfume
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </AdminLayout>
  );
};

export default PerfumeInventory;