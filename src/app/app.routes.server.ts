import { RenderMode, type ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
    {
        path: '',
        renderMode: RenderMode.Prerender,
    },
    {
        path: 'movies',
        renderMode: RenderMode.Client,
    },
    {
        path: 'movies/:id',
        renderMode: RenderMode.Client,
    },
    {
        path: '**',
        renderMode: RenderMode.Client,
    },
];
