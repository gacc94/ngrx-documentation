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
    styleUrl: './movie-carousel.scss',
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
            <div
                #track
                class="carousel-track"
                (scroll)="onScroll()"
                (mouseenter)="pauseAuto()"
                (mouseleave)="resumeAuto()"
            >
                <ng-content />
            </div>
        </div>
    `,
})
export class MovieCarouselComponent implements AfterViewInit {
    readonly title = input.required<string>();
    readonly autoScroll = input(true);

    readonly track = viewChild.required<ElementRef<HTMLDivElement>>('track');

    protected atStart = true;
    protected atEnd = false;

    readonly #destroyRef = inject(DestroyRef);
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
