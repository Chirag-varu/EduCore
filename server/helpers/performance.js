/**
 * Performance optimization utilities for EduCore
 * Provides caching and query optimization helpers
 */

import redisClient from "./redisClient.js";

/**
 * Cache wrapper for database queries
 * @param {string} key - Cache key
 * @param {Function} queryFn - Function that returns the data to cache
 * @param {number} ttl - Time to live in seconds (default: 5 minutes)
 * @returns {Promise} - Cached or fresh data
 */
export const cacheQuery = async (key, queryFn, ttl = 300) => {
  try {
    // Try to get data from cache first
    const cached = await redisClient.get(key);
    if (cached) {
      return JSON.parse(cached);
    }

    // If not in cache, execute query
    const data = await queryFn();
    
    // Store in cache with TTL
    if (data) {
      await redisClient.setEx(key, ttl, JSON.stringify(data));
    }
    
    return data;
  } catch (error) {
    console.error('Cache error:', error);
    // Fallback to direct query if cache fails
    return await queryFn();
  }
};

/**
 * Invalidate cache by pattern
 * @param {string} pattern - Pattern to match cache keys
 */
export const invalidateCache = async (pattern) => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
};

/**
 * Generate cache key for course queries
 * @param {Object} filters - Query filters
 * @param {Object} sort - Sort parameters
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {string} - Cache key
 */
export const generateCoursesCacheKey = (filters = {}, sort = {}, page = 1, limit = 10) => {
  const filterStr = JSON.stringify(filters);
  const sortStr = JSON.stringify(sort);
  return `courses:${Buffer.from(filterStr + sortStr).toString('base64')}:p${page}:l${limit}`;
};

/**
 * Performance monitoring for slow queries
 * @param {string} queryName - Name of the query for logging
 * @param {Function} queryFn - Query function to monitor
 * @returns {Promise} - Query result with timing
 */
export const monitorQuery = async (queryName, queryFn) => {
  const startTime = Date.now();
  try {
    const result = await queryFn();
    const duration = Date.now() - startTime;
    
    // Log slow queries (>1 second)
    if (duration > 1000) {
      console.warn(`Slow query detected: ${queryName} took ${duration}ms`);
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`Query failed: ${queryName} took ${duration}ms`, error);
    throw error;
  }
};

/**
 * Batch operations helper for better performance
 * @param {Array} operations - Array of operations to execute
 * @param {number} batchSize - Size of each batch
 * @returns {Promise} - Results of all operations
 */
export const batchExecute = async (operations, batchSize = 10) => {
  const results = [];
  
  for (let i = 0; i < operations.length; i += batchSize) {
    const batch = operations.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch);
    results.push(...batchResults);
  }
  
  return results;
};