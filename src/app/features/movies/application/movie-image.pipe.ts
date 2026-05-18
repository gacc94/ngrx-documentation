import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

import { environment } from '@env';

@Pipe({
    name: 'movieImage',
    standalone: true,
    pure: true,
})
export class MovieImagePipe implements PipeTransform {
    private static readonly baseUrl = environment.tmdbImageUrl;

    transform(path: string | null, size = 'w500'): string {
        if (!path) return '';
        return `${MovieImagePipe.baseUrl}/${size}${path}`;
    }
}
