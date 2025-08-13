import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { configureStore } from '@reduxjs/toolkit';
import '@testing-library/jest-dom';

import Cart from '../pages/Cart';
import cartReducer from '../features/cart/cartSlice';
import authReducer from '../features/auth/authSlice';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock API utilities
jest.mock('../utils/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

// Mock guest cart utilities
jest.mock('../utils/guestCart', () => ({
  getGuestCart: jest.fn(() => []),
  addToGuestCart: jest.fn(),
  updateGuestCartQuantity: jest.fn(),
  removeFromGuestCart: jest.fn(),
  clearGuestCart: jest.fn(),
}));

const theme = createTheme();

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      cart: cartReducer,
      auth: authReducer,
    },
    preloadedState: {
      cart: {
        cartItems: [],
        cartCount: 0,
        cartTotal: 0,
        loading: false,
        error: null,
        success: false,
        ...initialState.cart,
      },
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        ...initialState.auth,
      },
    },
  });
};

const TestWrapper = ({ children, store }) => (
  <Provider store={store}>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </BrowserRouter>
  </Provider>
);

describe('Cart Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('renders empty cart message when no items', () => {
    const store = createTestStore();
    render(
      <TestWrapper store={store}>
        <Cart />
      </TestWrapper>
    );

    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
    expect(screen.getByText(/continue shopping/i)).toBeInTheDocument();
  });

  test('renders cart items when items exist', () => {
    const mockCartItems = [
      {
        id: 1,
        quantity: 2,
        perfume_details: {
          id: 1,
          name: 'Test Perfume',
          price: 50000,
          discount_price: 45000,
          stock: 10,
          image: 'test-image.jpg',
        },
        total: 90000,
      },
    ];

    const store = createTestStore({
      cart: {
        cartItems: mockCartItems,
        cartCount: 2,
        cartTotal: 90000,
      },
    });

    render(
      <TestWrapper store={store}>
        <Cart />
      </TestWrapper>
    );

    expect(screen.getByText('Test Perfume')).toBeInTheDocument();
    expect(screen.getByText('RWF 90,000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2')).toBeInTheDocument();
  });

  test('handles quantity change correctly', async () => {
    const mockCartItems = [
      {
        id: 1,
        quantity: 1,
        perfume_details: {
          id: 1,
          name: 'Test Perfume',
          price: 50000,
          discount_price: 45000,
          stock: 10,
        },
        total: 45000,
      },
    ];

    const store = createTestStore({
      cart: {
        cartItems: mockCartItems,
        cartCount: 1,
        cartTotal: 45000,
      },
    });

    render(
      <TestWrapper store={store}>
        <Cart />
      </TestWrapper>
    );

    const quantityInput = screen.getByDisplayValue('1');
    fireEvent.change(quantityInput, { target: { value: '3' } });

    // The component should handle the quantity change
    expect(quantityInput.value).toBe('3');
  });

  test('calculates total correctly with discount price', () => {
    const mockCartItems = [
      {
        id: 1,
        quantity: 2,
        perfume_details: {
          id: 1,
          name: 'Test Perfume',
          price: 50000,
          discount_price: 45000,
          stock: 10,
        },
        // Test fallback calculation when total is not provided
      },
    ];

    const store = createTestStore({
      cart: {
        cartItems: mockCartItems,
        cartCount: 2,
        cartTotal: 90000,
      },
    });

    render(
      <TestWrapper store={store}>
        <Cart />
      </TestWrapper>
    );

    // Should show calculated total: 2 * 45000 = 90000
    expect(screen.getByText('RWF 90,000')).toBeInTheDocument();
  });

  test('handles loading state', () => {
    const store = createTestStore({
      cart: {
        loading: true,
      },
    });

    render(
      <TestWrapper store={store}>
        <Cart />
      </TestWrapper>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('handles error state', () => {
    const store = createTestStore({
      cart: {
        error: 'Failed to load cart',
      },
    });

    render(
      <TestWrapper store={store}>
        <Cart />
      </TestWrapper>
    );

    expect(screen.getByText(/failed to load cart/i)).toBeInTheDocument();
  });

  test('handles guest cart items with different structure', () => {
    const mockCartItems = [
      {
        id: 1,
        quantity: 1,
        perfume: {
          id: 1,
          name: 'Guest Perfume',
          price: 30000,
          discount_price: 25000,
          stock: 5,
        },
      },
    ];

    const store = createTestStore({
      cart: {
        cartItems: mockCartItems,
        cartCount: 1,
        cartTotal: 25000,
      },
    });

    render(
      <TestWrapper store={store}>
        <Cart />
      </TestWrapper>
    );

    expect(screen.getByText('Guest Perfume')).toBeInTheDocument();
    expect(screen.getByText('RWF 25,000')).toBeInTheDocument();
  });

  test('prevents quantity increase when stock limit reached', () => {
    const mockCartItems = [
      {
        id: 1,
        quantity: 5,
        perfume_details: {
          id: 1,
          name: 'Limited Stock Perfume',
          price: 40000,
          stock: 5, // Same as quantity
        },
        total: 200000,
      },
    ];

    const store = createTestStore({
      cart: {
        cartItems: mockCartItems,
        cartCount: 5,
        cartTotal: 200000,
      },
    });

    render(
      <TestWrapper store={store}>
        <Cart />
      </TestWrapper>
    );

    const increaseButton = screen.getByLabelText(/increase quantity/i);
    expect(increaseButton).toBeDisabled();
  });
});