// Guest cart management using localStorage

const GUEST_CART_KEY = 'perfumes_guest_cart';

// Get guest cart from localStorage
export const getGuestCart = () => {
  try {
    const cart = localStorage.getItem(GUEST_CART_KEY);
    return cart ? JSON.parse(cart) : {
      items: [],
      subtotal: 0,
      total_items: 0
    };
  } catch (error) {
    console.error('Error getting guest cart:', error);
    return {
      items: [],
      subtotal: 0,
      total_items: 0
    };
  }
};

// Save guest cart to localStorage
export const saveGuestCart = (cart) => {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving guest cart:', error);
  }
};

// Add item to guest cart
export const addToGuestCart = (perfume, quantity = 1) => {
  const cart = getGuestCart();
  const existingItemIndex = cart.items.findIndex(item => item.perfume.id === perfume.id);
  
  if (existingItemIndex >= 0) {
    // Update existing item
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    // Add new item
    const newItem = {
      id: Date.now(), // Temporary ID for guest cart
      perfume: perfume,
      quantity: quantity,
      total: (perfume.discount_price || perfume.price) * quantity
    };
    cart.items.push(newItem);
  }
  
  // Recalculate totals
  cart.subtotal = cart.items.reduce((total, item) => {
    const price = item.perfume.discount_price || item.perfume.price;
    return total + (price * item.quantity);
  }, 0);
  cart.total_items = cart.items.reduce((total, item) => total + item.quantity, 0);
  
  saveGuestCart(cart);
  return cart;
};

// Update item quantity in guest cart
export const updateGuestCartItem = (itemId, quantity) => {
  const cart = getGuestCart();
  const itemIndex = cart.items.findIndex(item => item.id === itemId);
  
  if (itemIndex >= 0) {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
      const price = cart.items[itemIndex].perfume.discount_price || cart.items[itemIndex].perfume.price;
      cart.items[itemIndex].total = price * quantity;
    }
    
    // Recalculate totals
    cart.subtotal = cart.items.reduce((total, item) => {
      const price = item.perfume.discount_price || item.perfume.price;
      return total + (price * item.quantity);
    }, 0);
    cart.total_items = cart.items.reduce((total, item) => total + item.quantity, 0);
    
    saveGuestCart(cart);
  }
  
  return cart;
};

// Remove item from guest cart
export const removeFromGuestCart = (itemId) => {
  const cart = getGuestCart();
  cart.items = cart.items.filter(item => item.id !== itemId);
  
  // Recalculate totals
  cart.subtotal = cart.items.reduce((total, item) => {
    const price = item.perfume.discount_price || item.perfume.price;
    return total + (price * item.quantity);
  }, 0);
  cart.total_items = cart.items.reduce((total, item) => total + item.quantity, 0);
  
  saveGuestCart(cart);
  return cart;
};

// Clear guest cart
export const clearGuestCart = () => {
  const emptyCart = {
    items: [],
    subtotal: 0,
    total_items: 0
  };
  saveGuestCart(emptyCart);
  return emptyCart;
};

// Transfer guest cart to user cart (when user logs in)
export const transferGuestCartToUser = async (userToken) => {
  const guestCart = getGuestCart();
  
  if (guestCart.items.length === 0) {
    return;
  }
  
  // This would be called after login to transfer items
  // Implementation would depend on your specific needs
  console.log('Transferring guest cart to user:', guestCart);
  
  // Clear guest cart after transfer
  clearGuestCart();
};