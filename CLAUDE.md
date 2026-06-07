# GameCounter — Claude Code Instructions

## Proyecto
App web para contar puntos de juegos de mesa. Stack: React + Vite + TypeScript + Tailwind CSS v4. Deploy en Vercel.

## Rama de trabajo
Desarrollar siempre en `claude/board-game-scorer-design-ScVoF`. Nunca pushear directo a `main`.

## Git workflow (automático)
Después de cada push de cambios:
1. Crear un PR hacia `main` usando `mcp__github__create_pull_request`
2. Mergear el PR con **squash** usando `mcp__github__merge_pull_request` con `merge_method: "squash"` — esto genera un único commit en main con autoría correcta, sin merge commits de GitHub
3. Hacer `git pull origin main` para sincronizar la rama local con main

## Convenciones de commits
- Usar prefijos: `feat:`, `fix:`, `chore:`, `docs:`
- Mensajes en español o inglés, concisos
- Siempre incluir el link de sesión al final del mensaje

## Arquitectura clave
- Los juegos son módulos TypeScript en `src/games/*.ts` — nunca tocar la app para agregar juegos
- `src/lib/types.ts` es el contrato central — cambios ahí afectan todo
- `src/lib/storage.ts` para toda interacción con localStorage
- Los inputs de cada juego se renderizan via `InputRenderer` — no escribir UI en los módulos

## Al agregar un juego nuevo
Seguir el `src/games/TEMPLATE_GUIDE.md`. Siempre verificar con `npm run build` antes de commitear.
