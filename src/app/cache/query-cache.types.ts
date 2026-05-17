export interface CacheEntry<T> {
    data: T;
    timestamp: number;
    staleTime: number;
    observers: number;
}

export interface QueryOptions {
    staleTime?: number;
    persist?: boolean;
}

export interface PersistedEntry {
    data: unknown;
    timestamp: number;
    staleTime: number;
}

export const DEFAULT_STALE_TIME = 30_000;
export const STORAGE_PREFIX = '__qcache__';
