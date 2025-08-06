import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  Settings as SettingsIcon,
  ExitToApp as ExitToAppIcon,
  AccountCircle,
  AdminPanelSettings,
  Warehouse as WarehouseIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo, isAuthenticated } = useSelector((state) => state.auth);
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    // Implement logout functionality
    navigate('/login');
  };

  const handleNavigate = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
    { text: 'Products', icon: <InventoryIcon />, path: '/admin/perfumes' },
    { text: 'Inventory', icon: <WarehouseIcon />, path: '/admin/inventory' },
    { text: 'Categories', icon: <CategoryIcon />, path: '/admin/categories' },
    { text: 'Brands', icon: <CategoryIcon />, path: '/admin/brands' },
    { text: 'Orders', icon: <ShoppingCartIcon />, path: '/admin/orders' },
    { text: 'Customers', icon: <PeopleIcon />, path: '/admin/customers' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' },
    ...(userInfo?.is_superuser ? [{ text: 'Superuser Panel', icon: <AdminPanelSettings />, path: '/admin/superuser' }] : []),
  ];

  const drawer = (
    <div>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AdminPanelSettings sx={{ color: 'primary.main' }} />
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
            Admin Panel
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      
      {/* User Info Section */}
      <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
        <Typography variant="body2" color="text.secondary">
          Logged in as:
        </Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {userInfo?.first_name} {userInfo?.last_name}
        </Typography>
        <Typography variant="caption" color="primary.main">
          {userInfo?.is_superuser ? 'Super Administrator' : 'Staff Member'}
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate('/')}>
            <ListItemIcon>
              <ExitToAppIcon />
            </ListItemIcon>
            <ListItemText primary="Back to Shop" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  if (!isAuthenticated || !userInfo || !userInfo.is_staff) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="body1" paragraph>
          You don't have permission to access the admin area.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={RouterLink}
          to="/"
        >
          Back to Home
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Perfumes Plug Admin
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              {userInfo?.first_name ? (
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  {userInfo.first_name[0]}{userInfo.last_name[0]}
                </Avatar>
              ) : (
                <AccountCircle />
              )}
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => {
                handleMenuClose();
                navigate('/profile');
              }}>
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout;