import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
  Button,
} from '@mui/material';
import {
  ShoppingCart,
  People,
  Inventory,
  AttachMoney,
  TrendingUp,
} from '@mui/icons-material';
import { getAllOrders } from '../../features/order/orderSlice';
import { getAllUsers } from '../../features/user/userSlice';
import AdminLayout from '../../components/admin/AdminLayout';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { orders, loading } = useSelector((state) => state.order);
  const { users, loading: usersLoading } = useSelector((state) => state.user);
  const { userInfo, isAuthenticated } = useSelector((state) => state.auth);

  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!userInfo || !userInfo.is_staff) {
      navigate('/');
      return;
    }

    dispatch(getAllOrders({ getAllForStats: true }));
    dispatch(getAllUsers());
  }, [dispatch, isAuthenticated, navigate, userInfo]);

  useEffect(() => {
    if (orders) {
      const totalSales = orders.reduce(
        (sum, order) => sum + (order.total_amount || order.total_price || 0),
        0
      );
      const pendingOrders = orders.filter(
        (order) => order.status === 'pending'
      ).length;
      const processingOrders = orders.filter(
        (order) => order.status === 'processing'
      ).length;
      const shippedOrders = orders.filter(
        (order) => order.status === 'shipped'
      ).length;
      const deliveredOrders = orders.filter(
        (order) => order.status === 'delivered'
      ).length;
      const cancelledOrders = orders.filter(
        (order) => order.status === 'cancelled'
      ).length;

      setStats({
        totalSales,
        totalOrders: orders.length,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
      });
    }
  }, [orders]);

  const recentOrders = orders
    ? [...orders]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 5)
    : [];

  if (loading || usersLoading) {
    return (
      <AdminLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            Admin Dashboard
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/admin/perfumes')}
              startIcon={<Inventory />}
            >
              Manage Inventory
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => navigate('/admin/orders')}
              startIcon={<ShoppingCart />}
            >
              View Orders
            </Button>
          </Box>
        </Box>

        {/* Quick Access Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2, cursor: 'pointer', '&:hover': { boxShadow: 4 } }} onClick={() => navigate('/admin/perfumes')}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <Inventory />
                </Avatar>
                <Box>
                  <Typography variant="h6">Product Management</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Add, edit, and manage perfume inventory
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2, cursor: 'pointer', '&:hover': { boxShadow: 4 } }} onClick={() => navigate('/admin/orders')}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <ShoppingCart />
                </Avatar>
                <Box>
                  <Typography variant="h6">Order Processing</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Process and manage customer orders
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Total Sales */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      TOTAL SALES
                    </Typography>
                    <Typography variant="h4">
                      ${(stats.totalSales || 0).toFixed(2)}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      backgroundColor: 'primary.main',
                      height: 56,
                      width: 56,
                    }}
                  >
                    <AttachMoney />
                  </Avatar>
                </Box>
                <Box
                  sx={{
                    pt: 2,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <TrendingUp color="success" />
                  <Typography
                    color="success.main"
                    sx={{ mr: 1 }}
                    variant="body2"
                  >
                    12%
                  </Typography>
                  <Typography color="textSecondary" variant="caption">
                    Since last month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Total Orders */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      TOTAL ORDERS
                    </Typography>
                    <Typography variant="h4">{stats.totalOrders}</Typography>
                  </Box>
                  <Avatar
                    sx={{
                      backgroundColor: 'warning.main',
                      height: 56,
                      width: 56,
                    }}
                  >
                    <ShoppingCart />
                  </Avatar>
                </Box>
                <Box
                  sx={{
                    pt: 2,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <TrendingUp color="success" />
                  <Typography
                    color="success.main"
                    sx={{ mr: 1 }}
                    variant="body2"
                  >
                    16%
                  </Typography>
                  <Typography color="textSecondary" variant="caption">
                    Since last month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Pending Orders */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      PENDING ORDERS
                    </Typography>
                    <Typography variant="h4">{stats.pendingOrders}</Typography>
                  </Box>
                  <Avatar
                    sx={{
                      backgroundColor: 'error.main',
                      height: 56,
                      width: 56,
                    }}
                  >
                    <Inventory />
                  </Avatar>
                </Box>
                <Box
                  sx={{
                    pt: 2,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Typography color="textSecondary" variant="caption">
                    Requires immediate attention
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Total Customers */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      TOTAL CUSTOMERS
                    </Typography>
                    <Typography variant="h4">{users ? users.length : 0}</Typography>
                  </Box>
                  <Avatar
                    sx={{
                      backgroundColor: 'success.main',
                      height: 56,
                      width: 56,
                    }}
                  >
                    <People />
                  </Avatar>
                </Box>
                <Box
                  sx={{
                    pt: 2,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <TrendingUp color="success" />
                  <Typography
                    color="success.main"
                    sx={{ mr: 1 }}
                    variant="body2"
                  >
                    8%
                  </Typography>
                  <Typography color="textSecondary" variant="caption">
                    Since last month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Order Status */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Order Status" />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Pending
                    </Typography>
                    <Typography variant="h6">{stats.pendingOrders}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Processing
                    </Typography>
                    <Typography variant="h6">{stats.processingOrders}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Shipped
                    </Typography>
                    <Typography variant="h6">{stats.shippedOrders}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Delivered
                    </Typography>
                    <Typography variant="h6">{stats.deliveredOrders}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Cancelled
                    </Typography>
                    <Typography variant="h6">{stats.cancelledOrders}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Orders */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Recent Orders" />
              <Divider />
              <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <React.Fragment key={order.id}>
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {order.id}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`Order #${order.id}`}
                          secondary={
                            <React.Fragment>
                              <Typography
                                sx={{ display: 'inline' }}
                                component="span"
                                variant="body2"
                                color="text.primary"
                              >
                                ${(order.total_price || 0).toFixed(2)}
                              </Typography>
                              {` — ${new Date(
                                order.created_at
                              ).toLocaleDateString()} — Status: ${order.status}`}
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No recent orders found" />
                  </ListItem>
                )}
              </List>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </AdminLayout>
  );
};

export default Dashboard;