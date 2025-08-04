import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import AdminLayout from '../../components/admin/AdminLayout';

// Mock data for brands
const mockBrands = [
  { id: 1, name: 'Chanel', country: 'France', founded: 1909, logo: 'chanel_logo.png' },
  { id: 2, name: 'Dior', country: 'France', founded: 1946, logo: 'dior_logo.png' },
  { id: 3, name: 'Gucci', country: 'Italy', founded: 1921, logo: 'gucci_logo.png' },
  { id: 4, name: 'Tom Ford', country: 'USA', founded: 2005, logo: 'tomford_logo.png' },
];

const Brands = () => {
  const [brands, setBrands] = useState(mockBrands);
  const [open, setOpen] = useState(false);
  const [currentBrand, setCurrentBrand] = useState({ name: '', country: '', founded: '', logo: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleDelete = (id) => {
    setBrands(brands.filter(brand => brand.id !== id));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentBrand(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (isEditing) {
      setBrands(brands.map(brand => 
        brand.id === currentBrand.id ? currentBrand : brand
      ));
    } else {
      const newBrand = {
        id: Math.max(...brands.map(b => b.id), 0) + 1,
        ...currentBrand
      };
      setBrands([...brands, newBrand]);
    }
    handleClose();
  };

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
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
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Country</TableCell>
                  <TableCell>Founded</TableCell>
                  <TableCell>Logo</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBrands.map((brand) => (
                  <TableRow key={brand.id}>
                    <TableCell>{brand.id}</TableCell>
                    <TableCell>{brand.name}</TableCell>
                    <TableCell>{brand.country}</TableCell>
                    <TableCell>{brand.founded}</TableCell>
                    <TableCell>{brand.logo}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => handleEdit(brand)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(brand.id)}
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
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {isEditing ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default Brands;