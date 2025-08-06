import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Grid,
  Chip,
} from '@mui/material';
import {
  AdminPanelSettings,
  Dashboard,
  Inventory,
  ShoppingCart,
  People,
  Settings,
} from '@mui/icons-material';

const AdminWelcome = () => {
  const navigate = useNavigate();
  const { userInfo: user } = useSelector((state) => state.auth);

  if (!user?.is_staff) {
    return null;
  }

  const quickActions = [
    {
      title: 'Manage Products',
      description: 'Add, edit, and organize perfume inventory',
      icon: <Inventory />,
      path: '/admin/perfumes',
      color: 'primary',
    },
    {
      title: 'Process Orders',
      description: 'View and manage customer orders',
      icon: <ShoppingCart />,
      path: '/admin/orders',
      color: 'warning',
    },
    {
      title: 'Admin Dashboard',
      description: 'View comprehensive admin analytics',
      icon: <Dashboard />,
      path: '/admin',
      color: 'info',
    },
  ];

  return (
    <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2, width: 56, height: 56 }}>
            <AdminPanelSettings sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              Welcome, {user?.first_name}!
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={user?.is_superuser ? 'Super Administrator' : 'Staff Member'}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 600,
                }}
              />
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                You have administrative access to manage the perfume store
              </Typography>
            </Box>
          </Box>
        </Box>

        <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
          Quick Access to Admin Features
        </Typography>

        <Grid container spacing={2}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  bgcolor: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.2)',
                    transform: 'translateY(-2px)',
                  },
                }}
                onClick={() => navigate(action.path)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
                      {action.icon}
                    </Avatar>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                      {action.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    {action.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.3)',
              },
            }}
            onClick={() => navigate('/admin')}
          >
            Go to Admin Dashboard
          </Button>
          {user?.is_superuser && (
            <Button
              variant="outlined"
              sx={{
                borderColor: 'rgba(255,255,255,0.5)',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                },
              }}
              onClick={() => navigate('/admin/superuser')}
            >
              Superuser Panel
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default AdminWelcome;