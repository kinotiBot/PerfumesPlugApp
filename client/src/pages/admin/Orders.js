import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
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
import { format } from 'date-fns';
import { getAllOrders, updateOrderStatus } from '../../features/order/orderSlice';
import AdminLayout from '../../components/admin/AdminLayout';

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, loading, totalPages } = useSelector((state) => state.order);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [orderIdFilter, setOrderIdFilter] = useState('');

  useEffect(() => {
    dispatch(getAllOrders({ 
      page: page + 1, 
      limit: rowsPerPage,
      status: statusFilter,
      order_id: orderIdFilter
    }));
  }, [dispatch, page, rowsPerPage, statusFilter, orderIdFilter]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (order) => {
    setSelectedOrder(order);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOrder(null);
  };

  const handleStatusChange = (event) => {
    if (selectedOrder) {
      dispatch(updateOrderStatus({
        orderId: selectedOrder.id,
        status: event.target.value
      })).then(() => {
        handleCloseDialog();
        dispatch(getAllOrders({ 
          page: page + 1, 
          limit: rowsPerPage,
          status: statusFilter,
          order_id: orderIdFilter
        }));
      });
    }
  };

  const handleClearFilters = () => {
    setStatusFilter('');
    setOrderIdFilter('');
    setPage(0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPaymentStatusColor = (status) => {
    if (typeof status === 'boolean') {
      return status ? 'success' : 'error';
    }
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <AdminLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Orders Management
        </Typography>

        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Search by Order ID"
                value={orderIdFilter}
                onChange={(e) => setOrderIdFilter(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Filter by Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="processing">Processing</MenuItem>
                  <MenuItem value="shipped">Shipped</MenuItem>
                  <MenuItem value="delivered">Delivered</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleClearFilters}
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
                <TableCell>Order ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Payment Status</TableCell>
                <TableCell align="center">Items</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : !Array.isArray(orders) || orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>
                      {format(new Date(order.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      {order.user ? `${order.user.first_name} ${order.user.last_name}` : (order.guest_name || 'N/A')}
                    </TableCell>
                    <TableCell align="right">${order.total_amount}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={order.status ? 
                          order.status.charAt(0).toUpperCase() + order.status.slice(1) : 
                          'Unknown'
                        }
                        color={getStatusColor(order.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={order.payment_status !== undefined ? 
                          (order.payment_status ? 'Paid' : 'Unpaid') : 
                          'Unknown'
                        }
                        color={getPaymentStatusColor(order.payment_status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      {order.order_items ? order.order_items.length : 0}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleOpenDialog(order)}
                      >
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={Math.max(0, (totalPages || 1) * rowsPerPage)}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>

        {/* Order Details Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          {selectedOrder && (
            <>
              <DialogTitle>
                Order #{selectedOrder.id} Details
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1">Customer Information</Typography>
                    <Typography>
                      {selectedOrder.user
                        ? `${selectedOrder.user.first_name} ${selectedOrder.user.last_name}`
                        : (selectedOrder.guest_name || 'N/A')}
                    </Typography>
                    <Typography>{selectedOrder.user?.email || selectedOrder.guest_email || 'N/A'}</Typography>
                    {(selectedOrder.user?.phone || selectedOrder.guest_phone) && (
                      <Typography>Phone: {selectedOrder.user?.phone || selectedOrder.guest_phone}</Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1">Order Information</Typography>
                    <Typography>
                      Date: {format(new Date(selectedOrder.created_at), 'MMM dd, yyyy')}
                    </Typography>
                    <Typography>Total: ${selectedOrder.total_amount}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">Shipping Address</Typography>
                    <Typography>
                      {selectedOrder.shipping_address ? 
                        `${selectedOrder.shipping_address?.street}, ${selectedOrder.shipping_address?.city}, ${selectedOrder.shipping_address?.state} ${selectedOrder.shipping_address?.zip_code}, ${selectedOrder.shipping_address?.country}` :
                        (selectedOrder.guest_address ? 
                          `${selectedOrder.guest_address}, ${selectedOrder.guest_city}, ${selectedOrder.guest_province}` : 
                          'N/A')
                      }
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">Payment Information</Typography>
                    <Typography>Method: {selectedOrder.payment_method}</Typography>
                    <Typography>
                      Status: 
                      <Chip
                        label={selectedOrder.payment_status !== undefined ? 
                          (selectedOrder.payment_status ? 'Paid' : 'Unpaid') : 
                          'Unknown'
                        }
                        color={getPaymentStatusColor(selectedOrder.payment_status)}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">Order Status</Typography>
                    <FormControl fullWidth sx={{ mt: 1 }}>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={selectedOrder.status}
                        label="Status"
                        onChange={handleStatusChange}
                      >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="processing">Processing</MenuItem>
                        <MenuItem value="shipped">Shipped</MenuItem>
                        <MenuItem value="delivered">Delivered</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Order Items
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Product</TableCell>
                            <TableCell align="right">Price</TableCell>
                            <TableCell align="right">Quantity</TableCell>
                            <TableCell align="right">Subtotal</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedOrder.order_items?.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.perfume?.name || 'N/A'}</TableCell>
                              <TableCell align="right">${item.price}</TableCell>
                              <TableCell align="right">{item.quantity}</TableCell>
                              <TableCell align="right">
                                ${(item.price * item.quantity).toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell colSpan={3} align="right">
                              <strong>Total</strong>
                            </TableCell>
                            <TableCell align="right">
                              <strong>${selectedOrder.total_amount}</strong>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </AdminLayout>
  );
};

export default Orders;