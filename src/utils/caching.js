import { performanceMonitor } from './performance';

// Enhanced caching system with multiple storage backends
class CacheManager {
  constructor() {
    this.memoryCache = new Map();
    this.storageCache = this.initializeStorageCache();
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      maxMemorySize: 100,
      maxStorageSize: 500,
      compressionThreshold: 1024 // 1KB
    };
  }

  initializeStorageCache() {
    try {
      return {
        get: (key) => {
          const item = localStorage.getItem(`cache_${key}`);
          return item ? JSON.parse(item) : null;
        },
        set: (key, value) => {
          try {
            localStorage.setItem(`cache_${key}`, JSON.stringify(value));
          } catch (e) {
            // Storage full, clean up oldest items
            this.cleanupStorage();
            try {
              localStorage.setItem(`cache_${key}`, JSON.stringify(value));
            } catch (e) {
              console.warn('Failed to cache item in localStorage:', e);
            }
          }
        },
        delete: (key) => localStorage.removeItem(`cache_${key}`),
        clear: () => {
          Object.keys(localStorage)
            .filter(key => key.startsWith('cache_'))
            .forEach(key => localStorage.removeItem(key));
        }
      };
    } catch (e) {
      // Fallback if localStorage is not available
      return {
        get: () => null,
        set: () => {},
        delete: () => {},
        clear: () => {}
      };
    }
  }

  // Create cache key from parameters
  createKey(namespace, params) {
    const paramsStr = typeof params === 'object' ? JSON.stringify(params) : String(params);
    return `${namespace}:${btoa(paramsStr).substring(0, 50)}`;
  }

  // Get item from cache
  get(namespace, params, useStorage = true) {
    const key = this.createKey(namespace, params);
    
    // Try memory cache first
    const memoryItem = this.memoryCache.get(key);
    if (memoryItem && !this.isExpired(memoryItem)) {
      performanceMonitor.startTiming(`Cache Hit: ${namespace}`);
      performanceMonitor.endTiming(`Cache Hit: ${namespace}`);
      return memoryItem.data;
    }

    // Try storage cache
    if (useStorage) {
      const storageItem = this.storageCache.get(key);
      if (storageItem && !this.isExpired(storageItem)) {
        // Promote to memory cache
        this.memoryCache.set(key, storageItem);
        this.cleanupMemoryCache();
        
        performanceMonitor.startTiming(`Storage Cache Hit: ${namespace}`);
        performanceMonitor.endTiming(`Storage Cache Hit: ${namespace}`);
        return storageItem.data;
      }
    }

    return null;
  }

  // Set item in cache
  set(namespace, params, data, options = {}) {
    const key = this.createKey(namespace, params);
    const ttl = options.ttl || this.config.defaultTTL;
    const useStorage = options.storage !== false;
    
    const cacheItem = {
      data,
      timestamp: Date.now(),
      ttl,
      size: this.estimateSize(data)
    };

    // Set in memory cache
    this.memoryCache.set(key, cacheItem);
    this.cleanupMemoryCache();

    // Set in storage cache if enabled and not too large
    if (useStorage && cacheItem.size < this.config.compressionThreshold * 10) {
      this.storageCache.set(key, cacheItem);
    }

    performanceMonitor.startTiming(`Cache Set: ${namespace}`);
    performanceMonitor.endTiming(`Cache Set: ${namespace}`);
  }

  // Check if cache item is expired
  isExpired(item) {
    return Date.now() - item.timestamp > item.ttl;
  }

  // Estimate size of data
  estimateSize(data) {
    try {
      return JSON.stringify(data).length;
    } catch (e) {
      return 0;
    }
  }

  // Clean up memory cache when it gets too large
  cleanupMemoryCache() {
    if (this.memoryCache.size <= this.config.maxMemorySize) return;

    // Remove expired items first
    for (const [key, item] of this.memoryCache.entries()) {
      if (this.isExpired(item)) {
        this.memoryCache.delete(key);
      }
    }

    // If still too large, remove oldest items
    if (this.memoryCache.size > this.config.maxMemorySize) {
      const entries = Array.from(this.memoryCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = entries.slice(0, entries.length - this.config.maxMemorySize);
      toRemove.forEach(([key]) => this.memoryCache.delete(key));
    }
  }

  // Clean up storage cache
  cleanupStorage() {
    try {
      const keys = Object.keys(localStorage)
        .filter(key => key.startsWith('cache_'));
      
      if (keys.length <= this.config.maxStorageSize) return;

      // Get cache items with timestamps
      const items = keys.map(key => {
        try {
          const item = JSON.parse(localStorage.getItem(key));
          return { key, timestamp: item.timestamp || 0 };
        } catch (e) {
          return { key, timestamp: 0 };
        }
      }).sort((a, b) => a.timestamp - b.timestamp);

      // Remove oldest items
      const toRemove = items.slice(0, items.length - this.config.maxStorageSize);
      toRemove.forEach(({ key }) => localStorage.removeItem(key));
      
    } catch (e) {
      console.warn('Failed to cleanup storage cache:', e);
    }
  }

  // Invalidate cache by namespace
  invalidate(namespace) {
    // Clear memory cache
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(`${namespace}:`)) {
        this.memoryCache.delete(key);
      }
    }

    // Clear storage cache
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(`cache_${namespace}:`))
        .forEach(key => localStorage.removeItem(key));
    } catch (e) {
      console.warn('Failed to invalidate storage cache:', e);
    }
  }

  // Clear all cache
  clear() {
    this.memoryCache.clear();
    this.storageCache.clear();
  }

  // Get cache statistics
  getStats() {
    const memorySize = this.memoryCache.size;
    const storageSize = Object.keys(localStorage)
      .filter(key => key.startsWith('cache_')).length;

    return {
      memory: {
        size: memorySize,
        maxSize: this.config.maxMemorySize,
        usage: `${((memorySize / this.config.maxMemorySize) * 100).toFixed(1)}%`
      },
      storage: {
        size: storageSize,
        maxSize: this.config.maxStorageSize,
        usage: `${((storageSize / this.config.maxStorageSize) * 100).toFixed(1)}%`
      }
    };
  }
}

// Request deduplication utility
class RequestManager {
  constructor() {
    this.pendingRequests = new Map();
  }

  // Execute request with deduplication
  async request(key, requestFn) {
    // If request is already pending, return the same promise
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    // Execute new request
    const promise = performanceMonitor.measureAsync(
      `Request: ${key}`,
      async () => {
        try {
          return await requestFn();
        } finally {
          this.pendingRequests.delete(key);
        }
      }
    );

    this.pendingRequests.set(key, promise);
    return promise;
  }

  // Cancel pending request
  cancel(key) {
    this.pendingRequests.delete(key);
  }

  // Clear all pending requests
  clear() {
    this.pendingRequests.clear();
  }
}

// Create global instances
export const cacheManager = new CacheManager();
export const requestManager = new RequestManager();

// High-level caching decorators
export function withCache(namespace, options = {}) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args) {
      const cacheKey = options.keyFn ? options.keyFn(...args) : args;
      
      // Try to get from cache
      const cached = cacheManager.get(namespace, cacheKey, options.storage);
      if (cached !== null) {
        return cached;
      }

      // Execute original method
      const result = await originalMethod.apply(this, args);
      
      // Cache the result
      cacheManager.set(namespace, cacheKey, result, options);
      
      return result;
    };

    return descriptor;
  };
}

// React hook for caching
export function useCache(namespace, key, fetcher, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try cache first
        const cached = cacheManager.get(namespace, key, options.storage);
        if (cached !== null) {
          setData(cached);
          setLoading(false);
          return;
        }

        // Fetch new data
        const result = await requestManager.request(
          `${namespace}:${JSON.stringify(key)}`,
          fetcher
        );

        if (!cancelled) {
          setData(result);
          cacheManager.set(namespace, key, result, options);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [namespace, JSON.stringify(key), fetcher, options]);

  const invalidate = useCallback(() => {
    cacheManager.invalidate(namespace);
  }, [namespace]);

  return { data, loading, error, invalidate };
}

export default cacheManager;