# GameCounter

App web PWA para contar puntos de juegos de mesa. Funciona offline, sin backend — todo se guarda en `localStorage`. Cada juego es un módulo TypeScript independiente; la app es el cascarón que orquesta jugadores, sesiones e historial.

**Demo:** https://game-counter-nine.vercel.app

---

## Funcionalidades

- **Librería de juegos** — 35 juegos incluidos; instalables/desinstalables individualmente; favoritos al tope
- **Juegos propios** — editor visual para crear juegos con reglas de puntaje personalizadas (sumas ponderadas)
- **Sesiones** — registro ronda a ronda o al final de la partida; deshacer última ronda; target score automático
- **Jugadores** — perfiles con nombre, color y emoji; búsqueda y orden (A–Z / recientes / más partidas)
- **Métricas** — ELO por jugador (pairwise, K=32), winrate, rachas, historial ELO por partida
- **Historial** — todas las partidas terminadas, filtrables por jugador/juego; resumen por ronda con desglose
- **Revancha** — desde el resumen final, pre-carga el mismo juego y jugadores con un clic
- **Favoritos** — marcar juegos frecuentes para que aparezcan primero en la librería
- **Compartir** — genera un link de solo-lectura de la partida vía Supabase (opcional, por env vars)
- **Backup** — exportar/importar JSON con selección granular: jugadores, partidas, mis juegos, preferencias
- **Tema** — claro, oscuro o sistema; persiste en `localStorage`
- **PWA** — instalable como app nativa; funciona offline; service worker con Workbox

---

## Stack

| Capa | Tecnología |
|------|-----------|
| UI | React 19 + Vite 8 |
| Estilos | Tailwind CSS v4 (class-based dark mode) |
| Routing | React Router v7 |
| Storage | `localStorage` (sin backend) |
| Tipos | TypeScript 6 |
| Tests | Vitest + Testing Library (488 tests) |
| PWA | vite-plugin-pwa + Workbox |
| Sharing | Supabase (opcional, via env vars) |
| Deploy | Vercel |

---

## Desarrollo local

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # 488 tests, ~17s
npm run build      # build de producción en /dist
```

Variables de entorno opcionales (para la función de compartir):

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Sin ellas la app funciona completa, solo sin sharing.

---

## Arquitectura

```
src/
├── games/                         # Módulos de juego (auto-detectados, 35 juegos)
│   ├── TEMPLATE_GUIDE.md          # Guía para crear nuevos módulos
│   ├── agricola.ts
│   ├── azul.ts
│   ├── brass-birmingham.ts
│   ├── carcassonne.ts
│   ├── catan.ts
│   ├── codenames.ts
│   ├── coup.ts
│   ├── dominion.ts
│   ├── everdell.ts
│   ├── exploding-kittens.ts
│   ├── generala.ts
│   ├── hanabi.ts
│   ├── king-of-tokyo.ts
│   ├── kingdomino.ts
│   ├── love-letter.ts
│   ├── pandemic.ts
│   ├── patchwork.ts
│   ├── puerto-rico.ts
│   ├── root.ts
│   ├── sagrada.ts
│   ├── scrabble.ts
│   ├── seven-wonders.ts
│   ├── seven-wonders-duel.ts
│   ├── skull-king.ts
│   ├── skull.ts
│   ├── small-world.ts
│   ├── splendor.ts
│   ├── sushi-go.ts
│   ├── takenoko.ts
│   ├── terraforming-mars.ts
│   ├── the-crew.ts
│   ├── ticket-to-ride.ts
│   ├── uno.ts
│   ├── viticulture.ts
│   └── wingspan.ts
│
├── lib/
│   ├── types.ts           # Contratos TypeScript centrales (GameModule, Session, Player, CustomGameDef…)
│   ├── storage.ts         # CRUD tipado con useSyncExternalStore (playersStorage, sessionsStorage…)
│   ├── sessionEngine.ts   # Lógica pura: computePlayerTotals, ELO, rachas, head-to-head, records
│   ├── gameLoader.ts      # import.meta.glob → carga módulos estáticos + customGames dinámicos
│   ├── backup.ts          # BackupData: serialización/validación para export/import JSON
│   ├── sharing.ts         # startSharing / syncSession vía Supabase
│   ├── supabase.ts        # Cliente Supabase (null si no hay env vars)
│   └── theme.ts           # applyTheme() — aplica clase .dark al <html>
│
├── hooks/
│   ├── useSession.ts          # createSession, submitRound, endSession, undoLastRound, abandonSession
│   ├── usePlayers.ts          # addPlayer, updatePlayer, removePlayer
│   ├── useInstalledGames.ts   # install, uninstall, toggleFavorite
│   ├── useCustomGames.ts      # CRUD de juegos propios (CustomGameDef[])
│   └── useSettings.ts         # lectura/escritura de AppSettings
│
├── components/
│   ├── ui/
│   │   ├── Button.tsx         # Variantes: primary / secondary / ghost / danger; tamaños: sm / md / lg
│   │   ├── Card.tsx           # Contenedor con sombra, borde y dark mode
│   │   ├── Modal.tsx          # Dialog accesible: focus-trap, Escape, backdrop, restaura foco previo
│   │   ├── InputRenderer.tsx  # Renderiza InputDef[] → Stepper / Toggle / NumberField / SelectField
│   │   ├── Logo.tsx           # Logotipo SVG de la app
│   │   └── ErrorBoundary.tsx  # Captura errores de render y muestra fallback
│   └── layout/
│       ├── BottomNav.tsx      # Navegación inferior fija (Librería / Jugar / Jugadores / Historial)
│       └── PageHeader.tsx     # Header de página: logo/atrás + título + ajustes opcional
│
└── pages/
    ├── LibraryPage.tsx          # Catálogo: instalar/desinstalar, favoritos, badge de juego propio
    ├── CustomGameEditorPage.tsx # Editor visual de juegos propios (crear y editar)
    ├── NewSessionPage.tsx       # Elegir juego + jugadores; soporta ?game=id&players=... para revancha
    ├── SessionPage.tsx          # Partida activa: inputs por ronda, tabs por jugador, deshacer
    ├── SessionSummaryPage.tsx   # Resumen read-only: tabla por ronda, ganadores, revancha
    ├── PlayersPage.tsx          # Lista + búsqueda + orden; métricas ELO/winrate
    ├── PlayerDetailPage.tsx     # Perfil editable + stats detalladas (ELO, historial, head-to-head)
    ├── HistoryPage.tsx          # Historial filtrable por jugador/juego
    ├── SettingsPage.tsx         # Tema + exportar/importar backup
    ├── SharePage.tsx            # Vista pública read-only de partida compartida
    └── HomePage.tsx             # Home (redirige a /library)
```

### Principio de diseño

**La app no conoce las reglas de ningún juego.** Cada módulo define:
1. `metadata` — nombre, jugadores, modo de puntaje, etc.
2. `inputs` — lista declarativa de campos (la app renderiza)
3. `score(values, ctx)` — función pura que devuelve un número

La app itera sobre los jugadores, recoge los `inputs` de cada uno, llama `score()` y acumula. Esto permite agregar cualquier juego sin tocar el código de la app.

Los **juegos propios** (`CustomGameDef`) se almacenan en `localStorage` y se convierten en tiempo de ejecución a `GameModule` mediante `gameLoader.ts`.

### Reactividad del storage

Todo el estado persistente usa `useSyncExternalStore` con un patrón `subscribe/getSnapshot`. Cuando cualquier componente escribe en `localStorage` vía las funciones de `storage.ts`, todos los suscriptores se actualizan automáticamente sin Redux ni Context.

### Rutas

| Ruta | Página |
|------|--------|
| `/` | → `/library` |
| `/library` | Catálogo e instalación de juegos |
| `/games/new` | Crear juego propio |
| `/games/:id/edit` | Editar juego propio existente |
| `/session/new` | Elegir juego + jugadores (`?game=id&players=id1,id2` para revancha) |
| `/session/:id` | Partida activa — score ronda a ronda |
| `/players` | Gestión de perfiles + métricas ELO |
| `/players/:id` | Detalle del jugador (stats + edición) |
| `/history` | Historial filtrable (`?player=id`) |
| `/history/:id` | Resumen read-only de partida |
| `/settings` | Tema + backup import/export |
| `/share/:id` | Vista pública de partida compartida (sin BottomNav) |

### `localStorage` keys

| Key | Tipo | Descripción |
|-----|------|-------------|
| `gc_players` | `Player[]` | Perfiles de jugadores |
| `gc_sessions` | `Session[]` | Todas las sesiones (activas, completadas, abandonadas) |
| `gc_installed_games` | `InstalledGame[]` | Juegos instalados y favoritos |
| `gc_custom_games` | `CustomGameDef[]` | Juegos creados por el usuario |
| `gc_settings` | `AppSettings` | Preferencias (tema, etc.) |

---

## Agregar un juego nuevo

Ver [src/games/TEMPLATE_GUIDE.md](src/games/TEMPLATE_GUIDE.md) para la guía completa.

En resumen: crear `src/games/mi-juego.ts` siguiendo el contrato `GameModule`. Vite lo detecta automáticamente mediante `import.meta.glob` — no hay que registrar nada más.

```bash
npm run build   # verificar que no hay errores TypeScript
npm run dev     # probar en la app
```

Alternativamente, usar el editor visual en `/games/new` para crear un juego sin código.

---

## Deploy

El proyecto se deploya automáticamente en Vercel en cada push a `main`.

Para deploy manual:

```bash
npm run build
# subir /dist a cualquier hosting estático
```

---

## Tests

```bash
npm test              # una pasada (488 tests)
npm run test:watch    # modo watch
npm run test:coverage # reporte de cobertura
```

Los tests cubren: `sessionEngine` (cómputo de puntajes, ELO, rachas, head-to-head, records), `storage`, módulos de juego individuales (Skull King, Catan), `Modal` (focus-trap, Escape, backdrop, restauración de foco), `InputRenderer` (aria-labels, roles, interacción), y páginas principales (PlayersPage).
