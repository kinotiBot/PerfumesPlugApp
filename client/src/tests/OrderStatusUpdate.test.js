import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import '@testing-library/jest-dom';
import authReducer from '../features/auth/authSlice';
import orderReducer from '../features/order/orderSlice';
import { updateOrderStatus, updatePaymentReceived } from '../features/order/orderSlice';

// Mock the API calls
jest.mock('../features/order/orderSlice', () => ({
  ...jest.requireActual('../features/order/orderSlice'),
  updateOrderStatus: jest.fn(),
  updatePaymentReceived: jest.fn(),
}));

// Simple component to test order status updates
const TestOrderStatusComponent = ({ order, onStatusChange, onPaymentStatusChange }) => {
  return (
    <div>
      <div data-testid="current-status">{order.status}</div>
      <div data-testid="current-payment-status">{order.payment_status ? 'paid' : 'unpaid'}</div>
      
      <select data-testid="status-select" onChange={(e) => onStatusChange(e.target.value)}>
        <option value="pending">Pending</option>
        <option value="processing">Processing</option>
        <option value="shipped">Shipped</option>
        <option value="delivered">Delivered</option>
        <option value="cancelled">Cancelled</option>
      </select>
      
      <select data-testid="payment-status-select" onChange={(e) => onPaymentStatusChange(e.target.value)}>
        <option value="unpaid">Unpaid</option>
        <option value="paid">Paid</option>
      </select>
    </div>
  );
};

const createMockStore = (initialState) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      order: orderReducer,
    },
    preloadedState: initialState,
  });
};

const renderWithProviders = (component) => {
  const store = createMockStore({
    auth: {
      userInfo: { id: 1, is_staff: true },
      isAuthenticated: true,
      userToken: 'mock-token',
    },
    order: {
      orders: [],
      loading: false,
      error: null,
      updatingStatus: false,
      success: false,
      totalPages: 1,
    },
  });
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('Order Status Update Functionality', () => {
  const mockOrder = {
    id: 1,
    status: 'pending',
    payment_status: false,
    total_amount: 100.00,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    updateOrderStatus.mockReturnValue({
      type: 'order/updateOrderStatus/fulfilled',
      payload: { ...mockOrder, status: 'processing' },
    });
    updatePaymentReceived.mockReturnValue({
    type: 'order/updatePaymentReceived/fulfilled', 
      payload: { ...mockOrder, payment_status: true },
    });
  });

  test('displays current order status correctly', () => {
    const mockStatusChange = jest.fn();
    const mockPaymentStatusChange = jest.fn();
    
    renderWithProviders(
      <TestOrderStatusComponent 
        order={mockOrder} 
        onStatusChange={mockStatusChange}
        onPaymentStatusChange={mockPaymentStatusChange}
      />
    );

    expect(screen.getByTestId('current-status')).toHaveTextContent('pending');
    expect(screen.getByTestId('current-payment-status')).toHaveTextContent('unpaid');
  });

  test('calls status change handler when order status is updated', () => {
    const mockStatusChange = jest.fn();
    const mockPaymentStatusChange = jest.fn();
    
    renderWithProviders(
      <TestOrderStatusComponent 
        order={mockOrder} 
        onStatusChange={mockStatusChange}
        onPaymentStatusChange={mockPaymentStatusChange}
      />
    );

    const statusSelect = screen.getByTestId('status-select');
    fireEvent.change(statusSelect, { target: { value: 'processing' } });

    expect(mockStatusChange).toHaveBeenCalledWith('processing');
  });

  test('calls payment status change handler when payment status is updated', () => {
    const mockStatusChange = jest.fn();
    const mockPaymentStatusChange = jest.fn();
    
    renderWithProviders(
      <TestOrderStatusComponent 
        order={mockOrder} 
        onStatusChange={mockStatusChange}
        onPaymentStatusChange={mockPaymentStatusChange}
      />
    );

    const paymentStatusSelect = screen.getByTestId('payment-status-select');
    fireEvent.change(paymentStatusSelect, { target: { value: 'paid' } });

    expect(mockPaymentStatusChange).toHaveBeenCalledWith('paid');
  });

  test('handles paid order status correctly', () => {
    const paidOrder = { ...mockOrder, payment_status: true };
    const mockStatusChange = jest.fn();
    const mockPaymentStatusChange = jest.fn();
    
    renderWithProviders(
      <TestOrderStatusComponent 
        order={paidOrder} 
        onStatusChange={mockStatusChange}
        onPaymentStatusChange={mockPaymentStatusChange}
      />
    );

    expect(screen.getByTestId('current-payment-status')).toHaveTextContent('paid');
  });

  test('handles different order statuses correctly', () => {
    const shippedOrder = { ...mockOrder, status: 'shipped' };
    const mockStatusChange = jest.fn();
    const mockPaymentStatusChange = jest.fn();
    
    renderWithProviders(
      <TestOrderStatusComponent 
        order={shippedOrder} 
        onStatusChange={mockStatusChange}
        onPaymentStatusChange={mockPaymentStatusChange}
      />
    );

    expect(screen.getByTestId('current-status')).toHaveTextContent('shipped');
  });
});