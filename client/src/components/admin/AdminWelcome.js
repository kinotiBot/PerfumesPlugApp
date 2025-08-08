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
    <Card sx={{ 
      mb: 4, 
      background: 'linear-gradient(135deg, #000000 0%, #1A1A1A 50%, #000000 100%)', 
      color: '#F8F8F8',
      border: '2px solid #FFD700',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 4px 16px rgba(255, 215, 0, 0.3)'
    }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar sx={{ bgcolor: '#FFD700', color: '#000000', mr: 2, width: 56, height: 56 }}>
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
                  bgcolor: '#FFD700',
                  color: '#000000',
                  fontWeight: 600,
                  border: '1px solid #FFED4A',
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
                  bgcolor: 'rgba(255, 215, 0, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 215, 0, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 215, 0, 0.2)',
                    transform: 'translateY(-2px)',
                    borderColor: '#FFD700',
                    boxShadow: '0 8px 25px rgba(255, 215, 0, 0.3)',
                  },
                }}
                onClick={() => navigate(action.path)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#FFD700', color: '#000000', mr: 2 }}>
                      {action.icon}
                    </Avatar>
                    <Typography variant="h6" sx={{ color: '#F8F8F8', fontWeight: 600 }}>
                      {action.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#B0B0B0' }}>
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
              bgcolor: '#FFD700',
              color: '#000000',
              border: '2px solid #FFD700',
              '&:hover': {
                bgcolor: '#FFED4A',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(255, 215, 0, 0.4)',
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
                borderColor: '#FFD700',
                color: '#FFD700',
                borderWidth: '2px',
                '&:hover': {
                  borderColor: '#FFED4A',
                  backgroundColor: 'rgba(255, 215, 0, 0.1)',
                  transform: 'translateY(-2px)',
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