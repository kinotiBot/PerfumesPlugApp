import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  Pinterest,
  YouTube,
} from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[900],
        color: 'white',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Perfumes Plug
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ color: 'grey.400' }}>
              Your one-stop shop for premium fragrances at affordable prices.
              Discover your signature scent today.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <IconButton color="inherit" aria-label="Facebook">
                <Facebook />
              </IconButton>
              <IconButton color="inherit" aria-label="Twitter">
                <Twitter />
              </IconButton>
              <IconButton color="inherit" aria-label="Instagram">
                <Instagram />
              </IconButton>
              <IconButton color="inherit" aria-label="Pinterest">
                <Pinterest />
              </IconButton>
              <IconButton color="inherit" aria-label="YouTube">
                <YouTube />
              </IconButton>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Shop
            </Typography>
            <Link
              component={RouterLink}
              to="/perfumes"
              color="inherit"
              display="block"
              sx={{ mb: 1 }}
            >
              All Perfumes
            </Link>
            <Link
              component={RouterLink}
              to="/categories"
              color="inherit"
              display="block"
              sx={{ mb: 1 }}
            >
              Categories
            </Link>
            <Link
              component={RouterLink}
              to="/perfumes?featured=true"
              color="inherit"
              display="block"
              sx={{ mb: 1 }}
            >
              Featured
            </Link>
            <Link
              component={RouterLink}
              to="/perfumes?on_sale=true"
              color="inherit"
              display="block"
              sx={{ mb: 1 }}
            >
              On Sale
            </Link>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Customer Service
            </Typography>
            <Link
              component={RouterLink}
              to="/contact"
              color="inherit"
              display="block"
              sx={{ mb: 1 }}
            >
              Contact Us
            </Link>
            <Link
              component={RouterLink}
              to="/faq"
              color="inherit"
              display="block"
              sx={{ mb: 1 }}
            >
              FAQ
            </Link>
            <Link
              component={RouterLink}
              to="/shipping"
              color="inherit"
              display="block"
              sx={{ mb: 1 }}
            >
              Shipping & Returns
            </Link>
            <Link
              component={RouterLink}
              to="/privacy-policy"
              color="inherit"
              display="block"
              sx={{ mb: 1 }}
            >
              Privacy Policy
            </Link>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              My Account
            </Typography>
            <Link
              component={RouterLink}
              to="/login"
              color="inherit"
              display="block"
              sx={{ mb: 1 }}
            >
              Login
            </Link>
            <Link
              component={RouterLink}
              to="/register"
              color="inherit"
              display="block"
              sx={{ mb: 1 }}
            >
              Register
            </Link>
            <Link
              component={RouterLink}
              to="/profile"
              color="inherit"
              display="block"
              sx={{ mb: 1 }}
            >
              My Profile
            </Link>
            <Link
              component={RouterLink}
              to="/orders"
              color="inherit"
              display="block"
              sx={{ mb: 1 }}
            >
              Order History
            </Link>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, backgroundColor: 'grey.700' }} />

        <Typography variant="body2" color="text.secondary" align="center" sx={{ color: 'grey.500' }}>
          © {new Date().getFullYear()} Perfumes Plug. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;