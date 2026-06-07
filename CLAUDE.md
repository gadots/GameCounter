# GameCounter — Claude Code Instructions

## Proyecto
App web para contar puntos de juegos de mesa. Stack: React + Vite + TypeScript + Tailwind CSS v4. Deploy en Vercel.

## Rama de trabajo
Desarrollar siempre en `claude/board-game-scorer-design-ScVoF`. Nunca pushear directo a `main`.

## Git workflow (automático)
Después de commitear cambios en el feature branch:
1. Push al feature branch: `git push origin claude/board-game-scorer-design-ScVoF`
2. Push directo a main (fast-forward, sin pasar por GitHub merge): `git push origin claude/board-game-scorer-design-ScVoF:main`
3. Sincronizar local: `git fetch origin && git reset --hard origin/main`

Esto evita los merge commits de GitHub que tienen committer incorrecto (`noreply@github.com`).
**No usar** `mcp__github__merge_pull_request` — genera commits con committer de GitHub.

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
