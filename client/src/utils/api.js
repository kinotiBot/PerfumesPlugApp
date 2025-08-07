// API configuration and utility functions

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

// Function to get full image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/images/placeholder.svg';
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it starts with /media/, prepend base URL
  if (imagePath.startsWith('/media/')) {
    return `${API_BASE_URL}${imagePath}`;
  }
  
  // If it's just a relative path, prepend base URL and /media/
  return `${API_BASE_URL}/media/${imagePath}`;
};

// Function to get full API URL
export const getApiUrl = (endpoint) => {
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  return `${API_BASE_URL}${endpoint}`;
};

export default API_BASE_URL;