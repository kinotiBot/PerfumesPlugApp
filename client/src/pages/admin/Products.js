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
import { getAllPerfumes, getCategories, getBrands } from '../../features/perfume/perfumeSlice';
import AdminLayout from '../../components/admin/AdminLayout';

const Products = () => {
  const dispatch = useDispatch();
  
  const { perfumes, categories, brands, loading, totalPages } = useSelector(
    (state) => state.perfume
  );

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');

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
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProduct(null);
  };

  const handleSaveProduct = () => {
    // Implement save product functionality
    handleCloseDialog();
  };

  const handleDeleteProduct = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      // Implement delete product functionality
      console.log('Delete product with ID:', id);
    }
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
                          image={
                            perfume.images && perfume.images.length > 0
                              ? perfume.images[0].image
                              : 'https://via.placeholder.com/60'
                          }
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
                        onClick={() => handleDeleteProduct(perfume.id)}
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
            count={totalPages * rowsPerPage}
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
                  defaultValue={selectedProduct?.name || ''}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Brand</InputLabel>
                  <Select
                    label="Brand"
                    defaultValue={selectedProduct?.brand?.id || ''}
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
                    defaultValue={selectedProduct?.category?.id || ''}
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
                  type="number"
                  defaultValue={selectedProduct?.stock || 0}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price"
                  type="number"
                  defaultValue={selectedProduct?.price || 0}
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
                  type="number"
                  defaultValue={selectedProduct?.regular_price || 0}
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
                  defaultValue={selectedProduct?.description || ''}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Featured</InputLabel>
                  <Select
                    label="Featured"
                    defaultValue={selectedProduct?.featured ? 'true' : 'false'}
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
                    defaultValue={selectedProduct?.on_sale ? 'true' : 'false'}
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
                  <input type="file" hidden multiple />
                </Button>
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedProduct?.images?.map((image, index) => (
                    <Card key={index} sx={{ width: 100, height: 100, position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="100"
                        image={image.image}
                        alt={`Product image ${index + 1}`}
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
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSaveProduct} variant="contained" color="primary">
              {selectedProduct ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </AdminLayout>
  );
};

export default Products;