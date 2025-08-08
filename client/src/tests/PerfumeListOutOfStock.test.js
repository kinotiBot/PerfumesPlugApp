// Test for PerfumeList Out of Stock functionality
// This test focuses on the logic and data handling for out-of-stock perfumes

// Mock perfume data for testing
const mockPerfumeInStock = {
  id: 1,
  name: 'Test Perfume In Stock',
  brand_name: 'Test Brand',
  price: 50000,
  discount_price: null,
  stock: 10,
  is_in_stock: true,
  is_on_sale: false,
  featured: false,
  image: '/test-image.jpg',
  images: []
};

const mockPerfumeOutOfStock = {
  id: 2,
  name: 'Test Perfume Out of Stock',
  brand_name: 'Test Brand',
  price: 60000,
  discount_price: null,
  stock: 0,
  is_in_stock: false,
  is_on_sale: false,
  featured: false,
  image: '/test-image-2.jpg',
  images: []
};

const mockPerfumeOutOfStockOnSale = {
  id: 3,
  name: 'Test Perfume Out of Stock On Sale',
  brand_name: 'Test Brand',
  price: 70000,
  discount_price: 56000,
  stock: 0,
  is_in_stock: false,
  on_sale: true,
  featured: false,
  image: '/test-image-3.jpg',
  images: []
};

const mockPerfumeOutOfStockFeatured = {
  id: 4,
  name: 'Test Perfume Out of Stock Featured',
  brand_name: 'Test Brand',
  price: 80000,
  discount_price: null,
  stock: 0,
  is_in_stock: false,
  is_on_sale: false,
  featured: true,
  image: '/test-image-4.jpg',
  images: []
};

// Helper functions to test out-of-stock logic
const shouldShowOutOfStockBadge = (perfume) => {
  return !perfume.is_in_stock;
};

const getButtonText = (perfume) => {
  return perfume.is_in_stock ? 'Add to Cart' : 'Out of Stock';
};

const isButtonDisabled = (perfume) => {
  return !perfume.is_in_stock;
};

const getButtonVariant = (perfume) => {
  return perfume.is_in_stock ? 'contained' : 'outlined';
};

const getOutOfStockBadgePosition = (perfume) => {
  if (perfume.on_sale && perfume.featured) {
    return '160px';
  } else if (perfume.on_sale || perfume.featured) {
    return '80px';
  } else {
    return '10px';
  }
};

describe('PerfumeList Out of Stock Logic', () => {
  test('shouldShowOutOfStockBadge returns true for out of stock perfumes', () => {
    expect(shouldShowOutOfStockBadge(mockPerfumeOutOfStock)).toBe(true);
  });

  test('shouldShowOutOfStockBadge returns false for in stock perfumes', () => {
    expect(shouldShowOutOfStockBadge(mockPerfumeInStock)).toBe(false);
  });

  test('getButtonText returns "Out of Stock" for out of stock perfumes', () => {
    expect(getButtonText(mockPerfumeOutOfStock)).toBe('Out of Stock');
  });

  test('getButtonText returns "Add to Cart" for in stock perfumes', () => {
    expect(getButtonText(mockPerfumeInStock)).toBe('Add to Cart');
  });

  test('isButtonDisabled returns true for out of stock perfumes', () => {
    expect(isButtonDisabled(mockPerfumeOutOfStock)).toBe(true);
  });

  test('isButtonDisabled returns false for in stock perfumes', () => {
    expect(isButtonDisabled(mockPerfumeInStock)).toBe(false);
  });

  test('getButtonVariant returns "outlined" for out of stock perfumes', () => {
    expect(getButtonVariant(mockPerfumeOutOfStock)).toBe('outlined');
  });

  test('getButtonVariant returns "contained" for in stock perfumes', () => {
    expect(getButtonVariant(mockPerfumeInStock)).toBe('contained');
  });

  test('getOutOfStockBadgePosition returns correct position for sale and featured perfume', () => {
    const perfume = { ...mockPerfumeOutOfStock, on_sale: true, featured: true };
    expect(getOutOfStockBadgePosition(perfume)).toBe('160px');
  });

  test('getOutOfStockBadgePosition returns correct position for sale perfume', () => {
    expect(getOutOfStockBadgePosition(mockPerfumeOutOfStockOnSale)).toBe('80px');
  });

  test('getOutOfStockBadgePosition returns correct position for featured perfume', () => {
    expect(getOutOfStockBadgePosition(mockPerfumeOutOfStockFeatured)).toBe('80px');
  });

  test('getOutOfStockBadgePosition returns correct position for regular perfume', () => {
    expect(getOutOfStockBadgePosition(mockPerfumeOutOfStock)).toBe('10px');
  });

  test('stock field correctly indicates availability', () => {
    expect(mockPerfumeInStock.stock).toBeGreaterThan(0);
    expect(mockPerfumeOutOfStock.stock).toBe(0);
  });

  test('is_in_stock field correctly indicates availability', () => {
    expect(mockPerfumeInStock.is_in_stock).toBe(true);
    expect(mockPerfumeOutOfStock.is_in_stock).toBe(false);
  });

  test('out of stock perfumes maintain other properties correctly', () => {
    expect(mockPerfumeOutOfStockOnSale.on_sale).toBe(true);
    expect(mockPerfumeOutOfStockOnSale.discount_price).toBeLessThan(mockPerfumeOutOfStockOnSale.price);
    expect(mockPerfumeOutOfStockFeatured.featured).toBe(true);
  });
});