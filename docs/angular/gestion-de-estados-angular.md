# Gestión de Estados en Angular

Guía completa de manejo de estado en Angular: desde Signals nativos hasta NgRx Store y NgRx SignalStore.

---

## Índice

1. [Introducción](#introducción)
2. [Signals (Nativo de Angular)](#signals-nativo-de-angular)
3. [NgRx SignalStore](#ngrx-signalstore)
4. [NgRx Store (Redux clásico)](#ngrx-store-redux-clásico)
5. [Comparativa](#comparativa)
6. [Mejores Prácticas](#mejores-prácticas)

---

## Introducción

Angular ofrece múltiples estrategias para gestionar el estado:

| Estrategia | Complejidad | Escala | Curva de aprendizaje |
|---|---|---|---|
| Signals locales | Baja | Componente | Fácil |
| Servicios con Signals | Media | Feature | Media |
| NgRx SignalStore | Media | Aplicación | Media |
| NgRx Store (Redux) | Alta | Aplicación grande | Alta |

---

## Signals (Nativo de Angular)

### ¿Qué son los Signals?

Los Signals son envoltorios reactivos alrededor de valores que notifican a los consumidores cuando el valor cambia. Son parte del core de Angular desde la v16.

### Instalación

No requiere instalación adicional. Viene incluido en Angular v16+.

```bash
ng new mi-app   # Ya incluye Signals
```

### Uso básico

```typescript
import { Component, signal, computed, effect } from '@angular/core';

@Component({
  selector: 'app-contador',
  template: `
    <p>Contador: {{ contador() }}</p>
    <p>Doble: {{ doble() }}</p>
    <button (click)="incrementar()">+</button>
    <button (click)="resetear()">Reset</button>
  `,
})
export class ContadorComponent {
  // Signal escribible
  contador = signal(0);

  // Signal computada (derivada, solo lectura)
  doble = computed(() => this.contador() * 2);

  // Efecto secundario (side effect)
  constructor() {
    effect(() => {
      console.log(`Contador cambió a: ${this.contador()}`);
    });
  }

  incrementar() {
    this.contador.update(c => c + 1);
  }

  resetear() {
    this.contador.set(0);
  }
}
```

### API de Signals

```typescript
// Crear
const nombre = signal('Angular');
const contador = signal<number>(0);

// Leer (reactivo)
const valor = nombre();

// Escribir
nombre.set('React');
contador.update(c => c + 1);

// Computed (derivado)
const mensaje = computed(() => `Hola ${nombre()}`);

// Effect (side effects)
effect(() => {
  localStorage.setItem('nombre', nombre());
});

// linkedSignal (Angular v19+) - señal dependiente que puede reinicializarse
const opciones = linkedSignal({
  source: this.idUsuario,
  computation: (id) => this.cargarOpciones(id),
});

// resource (Angular v19+) - carga de datos asíncrona
usuarios = resource({
  loader: () => fetch('/api/usuarios').then(r => r.json()),
});
```

### Signals en Servicios

```typescript
import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private items = signal<Item[]>([]);

  totalItems = computed(() => this.items().length);
  totalPrecio = computed(() =>
    this.items().reduce((sum, item) => sum + item.precio, 0)
  );

  agregar(item: Item) {
    this.items.update(items => [...items, item]);
  }

  eliminar(id: string) {
    this.items.update(items => items.filter(i => i.id !== id));
  }

  vaciar() {
    this.items.set([]);
  }
}
```

---

## NgRx SignalStore

SignalStore es la evolución moderna de NgRx que usa Signals nativos de Angular en lugar de Observables RxJS.

### Instalación

```bash
npm install @ngrx/signals
```

### Crear un SignalStore

```typescript
import { signalStore, withState, withComputed, withMethods } from '@ngrx/signals';
import { computed } from '@angular/core';

interface ContadorState {
  contador: number;
}

const estadoInicial: ContadorState = {
  contador: 0,
};

export const ContadorStore = signalStore(
  { providedIn: 'root' },
  withState(estadoInicial),

  withComputed(({ contador }) => ({
    doble: computed(() => contador() * 2),
    esPositivo: computed(() => contador() > 0),
  })),

  withMethods((store) => ({
    incrementar(): void {
      store.contador.update(c => c + 1);
    },
    decrementar(): void {
      store.contador.update(c => c - 1);
    },
    resetear(): void {
      store.contador.set(0);
    },
    sumar(valor: number): void {
      store.contador.update(c => c + valor);
    },
  }))
);
```

### Usar el Store en un Componente

```typescript
import { Component, inject } from '@angular/core';
import { ContadorStore } from './contador.store';

@Component({
  selector: 'app-contador',
  template: `
    <p>Contador: {{ store.contador() }}</p>
    <p>Doble: {{ store.doble() }}</p>
    <p>Es positivo: {{ store.esPositivo() }}</p>

    <button (click)="store.incrementar()">+1</button>
    <button (click)="store.decrementar()">-1</button>
    <button (click)="store.sumar(5)">+5</button>
    <button (click)="store.resetear()">Reset</button>
  `,
  providers: [ContadorStore], // Alcance local al componente
})
export class ContadorComponent {
  readonly store = inject(ContadorStore);
}
```

### withEntities — Manejo de Colecciones

```typescript
import { signalStore, withState, withEntities, withMethods } from '@ngrx/signals';

interface Tarea {
  id: string;
  titulo: string;
  completada: boolean;
}

export const TareasStore = signalStore(
  { providedIn: 'root' },
  withEntities<Tarea>(),

  withMethods((store) => ({
    agregar(titulo: string): void {
      const tarea: Tarea = {
        id: crypto.randomUUID(),
        titulo,
        completada: false,
      };
      store.addEntity(tarea);
    },

    toggleCompletada(id: string): void {
      store.updateEntity({
        id,
        changes: (tarea) => ({ completada: !tarea.completada }),
      });
    },

    eliminar(id: string): void {
      store.removeEntity(id);
    },

    limpiarCompletadas(): void {
      store.removeEntities(
        store.entities().filter(t => t.completada).map(t => t.id)
      );
    },
  })),

  withComputed(({ entities }) => ({
    tareasPendientes: computed(() =>
      entities().filter(t => !t.completada).length
    ),
    tareasCompletadas: computed(() =>
      entities().filter(t => t.completada).length
    ),
  }))
);
```

### withCallState — Estado de Carga

```typescript
import { signalStore, withState, withMethods } from '@ngrx/signals';
import { withCallState } from '@ngrx/signals/entities';

interface UsuariosState {
  usuarios: Usuario[];
}

export const UsuariosStore = signalStore(
  { providedIn: 'root' },
  withState<UsuariosState>({ usuarios: [] }),
  withCallState({ collection: 'usuarios' }),

  withMethods((store, http = inject(HttpClient)) => ({
    async cargar(): Promise<void> {
      store.setLoading('usuarios');
      try {
        const usuarios = await lastValueFrom(
          http.get<Usuario[]>('/api/usuarios')
        );
        store.usuarios.set(usuarios);
        store.setLoaded('usuarios');
      } catch {
        store.setError('usuarios', 'Error al cargar usuarios');
      }
    },
  }))
);
```

### Composición de Features

```typescript
// filtros.feature.ts
export function withFiltros() {
  return signalStoreFeature(
    withState({ filtro: 'todos' }),
    withComputed(({ filtro, entities }) => ({
      entidadesFiltradas: computed(() => {
        const f = filtro();
        const items = entities();
        if (f === 'todos') return items;
        return items.filter(i => i.estado === f);
      }),
    })),
    withMethods((store) => ({
      cambiarFiltro(filtro: string): void {
        store.filtro.set(filtro);
      },
    }))
  );
}

// tareas.store.ts
export const TareasStore = signalStore(
  { providedIn: 'root' },
  withEntities<Tarea>(),
  withFiltros(), // Composición reutilizable
);
```

### rxMethod — Integración con RxJS

```typescript
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';

withMethods((store, http = inject(HttpClient)) => ({
  buscar: rxMethod<string>(
    pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((query) =>
        http.get<Resultado[]>(`/api/buscar?q=${query}`)
      ),
      tap((resultados) => store.resultados.set(resultados))
    )
  ),
}))
```

---

## NgRx Store (Redux clásico)

NgRx Store implementa el patrón Redux con Actions, Reducers, Selectors y Effects usando RxJS.

### Instalación

```bash
npm install @ngrx/store @ngrx/effects @ngrx/store-devtools @ngrx/entity
```

### Configuración

```typescript
// app.config.ts
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { contadorReducer } from './store/contador.reducer';
import { ContadorEffects } from './store/contador.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore({ contador: contadorReducer }),
    provideEffects([ContadorEffects]),
    provideStoreDevtools({ maxAge: 25 }),
  ],
};
```

### Actions

```typescript
// contador.actions.ts
import { createActionGroup, props, emptyProps } from '@ngrx/store';

export const ContadorActions = createActionGroup({
  source: 'Contador',
  events: {
    Incrementar: emptyProps(),
    Decrementar: emptyProps(),
    Resetear: emptyProps(),
    Establecer: props<{ valor: number }>(),
    CargarValor: emptyProps(),
    CargarValorExito: props<{ valor: number }>(),
    CargarValorError: props<{ error: string }>(),
  },
});
```

### Reducer

```typescript
// contador.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { ContadorActions } from './contador.actions';

export interface ContadorState {
  valor: number;
  cargando: boolean;
}

export const estadoInicial: ContadorState = {
  valor: 0,
  cargando: false,
};

export const contadorReducer = createReducer(
  estadoInicial,

  on(ContadorActions.incrementar, (state) => ({
    ...state,
    valor: state.valor + 1,
  })),

  on(ContadorActions.decrementar, (state) => ({
    ...state,
    valor: state.valor - 1,
  })),

  on(ContadorActions.resetear, () => estadoInicial),

  on(ContadorActions.establecer, (state, { valor }) => ({
    ...state,
    valor,
  })),

  on(ContadorActions.cargarValor, (state) => ({
    ...state,
    cargando: true,
  })),

  on(ContadorActions.cargarValorExito, (state, { valor }) => ({
    ...state,
    valor,
    cargando: false,
  })),

  on(ContadorActions.cargarValorError, (state) => ({
    ...state,
    cargando: false,
  }))
);
```

### Selectors

```typescript
// contador.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ContadorState } from './contador.reducer';

export const selectContadorState =
  createFeatureSelector<ContadorState>('contador');

export const selectValor = createSelector(
  selectContadorState,
  (state) => state.valor
);

export const selectCargando = createSelector(
  selectContadorState,
  (state) => state.cargando
);

export const selectDoble = createSelector(
  selectValor,
  (valor) => valor * 2
);
```

### Effects

```typescript
// contador.effects.ts
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ContadorActions } from './contador.actions';
import { map, delay } from 'rxjs';

@Injectable()
export class ContadorEffects {
  private actions$ = inject(Actions);

  cargarValor$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ContadorActions.cargarValor),
      delay(1000), // Simula llamada API
      map(() => ContadorActions.cargarValorExito({ valor: 42 }))
    )
  );
}
```

### Uso en Componentes

```typescript
import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { ContadorActions } from './store/contador.actions';
import { selectValor, selectDoble, selectCargando } from './store/contador.selectors';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-contador',
  template: `
    <p>Valor: {{ valor$ | async }}</p>
    <p>Doble: {{ doble$ | async }}</p>

    @if (cargando$ | async) {
      <p>Cargando...</p>
    }

    <button (click)="incrementar()">+</button>
    <button (click)="decrementar()">-</button>
    <button (click)="cargar()">Cargar</button>
  `,
  imports: [AsyncPipe],
})
export class ContadorComponent {
  private store = inject(Store);

  valor$ = this.store.select(selectValor);
  doble$ = this.store.select(selectDoble);
  cargando$ = this.store.select(selectCargando);

  incrementar() {
    this.store.dispatch(ContadorActions.incrementar());
  }

  decrementar() {
    this.store.dispatch(ContadorActions.decrementar());
  }

  cargar() {
    this.store.dispatch(ContadorActions.cargarValor());
  }
}
```

### withEntities (Entity Adapter)

```typescript
import { createEntityAdapter, EntityState } from '@ngrx/entity';

interface Tarea {
  id: string;
  titulo: string;
  completada: boolean;
}

const adapter = createEntityAdapter<Tarea>();

const estadoInicial: TareasState = adapter.getInitialState({
  cargando: false,
});

const tareasReducer = createReducer(
  estadoInicial,

  on(TareasActions.cargarExito, (state, { tareas }) =>
    adapter.setAll(tareas, { ...state, cargando: false })
  ),

  on(TareasActions.agregarExito, (state, { tarea }) =>
    adapter.addOne(tarea, state)
  ),

  on(TareasActions.actualizarExito, (state, { tarea }) =>
    adapter.updateOne({ id: tarea.id, changes: tarea }, state)
  ),

  on(TareasActions.eliminarExito, (state, { id }) =>
    adapter.removeOne(id, state)
  )
);

// Selectors del adapter
const { selectAll, selectEntities, selectIds, selectTotal } =
  adapter.getSelectors();

export const selectTodasLasTareas = createSelector(
  selectTareasState,
  selectAll
);
```

---

## Comparativa

| Característica | Signals nativos | NgRx SignalStore | NgRx Store (Redux) |
|---|---|---|---|
| API Reactiva | Signals | Signals | Observables (RxJS) |
| Boilerplate | Mínimo | Bajo | Alto |
| DevTools | No nativo | No nativo | Sí (Redux DevTools) |
| Time-travel debugging | No | No | Sí |
| Escalabilidad | Baja-Media | Alta | Muy alta |
| Curva aprendizaje | Baja | Media | Alta |
| Tree-shakeable | Sí | Sí | Sí |
| Testing | Fácil | Fácil | Medio |

---

## Mejores Prácticas

### Cuándo usar cada enfoque

- **Signals locales**: Estado de UI simple (formularios, toggles, modales)
- **SignalStore**: Estado de feature o aplicación mediana
- **NgRx Store clásico**: Aplicaciones grandes con múltiples equipos, necesidad de DevTools y time-travel debugging

### Principios generales

1. **Estado local cerca del consumo**: Si solo un componente usa el estado, mantenlo como Signal local
2. **Elevar estado compartido**: Si varios componentes necesitan el dato, usa un servicio o Store
3. **Derivar en lugar de almacenar**: Usa `computed()` para valores derivados, no dupliques estado
4. **Separar UI de lógica**: El Store contiene estado y lógica, los componentes solo renderizan
5. **Inmutabilidad**: Siempre retorna nuevos objetos/arrays, nunca modifiques el estado directamente

```typescript
// Bien
this.items.update(items => [...items, nuevoItem]);

// Mal
this.items().push(nuevoItem);
```

### Estructura de archivos recomendada (NgRx SignalStore)

```
src/app/features/tareas/
├── tareas.store.ts       # SignalStore con lógica de estado
├── tareas.component.ts   # Componente que consume el store
├── tareas.component.html
└── tareas.component.css
```

### Estructura de archivos recomendada (NgRx Store clásico)

```
src/app/store/
├── contador/
│   ├── contador.actions.ts
│   ├── contador.reducer.ts
│   ├── contador.selectors.ts
│   └── contador.effects.ts
└── index.ts
```

---

## Recursos

- [NgRx Docs](https://ngrx.io)
- [NgRx SignalStore Guide](https://ngrx.io/guide/signals/signal-store)
- [Angular Signals Guide](https://angular.dev/guide/signals)
