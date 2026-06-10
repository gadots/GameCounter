# GameCounter

App web para contar puntos de juegos de mesa. Funciona offline, sin backend — todo se guarda en `localStorage`. Cada juego es un módulo TypeScript independiente; la app es el cascarón que orquesta jugadores, sesiones e historial.

**Demo:** https://game-counter-nine.vercel.app

---

## Funcionalidades

- **Librería de juegos** — catálogo de módulos instalables; cada juego define sus propios inputs y lógica de puntaje
- **Sesiones** — registro ronda a ronda (o al final de la partida); soporta deshacer la última ronda
- **Jugadores** — perfiles con nombre, color y emoji; estadísticas de winrate y racha
- **Historial** — todas las partidas terminadas, filtrables por jugador/juego; resumen por ronda
- **Revancha** — desde el resumen final, pre-carga el mismo juego y jugadores con un clic
- **Favoritos** — marcar juegos frecuentes para que aparezcan primero en la librería
- **Tema** — claro, oscuro o sistema; persiste en `localStorage`
- **Target score** — juegos como UNO o Splendor terminan solos cuando alguien alcanza el puntaje objetivo

---

## Stack

| Capa | Tecnología |
|------|-----------|
| UI | React 19 + Vite 8 |
| Estilos | Tailwind CSS v4 (class-based dark mode) |
| Routing | React Router v7 |
| Storage | `localStorage` (sin backend) |
| Tipos | TypeScript 6 |
| Tests | Vitest + Testing Library |
| Deploy | Vercel |

---

## Desarrollo local

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # 79 tests, ~5s
npm run build      # build de producción en /dist
```

---

## Arquitectura

```
src/
├── games/                 # Módulos de juego (auto-detectados)
│   ├── TEMPLATE_GUIDE.md  # Guía para crear nuevos módulos
│   ├── catan.ts
│   ├── skull-king.ts
│   ├── ticket-to-ride.ts
│   ├── splendor.ts
│   └── uno.ts
│
├── lib/
│   ├── types.ts           # Contratos TypeScript centrales (GameModule, Session, Player…)
│   ├── storage.ts         # CRUD tipado para localStorage (playersStorage, sessionsStorage…)
│   ├── sessionEngine.ts   # Lógica pura: computePlayerTotals, withWinners, resolvePlayerName…
│   ├── gameLoader.ts      # import.meta.glob → carga todos los módulos de /games/
│   └── theme.ts           # applyTheme() — aplica clase .dark al <html>
│
├── hooks/
│   ├── useSession.ts       # createSession, submitRound, endSession, undoLastRound
│   ├── usePlayers.ts       # addPlayer, updatePlayer, removePlayer
│   └── useInstalledGames.ts # install, uninstall, toggleFavorite
│
├── components/
│   ├── ui/                 # Button, Card, Modal, InputRenderer, ErrorBoundary
│   └── layout/             # BottomNav
│
└── pages/
    ├── LibraryPage.tsx
    ├── NewSessionPage.tsx
    ├── SessionPage.tsx
    ├── SessionSummaryPage.tsx
    ├── PlayersPage.tsx
    ├── PlayerDetailPage.tsx
    ├── HistoryPage.tsx
    └── SettingsPage.tsx
```

### Principio de diseño

**La app no conoce las reglas de ningún juego.** Cada módulo define:
1. `metadata` — nombre, jugadores, modo de puntaje, etc.
2. `inputs` — lista declarativa de campos (la app renderiza)
3. `score(values, ctx)` — función pura que devuelve un número

La app itera sobre los jugadores, recoge los `inputs` de cada uno, llama `score()` y acumula. Esto permite agregar cualquier juego sin tocar el código de la app.

### Rutas

| Ruta | Página |
|------|--------|
| `/` | → `/library` |
| `/library` | Catálogo e instalación de juegos |
| `/session/new` | Elegir juego + jugadores; soporta `?game=id&players=id1,id2` para revancha |
| `/session/:id` | Partida activa — score ronda a ronda |
| `/players` | Gestión de perfiles |
| `/players/:id` | Detalle del jugador (stats + edición) |
| `/history` | Historial filtrable; soporta `?player=id` |
| `/history/:id` | Resumen read-only de partida |
| `/settings` | Tema + preferencias |

### `localStorage` keys

| Key | Tipo |
|-----|------|
| `gc_players` | `Player[]` |
| `gc_sessions` | `Session[]` |
| `gc_installed_games` | `InstalledGame[]` |
| `gc_settings` | `AppSettings` |

---

## Agregar un juego nuevo

Ver [src/games/TEMPLATE_GUIDE.md](src/games/TEMPLATE_GUIDE.md) para la guía completa.

En resumen: crear `src/games/mi-juego.ts` siguiendo el contrato `GameModule`. Vite lo detecta automáticamente mediante `import.meta.glob` — no hay que registrar nada más.

```bash
npm run build   # verificar que no hay errores TypeScript
npm run dev     # probar en la app
```

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
npm test              # una pasada
npm run test:watch    # modo watch
npm run test:coverage # reporte de cobertura
```

Los tests cubren `sessionEngine` (cómputo de puntajes, desempate, resolución de nombres, rachas), `storage` y los módulos de juego individuales (Skull King, Catan).
