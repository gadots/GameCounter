# GameCounter — Guía para crear módulos de juego

Cada juego es un archivo `.ts` en este directorio. Vite los detecta con `import.meta.glob` — no hay que registrar nada en el resto de la app. La app valida los módulos al cargar; uno inválido se descarta con un warning en consola.

---

## Cómo funciona la app

GameCounter es un cascarón genérico. Para cada juego necesita saber:
1. **Qué campos mostrar** al usuario → los define `inputs`
2. **Cómo calcular el puntaje** con esos valores → lo define `score()`
3. **Modo de flujo** (end_of_game / per_round / cooperative / con bonus final)

La app nunca conoce las reglas de ningún juego. Solo renderiza inputs, llama a `score()`, y gestiona el estado de la sesión.

---

## Checklist de investigación

Antes de escribir código, respondé estas preguntas:

1. **¿Cuáles son TODAS las fuentes de puntos?** (incluyendo penalizaciones y bonos de fin de juego)
2. **¿Hay premios exclusivos?** (solo un jugador puede tenerlos, ej: Camino más largo en Catan) → `exclusive_group`
3. **¿Es cooperativo?** (todos los jugadores comparten el mismo puntaje, ej: Hanabi) → `cooperative: true`
4. **¿Se puntúa por ronda o al final?**
   - Por ronda (`per_round`): los jugadores ingresan datos cada turno
   - Al final (`end_of_game`): solo se carga una vez cuando termina el juego
5. **¿Hay un bonus de fin de juego después de las rondas regulares?** (ej: flanes en Sushi Go!, bonos en Azul) → `final_round`
6. **¿Cuántas rondas?** ¿Fijas (`total_rounds`) o variables (el jugador decide cuándo terminar)?
7. **¿Hay un puntaje objetivo?** (ej: Catan llega a 10 VP) → `target_score`
8. **¿Qué pasa en caso de empate?** → `tiebreaker_hint`
9. **¿Cuántos jugadores?** (mínimo y máximo del juego base)

---

## Árbol de decisión del modo de scoring

```
¿Es cooperativo (todos comparten mismo score)?
├── SÍ → cooperative: true  (además aplicar end_of_game o per_round según corresponda)
└── NO → continuar ↓

¿Se puntúa una sola vez al final?
├── SÍ → scoring_mode: 'end_of_game'
│         └── ¿Tiene target de victoria? → target_score: N
└── NO → scoring_mode: 'per_round'
          ├── ¿Rondas fijas?
          │   ├── SÍ → total_rounds: N
          │   │         └── ¿Hay bonus al finalizar? → final_round: { ... }
          │   └── NO → ¿El juego termina por puntaje? → target_score: N
          │              └── ¿Sin target? → "Terminar" aparece automáticamente
          │                  └── ¿Hay bonus al finalizar? → final_round: { ... }
          │                                                   (botón "Ir a bonus final")
          └── ¿Tiene target de victoria? → target_score: N
```

---

## Catálogo de tipos de input

**Solo podés usar estos tipos.** La app los renderiza con sus propios componentes.

| type | UI renderizado | Cuándo usarlo |
|------|---------------|---------------|
| `stepper` | Botones +/− con número | Cantidades discretas (0–20). Evitar para valores grandes (>20) |
| `number` | Campo numérico libre | Subtotales ya calculados o rangos grandes (monedas, puntajes libres) |
| `toggle` | Switch on/off | Bonos binarios: lo tenés o no lo tenés |
| `select` | Dropdown | Opciones fijas y nombradas (posiciones, categorías, tipos) |

### Propiedades opcionales de cada input

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `min` / `max` | `number` | Límites del valor |
| `default` | `number \| boolean` | Valor inicial (defecto: `0` o `false`) |
| `description` | `string` | Tooltip con recordatorio de reglas (muy recomendado) |
| `options` | `string[]` | Solo para `select` — lista de opciones |
| `exclusive_group` | `string` | **Ver sección Patrones** — solo un jugador puede activarlo |

---

## Schema completo

```typescript
import type { GameModule } from '../lib/types';

export default {
  metadata: {
    id: 'game-id',            // kebab-case; debe coincidir con el nombre del archivo
    name: 'Nombre del Juego',
    min_players: 2,
    max_players: 4,
    scoring_mode: 'end_of_game' | 'per_round',
    total_rounds?: number,    // solo per_round con rondas fijas
    target_score?: number,    // omitir si el juego termina por evento, no por puntaje
    tiebreaker_hint?: string, // texto corto para mostrar en caso de empate
    tags?: string[],          // para filtrar en la librería
    bgg_id?: number,          // ID numérico de BoardGameGeek
    cooperative?: boolean,    // true → todos comparten inputs y puntaje
  },

  inputs: [
    {
      id: 'field_id',                   // snake_case, único dentro del módulo
      label: 'Texto visible',
      type: 'stepper' | 'number' | 'toggle' | 'select',
      min?: number,
      max?: number,
      default?: number | boolean,
      description?: string,
      options?: string[],               // solo para select
      exclusive_group?: string,         // solo para toggle
    },
  ],

  // ctx.round es 1-indexed. Para end_of_game siempre será 1.
  score(values, ctx) {
    return /* número, puede ser negativo */;
  },

  // Opcional: validación cruzada entre inputs del mismo jugador.
  validate?(values): string | null {
    return null; // o string de error visible al usuario
  },

  // Opcional: ronda de bonus al terminar las rondas regulares.
  final_round?: {
    label?: string,           // texto en la UI (default: 'Bonificación final')
    inputs: [...],            // misma estructura que inputs principal
    score(values): number,   // sin ctx — siempre se llama una vez al final
  },
} satisfies GameModule;
```

---

## Patrones de diseño

### 1. Premio exclusivo (`exclusive_group`)

Para bonos que **solo un jugador puede tener** (camino más largo, loseta especial, etc.).

Cuando el primer jugador activa el toggle, los siguientes lo ven bloqueado con "Asignado a [nombre]".

```typescript
inputs: [
  { id: 'longest_road', label: 'Camino más largo', type: 'toggle',
    exclusive_group: 'catan_road',         // ← string único para este premio
    description: '+2 VP. Solo un jugador puede tenerlo.' },
  { id: 'largest_army', label: 'Ejército más grande', type: 'toggle',
    exclusive_group: 'catan_army',         // ← grupo diferente, independiente
    description: '+2 VP. Solo un jugador puede tenerlo.' },
],
```

Reglas:
- El `exclusive_group` debe ser único globalmente (prefijarlo con el id del juego)
- Solo tiene sentido en inputs `toggle`
- Dos inputs con distintos `exclusive_group` son independientes entre sí

---

### 2. Bonus de fin de juego (`final_round`)

Para juegos `per_round` que tienen **scoring adicional solo al terminar** (ej: flanes en Sushi Go!, bonos de tablero en Azul, ajuste de fichas en Scrabble).

**Rondas fijas** (`total_rounds` definido): el bonus se activa automáticamente al completar la última ronda.

**Rondas variables** (sin `total_rounds`): aparece el botón "Ir a bonus final" en el header. El jugador lo activa cuando quiere terminar.

```typescript
metadata: {
  scoring_mode: 'per_round',
  total_rounds: 3,  // ← con esto se activa automático al terminar ronda 3
},

inputs: [ /* inputs de rondas regulares */ ],
score({ ... }) { return /* puntaje por ronda */; },

final_round: {
  label: 'Bonificación de flanes',      // texto que aparece en la UI
  inputs: [
    { id: 'pudding', label: 'Flanes', type: 'select',
      options: ['Sin bonus (0)', 'Menos flanes (−6)', 'Más flanes (+6)'] },
  ],
  score({ pudding }) {
    return [0, -6, 6][pudding as number];
  },
},
```

Importante: `final_round.score()` no recibe `ctx` — siempre se llama exactamente una vez al final de la sesión.

---

### 3. Juego cooperativo (`cooperative: true`)

Para juegos donde **todos los jugadores comparten el mismo puntaje** (Hanabi, Pandemic, etc.).

La UI muestra un único set de inputs por ronda (sin tabs de jugadores) y aplica automáticamente el mismo score a todos.

```typescript
metadata: {
  scoring_mode: 'end_of_game',
  cooperative: true,   // ← activa el modo cooperativo
  target_score: 25,
},
inputs: [
  { id: 'fireworks', label: 'Puntaje final', type: 'stepper', min: 0, max: 25 },
],
score({ fireworks }) {
  return fireworks as number;
},
```

---

### 4. Scoring comparativo (`select`)

Para inputs cuyo valor **depende de la posición relativa** respecto a otros jugadores (quién tiene más/menos de algo). El usuario evalúa la comparación y elige su posición en un dropdown.

```typescript
{ id: 'maki', label: 'Makis', type: 'select',
  options: ['Sin puntos (0)', 'Segundo lugar (3 pts)', 'Primer lugar (6 pts)'],
  description: 'Quién tiene más makis al final de la ronda.' },

// En score():
const makiVP = [0, 3, 6];
return ... + makiVP[maki as number];
```

---

### 5. Tabla de VP por cantidad (`stepper` + lógica en score)

Para juegos donde **la cantidad de recursos se convierte en VP según una tabla no lineal** (Agrícola, en general juegos eurogame).

```typescript
// Patrón utilitario recomendado:
function tableVP(n: number, thresholds: [number, number][]): number {
  for (const [min, vp] of [...thresholds].reverse()) {
    if (n >= min) return vp;
  }
  return -1; // penalización por tener 0
}

// Uso:
const sheepVP: [number, number][] = [[1, 1], [4, 2], [6, 3], [8, 4]];
// 0 ovejas → -1 VP, 1-3 → +1, 4-5 → +2, 6-7 → +3, 8+ → +4
tableVP(sheep as number, sheepVP);
```

---

### 6. Puntaje acumulado con objetivo (`per_round` + `target_score`)

Para juegos donde los puntos se acumulan ronda a ronda y la sesión termina cuando alguien alcanza el objetivo (UNO, Love Letter con target fijo, etc.).

```typescript
metadata: {
  scoring_mode: 'per_round',
  target_score: 500,  // la app verifica después de cada ronda y cierra la sesión automáticamente
},
```

---

## Ejemplo completo — Sushi Go! (per_round + final_round + select comparativo)

```typescript
import type { GameModule } from '../lib/types';

export default {
  metadata: {
    id: 'sushi-go',
    name: 'Sushi Go!',
    min_players: 2,
    max_players: 5,
    scoring_mode: 'per_round',
    total_rounds: 3,
    tiebreaker_hint: 'Gana quien tenga más cartas de pudín al final de los 3 turnos.',
    tags: ['cartas', 'familia', 'rápido', 'drafting'],
    bgg_id: 133473,
  },

  inputs: [
    { id: 'tempura',   label: 'Tempura',   type: 'stepper', min: 0, description: 'Pares: cada par vale 5 pts' },
    { id: 'sashimi',   label: 'Sashimi',   type: 'stepper', min: 0, description: 'Tríos: cada trío vale 10 pts' },
    { id: 'dumplings', label: 'Dumplings', type: 'stepper', min: 0, max: 5, description: '1/3/6/10/15 pts por 1/2/3/4/5+' },
    { id: 'nigiri',    label: 'Nigiri',    type: 'number',  min: 0, description: 'Puntos directos (wasabi aplicado)' },
    { id: 'maki', label: 'Makis', type: 'select',
      options: ['Sin puntos (0)', 'Segundo lugar (3 pts)', 'Primer lugar (6 pts)'],
      description: 'Quién tiene más makis al final de la ronda.' },
  ],

  score({ tempura, sashimi, dumplings, nigiri, maki }) {
    const dumpVP = [0, 1, 3, 6, 10, 15];
    const makiVP = [0, 3, 6];
    return (
      Math.floor((tempura as number) / 2) * 5 +
      Math.floor((sashimi as number) / 3) * 10 +
      dumpVP[Math.min(dumplings as number, 5)] +
      (nigiri as number) +
      makiVP[maki as number]
    );
  },

  final_round: {
    label: 'Bonificación de flanes',
    inputs: [
      { id: 'pudding', label: 'Flanes acumulados', type: 'select',
        options: ['Sin bonus (0)', 'Menos flanes (−6 pts)', 'Más flanes (+6 pts)'],
        description: 'En 2 jugadores: solo hay +6, sin penalización.' },
    ],
    score({ pudding }) {
      return [0, -6, 6][pudding as number];
    },
  },
} satisfies GameModule;
```

---

## Edge cases y advertencias

**Puntos negativos:** `score()` puede devolver números negativos. Se muestran en rojo en la tabla.

**`number` vs `stepper`:** Usá `stepper` para cantidades que el usuario incrementa de a 1 (piezas, cartas). Usá `number` cuando el usuario ya calculó un subtotal o el rango es grande (monedas, puntaje de palabra en Scrabble).

**`target_score` en `end_of_game`:** Solo es informativo. La app no lo chequea automáticamente en ese modo — el usuario clickea "Terminar". En `per_round`, sí se chequea automáticamente tras cada ronda.

**Juegos sin `total_rounds` y sin `target_score`:** La app muestra un botón "Terminar" automáticamente (para Exploding Kittens, Codenames, Scrabble, etc.).

**`score()` solo recibe los valores del jugador actual.** Si el scoring depende de lo que hicieron otros (ej: "mayoría"), usá `select` — el usuario evalúa la comparación y elige su posición.

**`validate()`:** Para restricciones cruzadas entre inputs del mismo jugador (ej: basas ganadas no puede ser negativo). Devuelve `string` de error o `null`. Se llama antes de avanzar al siguiente jugador.

**`final_round` y `per_round` sin `total_rounds`:** El jugador activa el bonus manualmente con el botón "Ir a bonus final" que aparece en el header. El botón "← Cancelar bonificación" permite volver atrás.

---

## Convención de nombres

- Nombre de archivo: `{game-id}.ts`
- `game-id` = `metadata.id` (deben coincidir exactamente)
- Solo letras minúsculas, números y guiones: `ticket-to-ride.ts`, `seven-wonders.ts`

---

## Cómo testear un módulo nuevo

1. Copiar el archivo `.ts` a `src/games/`
2. `npm run build` — TypeScript valida el módulo (errores de tipo se ven aquí)
3. `npm run dev` → Librería → instalar el juego → crear sesión
4. Ingresar valores borde (0s, máximos) y verificar que `score()` calcula correctamente
5. Si tiene `exclusive_group`: verificar que el segundo jugador no puede activar el mismo toggle
6. Si tiene `final_round`: verificar que aparece el bonus después de la última ronda
7. Si tiene `cooperative: true`: verificar que no hay tabs de jugadores y el score se aplica a todos
8. Si tiene `target_score` en `per_round`: verificar que la sesión se cierra sola al alcanzarlo

---

## Catálogo de módulos

| Archivo | Juego | Modo | Rondas | Target | Especial |
|---------|-------|------|--------|--------|---------|
| `catan.ts` | Catan | end_of_game | — | 10 VP | exclusive_group (camino, ejército) |
| `skull-king.ts` | Skull King | per_round | 10 | — | validate() |
| `ticket-to-ride.ts` | Ticket to Ride | end_of_game | — | — | exclusive_group (ruta) |
| `splendor.ts` | Splendor | end_of_game | — | 15 pts | — |
| `uno.ts` | UNO | per_round | abierto | 500 pts | — |
| `patchwork.ts` | Patchwork | end_of_game | — | — | exclusive_group (loseta 7×7) |
| `carcassonne.ts` | Carcassonne | end_of_game | — | — | — |
| `scrabble.ts` | Scrabble | per_round | abierto | — | final_round (ajuste fichas) |
| `azul.ts` | Azul | per_round | abierto | — | final_round (filas/columnas/colores) |
| `seven-wonders.ts` | 7 Wonders | end_of_game | — | — | — |
| `root.ts` | Root | end_of_game | — | 30 VP | — |
| `agricola.ts` | Agrícola | end_of_game | — | — | tableVP(), select (tipo cabaña) |
| `exploding-kittens.ts` | Exploding Kittens | per_round | abierto | — | Terminar manual |
| `codenames.ts` | Codenames | per_round | abierto | — | Terminar manual |
| `love-letter.ts` | Love Letter | per_round | abierto | — | Terminar manual |
| `sushi-go.ts` | Sushi Go! | per_round | 3 | — | final_round (flanes), select (makis) |
| `hanabi.ts` | Hanabi | end_of_game | — | 25 pts | cooperative |
