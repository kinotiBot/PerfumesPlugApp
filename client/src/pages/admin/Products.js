import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CardMedia,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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
} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  Search,
  Clear,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { getAllPerfumes, getCategories, getBrands, deletePerfume } from '../../features/perfume/perfumeSlice';
import AdminLayout from '../../components/admin/AdminLayout';
import axios from 'axios';
import { getApiUrl, getImageUrl } from '../../utils/api';

const Products = () => {
  const dispatch = useDispatch();
  
  const { perfumes, categories, brands, loading, count } = useSelector(
    (state) => state.perfume
  );
  const { userToken } = useSelector((state) => state.auth);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  
  // Form state for controlled components - using strings for number inputs to handle placeholders properly
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    stock: '',
    price: '',
    regular_price: '',
    description: '',
    featured: false,
    on_sale: false
  });

  useEffect(() => {
    dispatch(getAllPerfumes({ page: page + 1, limit: rowsPerPage, search: searchTerm, category: filterCategory, brand: filterBrand }));
    dispatch(getCategories());
    dispatch(getBrands());
  }, [dispatch, page, rowsPerPage, searchTerm, filterCategory, filterBrand]);

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

  const handleClearSearch = () => {
    setSearchTerm('');
    setFilterCategory('');
    setFilterBrand('');
    setPage(0);
  };

  const handleOpenDialog = (product = null) => {
    setSelectedProduct(product);
    if (product) {
      setFormData({
        name: product?.name || '',
        brand: product?.brand?.id || '',
        category: product?.category?.id || '',
        stock: product?.stock?.toString() || '',
        price: product?.price?.toString() || '',
        regular_price: product?.regular_price?.toString() || '',
        description: product?.description || '',
        featured: product?.featured || false,
        on_sale: product?.on_sale || false
      });
    } else {
      setFormData({
        name: '',
        brand: '',
        category: '',
        stock: '',
        price: '',
        regular_price: '',
        description: '',
        featured: false,
        on_sale: false
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProduct(null);
    setSelectedImages([]);
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const imageUrls = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setSelectedImages(prev => [...prev, ...imageUrls]);
  };

  const handleRemoveImage = (index) => {
    setSelectedImages(prev => {
      // Clean up the preview URL to prevent memory leaks
      const imageToRemove = prev[index];
      if (imageToRemove?.preview) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSaveProduct = async () => {
    const { name, brand, category, stock, price, regular_price, description, featured, on_sale } = formData;

    // Enhanced validation for all required fields
    if (!name || !price || !brand || !category || !description) {
      const missingFields = [];
      if (!name) missingFields.push('Name');
      if (!price) missingFields.push('Price');
      if (!brand) missingFields.push('Brand');
      if (!category) missingFields.push('Category');
      if (!description) missingFields.push('Description');
      
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    // Convert and validate numeric values
    const stockValue = parseInt(stock) || 0;
    const priceValue = parseFloat(price);
    const regularPriceValue = parseFloat(regular_price) || 0;
    const brandId = parseInt(brand);
    const categoryId = parseInt(category);
    
    if (isNaN(priceValue) || priceValue <= 0) {
      alert('Please enter a valid price');
      return;
    }
    
    if (isNaN(brandId) || isNaN(categoryId)) {
      alert('Please select valid Brand and Category');
      return;
    }

    if (stockValue < 0) {
      alert('Stock cannot be negative');
      return;
    }

    setUploading(true);
    
    try {
      // Always use FormData when we have images or when creating a new product
      const formDataToSend = new FormData();
      
      // Append all product data
      formDataToSend.append('name', name);
      formDataToSend.append('description', description);
      formDataToSend.append('price', priceValue.toString());
      
      if (on_sale && regularPriceValue > 0) {
        formDataToSend.append('discount_price', regularPriceValue.toString());
      }
      
      formDataToSend.append('stock', stockValue.toString());
      formDataToSend.append('brand', brandId.toString());
      formDataToSend.append('category', categoryId.toString());
      formDataToSend.append('gender', 'U'); // 'U' for Unisex as per model choices
      formDataToSend.append('is_featured', featured ? 'Yes' : 'No');
      formDataToSend.append('is_active', 'true');
      
      // Important: Don't send the slug field - let the backend generate it
      // The backend will create the slug from the name and brand
      
      // Handle image upload - this is critical for the validation
      if (selectedImages.length > 0) {
        // Use the first image as the main product image
        if (selectedImages[0].file) {
          formDataToSend.append('image', selectedImages[0].file);
        }
        
        // Additional images can be handled separately if needed
        selectedImages.forEach((image, index) => {
          if (index > 0 && image.file) { // Skip the first image as it's already added as main image
            formDataToSend.append('images', image.file);
          }
        });
      } else {
        // If no image is selected, we need to handle this case
        // The backend requires an image, so we should alert the user
        alert('Please select at least one image for the product');
        setUploading(false);
        return;
      }
      
      // Debug logging
      console.log('Sending FormData with entries:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value);
      }
      
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userToken}`,
        },
      };

      let response;
      if (selectedProduct?.id) {
        // For updates, you might need to use PATCH instead of PUT depending on your backend
        response = await axios.put(getApiUrl(`/api/perfumes/${selectedProduct.slug}/`), formDataToSend, config);
      } else {
        response = await axios.post(getApiUrl('/api/perfumes/'), formDataToSend, config);
      }

      if (response.status === 200 || response.status === 201) {
        // Clean up preview URLs
        selectedImages.forEach(image => {
          if (image.preview) {
            URL.revokeObjectURL(image.preview);
          }
        });

        dispatch(getAllPerfumes({ page: page + 1, limit: rowsPerPage, search: searchTerm, category: filterCategory, brand: filterBrand }));
        handleCloseDialog();
        alert('Product saved successfully!');
      }
    } catch (error) {
      console.error('Error saving product:', error.response?.data || error.message);
      
      // Show detailed validation errors
      if (error.response?.data && typeof error.response.data === 'object') {
        const errorMessages = [];
        Object.keys(error.response.data).forEach(field => {
          const fieldErrors = error.response.data[field];
          if (Array.isArray(fieldErrors)) {
            errorMessages.push(`${field}: ${fieldErrors.join(', ')}`);
          } else {
            errorMessages.push(`${field}: ${fieldErrors}`);
          }
        });
        alert('Validation errors:\n' + errorMessages.join('\n'));
      } else {
        alert('Error saving product: ' + (error.response?.data?.detail || error.message));
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteProduct = async (perfume) => {
    if (window.confirm(`Are you sure you want to delete "${perfume.name}"? This action cannot be undone.`)) {
      try {
        await dispatch(deletePerfume(perfume.slug)).unwrap();
        // Refresh the perfumes list after successful deletion
        dispatch(getAllPerfumes({ page: page + 1, limit: rowsPerPage, search: searchTerm, category: filterCategory, brand: filterBrand }));
        alert('Product deleted successfully!');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product: ' + (error || 'Unknown error'));
      }
    }
  };

  // Helper function to handle number input changes
  const handleNumberChange = (field, value) => {
    setFormData({...formData, [field]: value});
  };

  return (
    <AdminLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4">Products</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add Product
          </Button>
        </Box>

        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
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
                      <IconButton onClick={handleClearSearch} edge="end">
                        <Clear />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Filter by Category</InputLabel>
                <Select
                  value={filterCategory}
                  label="Filter by Category"
                  onChange={(e) => setFilterCategory(e.target.value)}
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
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Filter by Brand</InputLabel>
                <Select
                  value={filterBrand}
                  label="Filter by Brand"
                  onChange={(e) => setFilterBrand(e.target.value)}
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
            <Grid item xs={12} sm={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleClearSearch}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Brand</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Stock</TableCell>
                <TableCell align="center">Featured</TableCell>
                <TableCell align="center">On Sale</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : perfumes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                perfumes.map((perfume) => (
                  <TableRow key={perfume.id}>
                    <TableCell>
                      <Card sx={{ width: 60, height: 60 }}>
                        <CardMedia
                          component="img"
                          height="60"
                          image={getImageUrl(perfume.image) || '/images/placeholder-perfume.svg'}
                          alt={perfume.name}
                          sx={{ objectFit: 'contain' }}
                        />
                      </Card>
                    </TableCell>
                    <TableCell>{perfume.name}</TableCell>
                    <TableCell>
                      {perfume.brand ? perfume.brand.name : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {perfume.category ? perfume.category.name : 'N/A'}
                    </TableCell>
                    <TableCell align="right">
                      ${perfume.price}
                      {perfume.on_sale && (
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          sx={{ textDecoration: 'line-through' }}
                        >
                          ${perfume.regular_price}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={perfume.stock}
                        color={perfume.stock > 0 ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      {perfume.featured ? (
                        <CheckCircle color="success" />
                      ) : (
                        <Cancel color="error" />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {perfume.on_sale ? (
                        <CheckCircle color="success" />
                      ) : (
                        <Cancel color="error" />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(perfume)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteProduct(perfume)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={count || 0}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>

        {/* Product Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedProduct ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Product Name"
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Brand</InputLabel>
                  <Select
                    label="Brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                  >
                    <MenuItem value="">Select Brand</MenuItem>
                    {brands.map((brand) => (
                      <MenuItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    label="Category"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <MenuItem value="">Select Category</MenuItem>
                    {categories.map((category) => (
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
                  label="Stock"
                  placeholder="0"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => handleNumberChange('stock', e.target.value)}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price"
                  placeholder="0.00"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleNumberChange('price', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                    inputProps: { min: 0, step: 0.01 },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Regular Price"
                  placeholder="0.00"
                  type="number"
                  value={formData.regular_price}
                  onChange={(e) => handleNumberChange('regular_price', e.target.value)}
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
                  placeholder="Enter product description"
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Featured</InputLabel>
                  <Select
                    label="Featured"
                    value={formData.featured ? 'true' : 'false'}
                    onChange={(e) => setFormData({...formData, featured: e.target.value === 'true'})}
                  >
                    <MenuItem value="true">Yes</MenuItem>
                    <MenuItem value="false">No</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>On Sale</InputLabel>
                  <Select
                    label="On Sale"
                    value={formData.on_sale ? 'true' : 'false'}
                    onChange={(e) => setFormData({...formData, on_sale: e.target.value === 'true'})}
                  >
                    <MenuItem value="true">Yes</MenuItem>
                    <MenuItem value="false">No</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Product Images
                </Typography>
                <Button variant="contained" component="label">
                  Upload Image
                  <input 
                    type="file" 
                    hidden 
                    multiple 
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </Button>
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {/* Existing product images */}
                  {selectedProduct?.images?.map((image, index) => (
                    <Card key={`existing-${index}`} sx={{ width: 100, height: 100, position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="100"
                        image={image.image}
                        alt={`Product image ${index + 1}`}
                        sx={{ objectFit: 'cover' }}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          bgcolor: 'rgba(255, 255, 255, 0.7)',
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Card>
                  ))}
                  {/* New uploaded images */}
                  {selectedImages.map((image, index) => (
                    <Card key={`new-${index}`} sx={{ width: 100, height: 100, position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="100"
                        image={image.preview}
                        alt={`New image ${index + 1}`}
                        sx={{ objectFit: 'cover' }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveImage(index)}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          bgcolor: 'rgba(255, 255, 255, 0.7)',
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Card>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              onClick={handleSaveProduct} 
              variant="contained" 
              color="primary"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  {selectedProduct ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                selectedProduct ? 'Update' : 'Create'
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </AdminLayout>
  );
};

export default Products;