import {
    type AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    type ElementRef,
    inject,
    input,
    viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { interval, takeWhile } from 'rxjs';

@Component({
    selector: 'app-movie-carousel',
    imports: [MatIconModule, MatIconButton],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="carousel-container">
            <div class="carousel-header">
                <h2 class="carousel-title">{{ title() }}</h2>
                <div class="carousel-controls">
                    <button mat-icon-button (click)="scrollLeft()" [disabled]="atStart">
                        <mat-icon>chevron_left</mat-icon>
                    </button>
                    <button mat-icon-button (click)="scrollRight()" [disabled]="atEnd">
                        <mat-icon>chevron_right</mat-icon>
                    </button>
                </div>
            </div>
            <div #track class="carousel-track" (scroll)="onScroll()" (mouseenter)="pauseAuto()" (mouseleave)="resumeAuto()">
                <ng-content />
            </div>
        </div>
    `,
    styles: `
        :host {
            display: block;
            margin-bottom: 32px;
        }

        .carousel-container {
            position: relative;
        }

        .carousel-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
        }

        .carousel-title {
            margin: 0;
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--mat-sys-on-surface);
        }

        .carousel-controls {
            display: flex;
            gap: 4px;
        }

        .carousel-track {
            display: flex;
            gap: 16px;
            overflow-x: auto;
            overflow-y: hidden;
            scroll-behavior: smooth;
            padding-bottom: 8px;
            scrollbar-width: thin;
            scrollbar-color: var(--mat-sys-outline-variant) transparent;

            &::-webkit-scrollbar {
                height: 6px;
            }

            &::-webkit-scrollbar-thumb {
                background: var(--mat-sys-outline-variant);
                border-radius: 3px;
            }

            &::-webkit-scrollbar-track {
                background: transparent;
            }
        }
    `,
})
export class MovieCarouselComponent implements AfterViewInit {
    readonly title = input.required<string>();
    readonly autoScroll = input(true);

    readonly track = viewChild.required<ElementRef<HTMLDivElement>>('track');

    protected atStart = true;
    protected atEnd = false;

    #destroyRef = inject(DestroyRef);
    #autoScrollActive = true;

    ngAfterViewInit(): void {
        if (this.autoScroll()) {
            interval(3000)
                .pipe(
                    takeWhile(() => this.#autoScrollActive),
                    takeUntilDestroyed(this.#destroyRef),
                )
                .subscribe(() => {
                    const el = this.track().nativeElement;
                    const cardWidth = 201;
                    el.scrollBy({ left: cardWidth, behavior: 'smooth' });

                    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - cardWidth) {
                        el.scrollTo({ left: 0, behavior: 'smooth' });
                    }
                });
        }
    }

    scrollLeft(): void {
        this.track().nativeElement.scrollBy({ left: -400, behavior: 'smooth' });
    }

    scrollRight(): void {
        this.track().nativeElement.scrollBy({ left: 400, behavior: 'smooth' });
    }

    onScroll(): void {
        const el = this.track().nativeElement;
        this.atEnd = el.scrollLeft + el.clientWidth + 1 >= el.scrollWidth;
        this.atStart = el.scrollLeft <= 1;
    }

    pauseAuto(): void {
        this.#autoScrollActive = false;
    }

    resumeAuto(): void {
        this.#autoScrollActive = true;
    }
}
