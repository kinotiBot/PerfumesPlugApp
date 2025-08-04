import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  InputBase,
  Menu,
  MenuItem,
  Avatar,
  Container,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  ShoppingCart,
  Person,
  Home,
  Store,
  Category,
  AdminPanelSettings,
  Logout,
  AccountCircle,
  Receipt,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { logout } from '../../features/auth/authSlice';
import { getCart } from '../../features/cart/cartSlice';

// Enhanced styled components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#FFFFFF',
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
  borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
  backdropFilter: 'blur(8px)',
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  color: 'inherit',
  '&:hover': {
    textDecoration: 'none',
  },
}));

const LogoText = styled(Typography)(({ theme }) => ({
  fontFamily: '"Cormorant Garamond", serif',
  fontWeight: 600,
  fontSize: '1.75rem',
  background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  letterSpacing: '-0.02em',
}));

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: '12px',
  backgroundColor: alpha('#F7FAFC', 0.8),
  border: '1px solid rgba(0, 0, 0, 0.08)',
  '&:hover': {
    backgroundColor: alpha('#F7FAFC', 1),
    borderColor: theme.palette.primary.main,
  },
  '&:focus-within': {
    backgroundColor: '#FFFFFF',
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
    minWidth: '300px',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.25, 1, 1.25, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    [theme.breakpoints.up('sm')]: {
      width: '20ch',
      '&:focus': {
        width: '25ch',
      },
    },
  },
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontWeight: 500,
  fontSize: '0.95rem',
  padding: '8px 16px',
  borderRadius: '8px',
  textTransform: 'none',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    color: theme.palette.primary.main,
  },
}));

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { cartItems, cartCount } = useSelector((state) => state.cart);
  
  const cartItemsCount = cartCount || 0;

  // Load cart data when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getCart());
    }
  }, [dispatch, isAuthenticated]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Add these missing functions:
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleCloseUserMenu();
    navigate('/');
  };

  return (
    <StyledAppBar position="sticky" elevation={0}>
      <Container maxWidth="xl">
        <Toolbar sx={{ py: 1, minHeight: '72px' }}>
          {/* Mobile menu button */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, color: 'text.primary' }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo */}
          <LogoContainer component={RouterLink} to="/" sx={{ mr: 4 }}>
            <LogoText variant="h6" noWrap>
              Perfumes Plug Rwanda
            </LogoText>
          </LogoContainer>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 'auto' }}>
              <NavButton component={RouterLink} to="/">
                Home
              </NavButton>
              <NavButton component={RouterLink} to="/perfumes">
                Shop
              </NavButton>
              <NavButton component={RouterLink} to="/categories">
                Categories
              </NavButton>
              {isAuthenticated && user?.is_staff && (
                <NavButton component={RouterLink} to="/admin">
                  Admin
                </NavButton>
              )}
            </Box>
          )}

          {/* Search Bar */}
          <Search sx={{ mx: 2, flexGrow: isMobile ? 1 : 0 }}>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search perfumes..."
              inputProps={{ 'aria-label': 'search' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  navigate(`/perfumes?search=${searchQuery}`);
                }
              }}
            />
          </Search>

          {/* Right side actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Cart */}
            <IconButton
              component={RouterLink}
              to="/cart"
              sx={{ 
                color: 'text.primary',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  color: theme.palette.primary.main,
                }
              }}
            >
              <Badge badgeContent={cartItemsCount} color="primary">
                <ShoppingCart />
              </Badge>
            </IconButton>

            {/* User Menu */}
            {isAuthenticated ? (
              <>
                <IconButton
                  onClick={handleMenu}
                  sx={{ 
                    color: 'text.primary',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    }
                  }}
                >
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                    {user?.first_name?.charAt(0) || user?.username?.charAt(0)}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      borderRadius: 2,
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                    }
                  }}
                >
                  <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>
                    <AccountCircle sx={{ mr: 2 }} />
                    Profile
                  </MenuItem>
                  <MenuItem onClick={() => { handleClose(); navigate('/orders'); }}>
                    <Receipt sx={{ mr: 2 }} />
                    Orders
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <Logout sx={{ mr: 2 }} />
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="outlined"
                  size="small"
                  sx={{
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    }
                  }}
                >
                  Login
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  size="small"
                  sx={{
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)',
                    }
                  }}
                >
                  Sign Up
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
            borderRadius: '0 16px 16px 0',
          },
        }}
      >
        {/* ... existing mobile drawer content ... */}
      </Drawer>
    </StyledAppBar>
  );
};

export default Header;