import cartReducer, {
  addToCart,
  updateCartItem,
  removeFromCart,
  getCart,
  loadGuestCart,
  addToGuestCartAction,
} from '../features/cart/cartSlice';

// Mock guest cart utilities
jest.mock('../utils/guestCart', () => ({
  getGuestCart: jest.fn(),
  addToGuestCart: jest.fn(),
  updateGuestCartItem: jest.fn(),
  removeFromGuestCart: jest.fn(),
  clearGuestCart: jest.fn(),
}));

import {
  getGuestCart,
  addToGuestCart,
  updateGuestCartItem,
  removeFromGuestCart,
  clearGuestCart,
} from '../utils/guestCart';

describe('cartSlice', () => {
  const initialState = {
    cartItems: [],
    cartCount: 0,
    cartTotal: 0,
    loading: false,
    error: null,
    success: false,
    isGuestCart: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return the initial state', () => {
    expect(cartReducer(undefined, { type: undefined })).toEqual(initialState);
  });

  test('should handle addToCart.pending', () => {
    const action = { type: addToCart.pending.type };
    const state = cartReducer(initialState, action);
    expect(state.loading).toBe(true);
    expect(state.error).toBe(null);
  });

  test('should handle addToCart.fulfilled', () => {
    const mockCartResponse = {
      items: [
        {
          id: 1,
          quantity: 2,
          perfume_details: {
            id: 1,
            name: 'Test Perfume',
            price: 50000,
            discount_price: 45000,
          },
        },
      ],
      subtotal: 90000,
      total_items: 2,
    };

    const action = {
      type: addToCart.fulfilled.type,
      payload: mockCartResponse,
    };

    const state = cartReducer(initialState, action);
    expect(state.loading).toBe(false);
    expect(state.success).toBe(true);
    expect(state.cartItems).toEqual(mockCartResponse.items);
    expect(state.cartCount).toBe(2);
    expect(state.cartTotal).toBe(90000);
  });

  test('should handle addToCart.rejected', () => {
    const action = {
      type: addToCart.rejected.type,
      payload: 'Error adding to cart',
    };

    const state = cartReducer(initialState, action);
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Error adding to cart');
  });

  test('should handle removeFromCart.fulfilled', () => {
    const initialStateWithItems = {
      ...initialState,
      cartItems: [
        {
          id: 1,
          quantity: 2,
          perfume_details: {
            price: 50000,
            discount_price: 45000,
          },
        },
        {
          id: 2,
          quantity: 1,
          perfume_details: {
            price: 30000,
            discount_price: 25000,
          },
        },
      ],
      cartCount: 3,
      cartTotal: 115000,
    };

    const action = {
      type: removeFromCart.fulfilled.type,
      payload: 1, // Remove item with id 1
    };

    const state = cartReducer(initialStateWithItems, action);
    expect(state.loading).toBe(false);
    expect(state.success).toBe(true);
    expect(state.cartItems).toHaveLength(1);
    expect(state.cartItems[0].id).toBe(2);
    expect(state.cartCount).toBe(1); // Only item 2 with quantity 1
    expect(state.cartTotal).toBe(25000); // Only item 2 total
  });

  test('should handle updateCartItem.fulfilled', () => {
    const initialStateWithItems = {
      ...initialState,
      cartItems: [
        {
          id: 1,
          quantity: 2,
          perfume_details: {
            price: 50000,
            discount_price: 45000,
          },
        },
      ],
      cartCount: 2,
      cartTotal: 90000,
    };

    const updatedCartResponse = {
      items: [
        {
          id: 1,
          quantity: 3,
          perfume_details: {
            price: 50000,
            discount_price: 45000,
          },
        },
      ],
      subtotal: 135000,
      total_items: 3,
    };

    const action = {
      type: updateCartItem.fulfilled.type,
      payload: updatedCartResponse,
    };

    const state = cartReducer(initialStateWithItems, action);
    expect(state.loading).toBe(false);
    expect(state.success).toBe(true);
    expect(state.cartItems[0].quantity).toBe(3);
    expect(state.cartCount).toBe(3);
    expect(state.cartTotal).toBe(135000);
  });

  test('should handle getCart.fulfilled', () => {
    const mockCartData = {
      items: [
        {
          id: 1,
          quantity: 1,
          perfume_details: {
            price: 40000,
            discount_price: 35000,
          },
        },
      ],
      subtotal: 35000,
      total_items: 1,
    };

    const action = {
      type: getCart.fulfilled.type,
      payload: mockCartData,
    };

    const state = cartReducer(initialState, action);
    expect(state.loading).toBe(false);
    expect(state.cartItems).toEqual(mockCartData.items);
    expect(state.cartCount).toBe(1);
    expect(state.cartTotal).toBe(35000);
  });

  test('should handle loadGuestCart', () => {
    const mockGuestCart = {
      items: [
        {
          id: 1,
          quantity: 2,
          perfume: {
            price: 30000,
            discount_price: 25000,
          },
        },
      ],
      subtotal: 50000,
      total_items: 2,
    };

    getGuestCart.mockReturnValue(mockGuestCart);

    const action = {
      type: loadGuestCart.type,
    };

    const state = cartReducer(initialState, action);
    expect(state.cartItems).toEqual(mockGuestCart.items);
    expect(state.cartCount).toBe(2);
    expect(state.cartTotal).toBe(50000);
    expect(state.isGuestCart).toBe(true);
  });

  test('should handle addToGuestCartAction', () => {
    const mockPerfume = {
      id: 1,
      price: 40000,
      discount_price: 35000,
    };

    const mockUpdatedCart = {
      items: [
        {
          id: 1,
          quantity: 1,
          perfume: mockPerfume,
        },
      ],
      subtotal: 35000,
      total_items: 1,
    };

    addToGuestCart.mockReturnValue(mockUpdatedCart);

    const action = {
      type: addToGuestCartAction.type,
      payload: { perfume: mockPerfume, quantity: 1 },
    };

    const state = cartReducer(initialState, action);
    expect(state.cartItems).toEqual(mockUpdatedCart.items);
    expect(state.cartCount).toBe(1);
    expect(state.cartTotal).toBe(35000);
    expect(state.isGuestCart).toBe(true);
    expect(state.success).toBe(true);
  });

  test('should calculate total correctly with fallback to regular price', () => {
    const mockCartResponse = {
      items: [
        {
          id: 1,
          quantity: 2,
          perfume_details: {
            price: 50000,
            // No discount_price
          },
        },
      ],
      subtotal: 100000,
      total_items: 2,
    };

    const action = {
      type: addToCart.fulfilled.type,
      payload: mockCartResponse,
    };

    const state = cartReducer(initialState, action);
    expect(state.cartTotal).toBe(100000);
  });

  test('should handle mixed cart item structures (guest and authenticated)', () => {
    const initialStateWithMixedItems = {
      ...initialState,
      cartItems: [
        {
          id: 1,
          quantity: 1,
          perfume_details: { // Authenticated user structure
            price: 50000,
            discount_price: 45000,
          },
        },
        {
          id: 2,
          quantity: 2,
          perfume: { // Guest user structure
            price: 30000,
            discount_price: 25000,
          },
        },
      ],
    };

    const action = {
      type: removeFromCart.fulfilled.type,
      payload: 1, // Remove first item
    };

    const state = cartReducer(initialStateWithMixedItems, action);
    expect(state.cartItems).toHaveLength(1);
    expect(state.cartCount).toBe(2);
    expect(state.cartTotal).toBe(50000); // 2 * 25000
  });
});