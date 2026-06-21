# GameCounter — Claude Code Instructions

## Proyecto
App web PWA para contar puntos de juegos de mesa. Stack: React 19 + Vite + TypeScript + Tailwind CSS v4. Deploy en Vercel. Demo: https://game-counter-nine.vercel.app

## Rama de trabajo
Desarrollar siempre en `claude/board-game-scorer-design-ScVoF`. Nunca pushear directo a `main`.

## Git workflow (automático)
Después de commitear cambios en el feature branch:
1. Push al feature branch: `git push -u origin claude/board-game-scorer-design-ScVoF`
2. Crear PR con `mcp__github__create_pull_request` (si no existe ya uno abierto para la rama)
3. Push directo a main: `git push origin claude/board-game-scorer-design-ScVoF:main`
   → GitHub detecta que los commits del PR ya están en main y lo cierra como "merged" automáticamente
4. Sincronizar local: `git fetch origin main && git reset --hard origin/main`

⚠️ **NUNCA usar** `mcp__github__merge_pull_request` — GitHub crea el commit de merge con committer `noreply@github.com`, lo que dispara el stop hook. El paso 3 (push directo `feature:main`) cierra el PR automáticamente sin crear ningún commit nuevo.
Si ya existe un PR abierto para la rama, omitir el paso 2.

## Convenciones de commits
- Usar prefijos: `feat:`, `fix:`, `chore:`, `docs:`
- Mensajes en español o inglés, concisos
- Siempre incluir el link de sesión al final del mensaje

---

## Arquitectura clave

- **Módulos de juego**: `src/games/*.ts` — nunca tocar la app para agregar juegos. Vite los detecta via `import.meta.glob`.
- **Juegos propios**: `CustomGameDef[]` en `localStorage` → convertidos a `GameModule` en runtime por `gameLoader.ts`.
- **Contrato central**: `src/lib/types.ts` — cambios ahí afectan toda la app.
- **Storage reactivo**: `src/lib/storage.ts` — patrón `useSyncExternalStore`. Nada de Context API ni Redux.
- **Inputs declarativos**: `src/components/ui/InputRenderer.tsx` — nunca escribir UI de inputs en los módulos de juego.

## Al agregar un juego nuevo
Seguir `src/games/TEMPLATE_GUIDE.md`. Verificar con `npm run build` antes de commitear.

---

## Sistema de diseño

### Paleta de colores (Tailwind v4)

| Rol | Light | Dark |
|-----|-------|------|
| Fondo de página | `bg-white` | `bg-gray-900` |
| Superficies (cards) | `bg-white` | `bg-gray-800` |
| Superficies elevadas | `bg-gray-50` | `bg-gray-700/60` |
| Borde | `border-gray-200` | `border-gray-700` |
| Texto primario | `text-gray-900` | `text-white` |
| Texto secundario | `text-gray-600` | `text-gray-300` |
| Texto muted | `text-gray-400` | `text-gray-500` |
| **Acento primario** | `indigo-600` | `indigo-400` |
| Peligro | `red-600` | — |
| Juegos propios | `violet-600 / violet-100` | `violet-300 / violet-900/50` |

El dark mode se activa con la clase `.dark` en `<html>`. Siempre usar pares `text-X dark:text-Y` y `bg-X dark:bg-Y`.

### Tipografía y espaciado

- **Fuente**: sistema (sans-serif por defecto de Tailwind)
- **Títulos de página**: `text-xl font-bold text-gray-900 dark:text-white`
- **Sección**: `text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide`
- **Cuerpo**: `text-sm text-gray-600 dark:text-gray-300`
- **Padding de página**: `p-4` en el contenedor raíz de cada página
- **Gap entre secciones**: `space-y-4` o `space-y-6`
- **Padding inferior**: `pb-24` para dejar espacio al BottomNav fijo

### Radio de bordes

- **Cards y contenedores**: `rounded-xl` (12px)
- **Botones**: `rounded-xl` para acciones principales, `rounded-full` para chips/tabs de filtro
- **Inputs**: `rounded-xl`
- **Badges**: `rounded-full`
- Evitar `rounded-lg` (8px) excepto en `Button.tsx` donde ya está establecido

### Sombras

- Cards: `shadow-sm` — sutil, no prominente
- Modales y overlays: sin shadow extra (el backdrop oscuro da jerarquía)

---

## Componentes UI

### `Button.tsx`
```
variants: primary (indigo-600) | secondary (gray-100/700) | ghost | danger (red-600)
sizes:    sm (px-3 py-1.5 text-sm) | md (px-4 py-2 text-sm) | lg (px-5 py-3 text-base)
```

### `Card.tsx`
```
bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4
```
Prop `padding={false}` para contenido que gestiona su propio padding.

### `Modal.tsx`
- `role="dialog"` + `aria-modal="true"` + `aria-label={title}`
- Focus-trap: Tab/Shift+Tab ciclan dentro del panel; Escape cierra; foco se restaura al elemento previo
- Backdrop: `fixed inset-0 bg-black/50` — clic en backdrop llama `onCancel`
- Panel: `bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6` centrado en pantalla
- Props: `open`, `title`, `description?`, `confirmLabel?`, `cancelLabel?`, `confirmVariant?`, `children?`

### `PageHeader.tsx`
- Logo (en páginas raíz) o `ChevronLeft` (en páginas de detalle) + título + botón ⚙️ opcional
- `backPath?: string` — si se provee, muestra flecha de volver en lugar del logo
- `showSettings?: boolean` — default `true`; algunas páginas lo ocultan y agregan sus propios controles en el header

### `BottomNav.tsx`
- Fijo en la parte inferior, 4 tabs: Librería / Jugar / Jugadores / Historial
- Acento activo: `text-indigo-600 dark:text-indigo-400`; icono activo más grueso (`strokeWidth={2.5}`)
- Badge naranja en "Jugar" cuando hay sesión activa
- `paddingBottom: env(safe-area-inset-bottom)` para notch de iPhone

### `InputRenderer.tsx`
Renderiza `InputDef[]` en cuatro variantes:
- **Toggle**: `role="switch"` + `aria-checked` + `aria-label={label}` — estilo botón píldora on/off
- **Stepper**: botones `−`/`+` con `aria-label="Restar X"/"Sumar X"`, valor central con `aria-live="polite"`
- **NumberField**: `<input type="number">` con `aria-label`
- **SelectField**: `<select>` nativo con `aria-label`

---

## Layout de páginas

### Páginas con BottomNav (flujo principal)
Estructura estándar:
```tsx
<div className="p-4 space-y-4 pb-24">
  <PageHeader title="..." />
  {/* contenido */}
</div>
```

### Páginas con header custom (LibraryPage, PlayersPage)
Algunas páginas reemplazan el `PageHeader` con un flex manual para incluir botones adicionales:
```tsx
<div className="flex items-center gap-2">
  <PageHeader title="..." showSettings={false} />
  <button aria-label="Acción">...</button>
  <button aria-label="Ajustes">...</button>
</div>
```

### Páginas de detalle (con back)
```tsx
<PageHeader title="Nombre" backPath="/players" />
```

### SharePage
Sin `BottomNav`. Layout standalone con header propio.

---

## Patrones de UI recurrentes

### Tabs / segmented control (dentro de página)
```tsx
{(['list', 'metrics'] as const).map(t => (
  <button key={t} onClick={() => setTab(t)}
    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
      tab === t ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
    }`}>
    {label}
  </button>
))}
```

### Chips de filtro/orden
```tsx
className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
  active ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300'
}`}
```

### Empty states
```tsx
<p className="text-center text-gray-400 py-12">No hay jugadores todavía.</p>
```

### Badge de juego propio (LibraryPage)
```tsx
<span className="inline-flex items-center gap-0.5 text-xs bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 rounded-full px-2 py-0.5 font-semibold border border-violet-200 dark:border-violet-700/50">
  <Pencil size={10} strokeWidth={2.5} /> propio
</span>
```

### Botones-ícono en header
```tsx
<button
  onClick={...}
  aria-label="Descripción"
  className="p-2 -mr-2 rounded-xl text-gray-400 dark:text-gray-500 active:bg-gray-100 dark:active:bg-gray-800 transition-colors shrink-0"
>
  <IconComponent size={20} />
</button>
```

### Input de búsqueda
```tsx
<input type="search" aria-label="Buscar..."
  className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-4 py-2.5 text-sm" />
```

---

## Accesibilidad

La app tiene implementadas las siguientes mejoras WCAG:

- **Modal**: focus-trap (Tab/Shift+Tab), Escape cierra, foco previo se restaura al cerrar
- **Toggles** (`InputRenderer`): `role="switch"`, `aria-checked`, `aria-label={label}`
- **Steppers** (`InputRenderer`): `role="group"` en contenedor, `aria-label="Restar/Sumar {label}"` en botones, `aria-live="polite"` en valor
- **NumberField / SelectField**: `aria-label={label}`
- **Botones de jugador en SessionPage**: `aria-label="Seleccionar a {nombre}"`, `aria-pressed`
- **Pickers en PlayerDetailPage**: `aria-label="Color N"` / `aria-label="Avatar {emoji}"`, `aria-pressed`
- **Input de agregar jugador** (PlayersPage): `aria-label="Nombre del jugador"`

Regla general: cualquier `<button>` cuyo contenido visible es solo un ícono/emoji/color necesita `aria-label`.

---

## Iconos

Usando **lucide-react**. Tamaños estándar:
- Iconos de header: `size={20}`
- Iconos en botones de texto: `size={15}` o `size={16}`
- Iconos de BottomNav: `size={22}`
- Iconos decorativos pequeños en badges: `size={10}`–`size={12}`

---

## Verificación antes de commitear

```bash
npm run build      # sin errores TypeScript
npm test -- --run  # 488 tests verdes
```
