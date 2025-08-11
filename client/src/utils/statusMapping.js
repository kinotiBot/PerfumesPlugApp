// Status mappings
export const STATUS_MAPPING = {
  'P': 'pending',
  'C': 'processing',
  'S': 'shipped',
  'D': 'delivered',
  'X': 'cancelled'
};

export const REVERSE_STATUS_MAPPING = {
  'pending': 'P',
  'processing': 'C',
  'shipped': 'S', 
  'delivered': 'D',
  'cancelled': 'X'
};

// Helper functions
export const getDisplayStatus = (apiStatus) => {
  return STATUS_MAPPING[apiStatus] || apiStatus;
};

export const getApiStatus = (displayStatus) => {
  return REVERSE_STATUS_MAPPING[displayStatus] || displayStatus;
};

export const getStatusColor = (status) => {
  const displayStatus = getDisplayStatus(status);
  switch (displayStatus) {
    case 'pending':
      return 'warning';
    case 'processing':
      return 'info';
    case 'shipped':
      return 'primary';
    case 'delivered':
      return 'success';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

export const getPaymentStatusColor = (status) => {
  if (status === true || status === 'paid') {
    return 'success';
  }
  return 'error';
};

export const formatStatusForDisplay = (status) => {
  return getDisplayStatus(status);
};

// Legacy payment status function (for backward compatibility)
export const formatPaymentStatusForDisplay = (paymentStatus) => {
  if (typeof paymentStatus === 'boolean') {
    return paymentStatus ? 'Paid' : 'Unpaid';
  }
  if (paymentStatus === 'paid' || paymentStatus === true) {
    return 'Paid';
  }
  if (paymentStatus === 'unpaid' || paymentStatus === false) {
    return 'Unpaid';
  }
  return 'Unknown';
};

// New payment received functions
export const getPaymentReceivedColor = (paymentReceived) => {
  if (paymentReceived === true || paymentReceived === 'true') {
    return 'success';
  }
  return 'error';
};

export const formatPaymentReceivedForDisplay = (paymentReceived) => {
  if (typeof paymentReceived === 'boolean') {
    return paymentReceived ? 'Yes' : 'No';
  }
  return paymentReceived ? 'Yes' : 'No';
};