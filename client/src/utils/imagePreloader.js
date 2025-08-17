// Mobile-optimized image preloader utility

class ImagePreloader {
  constructor() {
    this.cache = new Map();
    this.loadingPromises = new Map();
    this.maxCacheSize = 50; // Limit cache size for mobile
  }

  // Preload image with mobile optimizations
  preloadImage(src, priority = 'low') {
    if (!src) return Promise.resolve(null);
    
    // Return cached promise if already loading
    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src);
    }

    // Return cached image if available
    if (this.cache.has(src)) {
      return Promise.resolve(this.cache.get(src));
    }

    const loadPromise = new Promise((resolve, reject) => {
      const img = new Image();
      
      // Mobile-specific optimizations
      img.crossOrigin = 'anonymous';
      img.decoding = 'async';
      img.loading = priority === 'high' ? 'eager' : 'lazy';
      
      // Timeout for mobile networks
      const timeout = setTimeout(() => {
        img.onload = null;
        img.onerror = null;
        reject(new Error('Image load timeout'));
      }, 15000);

      img.onload = () => {
        clearTimeout(timeout);
        this.addToCache(src, img);
        this.loadingPromises.delete(src);
        resolve(img);
      };

      img.onerror = () => {
        clearTimeout(timeout);
        this.loadingPromises.delete(src);
        reject(new Error('Image load failed'));
      };

      img.src = src;
    });

    this.loadingPromises.set(src, loadPromise);
    return loadPromise;
  }

  // Add image to cache with size management
  addToCache(src, img) {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(src, img);
  }

  // Preload multiple images with priority
  preloadImages(sources, priority = 'low') {
    return Promise.allSettled(
      sources.map(src => this.preloadImage(src, priority))
    );
  }

  // Clear cache to free memory
  clearCache() {
    this.cache.clear();
    this.loadingPromises.clear();
  }

  // Get cache size for debugging
  getCacheSize() {
    return this.cache.size;
  }
}

// Create singleton instance
const imagePreloader = new ImagePreloader();

// Utility functions
export const preloadImage = (src, priority) => imagePreloader.preloadImage(src, priority);
export const preloadImages = (sources, priority) => imagePreloader.preloadImages(sources, priority);
export const clearImageCache = () => imagePreloader.clearCache();
export const getImageCacheSize = () => imagePreloader.getCacheSize();

// Auto-clear cache on memory pressure (mobile-specific)
if ('memory' in performance) {
  const checkMemory = () => {
    const memInfo = performance.memory;
    const usedRatio = memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit;
    
    // Clear cache if memory usage is high
    if (usedRatio > 0.8) {
      imagePreloader.clearCache();
      console.log('Image cache cleared due to memory pressure');
    }
  };
  
  // Check memory every 30 seconds
  setInterval(checkMemory, 30000);
}

export default imagePreloader;