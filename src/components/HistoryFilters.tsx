import type { ChangeEvent } from 'react';
import type { Player } from '../lib/types';

export type SortOrder = 'desc' | 'asc';

export interface FilterState {
  player: string;
  game: string;
  sort: SortOrder;
}

interface Props {
  players: Player[];
  gameNames: string[];
  value: FilterState;
  onChange: (next: FilterState) => void;
}

const selectClass =
  'w-full min-h-[44px] rounded-xl border border-gray-300 dark:border-gray-600 ' +
  'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-3 py-2 text-sm';

export function HistoryFilters({ players, gameNames, value, onChange }: Props) {
  const set = (key: keyof FilterState) => (e: ChangeEvent<HTMLSelectElement>) =>
    onChange({ ...value, [key]: e.target.value });

  const hasActiveFilters = value.player !== '' || value.game !== '';

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <select value={value.player} onChange={set('player')} className={selectClass}>
          <option value="">Todos los jugadores</option>
          {players.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select value={value.game} onChange={set('game')} className={selectClass}>
          <option value="">Todos los juegos</option>
          {gameNames.map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3">
        <select value={value.sort} onChange={set('sort')} className={`${selectClass} flex-1`}>
          <option value="desc">Más recientes primero</option>
          <option value="asc">Más antiguas primero</option>
        </select>

        {hasActiveFilters && (
          <button
            onClick={() => onChange({ ...value, player: '', game: '' })}
            className="shrink-0 text-sm text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            Limpiar
          </button>
        )}
      </div>
    </div>
  );
}
