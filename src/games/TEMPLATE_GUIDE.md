# GameCounter — Guía para crear módulos de juego

Cada juego es un archivo `.ts` en este directorio. Vite los detecta con `import.meta.glob` — no hay que registrar nada en el resto de la app. La app valida los módulos al cargar; uno inválido se descarta con un warning en consola.

---

## Cómo funciona la app

GameCounter es un cascarón. Para cada juego tiene que saber dos cosas:
1. **Qué campos mostrar** al usuario → lo definen los `inputs`
2. **Cómo calcular el puntaje** con esos valores → lo define `score()`

La app nunca conoce las reglas de ningún juego. Solo renderiza inputs y llama a `score()`.
Los jugadores y el historial son responsabilidad de la app, no del módulo.

---

## Checklist de investigación

Antes de escribir código, respondé estas preguntas sobre el juego:

1. **¿Cuáles son todas las fuentes de puntos?** (incluyendo penalizaciones)
2. **¿Hay premios exclusivos?** (solo un jugador puede tenerlos a la vez, ej: Camino más largo en Catan)
3. **¿Se puntúa por ronda o al final?**
   - Por ronda (`per_round`): los jugadores ingresan datos cada turno/ronda
   - Al final (`end_of_game`): solo se carga una vez cuando termina el juego
4. **¿Hay un puntaje objetivo?** (ej: Catan termina cuando alguien llega a 10 VP)
5. **¿Qué pasa en caso de empate?** (una oración clara para mostrar al usuario)
6. **¿Cuántos jugadores?** (mínimo y máximo del juego base)

---

## Catálogo de tipos de input

**Solo podés usar estos tipos.** La app los renderiza con sus propios componentes — vos nunca escribís UI.

| type | UI renderizado | Cuándo usarlo |
|------|---------------|---------------|
| `stepper` | Botones +/- con número | Cantidades discretas pequeñas (0-20) |
| `number` | Campo numérico libre | Puntajes directos o rangos grandes |
| `toggle` | Switch on/off | Bonos binarios (lo tenés o no lo tenés) |
| `select` | Dropdown | Opciones fijas y nombradas |

Campos opcionales para todos los tipos:
- `min` / `max` → límites del input
- `default` → valor inicial
- `description` → tooltip con recordatorio de reglas (muy recomendado)
- `options` → solo para `select`, array de strings

---

## Schema completo

```typescript
interface GameModule {
  metadata: {
    id: string;            // lowercase-con-guiones, debe coincidir con el nombre del archivo
    name: string;          // nombre humano del juego
    min_players: number;
    max_players: number;
    scoring_mode: 'end_of_game' | 'per_round';
    total_rounds?: number; // solo para per_round
    target_score?: number; // omitir si el juego termina por evento, no por puntaje
    tiebreaker_hint?: string;
    tags?: string[];       // útil para filtrar en la librería
    bgg_id?: number;       // ID numérico de BoardGameGeek
  };

  inputs: Array<{
    id: string;            // snake_case, único dentro del módulo
    label: string;         // texto corto mostrado al usuario
    type: 'stepper' | 'number' | 'toggle' | 'select';
    min?: number;
    max?: number;
    default?: number | boolean;
    description?: string;
    options?: string[];    // solo para type: 'select'
  }>;

  // ctx.round es 1-indexed. Para end_of_game siempre será 1.
  score(values: Record<string, number | boolean>, ctx: { round: number; total_rounds?: number }): number;

  // Opcional: devuelve un string de error, o null si es válido
  validate?(values: Record<string, number | boolean>): string | null;
}
```

---

## Ejemplo simple — Catan

```typescript
import type { GameModule } from '../lib/types';

export default {
  metadata: {
    id: 'catan',
    name: 'Catan',
    min_players: 3,
    max_players: 4,
    scoring_mode: 'end_of_game',
    target_score: 10,
    tiebreaker_hint: 'Oficialmente se comparte la victoria. House rule: gana quien más caminos construyó.',
    tags: ['estrategia', 'familia', 'intercambio'],
    bgg_id: 13,
  },

  inputs: [
    { id: 'settlements',  label: 'Asentamientos',      type: 'stepper', min: 0, max: 5,  description: '1 VP cada uno' },
    { id: 'cities',       label: 'Ciudades',            type: 'stepper', min: 0, max: 4,  description: '2 VP cada una' },
    { id: 'longest_road', label: 'Camino más largo',    type: 'toggle',  description: '+2 VP. Solo un jugador puede tenerlo.' },
    { id: 'largest_army', label: 'Ejército más grande', type: 'toggle',  description: '+2 VP. Solo un jugador puede tenerlo.' },
    { id: 'vp_cards',     label: 'Cartas VP',           type: 'stepper', min: 0, max: 5,  description: '1 VP cada una' },
  ],

  score({ settlements, cities, longest_road, largest_army, vp_cards }) {
    return (
      (settlements as number) * 1 +
      (cities as number) * 2 +
      (longest_road ? 2 : 0) +
      (largest_army ? 2 : 0) +
      (vp_cards as number) * 1
    );
  },
} satisfies GameModule;
```

**Por qué cada decisión:**
- `settlements` y `cities` son `stepper` porque el usuario ingresa una cantidad que se multiplica
- `longest_road` y `largest_army` son `toggle` porque solo tenés o no tenés la carta
- No hay `total_rounds` porque el juego termina cuando alguien llega a 10 VP (`target_score`)

---

## Ejemplo complejo — Skull King (per_round con lógica condicional)

```typescript
import type { GameModule } from '../lib/types';

export default {
  metadata: {
    id: 'skull-king',
    name: 'Skull King',
    min_players: 2,
    max_players: 6,
    scoring_mode: 'per_round',
    total_rounds: 10,
    tiebreaker_hint: 'Gana quien tenga mayor puntaje en la última ronda.',
    tags: ['cartas', 'apuestas', 'familia', 'piratas'],
    bgg_id: 180891,
  },

  inputs: [
    { id: 'bid',        label: 'Basas apostadas',      type: 'stepper', min: 0 },
    { id: 'won',        label: 'Basas ganadas',        type: 'stepper', min: 0 },
    { id: 'skull_king', label: 'Skull King capturado', type: 'toggle',  description: '+30 pts' },
    { id: 'mermaids',   label: 'Sirenas capturadas',   type: 'stepper', min: 0, max: 2, description: '+20 c/u' },
    { id: 'pirates',    label: 'Piratas capturados',   type: 'stepper', min: 0, max: 5, description: '+30 c/u' },
  ],

  score({ bid, won, skull_king, mermaids, pirates }, { round }) {
    const b = bid as number;
    const w = won as number;

    if (b === 0) return w === 0 ? round * 10 : -(round * 10);

    if (b === w) {
      const bonus = (skull_king ? 30 : 0) + (mermaids as number) * 20 + (pirates as number) * 30;
      return b * 20 + bonus;
    }

    return -(Math.abs(b - w) * 10);
  },

  validate({ bid, won }) {
    if ((bid as number) < 0 || (won as number) < 0) return 'Los valores no pueden ser negativos.';
    return null;
  },
} satisfies GameModule;
```

---

## Edge cases

**Puntos negativos:** `score()` puede devolver números negativos. Se muestran en rojo en la tabla de puntajes.

**target_score — partida que termina sola:** Si definís `target_score`, la app verifica automáticamente después de cada ronda (en `per_round`) o al calcular el total final (en `end_of_game`). Cuando al menos un jugador llega o supera el objetivo, la sesión se cierra y se navega al resumen. Ejemplos reales: UNO (`target_score: 500`) y Splendor (`target_score: 15`).

**Sin target_score:** Juegos que terminan por evento (se acaban las cartas, se completan X rondas): omitir `target_score`. Para `per_round` usar `total_rounds`; para `end_of_game` el usuario presiona "Terminar" manualmente.

**Lógica que depende de otros jugadores:** `score()` solo recibe los valores del jugador actual. Si el scoring depende de lo que hicieron los demás (ej: "mayoría de algo"), modelarlo como `toggle` — el usuario decide quién tiene la mayoría y le activa el toggle.

**`stepper` vs `number`:** Usá `stepper` cuando el usuario ingresa una cantidad de piezas/cartas y la app multiplica. Usá `number` cuando el usuario ingresa directamente un subtotal ya calculado.

**`validate()`:** Opcional. Recomendado para restricciones cruzadas entre inputs. Devuelve un string de error visible al usuario, o `null` si todo está bien. Se llama antes de avanzar al siguiente jugador.

---

## Convención de nombres de archivo

- Nombre: `{game-id}.ts`
- `game-id` debe coincidir exactamente con el campo `metadata.id`
- Solo letras minúsculas, números y guiones
- Ejemplos: `catan.ts`, `ticket-to-ride.ts`, `pandemic-legacy-s1.ts`

---

## Cómo testear tu módulo

1. Copiar el archivo `.ts` a `src/games/`
2. Correr `npm run build` — TypeScript valida el módulo en el build
3. Correr `npm run dev` → Librería → instalar el juego → crear sesión
4. Ingresar valores borde (0, máximos) y verificar que `score()` calcula correctamente
5. Si el juego tiene `target_score`, verificar que la sesión termina sola al alcanzarlo
6. Verificar el tooltip de cada campo (`description`)

---

## Módulos incluidos

| Archivo | Juego | Modo | Rondas | target |
|---------|-------|------|--------|--------|
| `catan.ts` | Catan | end_of_game | — | 10 VP |
| `skull-king.ts` | Skull King | per_round | 10 | — |
| `ticket-to-ride.ts` | Ticket to Ride | end_of_game | — | — |
| `splendor.ts` | Splendor | end_of_game | — | 15 pts |
| `uno.ts` | UNO | per_round | open | 500 pts |
