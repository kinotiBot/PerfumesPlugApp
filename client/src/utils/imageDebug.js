// Image loading debug utilities for mobile troubleshooting

import { isMobile, getConnectionType, getDeviceMemory } from './deviceDetection';

class ImageDebugger {
  constructor() {
    this.logs = [];
    this.maxLogs = 100;
    this.enabled = process.env.NODE_ENV === 'development';
  }

  log(type, message, data = {}) {
    if (!this.enabled) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      type,
      message,
      data: {
        ...data,
        userAgent: navigator.userAgent,
        isMobile: isMobile(),
        connection: getConnectionType(),
        memory: getDeviceMemory(),
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      }
    };

    this.logs.push(logEntry);
    
    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output with styling
    const style = this.getLogStyle(type);
    console.log(`%c[ImageDebug] ${message}`, style, data);
  }

  getLogStyle(type) {
    const styles = {
      error: 'color: #ff4444; font-weight: bold;',
      warning: 'color: #ffaa00; font-weight: bold;',
      info: 'color: #4444ff;',
      success: 'color: #44ff44;'
    };
    return styles[type] || styles.info;
  }

  logImageLoad(src, success, loadTime, error = null) {
    const type = success ? 'success' : 'error';
    const message = success 
      ? `Image loaded successfully in ${loadTime}ms` 
      : `Image failed to load: ${error?.message || 'Unknown error'}`;
    
    this.log(type, message, {
      src,
      loadTime,
      error: error?.message,
      stack: error?.stack
    });
  }

  logImageError(src, error, retryCount = 0, loadTime = null) {
    this.log('error', `Image load error (retry ${retryCount})`, {
      src,
      error: error.message,
      retryCount,
      loadTime,
      networkState: navigator.onLine ? 'online' : 'offline'
    });
  }

  logCacheHit(src) {
    this.log('info', 'Image served from cache', { src });
  }

  logCacheMiss(src) {
    this.log('info', 'Image cache miss, fetching from network', { src });
  }

  logSlowLoad(src, loadTime) {
    this.log('warning', `Slow image load detected: ${loadTime}ms`, {
      src,
      loadTime,
      threshold: 3000
    });
  }

  // Get diagnostic report
  getDiagnosticReport() {
    const errorLogs = this.logs.filter(log => log.type === 'error');
    const slowLogs = this.logs.filter(log => 
      log.type === 'warning' && log.message.includes('Slow image load')
    );
    
    return {
      totalLogs: this.logs.length,
      errors: errorLogs.length,
      slowLoads: slowLogs.length,
      deviceInfo: {
        isMobile: isMobile(),
        connection: getConnectionType(),
        memory: getDeviceMemory(),
        userAgent: navigator.userAgent
      },
      recentErrors: errorLogs.slice(-5),
      recentSlowLoads: slowLogs.slice(-5)
    };
  }

  // Export logs for debugging
  exportLogs() {
    const report = this.getDiagnosticReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `image-debug-${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
    this.log('info', 'Debug logs cleared');
  }

  // Test image loading
  async testImageLoad(src) {
    const startTime = performance.now();
    
    try {
      await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = src;
      });
      
      const loadTime = performance.now() - startTime;
      this.logImageLoad(src, true, loadTime);
      return { success: true, loadTime };
    } catch (error) {
      const loadTime = performance.now() - startTime;
      this.logImageLoad(src, false, loadTime, error);
      return { success: false, loadTime, error };
    }
  }
}

// Create singleton instance
const imageDebugger = new ImageDebugger();

// Utility functions
export const logImageLoad = (src, success, loadTime, error) => 
  imageDebugger.logImageLoad(src, success, loadTime, error);

export const logImageError = (src, error, retryCount, loadTime) => 
  imageDebugger.logImageError(src, error, retryCount, loadTime);

export const logCacheHit = (src) => imageDebugger.logCacheHit(src);
export const logCacheMiss = (src) => imageDebugger.logCacheMiss(src);
export const logSlowLoad = (src, loadTime) => imageDebugger.logSlowLoad(src, loadTime);

export const getDiagnosticReport = () => imageDebugger.getDiagnosticReport();
export const exportImageLogs = () => imageDebugger.exportLogs();
export const clearImageLogs = () => imageDebugger.clearLogs();
export const testImageLoad = (src) => imageDebugger.testImageLoad(src);

// Add global debug functions for console access
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.imageDebug = {
    report: getDiagnosticReport,
    export: exportImageLogs,
    clear: clearImageLogs,
    test: testImageLoad
  };
}

export default imageDebugger;