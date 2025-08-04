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

// Mock data for categories
const mockCategories = [
  { id: 1, name: 'Eau de Parfum', description: 'Long-lasting fragrance with 15-20% perfume oil' },
  { id: 2, name: 'Eau de Toilette', description: 'Light fragrance with 5-15% perfume oil' },
  { id: 3, name: 'Cologne', description: 'Very light fragrance with 2-4% perfume oil' },
  { id: 4, name: 'Perfume Oil', description: 'Concentrated fragrance without alcohol' },
];

const Categories = () => {
  const [categories, setCategories] = useState(mockCategories);
  const [open, setOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({ name: '', description: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleOpen = () => {
    setCurrentCategory({ name: '', description: '' });
    setIsEditing(false);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleEdit = (category) => {
    setCurrentCategory(category);
    setIsEditing(true);
    setOpen(true);
  };

  const handleDelete = (id) => {
    setCategories(categories.filter(category => category.id !== id));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentCategory(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (isEditing) {
      setCategories(categories.map(category => 
        category.id === currentCategory.id ? currentCategory : category
      ));
    } else {
      const newCategory = {
        id: Math.max(...categories.map(c => c.id), 0) + 1,
        ...currentCategory
      };
      setCategories([...categories, newCategory]);
    }
    handleClose();
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Categories Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpen}
          >
            Add Category
          </Button>
        </Box>

        <Paper sx={{ mb: 3, p: 2 }}>
          <TextField
            fullWidth
            label="Search Categories"
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
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>{category.id}</TableCell>
                    <TableCell>{category.name}</TableCell>
                    <TableCell>{category.description}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => handleEdit(category)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(category.id)}
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
        <DialogTitle>{isEditing ? 'Edit Category' : 'Add New Category'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Category Name"
            type="text"
            fullWidth
            variant="outlined"
            value={currentCategory.name}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            value={currentCategory.description}
            onChange={handleChange}
            multiline
            rows={4}
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

export default Categories;