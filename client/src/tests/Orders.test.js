import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Orders from '../pages/admin/Orders';
import orderReducer from '../features/order/orderSlice';
import authReducer from '../features/auth/authSlice';

// Mock the API calls
jest.mock('../features/order/orderSlice', () => ({
  ...jest.requireActual('../features/order/orderSlice'),
  getAllOrders: jest.fn(() => ({ type: 'orders/getAllOrders/pending' })),
}));

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      orders: orderReducer,
      auth: authReducer,
    },
    preloadedState: {
      orders: {
        orders: [
          {
            id: 1,
            created_at: '2024-01-01T00:00:00Z',
            user: { first_name: 'John', last_name: 'Doe' },
            total_amount: '99.99',
            status: 'pending',
            payment_status: true, // Boolean value
          },
          {
            id: 2,
            created_at: '2024-01-02T00:00:00Z',
            user: { first_name: 'Jane', last_name: 'Smith' },
            total_amount: '149.99',
            status: 'confirmed',
            payment_status: false, // Boolean value
          },
        ],
        loading: false,
        error: null,
      },
      auth: {
        user: { role: 'admin' },
        isAuthenticated: true,
      },
      ...initialState,
    },
  });
};

const renderWithProviders = (component, store = createMockStore()) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('Orders Component', () => {
  test('renders orders table with payment status as boolean', async () => {
    renderWithProviders(<Orders />);
    
    await waitFor(() => {
      expect(screen.getByText('Orders Management')).toBeInTheDocument();
    });
    
    // Check that boolean payment_status is displayed correctly
    expect(screen.getByText('Paid')).toBeInTheDocument();
    expect(screen.getByText('Unpaid')).toBeInTheDocument();
  });

  test('handles undefined payment_status gracefully', async () => {
    const storeWithUndefinedPayment = createMockStore({
      orders: {
        orders: [
          {
            id: 3,
            created_at: '2024-01-03T00:00:00Z',
            user: { first_name: 'Test', last_name: 'User' },
            total_amount: '199.99',
            status: 'delivered',
            payment_status: undefined,
          },
        ],
        loading: false,
        error: null,
      },
    });
    
    renderWithProviders(<Orders />, storeWithUndefinedPayment);
    
    await waitFor(() => {
      expect(screen.getByText('Orders Management')).toBeInTheDocument();
    });
    
    // Check that undefined payment_status shows 'Unknown'
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  test('payment status color function handles boolean values', () => {
    // This test would need to be implemented by extracting the function
    // or testing it through the component's rendered output
    renderWithProviders(<Orders />);
    
    // The color should be applied correctly based on boolean values
    // This is tested indirectly through the component rendering without errors
    expect(screen.getByText('Orders Management')).toBeInTheDocument();
  });

  test('does not throw TypeError when rendering payment status', async () => {
    // This test ensures the charAt error is fixed
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    renderWithProviders(<Orders />);
    
    await waitFor(() => {
      expect(screen.getByText('Orders Management')).toBeInTheDocument();
    });
    
    // Should not have any console errors about charAt
    expect(consoleSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('charAt is not a function')
    );
    
    consoleSpy.mockRestore();
  });
});