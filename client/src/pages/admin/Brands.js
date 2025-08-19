import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import AdminLayout from '../../components/admin/AdminLayout';
import { getBrands, createBrand, updateBrand, deleteBrand } from '../../features/perfume/perfumeSlice';

const Brands = () => {
  const dispatch = useDispatch();
  const { brands, loading, error } = useSelector((state) => state.perfume);
  
  const [open, setOpen] = useState(false);
  const [currentBrand, setCurrentBrand] = useState({ name: '', country: '', founded: '', logo: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(getBrands());
  }, [dispatch]);

  const handleOpen = () => {
    setCurrentBrand({ name: '', country: '', founded: '', logo: '' });
    setIsEditing(false);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleEdit = (brand) => {
    setCurrentBrand(brand);
    setIsEditing(true);
    setOpen(true);
  };

  const handleDelete = (slug) => {
    if (window.confirm('Are you sure you want to delete this brand?')) {
      dispatch(deleteBrand(slug));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentBrand(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (isEditing) {
        await dispatch(updateBrand({ slug: currentBrand.slug, brandData: currentBrand })).unwrap();
      } else {
        await dispatch(createBrand(currentBrand)).unwrap();
      }
      handleClose();
    } catch (error) {
      console.error('Error saving brand:', error);
    }
  };

  const filteredBrands = brands ? brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.country.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  if (loading && brands.length === 0) {
    return (
      <AdminLayout>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Brands Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpen}
          >
            Add Brand
          </Button>
        </Box>

        <Paper sx={{ mb: 3, p: 2 }}>
          <TextField
            fullWidth
            label="Search Brands"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Slug</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Country</TableCell>
                  <TableCell>Founded</TableCell>
                  <TableCell>Logo</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBrands.map((brand) => (
                  <TableRow key={brand.slug}>
                    <TableCell>{brand.slug}</TableCell>
                    <TableCell>{brand.name}</TableCell>
                    <TableCell>{brand.country}</TableCell>
                    <TableCell>{brand.founded}</TableCell>
                    <TableCell>{brand.logo || 'N/A'}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => handleEdit(brand)}
                        disabled={loading}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(brand.slug)}
                        disabled={loading}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{isEditing ? 'Edit Brand' : 'Add New Brand'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Brand Name"
            type="text"
            fullWidth
            variant="outlined"
            value={currentBrand.name}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="country"
            label="Country"
            type="text"
            fullWidth
            variant="outlined"
            value={currentBrand.country}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="founded"
            label="Founded Year"
            type="number"
            fullWidth
            variant="outlined"
            value={currentBrand.founded}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="logo"
            label="Logo URL"
            type="text"
            fullWidth
            variant="outlined"
            value={currentBrand.logo}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={loading || !currentBrand.name.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Saving...' : (isEditing ? 'Update' : 'Add')}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default Brands;