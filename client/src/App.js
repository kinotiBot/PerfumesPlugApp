import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container } from '@mui/material';

// Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import PWAInstallPrompt from './components/PWAInstallPrompt';


// Pages
import HomePage from './pages/Home';
import PerfumeListPage from './pages/PerfumeList';
import PerfumeDetailPage from './pages/PerfumeDetail';
import CategoriesPage from './pages/Categories';
import CartPage from './pages/Cart';
import CheckoutPage from './pages/Checkout';
import OrdersPage from './pages/OrdersList';
import OrderDetailPage from './pages/OrderDetail';
import LoginPage from './pages/auth/Login';
import RegisterPage from './pages/auth/Register';
import ProfilePage from './pages/Profile';
import ApiTestPage from './pages/ApiTest';

// Admin Pages
import { Dashboard, Products, PerfumeInventory, Orders, Users, Categories, Brands, Customers, Settings, SuperuserPanel } from './pages/admin';

// Auth
import PrivateRoute from './components/routes/PrivateRoute';
import AdminRoute from './components/routes/AdminRoute';

// Actions
import { checkAuth } from './features/auth/authSlice';
import { getCart, loadGuestCart } from './features/cart/cartSlice';

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    // Check if user is authenticated on app load
    dispatch(checkAuth());
  }, [dispatch]);

  useEffect(() => {
    // Get cart if user is authenticated, otherwise load guest cart
    // Add a small delay to ensure auth state is properly initialized
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        dispatch(getCart());
      } else {
        dispatch(loadGuestCart());
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [dispatch, isAuthenticated]);

  return (
    <>
      <Header />
      <PWAInstallPrompt />
      <Container sx={{ minHeight: 'calc(100vh - 140px)', py: 4 }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/perfumes" element={<PerfumeListPage />} />
          <Route path="/perfume/:slug" element={<PerfumeDetailPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/api-test" element={<ApiTestPage />} />

          {/* Checkout Route - Allow both authenticated and guest users */}
          <Route path="/checkout" element={<CheckoutPage />} />

          {/* Protected Routes */}
          <Route path="/orders" element={
            <PrivateRoute>
              <OrdersPage />
            </PrivateRoute>
          } />
          <Route path="/order/:id" element={
            <PrivateRoute>
              <OrderDetailPage />
            </PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <Dashboard />
            </AdminRoute>
          } />
          <Route path="/admin/perfumes" element={
            <AdminRoute>
              <Products />
            </AdminRoute>
          } />
          <Route path="/admin/inventory" element={
            <AdminRoute>
              <PerfumeInventory />
            </AdminRoute>
          } />
          <Route path="/admin/orders" element={
            <AdminRoute>
              <Orders />
            </AdminRoute>
          } />
          <Route path="/admin/users" element={
            <AdminRoute>
              <Users />
            </AdminRoute>
          } />
          <Route path="/admin/categories" element={
            <AdminRoute>
              <Categories />
            </AdminRoute>
          } />
          <Route path="/admin/brands" element={
            <AdminRoute>
              <Brands />
            </AdminRoute>
          } />
          <Route path="/admin/customers" element={
            <AdminRoute>
              <Customers />
            </AdminRoute>
          } />
          <Route path="/admin/settings" element={
            <AdminRoute>
              <Settings />
            </AdminRoute>
          } />
          <Route path="/admin/superuser" element={
            <AdminRoute>
              <SuperuserPanel />
            </AdminRoute>
          } />

        </Routes>
      </Container>
      <Footer />
    </>
  );
};

export default App;