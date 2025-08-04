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
  IconButton,
  Chip,
  Avatar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import AdminLayout from '../../components/admin/AdminLayout';

// Mock data for customers
const mockCustomers = [
  {
    id: 1,
    username: 'johndoe',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    dateJoined: '2023-01-15',
    lastLogin: '2023-06-20',
    isActive: true,
    ordersCount: 12,
    totalSpent: 1250.75,
  },
  {
    id: 2,
    username: 'janedoe',
    email: 'jane.doe@example.com',
    firstName: 'Jane',
    lastName: 'Doe',
    dateJoined: '2023-02-10',
    lastLogin: '2023-06-18',
    isActive: true,
    ordersCount: 8,
    totalSpent: 875.50,
  },
  {
    id: 3,
    username: 'bobsmith',
    email: 'bob.smith@example.com',
    firstName: 'Bob',
    lastName: 'Smith',
    dateJoined: '2023-03-05',
    lastLogin: '2023-05-30',
    isActive: false,
    ordersCount: 3,
    totalSpent: 320.25,
  },
  {
    id: 4,
    username: 'alicejones',
    email: 'alice.jones@example.com',
    firstName: 'Alice',
    lastName: 'Jones',
    dateJoined: '2023-04-20',
    lastLogin: '2023-06-15',
    isActive: true,
    ordersCount: 5,
    totalSpent: 550.00,
  },
];

const Customers = () => {
  const [customers, setCustomers] = useState(mockCustomers);
  const [open, setOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    isActive: true,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewCustomerDialogOpen, setViewCustomerDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const handleOpen = () => {
    setCurrentCustomer({
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      isActive: true,
    });
    setIsEditing(false);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setViewCustomerDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewCustomerDialogOpen(false);
  };

  const handleEdit = (customer) => {
    setCurrentCustomer(customer);
    setIsEditing(true);
    setOpen(true);
  };

  const handleDelete = (id) => {
    setCustomers(customers.filter(customer => customer.id !== id));
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setCurrentCustomer(prev => ({
      ...prev,
      [name]: name === 'isActive' ? checked : value
    }));
  };

  const handleSubmit = () => {
    if (isEditing) {
      setCustomers(customers.map(customer => 
        customer.id === currentCustomer.id ? currentCustomer : customer
      ));
    } else {
      const newCustomer = {
        id: Math.max(...customers.map(c => c.id), 0) + 1,
        ...currentCustomer,
        dateJoined: new Date().toISOString().split('T')[0],
        lastLogin: new Date().toISOString().split('T')[0],
        ordersCount: 0,
        totalSpent: 0,
      };
      setCustomers([...customers, newCustomer]);
    }
    handleClose();
  };

  const filteredCustomers = customers.filter(customer =>
    customer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Customers Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpen}
          >
            Add Customer
          </Button>
        </Box>

        <Paper sx={{ mb: 3, p: 2 }}>
          <TextField
            fullWidth
            label="Search Customers"
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
                  <TableCell>Email</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Orders</TableCell>
                  <TableCell>Total Spent</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>{customer.id}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2 }}>
                          {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                        </Avatar>
                        {customer.firstName} {customer.lastName}
                      </Box>
                    </TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={customer.isActive ? 'Active' : 'Inactive'}
                        color={customer.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{customer.ordersCount}</TableCell>
                    <TableCell>${customer.totalSpent.toFixed(2)}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="info"
                        onClick={() => handleViewCustomer(customer)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        color="primary"
                        onClick={() => handleEdit(customer)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(customer.id)}
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

      {/* Add/Edit Customer Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="username"
            label="Username"
            type="text"
            fullWidth
            variant="outlined"
            value={currentCustomer.username}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={currentCustomer.email}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="firstName"
            label="First Name"
            type="text"
            fullWidth
            variant="outlined"
            value={currentCustomer.firstName}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="lastName"
            label="Last Name"
            type="text"
            fullWidth
            variant="outlined"
            value={currentCustomer.lastName}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={currentCustomer.isActive}
                onChange={handleChange}
                name="isActive"
                color="primary"
              />
            }
            label="Active"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {isEditing ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Customer Dialog */}
      {selectedCustomer && (
        <Dialog open={viewCustomerDialogOpen} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
          <DialogTitle>Customer Details</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom>Basic Information</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Username</Typography>
                  <Typography variant="body1">{selectedCustomer.username}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Full Name</Typography>
                  <Typography variant="body1">{selectedCustomer.firstName} {selectedCustomer.lastName}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{selectedCustomer.email}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip
                    label={selectedCustomer.isActive ? 'Active' : 'Inactive'}
                    color={selectedCustomer.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom>Account Information</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Date Joined</Typography>
                  <Typography variant="body1">{selectedCustomer.dateJoined}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Last Login</Typography>
                  <Typography variant="body1">{selectedCustomer.lastLogin}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Total Orders</Typography>
                  <Typography variant="body1">{selectedCustomer.ordersCount}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Total Spent</Typography>
                  <Typography variant="body1">${selectedCustomer.totalSpent.toFixed(2)}</Typography>
                </Box>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseViewDialog}>Close</Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                handleCloseViewDialog();
                handleEdit(selectedCustomer);
              }}
            >
              Edit
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </AdminLayout>
  );
};

export default Customers;