import React, { useState } from 'react';
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
  Logout,
  AccountCircle,
  Receipt,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { logout } from '../../features/auth/authSlice';

// Enhanced styled components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#0A0A0A',
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(8px)',
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  color: 'inherit',
  gap: theme.spacing(1.5),
  '&:hover': {
    textDecoration: 'none',
  },
}));

const LogoImage = styled('img')(({ theme }) => ({
  height: '40px',
  width: 'auto',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(255, 215, 0, 0.2)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 4px 16px rgba(255, 215, 0, 0.3)',
  },
  [theme.breakpoints.down('sm')]: {
    height: '32px',
  },
}));

const LogoText = styled(Typography)(({ theme }) => ({
  fontFamily: '"Cormorant Garamond", serif',
  fontWeight: 600,
  fontSize: '1.75rem',
  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  letterSpacing: '-0.02em',
}));

const FloatingCartButton = styled(IconButton)(({ theme }) => ({
  position: 'relative',
  color: '#F8F8F8',
  backgroundColor: '#1A1A1A',
  border: '2px solid #FFD700',
  borderRadius: '50%',
  width: '56px',
  height: '56px',
  boxShadow: '0 4px 20px rgba(255, 215, 0, 0.3)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    backgroundColor: '#FFD700',
    color: '#1A1A1A',
    transform: 'translateY(-2px) scale(1.05)',
    boxShadow: '0 8px 30px rgba(255, 215, 0, 0.4)',
    borderColor: '#FFA500',
  },
  '&:active': {
    transform: 'translateY(0) scale(0.98)',
  },
  [theme.breakpoints.down('sm')]: {
    width: '48px',
    height: '48px',
  },
}));

const FloatingCartBadge = styled(Badge, {
  shouldForwardProp: (prop) => prop !== 'animate',
})(({ theme, animate }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#FFD700',
    color: '#1A1A1A',
    fontWeight: 700,
    fontSize: '0.75rem',
    minWidth: '22px',
    height: '22px',
    borderRadius: '11px',
    border: '2px solid #1A1A1A',
    boxShadow: '0 2px 8px rgba(255, 215, 0, 0.4)',
    animation: animate ? 'pulse 2s infinite' : 'none',
    transform: 'scale(1)',
    transformOrigin: 'center',
    transition: 'all 0.3s ease',
  },
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(1)',
      boxShadow: '0 2px 8px rgba(255, 215, 0, 0.4)',
    },
    '50%': {
      transform: 'scale(1.1)',
      boxShadow: '0 4px 16px rgba(255, 215, 0, 0.6)',
    },
    '100%': {
      transform: 'scale(1)',
      boxShadow: '0 2px 8px rgba(255, 215, 0, 0.4)',
    },
  },
}));

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: '12px',
  backgroundColor: alpha('#1A1A1A', 0.8),
  border: '1px solid rgba(255, 255, 255, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: alpha('#1A1A1A', 1),
    borderColor: '#FFD700',
    boxShadow: '0 2px 8px rgba(255, 215, 0, 0.15)',
  },
  '&:focus-within': {
    backgroundColor: '#2A2A2A',
    borderColor: '#FFD700',
    boxShadow: '0 0 0 3px rgba(255, 215, 0, 0.2), 0 4px 12px rgba(255, 215, 0, 0.15)',
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
    minWidth: '250px',
  },
  [theme.breakpoints.down('sm')]: {
    minWidth: 'auto',
    width: '100%',
    maxWidth: '100%',
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
  color: '#F8F8F8',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.25, 1, 1.25, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    color: '#F8F8F8',
    '&::placeholder': {
      color: 'rgba(248, 248, 248, 0.6)',
      opacity: 1,
    },
    [theme.breakpoints.up('sm')]: {
      width: '20ch',
      '&:focus': {
        width: '25ch',
      },
    },
  },
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: '#F8F8F8',
  fontWeight: 500,
  fontSize: '0.95rem',
  padding: '8px 16px',
  borderRadius: '8px',
  textTransform: 'none',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    color: '#FFD700',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(255, 215, 0, 0.2)',
  },
  '&:active': {
    transform: 'translateY(0)',
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
  
  const { userInfo: user, isAuthenticated } = useSelector((state) => state.auth);
  const { cartCount } = useSelector((state) => state.cart);
  
  const cartItemsCount = cartCount || 0;

  // Cart loading is now handled in App.js to avoid duplicate calls

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
        <Toolbar sx={{ 
          py: { xs: 0.5, md: 1 }, 
          minHeight: { xs: '64px', md: '72px' },
          px: { xs: 1, md: 2 },
        }}>
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
          <LogoContainer 
            component={RouterLink} 
            to="/" 
            sx={{ 
              mr: { xs: 1, md: 4 },
              flexShrink: 0,
            }}
          >
            <LogoImage 
              src="/images/perfumes_plug_logo.jpg" 
              alt="Perfumes Plug Rwanda Logo"
            />
            {!isMobile && (
              <LogoText variant="h6" noWrap>
                Perfumes Plug Rwanda
              </LogoText>
            )}
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
          <Search 
            sx={{ 
              mx: { xs: 1, md: 2 }, 
              flexGrow: isMobile ? 1 : 0,
              maxWidth: { xs: '200px', sm: '250px', md: 'none' },
            }}
          >
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder={isMobile ? "Search..." : "Search perfumes..."}
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
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 0.5, md: 1 },
            flexShrink: 0,
          }}>
            {/* Floating Cart */}
            <FloatingCartButton
              component={RouterLink}
              to="/cart"
              aria-label="Shopping cart"
            >
              <FloatingCartBadge badgeContent={cartItemsCount} max={99} animate={cartItemsCount > 0}>
                 <ShoppingCart sx={{ fontSize: '1.5rem' }} />
               </FloatingCartBadge>
            </FloatingCartButton>

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
              <Box sx={{ 
                display: 'flex', 
                gap: { xs: 0.5, md: 1 },
                flexShrink: 0,
              }}>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="outlined"
                  size={isMobile ? "small" : "small"}
                  sx={{
                    borderColor: '#FFD700',
                    color: '#FFD700',
                    fontWeight: 600,
                    borderRadius: '8px',
                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                    px: { xs: 1, md: 2 },
                    minWidth: { xs: 'auto', md: '64px' },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 215, 0, 0.1)',
                      borderColor: '#FFA500',
                      color: '#FFA500',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)',
                    }
                  }}
                >
                  {isMobile ? 'Login' : 'Login'}
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  size={isMobile ? "small" : "small"}
                  sx={{
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    color: '#1A1A1A',
                    fontWeight: 700,
                    borderRadius: '8px',
                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                    px: { xs: 1, md: 2 },
                    minWidth: { xs: 'auto', md: '64px' },
                    boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #FFA500 0%, #FF8C00 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(255, 215, 0, 0.4)',
                    }
                  }}
                >
                  {isMobile ? 'Sign Up' : 'Sign Up'}
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
            backgroundColor: '#0A0A0A',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          {/* Mobile Logo */}
          <LogoContainer component={RouterLink} to="/" onClick={handleDrawerToggle} sx={{ mb: 3 }}>
            <LogoImage 
              src="/images/perfumes_plug_logo.jpg" 
              alt="Perfumes Plug Rwanda Logo"
            />
            <LogoText variant="h6" noWrap>
              Perfumes Plug Rwanda
            </LogoText>
          </LogoContainer>
          
          <Divider sx={{ mb: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
          
          {/* Mobile Navigation Links */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              component={RouterLink}
              to="/"
              onClick={handleDrawerToggle}
              fullWidth
              sx={{
                justifyContent: 'flex-start',
                color: '#F8F8F8',
                py: 1.5,
                px: 2,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: 'rgba(255, 215, 0, 0.1)',
                  color: '#FFD700',
                },
              }}
            >
              Home
            </Button>
            <Button
              component={RouterLink}
              to="/perfumes"
              onClick={handleDrawerToggle}
              fullWidth
              sx={{
                justifyContent: 'flex-start',
                color: '#F8F8F8',
                py: 1.5,
                px: 2,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: 'rgba(255, 215, 0, 0.1)',
                  color: '#FFD700',
                },
              }}
            >
              Shop
            </Button>
            <Button
              component={RouterLink}
              to="/categories"
              onClick={handleDrawerToggle}
              fullWidth
              sx={{
                justifyContent: 'flex-start',
                color: '#F8F8F8',
                py: 1.5,
                px: 2,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: 'rgba(255, 215, 0, 0.1)',
                  color: '#FFD700',
                },
              }}
            >
              Categories
            </Button>
            {isAuthenticated && user?.is_staff && (
              <Button
                component={RouterLink}
                to="/admin"
                onClick={handleDrawerToggle}
                fullWidth
                sx={{
                  justifyContent: 'flex-start',
                  color: '#F8F8F8',
                  py: 1.5,
                  px: 2,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 215, 0, 0.1)',
                    color: '#FFD700',
                  },
                }}
              >
                Admin
              </Button>
            )}
          </Box>
          
          <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
          
          {/* Mobile Auth Buttons */}
          {isAuthenticated ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                component={RouterLink}
                to="/profile"
                onClick={handleDrawerToggle}
                fullWidth
                startIcon={<AccountCircle />}
                sx={{
                  justifyContent: 'flex-start',
                  color: '#F8F8F8',
                  py: 1.5,
                  px: 2,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 215, 0, 0.1)',
                    color: '#FFD700',
                  },
                }}
              >
                Profile
              </Button>
              <Button
                component={RouterLink}
                to="/orders"
                onClick={handleDrawerToggle}
                fullWidth
                startIcon={<Receipt />}
                sx={{
                  justifyContent: 'flex-start',
                  color: '#F8F8F8',
                  py: 1.5,
                  px: 2,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 215, 0, 0.1)',
                    color: '#FFD700',
                  },
                }}
              >
                Orders
              </Button>
              <Button
                onClick={() => {
                  handleLogout();
                  handleDrawerToggle();
                }}
                fullWidth
                startIcon={<Logout />}
                sx={{
                  justifyContent: 'flex-start',
                  color: '#F8F8F8',
                  py: 1.5,
                  px: 2,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 0, 0, 0.1)',
                    color: '#FF6B6B',
                  },
                }}
              >
                Logout
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                component={RouterLink}
                to="/login"
                onClick={handleDrawerToggle}
                variant="outlined"
                fullWidth
                sx={{
                  borderColor: '#FFD700',
                  color: '#FFD700',
                  fontWeight: 600,
                  py: 1.5,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 215, 0, 0.1)',
                    borderColor: '#FFA500',
                    color: '#FFA500',
                  },
                }}
              >
                Login
              </Button>
              <Button
                component={RouterLink}
                to="/register"
                onClick={handleDrawerToggle}
                variant="contained"
                fullWidth
                sx={{
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                  color: '#1A1A1A',
                  fontWeight: 700,
                  py: 1.5,
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #FFA500 0%, #FF8C00 100%)',
                    boxShadow: '0 6px 20px rgba(255, 215, 0, 0.4)',
                  },
                }}
              >
                Sign Up
              </Button>
            </Box>
          )}
        </Box>
      </Drawer>
    </StyledAppBar>
  );
};

export default Header;