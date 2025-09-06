import { supabase } from '../integrations/supabase/client';
import { cacheManager, requestManager } from './caching';
import { performanceMonitor } from './performance';

// Optimized database query utilities
class DatabaseOptimizer {
  constructor() {
    this.queryCache = new Map();
    this.batchSize = 100;
    this.maxConcurrentQueries = 5;
    this.activeQueries = 0;
  }

  // Build optimized select query
  buildSelectQuery(table, options = {}) {
    let query = supabase.from(table);

    // Add select columns (only fetch what you need)
    if (options.select) {
      query = query.select(options.select);
    } else {
      // Default to essential columns only
      query = query.select('*');
    }

    // Add filters
    if (options.filters) {
      Object.entries(options.filters).forEach(([column, value]) => {
        if (Array.isArray(value)) {
          query = query.in(column, value);
        } else if (typeof value === 'object' && value.operator) {
          switch (value.operator) {
            case 'gte':
              query = query.gte(column, value.value);
              break;
            case 'lte':
              query = query.lte(column, value.value);
              break;
            case 'like':
              query = query.like(column, value.value);
              break;
            case 'ilike':
              query = query.ilike(column, value.value);
              break;
            default:
              query = query.eq(column, value.value);
          }
        } else {
          query = query.eq(column, value);
        }
      });
    }

    // Add ordering
    if (options.orderBy) {
      const { column, ascending = true } = options.orderBy;
      query = query.order(column, { ascending });
    }

    // Add pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 100) - 1);
    }

    return query;
  }

  // Execute cached query
  async cachedQuery(cacheKey, queryFn, ttl = 5 * 60 * 1000) {
    // Check cache first
    const cached = cacheManager.get('db_queries', cacheKey);
    if (cached) {
      return cached;
    }

    // Execute query with performance monitoring
    const result = await performanceMonitor.measureAsync(
      `DB Query: ${cacheKey}`,
      async () => {
        const { data, error } = await queryFn();
        if (error) throw error;
        return data;
      }
    );

    // Cache the result
    cacheManager.set('db_queries', cacheKey, result, { ttl });
    return result;
  }

  // Batch multiple queries
  async batchQueries(queries) {
    const results = [];
    const batches = [];
    
    // Split into batches
    for (let i = 0; i < queries.length; i += this.batchSize) {
      batches.push(queries.slice(i, i + this.batchSize));
    }

    // Execute batches with concurrency control
    for (const batch of batches) {
      const batchPromises = batch.map(async (query) => {
        // Wait if too many concurrent queries
        while (this.activeQueries >= this.maxConcurrentQueries) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        this.activeQueries++;
        try {
          return await query();
        } finally {
          this.activeQueries--;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return results;
  }

  // Optimized user ventures query
  async getUserVentures(userId, options = {}) {
    const cacheKey = `user_ventures_${userId}_${JSON.stringify(options)}`;
    
    return this.cachedQuery(cacheKey, () => {
      return this.buildSelectQuery('ventures', {
        select: options.detailed 
          ? 'id, name, description, type, stage, created_at, updated_at'
          : 'id, name, description, type',
        filters: { user_id: userId },
        orderBy: { column: 'created_at', ascending: false },
        ...options
      });
    });
  }

  // Optimized KPIs query with aggregation
  async getVentureKpis(ventureId, options = {}) {
    const cacheKey = `venture_kpis_${ventureId}_${JSON.stringify(options)}`;
    
    return this.cachedQuery(cacheKey, () => {
      return this.buildSelectQuery('kpis', {
        select: 'id, name, value, confidence_level, created_at',
        filters: { venture_id: ventureId },
        orderBy: { column: 'created_at', ascending: false },
        limit: options.limit || 50
      });
    });
  }

  // Optimized worksheets query
  async getUserWorksheets(userId, options = {}) {
    const cacheKey = `user_worksheets_${userId}_${JSON.stringify(options)}`;
    
    return this.cachedQuery(cacheKey, () => {
      return this.buildSelectQuery('worksheets', {
        select: options.includeData 
          ? 'id, type, venture_id, inputs, outputs, created_at, updated_at'
          : 'id, type, venture_id, created_at',
        filters: { user_id: userId },
        orderBy: { column: 'updated_at', ascending: false },
        ...options
      });
    });
  }

  // Optimized portfolio metrics query
  async getPortfolioMetrics(userId) {
    const cacheKey = `portfolio_metrics_${userId}`;
    
    return this.cachedQuery(cacheKey, async () => {
      // Use database function for efficient aggregation
      const { data, error } = await supabase.rpc('calculate_portfolio_metrics', {
        user_id: userId
      });
      
      if (error) throw error;
      return data;
    }, 10 * 60 * 1000); // Cache for 10 minutes
  }

  // Bulk insert with optimization
  async bulkInsert(table, records, options = {}) {
    const batchSize = options.batchSize || 100;
    const results = [];

    // Split into batches
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from(table)
        .insert(batch)
        .select();

      if (error) throw error;
      results.push(...(data || []));
    }

    // Invalidate related cache
    cacheManager.invalidate('db_queries');
    
    return results;
  }

  // Bulk update with optimization
  async bulkUpdate(table, updates, options = {}) {
    const results = [];

    // Use batch updates for efficiency
    for (const update of updates) {
      const { id, ...updateData } = update;
      
      const { data, error } = await supabase
        .from(table)
        .update(updateData)
        .eq('id', id)
        .select();

      if (error) throw error;
      results.push(...(data || []));
    }

    // Invalidate related cache
    cacheManager.invalidate('db_queries');
    
    return results;
  }

  // Query performance analytics
  getQueryStats() {
    return {
      activeQueries: this.activeQueries,
      maxConcurrent: this.maxConcurrentQueries,
      cacheStats: cacheManager.getStats(),
      recentQueries: Array.from(this.queryCache.keys()).slice(-10)
    };
  }

  // Invalidate specific cache patterns
  invalidateCache(pattern) {
    if (pattern) {
      cacheManager.invalidate(`db_queries:${pattern}`);
    } else {
      cacheManager.invalidate('db_queries');
    }
  }
}

// Database query hooks for React components
export function useOptimizedVentures(userId, options = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    const loadVentures = async () => {
      try {
        setLoading(true);
        setError(null);

        const ventures = await dbOptimizer.getUserVentures(userId, options);
        
        if (!cancelled) {
          setData(ventures || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
          console.error('Failed to load ventures:', err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadVentures();

    return () => {
      cancelled = true;
    };
  }, [userId, JSON.stringify(options)]);

  const refresh = useCallback(() => {
    dbOptimizer.invalidateCache(`user_ventures_${userId}`);
    // Trigger reload by updating a dependency
  }, [userId]);

  return { data, loading, error, refresh };
}

export function useOptimizedKpis(ventureId, options = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ventureId) return;

    let cancelled = false;

    const loadKpis = async () => {
      try {
        setLoading(true);
        setError(null);

        const kpis = await dbOptimizer.getVentureKpis(ventureId, options);
        
        if (!cancelled) {
          setData(kpis || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
          console.error('Failed to load KPIs:', err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadKpis();

    return () => {
      cancelled = true;
    };
  }, [ventureId, JSON.stringify(options)]);

  return { data, loading, error };
}

// Create global database optimizer instance
export const dbOptimizer = new DatabaseOptimizer();

export default dbOptimizer;