import { useCallback } from "react";
import type { Annotation } from "@/types/annotation";

interface CacheEntry {
  data: Annotation[];
  timestamp: number;
  ttl: number;
}

interface CacheConfig {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
  prefix?: string; // Cache key prefix
}

const DEFAULT_CONFIG: Required<CacheConfig> = {
  ttl: 24 * 60 * 60 * 1000, // 24 hours
  maxSize: 50,
  prefix: "analysis_cache_",
};

export function useAnalysisCache(config: CacheConfig = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  const getCacheKey = useCallback(
    (url: string) => `${finalConfig.prefix}${btoa(url)}`,
    [finalConfig.prefix],
  );

  const getFromCache = useCallback(
    (url: string): Annotation[] | null => {
      try {
        const key = getCacheKey(url);
        const cached = localStorage.getItem(key);

        if (!cached) return null;

        const entry: CacheEntry = JSON.parse(cached);
        const now = Date.now();

        // Check if expired
        if (now - entry.timestamp > entry.ttl) {
          localStorage.removeItem(key);
          return null;
        }

        return entry.data;
      } catch (error) {
        console.warn("Cache read error:", error);
        return null;
      }
    },
    [getCacheKey],
  );

  const setCache = useCallback(
    (url: string, data: Annotation[]) => {
      try {
        const key = getCacheKey(url);
        const entry: CacheEntry = {
          data,
          timestamp: Date.now(),
          ttl: finalConfig.ttl,
        };

        // Clean up old entries if we're at max size
        const allKeys = Object.keys(localStorage)
          .filter((k) => k.startsWith(finalConfig.prefix))
          .map((k) => ({
            key: k,
            timestamp:
              JSON.parse(localStorage.getItem(k) || "{}").timestamp || 0,
          }))
          .sort((a, b) => b.timestamp - a.timestamp);

        if (allKeys.length >= finalConfig.maxSize) {
          const toRemove = allKeys.slice(finalConfig.maxSize - 1);
          toRemove.forEach(({ key }) => {
            localStorage.removeItem(key);
          });
        }

        localStorage.setItem(key, JSON.stringify(entry));
      } catch (error) {
        console.warn("Cache write error:", error);
      }
    },
    [getCacheKey, finalConfig.ttl, finalConfig.maxSize, finalConfig.prefix],
  );

  return {
    getFromCache,
    setCache,
    config: finalConfig,
  };
}
