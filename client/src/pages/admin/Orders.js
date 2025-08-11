import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
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
  Snackbar,
  Alert,
} from '@mui/material';
import { format } from 'date-fns';
import { getAllOrders, updateOrderStatus, updatePaymentReceived, resetOrderSuccess } from '../../features/order/orderSlice';
import AdminLayout from '../../components/admin/AdminLayout';
import { 
  getDisplayStatus, 
  getApiStatus, 
  getStatusColor, 
  getPaymentReceivedColor, 
  formatStatusForDisplay, 
  formatPaymentReceivedForDisplay 
} from '../../utils/statusMapping';

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, loading, error, totalPages, success, updatingStatus } = useSelector((state) => state.order);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [orderIdFilter, setOrderIdFilter] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    dispatch(getAllOrders({ 
      page: page + 1, 
      limit: rowsPerPage,
      status: statusFilter,
      order_id: orderIdFilter,
      _t: Date.now() // Cache busting
    }));
    
    // Reset success state after re-fetching to prevent infinite loops
    if (success) {
      dispatch(resetOrderSuccess());
    }
  }, [dispatch, page, rowsPerPage, statusFilter, orderIdFilter, success]);

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
      const apiStatus = getApiStatus(event.target.value);
      dispatch(updateOrderStatus({
        orderId: selectedOrder.id,
        status: apiStatus
      })).then(() => {
        // Refresh the orders list to show updated data
        dispatch(getAllOrders({ page: page + 1, page_size: rowsPerPage, status: statusFilter, order_id: orderIdFilter }));
        handleCloseDialog();
        setSnackbar({ open: true, message: 'Order status updated successfully.', severity: 'success' });
      }).catch((error) => {
        setSnackbar({ open: true, message: 'Failed to update order status.', severity: 'error' });
      });
    }
  };

  const handleClearFilters = () => {
    setStatusFilter('');
    setOrderIdFilter('');
    setPage(0);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Replace the handlePaymentStatusChange function (around line 100-115)
  const handleUpdatePaymentReceived = async (orderId, paymentReceived) => {
    if (selectedOrder) {
      try {
        console.log('Updating payment status:', { orderId, paymentReceived });
        await dispatch(updatePaymentReceived({ orderId, paymentReceived })).unwrap();
        // Refresh the orders list to show updated data
        dispatch(getAllOrders({ page: page + 1, page_size: rowsPerPage, status: statusFilter, order_id: orderIdFilter }));
        handleCloseDialog();
        setSnackbar({ open: true, message: 'Payment status updated successfully.', severity: 'success' });
      } catch (error) {
        console.error('Payment status update error:', error);
        setSnackbar({ open: true, message: `Failed to update payment status: ${error.message || error}`, severity: 'error' });
      }
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
                  <MenuItem value="P">Pending</MenuItem>
                  <MenuItem value="C">Processing</MenuItem>
                  <MenuItem value="S">Shipped</MenuItem>
                  <MenuItem value="D">Delivered</MenuItem>
                  <MenuItem value="X">Cancelled</MenuItem>
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
                <TableCell>Customer</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Payment Received</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>
                    {order.user
                      ? `${order.user.first_name} ${order.user.last_name}`
                      : (order.guest_name || 'N/A')}
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.created_at), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>${order.total}</TableCell>
                  <TableCell>
                    <Chip
                      label={formatStatusForDisplay(order.status)}
                      color={getStatusColor(order.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={formatPaymentReceivedForDisplay(order.payment_status)}
                      color={getPaymentReceivedColor(order.payment_status)}
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
              ))}
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
                    <Typography>Total: ${selectedOrder.total}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">Payment Information</Typography>
                    <Typography>Method: {selectedOrder.payment_method}</Typography>
                    <FormControl fullWidth sx={{ mt: 1 }}>
                      <InputLabel>Payment Received</InputLabel>
                      <Select
                        value={selectedOrder.payment_status}
                        label="Payment Received"
                        onChange={(e) => handleUpdatePaymentReceived(selectedOrder.id, e.target.value)}
                        disabled={updatingStatus}
                      >
                        <MenuItem value={true}>Yes</MenuItem>
                        <MenuItem value={false}>No</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">Order Status</Typography>
                    <FormControl fullWidth sx={{ mt: 1 }}>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={getDisplayStatus(selectedOrder.status)}
                        label="Status"
                        onChange={handleStatusChange}
                        disabled={updatingStatus}
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
                              <strong>${selectedOrder.total}</strong>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog} disabled={updatingStatus}>Close</Button>
                {updatingStatus && <CircularProgress size={24} />}
              </DialogActions>
            </>
          )}
        </Dialog>
        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </AdminLayout>
  );
};

export default Orders;