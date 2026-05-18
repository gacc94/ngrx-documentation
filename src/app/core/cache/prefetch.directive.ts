import { DestroyRef, Directive, ElementRef, inject, input, type OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, filter, fromEvent, map, merge, type Observable } from 'rxjs';
import { QueryCacheService } from './query-cache.service';
import type { QueryOptions } from './query-cache.types';

/**
 * Prefetch cache data on user intent signals.
 *
 * @example
 * ```html
 * <a routerLink="/products"
 *    [appPrefetch]="'products'"
 *    [appPrefetchFn]="productListFn"
 *    [appPrefetchOptions]="{ staleTime: 30_000, persist: true }">
 *   Products
 * </a>
 * ```
 */
@Directive({
    selector: '[appPrefetch]',
})
export class PrefetchDirective implements OnInit {
    readonly queryKey = input.required<string>({ alias: 'appPrefetch' });
    readonly queryFn = input.required<() => Observable<unknown>>({ alias: 'appPrefetchFn' });
    readonly queryOptions = input<QueryOptions>({}, { alias: 'appPrefetchOptions' });
    readonly trigger = input<'hover' | 'visible'>('hover');

    #cache = inject(QueryCacheService);
    #destroyRef = inject(DestroyRef);
    #el = inject(ElementRef).nativeElement as HTMLElement;

    ngOnInit(): void {
        if (this.trigger() === 'hover') {
            this.#bindHover();
        } else {
            this.#bindVisible();
        }
    }

    #bindHover(): void {
        merge(
            fromEvent<MouseEvent>(this.#el, 'mouseenter').pipe(map(() => true)),
            fromEvent<MouseEvent>(this.#el, 'mouseleave').pipe(map(() => false)),
        )
            .pipe(
                debounceTime(150),
                filter((hovering) => !!hovering),
                filter(() => !this.#cache.has(this.queryKey())),
                takeUntilDestroyed(this.#destroyRef),
            )
            .subscribe(() => {
                this.#cache.prefetch(this.queryKey(), this.queryFn(), this.queryOptions());
            });
    }

    #bindVisible(): void {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry?.isIntersecting && !this.#cache.has(this.queryKey())) {
                    this.#cache.prefetch(this.queryKey(), this.queryFn(), this.queryOptions());
                    observer.disconnect();
                }
            },
            { rootMargin: '200px' },
        );

        observer.observe(this.#el);
        this.#destroyRef.onDestroy(() => observer.disconnect());
    }
}
