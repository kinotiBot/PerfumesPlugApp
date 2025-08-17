// API configuration and utility functions

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

// Function to get full image URL with mobile browser compatibility
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/images/placeholder.svg';
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it starts with /media/, prepend base URL
  if (imagePath.startsWith('/media/')) {
    const url = `${API_BASE_URL}${imagePath}`;
    // Add cache-busting parameter for mobile browsers
    return `${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`;
  }
  
  // If it's just a relative path, prepend base URL and /media/
  const url = `${API_BASE_URL}/media/${imagePath}`;
  // Add cache-busting parameter for mobile browsers
  return `${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`;
};

// Function to get image URL with error handling
export const getImageUrlWithFallback = (imagePath, fallbackPath = '/images/placeholder.svg') => {
  try {
    return getImageUrl(imagePath);
  } catch (error) {
    console.warn('Error generating image URL:', error);
    return fallbackPath;
  }
};

// Function to get full API URL
export const getApiUrl = (endpoint) => {
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  return `${API_BASE_URL}${endpoint}`;
};

export default API_BASE_URL;