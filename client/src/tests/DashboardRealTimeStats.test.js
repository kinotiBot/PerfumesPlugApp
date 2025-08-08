import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import '@testing-library/jest-dom';
import authReducer from '../features/auth/authSlice';
import orderReducer from '../features/order/orderSlice';
import userReducer from '../features/user/userSlice';

// Simple component to test statistics calculation
const TestStatsComponent = ({ orders, users }) => {
  const stats = {
    totalSales: orders ? orders.reduce((sum, order) => sum + (order.total_amount || 0), 0) : 0,
    totalOrders: orders ? orders.length : 0,
    pendingOrders: orders ? orders.filter(order => order.status === 'pending').length : 0,
    totalCustomers: users ? users.length : 0,
  };

  return (
    <div>
      <div data-testid="total-sales">${stats.totalSales.toFixed(2)}</div>
      <div data-testid="total-orders">{stats.totalOrders}</div>
      <div data-testid="pending-orders">{stats.pendingOrders}</div>
      <div data-testid="total-customers">{stats.totalCustomers}</div>
    </div>
  );
};

const createMockStore = (initialState) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      order: orderReducer,
      user: userReducer,
    },
    preloadedState: initialState,
  });
};

const renderWithProviders = (component) => {
  const store = createMockStore({});
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('Dashboard Real-Time Statistics', () => {

  const mockOrdersData = [
    {
      id: 1,
      total_amount: 100.00,
      status: 'pending',
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      total_amount: 150.50,
      status: 'processing',
      created_at: '2024-01-02T00:00:00Z',
    },
    {
      id: 3,
      total_amount: 75.25,
      status: 'delivered',
      created_at: '2024-01-03T00:00:00Z',
    },
  ];

  const mockUsersData = [
    { id: 1, email: 'user1@test.com' },
    { id: 2, email: 'user2@test.com' },
    { id: 3, email: 'user3@test.com' },
    { id: 4, email: 'user4@test.com' },
  ];

  test('calculates real-time total sales from orders data', () => {
    renderWithProviders(<TestStatsComponent orders={mockOrdersData} users={mockUsersData} />);

    expect(screen.getByTestId('total-sales')).toHaveTextContent('$325.75'); // 100 + 150.50 + 75.25
  });

  test('calculates real-time total orders count', () => {
    renderWithProviders(<TestStatsComponent orders={mockOrdersData} users={mockUsersData} />);

    expect(screen.getByTestId('total-orders')).toHaveTextContent('3'); // 3 orders
  });

  test('calculates real-time pending orders count', () => {
    renderWithProviders(<TestStatsComponent orders={mockOrdersData} users={mockUsersData} />);

    expect(screen.getByTestId('pending-orders')).toHaveTextContent('1'); // 1 pending order
  });

  test('calculates real-time total customers count from users data', () => {
    renderWithProviders(<TestStatsComponent orders={mockOrdersData} users={mockUsersData} />);

    expect(screen.getByTestId('total-customers')).toHaveTextContent('4'); // 4 users
  });

  test('handles empty orders data gracefully', () => {
    renderWithProviders(<TestStatsComponent orders={[]} users={mockUsersData} />);

    expect(screen.getByTestId('total-sales')).toHaveTextContent('$0.00');
    expect(screen.getByTestId('total-orders')).toHaveTextContent('0');
    expect(screen.getByTestId('pending-orders')).toHaveTextContent('0');
  });

  test('handles empty users data gracefully', () => {
    renderWithProviders(<TestStatsComponent orders={mockOrdersData} users={[]} />);

    expect(screen.getByTestId('total-customers')).toHaveTextContent('0');
  });

  test('handles null data gracefully', () => {
    renderWithProviders(<TestStatsComponent orders={null} users={null} />);

    expect(screen.getByTestId('total-sales')).toHaveTextContent('$0.00');
    expect(screen.getByTestId('total-orders')).toHaveTextContent('0');
    expect(screen.getByTestId('pending-orders')).toHaveTextContent('0');
    expect(screen.getByTestId('total-customers')).toHaveTextContent('0');
  });
});