import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, type Observable, share, tap } from 'rxjs';

import { DEFAULT_STALE_TIME, type PersistedEntry, type QueryOptions, STORAGE_PREFIX } from './query-cache.types';

type CacheItem = {
    subject: BehaviorSubject<unknown>;
    timestamp: number;
    staleTime: number;
    persist: boolean;
};

@Injectable({ providedIn: 'root' })
export class QueryCacheService {
    #cache = new Map<string, CacheItem>();
    #pending = new Map<string, Observable<unknown>>();

    constructor() {
        this.#restore();
    }

    query<T>(key: string, queryFn: () => Observable<T>, options?: QueryOptions): Observable<T> {
        const staleTime = options?.staleTime ?? DEFAULT_STALE_TIME;
        const persist = options?.persist ?? false;
        const entry = this.#cache.get(key);

        if (entry) {
            if (persist) entry.persist = true;

            const isStale = Date.now() - entry.timestamp > staleTime;

            if (isStale) {
                this.#refetchInBackground(key, queryFn, staleTime, persist);
            }

            return entry.subject.asObservable().pipe(filter((d): d is T => d !== undefined));
        }

        return this.#fetchAndCache(key, queryFn, staleTime, persist);
    }

    prefetch<T>(key: string, queryFn: () => Observable<T>, options?: QueryOptions): void {
        const staleTime = options?.staleTime ?? DEFAULT_STALE_TIME;
        const persist = options?.persist ?? false;
        const entry = this.#cache.get(key);

        if (entry) {
            const isStale = Date.now() - entry.timestamp > staleTime;
            if (isStale) {
                this.#refetchInBackground(key, queryFn, staleTime, persist);
            }
            return;
        }

        this.#fetchAndCache(key, queryFn, staleTime, persist);
    }

    invalidate(key: string | string[]): void {
        const keys = Array.isArray(key) ? key : [key];

        for (const k of keys) {
            const entry = this.#cache.get(k);
            if (entry) {
                entry.timestamp = 0;
            }
        }
    }

    invalidateAll(): void {
        for (const [, entry] of this.#cache) {
            entry.timestamp = 0;
        }
    }

    get<T>(key: string): T | undefined {
        const entry = this.#cache.get(key);
        if (!entry) return undefined;
        return entry.subject.getValue() as T;
    }

    set<T>(key: string, data: T, options?: QueryOptions): void {
        const staleTime = options?.staleTime ?? DEFAULT_STALE_TIME;
        const persist = options?.persist ?? false;
        const existing = this.#cache.get(key);

        if (existing) {
            existing.subject.next(data);
            existing.timestamp = Date.now();
            existing.staleTime = staleTime;
            if (persist) existing.persist = true;
            if (existing.persist) this.#save(key, data, existing.timestamp, staleTime);
            return;
        }

        const subject = new BehaviorSubject<unknown>(data);
        this.#cache.set(key, { subject, timestamp: Date.now(), staleTime, persist });
        if (persist) this.#save(key, data, Date.now(), staleTime);
    }

    has(key: string): boolean {
        return this.#cache.has(key);
    }

    clear(key?: string): void {
        if (key) {
            this.#removeEntry(key);
            return;
        }

        for (const k of this.#cache.keys()) {
            this.#removeEntry(k);
        }
    }

    #fetchAndCache<T>(key: string, queryFn: () => Observable<T>, staleTime: number, persist: boolean): Observable<T> {
        const pending = this.#pending.get(key);
        if (pending) return pending as Observable<T>;

        const subject = new BehaviorSubject<unknown>(undefined);
        this.#cache.set(key, { subject, timestamp: 0, staleTime, persist });

        const shared$ = queryFn().pipe(
            tap((data) => {
                subject.next(data);
                const entry = this.#cache.get(key);
                if (entry) {
                    entry.timestamp = Date.now();
                    if (entry.persist) this.#save(key, data, entry.timestamp, staleTime);
                }
            }),
            share(),
        );

        this.#pending.set(key, shared$);
        shared$.subscribe({
            error: () => void 0,
            complete: () => void this.#pending.delete(key),
        });

        return subject.asObservable().pipe(filter((d): d is T => d !== undefined));
    }

    #refetchInBackground<T>(key: string, queryFn: () => Observable<T>, staleTime: number, persist: boolean): void {
        if (this.#pending.has(key)) return;

        if (persist) {
            const entry = this.#cache.get(key);
            if (entry) entry.persist = true;
        }

        const shared$ = queryFn().pipe(
            tap((data) => {
                const entry = this.#cache.get(key);
                if (entry) {
                    entry.subject.next(data);
                    entry.timestamp = Date.now();
                    entry.staleTime = staleTime;
                    if (entry.persist) this.#save(key, data, entry.timestamp, staleTime);
                }
            }),
            share(),
        );

        this.#pending.set(key, shared$);
        shared$.subscribe({
            error: () => void 0,
            complete: () => void this.#pending.delete(key),
        });
    }

    #save(key: string, data: unknown, timestamp: number, staleTime: number): void {
        try {
            const entry: PersistedEntry = { data, timestamp, staleTime };
            sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(entry));
        } catch {
            // SessionStorage full or unavailable
        }
    }

    #restore(): void {
        for (let i = 0; i < sessionStorage.length; i++) {
            const storageKey = sessionStorage.key(i);
            if (storageKey === null || !storageKey.startsWith(STORAGE_PREFIX)) continue;

            const appKey = storageKey.slice(STORAGE_PREFIX.length);
            if (this.#cache.has(appKey)) continue;

            try {
                const raw = sessionStorage.getItem(storageKey);
                if (!raw) continue;

                const persisted: PersistedEntry = JSON.parse(raw);
                const subject = new BehaviorSubject<unknown>(persisted.data);
                this.#cache.set(appKey, {
                    subject,
                    timestamp: persisted.timestamp,
                    staleTime: persisted.staleTime,
                    persist: true,
                });
            } catch {
                sessionStorage.removeItem(storageKey);
            }
        }
    }

    #removeEntry(key: string): void {
        const entry = this.#cache.get(key);
        if (entry) {
            entry.subject.complete();
            this.#cache.delete(key);
        }
        this.#pending.delete(key);

        try {
            sessionStorage.removeItem(STORAGE_PREFIX + key);
        } catch {
            // SessionStorage unavailable
        }
    }
}
