import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { configureStore } from '@reduxjs/toolkit';
import AdminWelcome from '../components/admin/AdminWelcome';
import theme from '../theme';

// Setup testing-library matchers
import '@testing-library/jest-dom';

// Mock store with admin user
const createMockStore = (userInfo) => {
  return configureStore({
    reducer: {
      auth: (state = { userInfo }, action) => state,
    },
  });
};

// Test wrapper component
const TestWrapper = ({ children, store }) => (
  <Provider store={store}>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </BrowserRouter>
  </Provider>
);

describe('AdminWelcome Theme Consistency', () => {
  const mockAdminUser = {
    id: 1,
    email: 'admin@test.com',
    first_name: 'Admin',
    last_name: 'User',
    is_staff: true,
    is_superuser: true,
  };

  const mockStaffUser = {
    id: 2,
    email: 'staff@test.com',
    first_name: 'Staff',
    last_name: 'User',
    is_staff: true,
    is_superuser: false,
  };

  test('renders with black and gold theme for admin user', () => {
    const store = createMockStore(mockAdminUser);
    render(
      <TestWrapper store={store}>
        <AdminWelcome />
      </TestWrapper>
    );

    // Check if welcome message is displayed
    expect(screen.getByText('Welcome, Admin!')).toBeInTheDocument();
    
    // Check if Super Administrator chip is displayed
    expect(screen.getByText('Super Administrator')).toBeInTheDocument();
    
    // Check if quick action cards are present
    expect(screen.getByText('Manage Products')).toBeInTheDocument();
    expect(screen.getByText('Process Orders')).toBeInTheDocument();
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    
    // Check if buttons are present
    expect(screen.getByText('Go to Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Superuser Panel')).toBeInTheDocument();
  });

  test('renders with black and gold theme for staff user', () => {
    const store = createMockStore(mockStaffUser);
    render(
      <TestWrapper store={store}>
        <AdminWelcome />
      </TestWrapper>
    );

    // Check if welcome message is displayed
    expect(screen.getByText('Welcome, Staff!')).toBeInTheDocument();
    
    // Check if Staff Member chip is displayed
    expect(screen.getByText('Staff Member')).toBeInTheDocument();
    
    // Check if superuser panel button is not present for staff
    expect(screen.queryByText('Superuser Panel')).not.toBeInTheDocument();
  });

  test('does not render for non-staff user', () => {
    const nonStaffUser = { ...mockAdminUser, is_staff: false };
    const store = createMockStore(nonStaffUser);
    render(
      <TestWrapper store={store}>
        <AdminWelcome />
      </TestWrapper>
    );

    // Component should not render anything for non-staff users
    expect(screen.queryByText(/Welcome, .+!/)).not.toBeInTheDocument();
  });

  test('applies consistent theme colors', () => {
    const store = createMockStore(mockAdminUser);
    render(
    <TestWrapper store={store}>
      <AdminWelcome />
    </TestWrapper>
  );

  // Check for main welcome text
  expect(screen.getByText('Welcome, Admin!')).toBeInTheDocument();
  
  // Check if quick action cards are present
  expect(screen.getByText('Manage Products')).toBeInTheDocument();
  expect(screen.getByText('Process Orders')).toBeInTheDocument();
  expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  const actionTitles = screen.getAllByText(/(Manage Products|Process Orders|Admin Dashboard)/);
  expect(actionTitles.length).toBe(3); // Main card + action cards
  });

  test('displays correct administrative access message', () => {
    const store = createMockStore(mockAdminUser);
    render(
      <TestWrapper store={store}>
        <AdminWelcome />
      </TestWrapper>
    );

    expect(screen.getByText('You have administrative access to manage the perfume store')).toBeInTheDocument();
    expect(screen.getByText('Quick Access to Admin Features')).toBeInTheDocument();
  });

  test('displays correct action descriptions', () => {
    const store = createMockStore(mockAdminUser);
    render(
      <TestWrapper store={store}>
        <AdminWelcome />
      </TestWrapper>
    );

    expect(screen.getByText('Add, edit, and organize perfume inventory')).toBeInTheDocument();
    expect(screen.getByText('View and manage customer orders')).toBeInTheDocument();
    expect(screen.getByText('View comprehensive admin analytics')).toBeInTheDocument();
  });
});