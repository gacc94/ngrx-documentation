# Documentación Angular

Bienvenido a la documentación de Angular. Esta guía cubre conceptos fundamentales y avanzados del framework para construir aplicaciones web escalables.

---

## Contenido

1. [Fundamentos de Angular](#fundamentos-de-angular)
2. [Componentes y Directivas](#componentes-y-directivas)
3. [Servicios e Inyección de Dependencias](#servicios-e-inyección-de-dependencias)
4. [Enrutamiento](#enrutamiento)
5. [Peticiones HTTP](#peticiones-http)
6. [Formularios Reactivos y Template-driven](#formularios-reactivos-y-template-driven)
7. [Pipes y Transformaciones](#pipes-y-transformaciones)
8. [Gestión de Estados en Angular](gestion-de-estados-angular.md)
9. [Testing](#testing)
10. [Performance y Optimización](#performance-y-optimizacion)

---

## Fundamentos de Angular

Angular es un framework de desarrollo frontend mantenido por Google, basado en TypeScript. Utiliza una arquitectura de componentes y provee herramientas como CLI, enrutamiento, formularios, y testing integrado.

### Requisitos previos

- Node.js 18+
- npm 9+ o yarn/pnpm
- TypeScript 5+

### Crear un proyecto

```bash
npm install -g @angular/cli
ng new mi-app
cd mi-app
ng serve
```

### Estructura del proyecto

```
mi-app/
├── src/
│   ├── app/
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── angular.json
├── package.json
└── tsconfig.json
```

---

## Componentes y Directivas

### Standalone Components (Angular v17+)

```typescript
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-saludo',
  template: `
    <h2>{{ nombre() }}</h2>
    <button (click)="clickeado.emit()">Saludar</button>
  `,
  styles: [`
    h2 { color: #333; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaludoComponent {
  nombre = input.required<string>();
  clickeado = output<void>();
}
```

### Control Flow (v17+)

```html
@if (usuario(); as user) {
  <p>Bienvenido, {{ user.nombre }}</p>
} @else {
  <p>No has iniciado sesión</p>
}

@for (item of items(); track item.id) {
  <li>{{ item.nombre }}</li>
} @empty {
  <p>No hay elementos</p>
}
```

### Directivas

- `*ngIf`, `*ngFor`, `*ngSwitch` → Reemplazados por `@if`, `@for`, `@switch`
- Directivas de atributo: `[class]`, `[style]`, `[attr]`
- Directivas estructurales: afectan la estructura del DOM

---

## Servicios e Inyección de Dependencias

```typescript
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private http = inject(HttpClient);

  obtenerUsuarios() {
    return this.http.get<Usuario[]>('/api/usuarios');
  }
}
```

> Preferir `inject()` sobre inyección por constructor (Angular v14+).

---

## Enrutamiento

```typescript
// app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'usuarios',
    loadChildren: () => import('./usuarios/usuarios.routes').then(m => m.routes),
  },
];
```

---

## Peticiones HTTP

### HttpClient (clásico)

```typescript
usuarios$ = this.http.get<Usuario[]>('/api/usuarios');
```

### httpResource (Angular v20+)

```typescript
import { httpResource } from '@angular/common/http';

usuarios = httpResource<Usuario[]>('/api/usuarios');
```

### resource (datos reactivos)

```typescript
import { resource } from '@angular/core';

usuarios = resource({
  loader: () => fetch('/api/usuarios').then(r => r.json()),
});
```

---

## Formularios Reactivos y Template-driven

### Reactive Forms (recomendado)

```typescript
import { FormBuilder, Validators } from '@angular/forms';

perfilForm = this.fb.nonNullable.group({
  nombre: ['', Validators.required],
  email: ['', [Validators.required, Validators.email]],
});

guardar() {
  if (this.perfilForm.valid) {
    console.log(this.perfilForm.value);
  }
}
```

---

## Pipes y Transformaciones

```html
<p>{{ fecha | date:'dd/MM/yyyy' }}</p>
<p>{{ precio | currency:'EUR' }}</p>
<p>{{ texto | uppercase }}</p>
```

### Pipe personalizado

```typescript
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'primerasPalabras' })
export class PrimerasPalabrasPipe implements PipeTransform {
  transform(value: string, cantidad: number = 10): string {
    return value.split(' ').slice(0, cantidad).join(' ') + '...';
  }
}
```

---

## Testing

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SaludoComponent } from './saludo.component';

describe('SaludoComponent', () => {
  let fixture: ComponentFixture<SaludoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaludoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SaludoComponent);
  });

  it('debería crearse', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
```

---

## Performance y Optimización

- Usar `ChangeDetectionStrategy.OnPush`
- Lazy loading de rutas y componentes con `loadComponent` / `loadChildren`
- `@defer` para carga diferida de bloques pesados:
  ```html
  @defer (on viewport) {
    <app-grafico-pesado />
  } @placeholder {
    <p>Cargando gráfico...</p>
  }
  ```
- Tree-shaking con standalone components
- `trackBy` en `@for` para listas grandes

---

## Recursos

- [Documentación oficial de Angular](https://angular.dev)
- [Angular CLI](https://angular.dev/cli)
- [Angular Material](https://material.angular.io)

---

**Siguiente**: [Gestión de Estados en Angular →](gestion-de-estados-angular.md)
