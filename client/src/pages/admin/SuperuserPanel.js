import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  Avatar,
} from '@mui/material';
import {
  SupervisorAccount,
  Security,
  Storage,
  Analytics,
  Settings,
  People,
  AdminPanelSettings,
  Warning,
  CheckCircle,
  Error,
  Info,
} from '@mui/icons-material';
import AdminLayout from '../../components/admin/AdminLayout';

const SuperuserPanel = () => {
  const navigate = useNavigate();
  const { userInfo: user, isAuthenticated } = useSelector((state) => state.auth);
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    staffUsers: 0,
    activeOrders: 0,
    totalProducts: 0,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!user || !user.is_staff) {
      navigate('/');
      return;
    }

    // Load system statistics
    // This would be replaced with actual API calls
    setSystemStats({
      totalUsers: 156,
      staffUsers: 3,
      activeOrders: 23,
      totalProducts: 89,
    });
  }, [isAuthenticated, navigate, user]);

  const superuserFeatures = [
    {
      title: 'User Management',
      description: 'Manage user accounts, permissions, and staff access',
      icon: <People />,
      path: '/admin/users',
      color: 'primary',
    },
    {
      title: 'System Settings',
      description: 'Configure application settings and preferences',
      icon: <Settings />,
      path: '/admin/settings',
      color: 'secondary',
    },
    {
      title: 'Security Center',
      description: 'Monitor security logs and access controls',
      icon: <Security />,
      path: '/admin/security',
      color: 'warning',
    },
    {
      title: 'Database Management',
      description: 'Backup, restore, and manage database operations',
      icon: <Storage />,
      path: '/admin/database',
      color: 'info',
    },
  ];

  const systemAlerts = [
    {
      type: 'success',
      message: 'System backup completed successfully',
      time: '2 hours ago',
    },
    {
      type: 'warning',
      message: 'Low inventory alert: 5 products below threshold',
      time: '4 hours ago',
    },
    {
      type: 'info',
      message: 'New user registration: john.doe@example.com',
      time: '6 hours ago',
    },
  ];

  const getAlertIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle color="success" />;
      case 'warning':
        return <Warning color="warning" />;
      case 'error':
        return <Error color="error" />;
      default:
        return <Info color="info" />;
    }
  };

  if (!user?.is_staff) {
    return (
      <AdminLayout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error">
            <Typography variant="h6">Access Denied</Typography>
            <Typography>
              You don't have permission to access superuser features.
            </Typography>
          </Alert>
        </Container>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <AdminPanelSettings sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Superuser Control Panel
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Advanced administrative tools and system management
            </Typography>
          </Box>
        </Box>

        {/* System Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      TOTAL USERS
                    </Typography>
                    <Typography variant="h4">{systemStats.totalUsers}</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <People />
                  </Avatar>
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
                      STAFF USERS
                    </Typography>
                    <Typography variant="h4">{systemStats.staffUsers}</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    <SupervisorAccount />
                  </Avatar>
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
                      ACTIVE ORDERS
                    </Typography>
                    <Typography variant="h4">{systemStats.activeOrders}</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <Analytics />
                  </Avatar>
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
                      TOTAL PRODUCTS
                    </Typography>
                    <Typography variant="h4">{systemStats.totalProducts}</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'info.main' }}>
                    <Storage />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Superuser Features */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader title="Administrative Tools" />
              <CardContent>
                <Grid container spacing={2}>
                  {superuserFeatures.map((feature, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Card
                        sx={{
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: 4,
                          },
                        }}
                        onClick={() => navigate(feature.path)}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ bgcolor: `${feature.color}.main`, mr: 2 }}>
                              {feature.icon}
                            </Avatar>
                            <Typography variant="h6">{feature.title}</Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {feature.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* System Alerts */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="System Alerts" />
              <CardContent>
                <List>
                  {systemAlerts.map((alert, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemIcon>{getAlertIcon(alert.type)}</ListItemIcon>
                        <ListItemText
                          primary={alert.message}
                          secondary={alert.time}
                          primaryTypographyProps={{ variant: 'body2' }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                      {index < systemAlerts.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/admin/perfumes')}
            >
              Add New Product
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => navigate('/admin/users')}
            >
              Create Staff Account
            </Button>
            <Button
              variant="outlined"
              color="info"
              onClick={() => navigate('/admin/orders')}
            >
              Process Orders
            </Button>
            <Button
              variant="outlined"
              color="warning"
              onClick={() => navigate('/admin/settings')}
            >
              System Settings
            </Button>
          </Box>
        </Box>
      </Container>
    </AdminLayout>
  );
};

export default SuperuserPanel;