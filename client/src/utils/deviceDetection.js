// Mobile device detection and optimization utilities

// Detect if the device is mobile
export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  
  // Check user agent
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  
  // Check screen size
  const isSmallScreen = window.innerWidth <= 768;
  
  // Check touch capability
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  return mobileRegex.test(userAgent) || (isSmallScreen && isTouchDevice);
};

// Detect if the device is iOS
export const isIOS = () => {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

// Detect if the device is Android
export const isAndroid = () => {
  if (typeof window === 'undefined') return false;
  return /Android/.test(navigator.userAgent);
};

// Get connection type (if available)
export const getConnectionType = () => {
  if (typeof navigator === 'undefined' || !navigator.connection) {
    return 'unknown';
  }
  
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  return connection.effectiveType || connection.type || 'unknown';
};

// Check if connection is slow
export const isSlowConnection = () => {
  const connectionType = getConnectionType();
  return ['slow-2g', '2g', '3g'].includes(connectionType);
};

// Get device memory (if available)
export const getDeviceMemory = () => {
  if (typeof navigator === 'undefined' || !navigator.deviceMemory) {
    return 4; // Default assumption
  }
  return navigator.deviceMemory;
};

// Check if device has limited resources
export const isLowEndDevice = () => {
  const memory = getDeviceMemory();
  const isSlowConn = isSlowConnection();
  const cores = navigator.hardwareConcurrency || 4;
  
  return memory <= 2 || isSlowConn || cores <= 2;
};

// Get optimal image loading strategy
export const getImageLoadingStrategy = () => {
  if (isLowEndDevice()) {
    return {
      preload: false,
      lazy: true,
      quality: 'low',
      timeout: 20000,
      retries: 1
    };
  }
  
  if (isMobile()) {
    return {
      preload: true,
      lazy: true,
      quality: 'medium',
      timeout: 15000,
      retries: 2
    };
  }
  
  return {
    preload: true,
    lazy: false,
    quality: 'high',
    timeout: 10000,
    retries: 3
  };
};

// Viewport utilities
export const getViewportSize = () => {
  if (typeof window === 'undefined') {
    return { width: 1920, height: 1080 };
  }
  
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
};

// Check if device supports WebP
export const supportsWebP = () => {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
};

// Performance monitoring
export const measureImageLoadTime = (startTime) => {
  const endTime = performance.now();
  const loadTime = endTime - startTime;
  
  // Log slow image loads for debugging
  if (loadTime > 3000) {
    console.warn(`Slow image load detected: ${loadTime}ms`);
  }
  
  return loadTime;
};

const deviceDetection = {
  isMobile,
  isIOS,
  isAndroid,
  getConnectionType,
  isSlowConnection,
  getDeviceMemory,
  isLowEndDevice,
  getImageLoadingStrategy,
  getViewportSize,
  supportsWebP,
  measureImageLoadTime
};

export default deviceDetection;