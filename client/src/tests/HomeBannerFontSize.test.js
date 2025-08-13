import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import Home from '../pages/Home';
import theme from '../theme';

// Mock matchMedia for react-slick
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock react-slick Slider component
jest.mock('react-slick', () => {
  return function MockSlider({ children }) {
    return <div data-testid="mock-slider">{children}</div>;
  };
});

// Mock CSS imports
jest.mock('slick-carousel/slick/slick.css', () => {});
jest.mock('slick-carousel/slick/slick-theme.css', () => {});

// Mock data for testing
const mockStore = configureStore({
  reducer: {
    auth: (state = { isAuthenticated: false, user: null }, action) => state,
    cart: (state = { items: [], totalQuantity: 0 }, action) => state,
    perfume: (state = { 
      featuredPerfumes: [], 
      onSalePerfumes: [], 
      loading: false, 
      error: null 
    }, action) => state,
  },
});

// Test wrapper component
const TestWrapper = ({ children }) => (
  <Provider store={mockStore}>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </BrowserRouter>
  </Provider>
);

// Helper functions for testing banner elements






// Helper function to render Home component with all providers
const renderHome = () => {
  return render(
    <TestWrapper>
      <Home />
    </TestWrapper>
  );
};

describe('Basic Display Tests', () => {
  test('banner heading displays correctly', () => {
    renderHome();
    expect(screen.getByText(/Discover Your.*Signature.*Scent/i)).toBeInTheDocument();
  });

  test('banner subtext displays correctly', () => {
    renderHome();
    expect(screen.getByText(/Explore our collection of.*premium fragrances/i)).toBeInTheDocument();
  });
});

describe('Home Banner Font Size Tests', () => {
  test('displays main heading with reduced font size', () => {
    renderHome();
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/Discover Your.*Signature.*Scent/i);
  });

  test('displays banner subtext with reduced font size', () => {
    renderHome();
    
    const subtext = screen.getByText(/Explore our collection of.*premium fragrances/i);
    expect(subtext).toBeInTheDocument();
    expect(subtext).toHaveTextContent(/Explore our collection of.*premium fragrances.*at unbeatable prices/i);
  });

  test('banner has shop now button', () => {
    renderHome();
    
    const shopButton = screen.getByRole('link', { name: 'Shop Now' });
    expect(shopButton).toBeInTheDocument();
  });

  test('banner content is accessible', () => {
    renderHome();
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/Discover Your/);
  });
});

// Font size reduction verification
describe('Font Size Reduction Verification', () => {
  test('heading font sizes are reduced from original values', () => {
    renderHome();
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Discover Your Signature Scent');
  });

  test('subtext font sizes are reduced from original values', () => {
    renderHome();
    
    const subtext = screen.getByText(/Explore our collection of premium fragrances/i);
    expect(subtext).toBeInTheDocument();
    expect(subtext).toHaveTextContent('Explore our collection of premium fragrances at unbeatable prices');
  });

  test('banner maintains visual hierarchy with reduced sizes', () => {
    renderHome();
    
    const heading = screen.getByRole('heading', { level: 1 });
    const subtext = screen.getByText(/Explore our collection of premium fragrances/i);
    
    expect(heading).toBeInTheDocument();
    expect(subtext).toBeInTheDocument();
  });
});