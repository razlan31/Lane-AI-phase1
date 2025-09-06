// Performance monitoring and optimization utilities
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.isEnabled = process.env.NODE_ENV === 'development';
  }

  // Start timing a performance metric
  startTiming(name) {
    if (!this.isEnabled) return;
    
    this.metrics.set(name, {
      startTime: performance.now(),
      name
    });
  }

  // End timing and log the result
  endTiming(name) {
    if (!this.isEnabled) return;
    
    const metric = this.metrics.get(name);
    if (!metric) return;
    
    const duration = performance.now() - metric.startTime;
    console.log(`⚡ Performance: ${name} took ${duration.toFixed(2)}ms`);
    
    this.metrics.delete(name);
    return duration;
  }

  // Measure component render time
  measureComponent(componentName, renderFn) {
    if (!this.isEnabled) return renderFn();
    
    this.startTiming(`Component: ${componentName}`);
    const result = renderFn();
    this.endTiming(`Component: ${componentName}`);
    
    return result;
  }

  // Measure async function execution
  async measureAsync(name, asyncFn) {
    if (!this.isEnabled) return await asyncFn();
    
    this.startTiming(name);
    try {
      const result = await asyncFn();
      this.endTiming(name);
      return result;
    } catch (error) {
      this.endTiming(name);
      throw error;
    }
  }

  // Memory usage monitoring
  checkMemoryUsage(label = 'Memory Check') {
    if (!this.isEnabled || !performance.memory) return;
    
    const memory = performance.memory;
    console.log(`📊 ${label}:`, {
      used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
    });
  }

  // Network performance monitoring
  measureNetworkRequest(url, requestFn) {
    if (!this.isEnabled) return requestFn();
    
    const startTime = performance.now();
    
    return requestFn().then(result => {
      const duration = performance.now() - startTime;
      console.log(`🌐 Network: ${url} took ${duration.toFixed(2)}ms`);
      return result;
    }).catch(error => {
      const duration = performance.now() - startTime;
      console.log(`❌ Network Error: ${url} failed after ${duration.toFixed(2)}ms`);
      throw error;
    });
  }

  // Bundle size analysis (development only)
  analyzeBundleSize() {
    if (!this.isEnabled) return;
    
    // Estimate loaded JavaScript size
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    let totalSize = 0;
    
    scripts.forEach(script => {
      // This is an estimation - in production you'd use proper bundle analysis tools
      const src = script.src;
      if (src.includes('main') || src.includes('vendor')) {
        console.log(`📦 Script loaded: ${src}`);
      }
    });
    
    // Check for large libraries
    if (window.React) console.log('📚 React loaded');
    if (window.ReactDOM) console.log('📚 ReactDOM loaded');
    
    this.checkMemoryUsage('Bundle Analysis');
  }
}

// Debounce utility for performance optimization
export function debounce(func, wait, immediate = false) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
}

// Throttle utility for performance optimization
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Lazy loading utilities
export function createIntersectionObserver(callback, options = {}) {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
  };
  
  return new IntersectionObserver(callback, { ...defaultOptions, ...options });
}

// Memoization utility for expensive calculations
export function memoize(fn, getKey = (...args) => JSON.stringify(args)) {
  const cache = new Map();
  
  return function memoized(...args) {
    const key = getKey(...args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn.apply(this, args);
    cache.set(key, result);
    
    // Clean up cache if it gets too large
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return result;
  };
}

// Virtual scrolling utility for large lists
export class VirtualScrollManager {
  constructor(options = {}) {
    this.itemHeight = options.itemHeight || 50;
    this.containerHeight = options.containerHeight || 400;
    this.overscan = options.overscan || 5;
    this.items = options.items || [];
  }

  getVisibleRange(scrollTop) {
    const start = Math.floor(scrollTop / this.itemHeight);
    const visibleCount = Math.ceil(this.containerHeight / this.itemHeight);
    
    return {
      start: Math.max(0, start - this.overscan),
      end: Math.min(this.items.length, start + visibleCount + this.overscan)
    };
  }

  getItemStyle(index) {
    return {
      position: 'absolute',
      top: index * this.itemHeight,
      height: this.itemHeight,
      width: '100%'
    };
  }

  getTotalHeight() {
    return this.items.length * this.itemHeight;
  }
}

// Image optimization utilities
export function createOptimizedImageLoader() {
  const cache = new Map();
  
  return {
    loadImage(src, options = {}) {
      if (cache.has(src)) {
        return Promise.resolve(cache.get(src));
      }
      
      return new Promise((resolve, reject) => {
        const img = new Image();
        
        img.onload = () => {
          cache.set(src, img);
          resolve(img);
        };
        
        img.onerror = reject;
        
        // Add responsive image loading
        if (options.sizes) {
          img.sizes = options.sizes;
        }
        if (options.srcSet) {
          img.srcset = options.srcSet;
        }
        
        img.src = src;
      });
    },
    
    preloadImages(urls) {
      return Promise.all(urls.map(url => this.loadImage(url)));
    },
    
    clearCache() {
      cache.clear();
    }
  };
}

// Create global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// React performance helpers
export function withPerformanceMonitoring(Component, componentName) {
  return function PerformanceMonitoredComponent(props) {
    return performanceMonitor.measureComponent(componentName, () => (
      <Component {...props} />
    ));
  };
}

// Bundle analysis (run in development)
if (process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    performanceMonitor.analyzeBundleSize();
  }, 2000);
}

export default performanceMonitor;