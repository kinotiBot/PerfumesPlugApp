// Test for customer name display logic in Orders component

describe('Orders Customer Name Display Logic', () => {
  // Helper function to simulate the customer name display logic
  const getCustomerName = (order) => {
    return order.user ? `${order.user.first_name} ${order.user.last_name}` : (order.guest_name || 'N/A');
  };

  // Helper function to simulate the customer email display logic
  const getCustomerEmail = (order) => {
    return order.user?.email || order.guest_email || 'N/A';
  };

  // Helper function to simulate the customer phone display logic
  const getCustomerPhone = (order) => {
    return order.user?.phone || order.guest_phone;
  };

  // Helper function to simulate the shipping address display logic
  const getShippingAddress = (order) => {
    if (order.shipping_address) {
      return `${order.shipping_address?.street}, ${order.shipping_address?.city}, ${order.shipping_address?.state} ${order.shipping_address?.zip_code}, ${order.shipping_address?.country}`;
    }
    if (order.guest_address) {
      return `${order.guest_address}, ${order.guest_city}, ${order.guest_province}`;
    }
    return 'N/A';
  };

  const mockAuthenticatedUserOrder = {
    id: 1,
    user: {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890'
    },
    guest_name: null,
    guest_email: null,
    guest_phone: null,
    shipping_address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip_code: '10001',
      country: 'USA'
    }
  };

  const mockGuestOrder = {
    id: 2,
    user: null,
    guest_name: 'Jane Smith',
    guest_email: 'jane.smith@example.com',
    guest_phone: '+0987654321',
    guest_address: '456 Oak Ave',
    guest_city: 'Los Angeles',
    guest_province: 'CA',
    shipping_address: null
  };

  const mockOrderWithoutCustomerInfo = {
    id: 3,
    user: null,
    guest_name: null,
    guest_email: null,
    guest_phone: null,
    guest_address: null,
    guest_city: null,
    guest_province: null,
    shipping_address: null
  };

  test('displays authenticated user name correctly', () => {
    const customerName = getCustomerName(mockAuthenticatedUserOrder);
    expect(customerName).toBe('John Doe');
  });

  test('displays authenticated user email correctly', () => {
    const customerEmail = getCustomerEmail(mockAuthenticatedUserOrder);
    expect(customerEmail).toBe('john.doe@example.com');
  });

  test('displays authenticated user phone correctly', () => {
    const customerPhone = getCustomerPhone(mockAuthenticatedUserOrder);
    expect(customerPhone).toBe('+1234567890');
  });

  test('displays authenticated user shipping address correctly', () => {
    const shippingAddress = getShippingAddress(mockAuthenticatedUserOrder);
    expect(shippingAddress).toBe('123 Main St, New York, NY 10001, USA');
  });

  test('displays guest name correctly', () => {
    const customerName = getCustomerName(mockGuestOrder);
    expect(customerName).toBe('Jane Smith');
  });

  test('displays guest email correctly', () => {
    const customerEmail = getCustomerEmail(mockGuestOrder);
    expect(customerEmail).toBe('jane.smith@example.com');
  });

  test('displays guest phone correctly', () => {
    const customerPhone = getCustomerPhone(mockGuestOrder);
    expect(customerPhone).toBe('+0987654321');
  });

  test('displays guest shipping address correctly', () => {
    const shippingAddress = getShippingAddress(mockGuestOrder);
    expect(shippingAddress).toBe('456 Oak Ave, Los Angeles, CA');
  });

  test('displays N/A when no customer name is available', () => {
    const customerName = getCustomerName(mockOrderWithoutCustomerInfo);
    expect(customerName).toBe('N/A');
  });

  test('displays N/A when no customer email is available', () => {
    const customerEmail = getCustomerEmail(mockOrderWithoutCustomerInfo);
    expect(customerEmail).toBe('N/A');
  });

  test('returns null when no customer phone is available', () => {
    const customerPhone = getCustomerPhone(mockOrderWithoutCustomerInfo);
    expect(customerPhone).toBeNull();
  });

  test('displays N/A when no shipping address is available', () => {
    const shippingAddress = getShippingAddress(mockOrderWithoutCustomerInfo);
    expect(shippingAddress).toBe('N/A');
  });

  test('prioritizes user information over guest information when both exist', () => {
    const orderWithBothUserAndGuest = {
      ...mockAuthenticatedUserOrder,
      guest_name: 'Guest Name',
      guest_email: 'guest@example.com',
      guest_phone: '+1111111111'
    };

    const customerName = getCustomerName(orderWithBothUserAndGuest);
    const customerEmail = getCustomerEmail(orderWithBothUserAndGuest);
    const customerPhone = getCustomerPhone(orderWithBothUserAndGuest);

    expect(customerName).toBe('John Doe'); // User name, not guest name
    expect(customerEmail).toBe('john.doe@example.com'); // User email, not guest email
    expect(customerPhone).toBe('+1234567890'); // User phone, not guest phone
  });

  test('handles partial user information correctly', () => {
    const orderWithPartialUserInfo = {
      id: 4,
      user: {
        first_name: 'John',
        last_name: '', // Empty last name
        email: null // No email
      },
      guest_name: 'Guest Name',
      guest_email: 'guest@example.com'
    };

    const customerName = getCustomerName(orderWithPartialUserInfo);
    const customerEmail = getCustomerEmail(orderWithPartialUserInfo);

    expect(customerName).toBe('John '); // Should still show user name even with empty last name
    expect(customerEmail).toBe('guest@example.com'); // Should fall back to guest email
  });

  test('handles partial guest information correctly', () => {
    const orderWithPartialGuestInfo = {
      id: 5,
      user: null,
      guest_name: '', // Empty guest name
      guest_email: 'guest@example.com',
      guest_address: '123 Street',
      guest_city: '', // Empty city
      guest_province: 'CA'
    };

    const customerName = getCustomerName(orderWithPartialGuestInfo);
    const customerEmail = getCustomerEmail(orderWithPartialGuestInfo);
    const shippingAddress = getShippingAddress(orderWithPartialGuestInfo);

    expect(customerName).toBe('N/A'); // Should show N/A for empty guest name
    expect(customerEmail).toBe('guest@example.com'); // Should show guest email
    expect(shippingAddress).toBe('123 Street, , CA'); // Should show partial address
  });
});