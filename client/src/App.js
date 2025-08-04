import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container } from '@mui/material';

// Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

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

// Admin Pages
import { Dashboard, Products, Orders, Users, Categories, Brands, Customers, Settings } from './pages/admin';

// Auth
import PrivateRoute from './components/routes/PrivateRoute';
import AdminRoute from './components/routes/AdminRoute';

// Actions
import { checkAuth } from './features/auth/authSlice';
import { getCart } from './features/cart/cartSlice';

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    // Check if user is authenticated on app load
    dispatch(checkAuth());
  }, [dispatch]);

  useEffect(() => {
    // Get cart if user is authenticated
    if (isAuthenticated) {
      dispatch(getCart());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <>
      <Header />
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

          {/* Protected Routes */}
          <Route path="/checkout" element={
            <PrivateRoute>
              <CheckoutPage />
            </PrivateRoute>
          } />
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
        </Routes>
      </Container>
      <Footer />
    </>
  );
};

export default App;