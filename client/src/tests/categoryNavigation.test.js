// Automated test for category navigation functionality
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Categories from '../pages/Categories';
import PerfumeList from '../pages/PerfumeList';
import perfumeReducer from '../features/perfume/perfumeSlice';
import authReducer from '../features/auth/authSlice';
import cartReducer from '../features/cart/cartSlice';

// Mock API calls
jest.mock('../features/perfume/perfumeSlice', () => ({
  ...jest.requireActual('../features/perfume/perfumeSlice'),
  getCategories: jest.fn(() => ({ type: 'perfume/getCategories/fulfilled', payload: { results: mockCategories } })),
  getPerfumes: jest.fn(() => ({ type: 'perfume/getPerfumes/fulfilled', payload: { results: mockPerfumes } }))
}));

const mockCategories = [
  { id: 1, name: 'Men', slug: 'men', description: 'Fragrances for men' },
  { id: 2, name: 'Women', slug: 'women', description: 'Fragrances for women' },
  { id: 3, name: 'Unisex', slug: 'unisex', description: 'Fragrances for everyone' },
  { id: 4, name: 'Luxury', slug: 'luxury', description: 'Premium luxury fragrances' }
];

const mockPerfumes = [
  { id: 1, name: 'Test Perfume 1', category: 1, price: '100.00' },
  { id: 2, name: 'Test Perfume 2', category: 1, price: '150.00' }
];

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      perfume: perfumeReducer,
      auth: authReducer,
      cart: cartReducer
    },
    preloadedState: {
      perfume: {
        categories: mockCategories,
        perfumes: mockPerfumes,
        loading: false,
        error: null,
        page: 1,
        pages: 1,
        count: 2,
        ...initialState.perfume
      },
      auth: {
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
        ...initialState.auth
      },
      cart: {
        items: [],
        loading: false,
        error: null,
        ...initialState.cart
      }
    }
  });
};

const renderWithProviders = (component, { initialState = {} } = {}) => {
  const store = createTestStore(initialState);
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('Category Navigation', () => {
  test('renders categories page with category cards', async () => {
    renderWithProviders(<Categories />);
    
    // Check if categories are displayed
    await waitFor(() => {
      expect(screen.getByText('Perfume Categories')).toBeInTheDocument();
      expect(screen.getByText('Men')).toBeInTheDocument();
      expect(screen.getByText('Women')).toBeInTheDocument();
      expect(screen.getByText('Unisex')).toBeInTheDocument();
      expect(screen.getByText('Luxury')).toBeInTheDocument();
    });
  });

  test('category cards have browse products buttons', async () => {
    renderWithProviders(<Categories />);
    
    await waitFor(() => {
      const browseButtons = screen.getAllByText('Browse Products');
      expect(browseButtons).toHaveLength(4); // One for each category
    });
  });

  test('perfume list page handles category filter parameter', async () => {
    // Mock window.location.search
    delete window.location;
    window.location = { search: '?category=1' };
    
    renderWithProviders(<PerfumeList />);
    
    // The component should handle the category parameter
    // This test verifies the component renders without errors when category filter is applied
    await waitFor(() => {
      expect(screen.getByText(/perfume/i)).toBeInTheDocument();
    });
  });

  test('categories load without errors', async () => {
    const { container } = renderWithProviders(<Categories />);
    
    await waitFor(() => {
      // Check that no error messages are displayed
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/failed/i)).not.toBeInTheDocument();
      
      // Check that categories are rendered
      const categoryCards = container.querySelectorAll('.MuiCard-root');
      expect(categoryCards.length).toBeGreaterThan(0);
    });
  });
});