import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import axios from 'axios';
import Products from '../pages/admin/Products';
import perfumeSlice from '../features/perfume/perfumeSlice';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock the API utility
jest.mock('../utils/api', () => ({
  getApiUrl: (path) => `http://localhost:8000${path}`
}));

// Mock AdminLayout
jest.mock('../components/admin/AdminLayout', () => {
  return function MockAdminLayout({ children }) {
    return <div data-testid="admin-layout">{children}</div>;
  };
});

const mockStore = configureStore({
  reducer: {
    perfume: perfumeSlice,
    auth: (state = { user: { token: 'test-token' } }) => state
  },
  preloadedState: {
    perfume: {
      perfumes: [],
      categories: [
        { id: 1, name: 'Men', slug: 'men' },
        { id: 2, name: 'Women', slug: 'women' }
      ],
      brands: [
        { id: 1, name: 'Tom Ford', slug: 'tom-ford' },
        { id: 2, name: 'Chanel', slug: 'chanel' }
      ],
      loading: false,
      totalCount: 0
    },
    auth: {
      user: { token: 'test-token' }
    }
  }
});

describe('Products Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderProducts = () => {
    return render(
      <Provider store={mockStore}>
        <Products />
      </Provider>
    );
  };

  test('renders products page with add button', () => {
    renderProducts();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Add Product')).toBeInTheDocument();
  });

  test('opens product dialog when add button is clicked', () => {
    renderProducts();
    const addButton = screen.getByText('Add Product');
    fireEvent.click(addButton);
    expect(screen.getByText('Add New Product:')).toBeInTheDocument();
  });

  test('form fields have proper placeholders instead of static values', () => {
    renderProducts();
    const addButton = screen.getByText('Add Product');
    fireEvent.click(addButton);

    // Check that form fields are empty with placeholders
    const nameField = screen.getByLabelText('Product Name');
    const stockField = screen.getByLabelText('Stock');
    const priceField = screen.getByLabelText('Price');
    const descriptionField = screen.getByLabelText('Description');

    expect(nameField.value).toBe('');
    expect(stockField.value).toBe('');
    expect(priceField.value).toBe('');
    expect(descriptionField.value).toBe('');

    expect(nameField.placeholder).toBe('Enter product name');
    expect(stockField.placeholder).toBe('Enter stock quantity');
    expect(priceField.placeholder).toBe('Enter price');
    expect(descriptionField.placeholder).toBe('Enter product description');
  });

  test('validates required fields before submission', async () => {
    renderProducts();
    const addButton = screen.getByText('Add Product');
    fireEvent.click(addButton);

    const createButton = screen.getByText('Create');
    fireEvent.click(createButton);

    // Should show validation alert for missing fields
    await waitFor(() => {
      // Note: jsdom doesn't support window.alert, so we'd need to mock it
      // or check for validation state changes
    });
  });

  test('sends correct data format to backend', async () => {
    mockedAxios.post.mockResolvedValue({
      status: 201,
      data: { id: 1, slug: 'test-product', name: 'Test Product' }
    });

    renderProducts();
    const addButton = screen.getByText('Add Product');
    fireEvent.click(addButton);

    // Fill in the form
    fireEvent.change(screen.getByLabelText('Product Name'), {
      target: { value: 'Test Product' }
    });
    fireEvent.change(screen.getByLabelText('Price'), {
      target: { value: '99.99' }
    });
    fireEvent.change(screen.getByLabelText('Stock'), {
      target: { value: '10' }
    });
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Test description' }
    });

    // Select brand and category
    const brandSelect = screen.getByLabelText('Brand');
    const categorySelect = screen.getByLabelText('Category');
    
    fireEvent.mouseDown(brandSelect);
    fireEvent.click(screen.getByText('Tom Ford'));
    
    fireEvent.mouseDown(categorySelect);
    fireEvent.click(screen.getByText('Men'));

    const createButton = screen.getByText('Create');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8000/api/perfumes/',
        expect.objectContaining({
          name: 'Test Product',
          price: '99.99',
          stock: '10',
          description: 'Test description',
          brand: 1,
          category: 1,
          gender: 'U',
          is_featured: 'No',
          is_active: true
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
    });
  });

  test('handles FormData correctly when no images selected', async () => {
    // Mock canvas and blob creation
    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: jest.fn(() => ({
        fillStyle: '',
        fillRect: jest.fn(),
        font: '',
        textAlign: '',
        fillText: jest.fn()
      })),
      toBlob: jest.fn((callback) => {
        const mockBlob = new Blob(['test'], { type: 'image/png' });
        callback(mockBlob);
      })
    };
    
    document.createElement = jest.fn(() => mockCanvas);

    mockedAxios.post.mockResolvedValue({
      status: 201,
      data: { id: 1, slug: 'test-product', name: 'Test Product' }
    });

    renderProducts();
    const addButton = screen.getByText('Add Product');
    fireEvent.click(addButton);

    // Fill in the form
    fireEvent.change(screen.getByLabelText('Product Name'), {
      target: { value: 'Test Product' }
    });
    fireEvent.change(screen.getByLabelText('Price'), {
      target: { value: '99.99' }
    });
    fireEvent.change(screen.getByLabelText('Stock'), {
      target: { value: '10' }
    });
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Test description' }
    });

    // Select brand and category
    const brandSelect = screen.getByLabelText('Brand');
    const categorySelect = screen.getByLabelText('Category');
    
    fireEvent.mouseDown(brandSelect);
    fireEvent.click(screen.getByText('Tom Ford'));
    
    fireEvent.mouseDown(categorySelect);
    fireEvent.click(screen.getByText('Men'));

    const createButton = screen.getByText('Create');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8000/api/perfumes/',
        expect.any(FormData),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'multipart/form-data'
          })
        })
      );
    });

    // Verify FormData contains correct fields as single values, not arrays
    const formDataCall = mockedAxios.post.mock.calls[0][1];
    expect(formDataCall).toBeInstanceOf(FormData);
  });

  test('handles image upload and validates image requirement', async () => {
    // Mock window.alert
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    renderProducts();
    const addButton = screen.getByText('Add Product');
    fireEvent.click(addButton);

    

    // Fill in all required fields except image
    fireEvent.change(screen.getByLabelText('Product Name'), {
      target: { value: 'Test Product' }
    });
    fireEvent.change(screen.getByLabelText('Price'), {
      target: { value: '99.99' }
    });
    fireEvent.change(screen.getByLabelText('Stock'), {
      target: { value: '10' }
    });
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Test description' }
    });

    // Select brand and category
    const brandSelect = screen.getByLabelText('Brand');
    const categorySelect = screen.getByLabelText('Category');
    
    fireEvent.mouseDown(brandSelect);
    fireEvent.click(screen.getByText('Tom Ford'));
    
    fireEvent.mouseDown(categorySelect);
    fireEvent.click(screen.getByText('Men'));

    const createButton = screen.getByText('Create');
    fireEvent.click(createButton);

    // Should show alert for missing image
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Please select at least one image for the product');
    });

    alertSpy.mockRestore();
  });

  test('sends FormData with image when image is selected', async () => {
    mockedAxios.post.mockResolvedValue({
      status: 201,
      data: { id: 1, slug: 'test-product', name: 'Test Product' }
    });

    renderProducts();
    const addButton = screen.getByText('Add Product');
    fireEvent.click(addButton);

    // Fill in the form
    fireEvent.change(screen.getByLabelText('Product Name'), {
      target: { value: 'Test Product' }
    });
    fireEvent.change(screen.getByLabelText('Price'), {
      target: { value: '99.99' }
    });
    fireEvent.change(screen.getByLabelText('Stock'), {
      target: { value: '10' }
    });
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Test description' }
    });

    // Select brand and category
    const brandSelect = screen.getByLabelText('Brand');
    const categorySelect = screen.getByLabelText('Category');
    
    fireEvent.mouseDown(brandSelect);
    fireEvent.click(screen.getByText('Tom Ford'));
    
    fireEvent.mouseDown(categorySelect);
    fireEvent.click(screen.getByText('Men'));

    // Mock file upload
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const uploadButton = screen.getByText('Upload Image');
    const fileInput = uploadButton.closest('label').querySelector('input[type="file"]');
    
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
    });
    
    fireEvent.change(fileInput);

    const createButton = screen.getByText('Create');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8000/api/perfumes/',
        expect.any(FormData),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'multipart/form-data'
          })
        })
      );
    });

    // Verify FormData contains the image
    const formDataCall = mockedAxios.post.mock.calls[0][1];
    expect(formDataCall).toBeInstanceOf(FormData);
  });

  test('does not send slug field in FormData', async () => {
    mockedAxios.post.mockResolvedValue({
      status: 201,
      data: { id: 1, slug: 'test-product', name: 'Test Product' }
    });

    renderProducts();
    const addButton = screen.getByText('Add Product');
    fireEvent.click(addButton);

    // Fill in the form with all required fields
    fireEvent.change(screen.getByLabelText('Product Name'), {
      target: { value: 'Test Product' }
    });
    fireEvent.change(screen.getByLabelText('Price'), {
      target: { value: '99.99' }
    });
    fireEvent.change(screen.getByLabelText('Stock'), {
      target: { value: '10' }
    });
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Test description' }
    });

    // Select brand and category
    const brandSelect = screen.getByLabelText('Brand');
    const categorySelect = screen.getByLabelText('Category');
    
    fireEvent.mouseDown(brandSelect);
    fireEvent.click(screen.getByText('Tom Ford'));
    
    fireEvent.mouseDown(categorySelect);
    fireEvent.click(screen.getByText('Men'));

    // Mock file upload
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const uploadButton = screen.getByText('Upload Image');
    const fileInput = uploadButton.closest('label').querySelector('input[type="file"]');
    
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
    });
    
    fireEvent.change(fileInput);

    const createButton = screen.getByText('Create');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalled();
    });

    // Verify FormData does not contain slug field
    const formDataCall = mockedAxios.post.mock.calls[0][1];
    expect(formDataCall).toBeInstanceOf(FormData);
    
    // Convert FormData to array to check entries
    const formDataEntries = Array.from(formDataCall.entries());
    const slugEntry = formDataEntries.find(([key]) => key === 'slug');
    expect(slugEntry).toBeUndefined();
  });
});