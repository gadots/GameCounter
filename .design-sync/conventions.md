# GameCounter design system

A React 19 + Tailwind CSS v4 component set for a mobile-first PWA that keeps score
for board games. Components are plain functions on `window.GameCounter.*`; style is
Tailwind utility classes compiled into the shipped `styles.css`.

## Wrapping & setup

- **Router.** `PageHeader` and `BottomNav` read react-router context (`useNavigate`,
  `NavLink`). Wrap any tree that uses them in a router — `<MemoryRouter>` for a static
  design, `<BrowserRouter>` in a real app. The other components (`Button`, `Card`,
  `Modal`, `Logo`, `InputRenderer`) need no provider.
- **Language / settings** come from a `localStorage`-backed store, not a React
  context — there is nothing to wrap. Text defaults to Spanish (`es`); `en` and `pt`
  exist. UI copy in this app is Spanish.
- **Dark mode** is class-based: add `class="dark"` to `<html>`. Every component ships
  paired `text-X dark:text-Y` / `bg-X dark:bg-Y` classes, so both themes just work.
- **Mobile-first.** Layouts assume a phone-width column. `BottomNav` is
  `position: fixed` at the bottom; `Modal` is a full-screen overlay that docks to the
  bottom as a sheet under the `sm` breakpoint.

## Styling idiom — Tailwind v4 utilities

Style with utility classes (there is no separate props-based theming). Use this
vocabulary so new markup matches the components:

| Role | Light | Dark |
|------|-------|------|
| Accent (primary) | `bg-indigo-600` `text-indigo-600` | `dark:text-indigo-400` |
| Page background | `bg-white` | `dark:bg-gray-900` |
| Surface / card | `bg-white` | `dark:bg-gray-800` |
| Elevated surface | `bg-gray-50` | `dark:bg-gray-700` |
| Border | `border-gray-200` | `dark:border-gray-700` |
| Text primary | `text-gray-900` | `dark:text-white` |
| Text secondary | `text-gray-600` | `dark:text-gray-300` |
| Text muted | `text-gray-400` | `dark:text-gray-500` |
| Danger | `bg-red-600` `text-red-600` | — |
| Custom-game accent | `bg-violet-100 text-violet-700` | `dark:bg-violet-900/50 dark:text-violet-300` |

- **Radius:** `rounded-xl` for cards, inputs and primary actions; `rounded-full` for
  chips, badges and toggle pills; `rounded-lg` inside `Button`.
- **Shadow:** `shadow-sm` on cards; overlays rely on the dark backdrop, no extra shadow.
- **Numbers:** score values use the `score-num` class (tabular figures).

## Component API quick reference

- `Button` — `variant`: `primary | secondary | ghost | danger`; `size`: `sm | md | lg`;
  passes through native button props (`disabled`, `onClick`, `className="w-full"`, …).
- `Card` — `padding` (default `true`; `false` when the child manages its own padding).
- `Modal` — controlled: `open`, `title`, `description?`, `confirmLabel?`, `cancelLabel?`,
  `confirmVariant?` (`primary | danger`), `onConfirm`, `onCancel`, `children?`.
- `InputRenderer` — declarative form driver: `inputs: InputDef[]` (each `{id, label,
  type: 'stepper'|'number'|'toggle'|'select', min?, max?, options?, description?}`),
  controlled `values` + `onChange(id, value)`. Never hand-build input UI — feed it defs.
- `PageHeader` — `title`, `showBack?`, `showSettings?`.
- `BottomNav` — no props; fixed 4-tab bar (Librería / Jugar / Jugadores / Historial).
- `Logo` — `size?` (px, default 30).

## Where the truth lives

Read `styles.css` (and its `@import` of `_ds_bundle.css` + `tokens/`) for the compiled
styles and CSS custom properties. Each component has a `<Name>.d.ts` (props contract)
and `<Name>.prompt.md` (usage with real examples) under `components/<group>/<Name>/`.

## Idiomatic snippet

```jsx
// A round-entry screen: header, a Card wrapping declarative inputs, a primary action.
<MemoryRouter>
  <div className="p-4 space-y-4 bg-white dark:bg-gray-900 min-h-screen">
    <PageHeader title="Skull King" showBack />
    <Card>
      <InputRenderer
        inputs={[
          { id: 'bid', label: 'Basas apostadas', type: 'stepper', min: 0 },
          { id: 'won', label: 'Basas ganadas', type: 'stepper', min: 0 },
        ]}
        values={{ bid: 2, won: 3 }}
        onChange={(id, v) => {}}
      />
    </Card>
    <Button variant="primary" className="w-full">Registrar ronda</Button>
  </div>
</MemoryRouter>
```
