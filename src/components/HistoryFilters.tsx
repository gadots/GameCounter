import type { ReactNode } from 'react';
import type { Player } from '../lib/types';
import { useTranslation } from '../hooks/useTranslation';

export type SortOrder = 'desc' | 'asc';
export type Period = '' | 'week' | 'month' | 'year';

export interface FilterState {
  player: string;
  game: string;
  sort: SortOrder;
  period: Period;
}

interface Props {
  players: Player[];
  gameNames: string[];
  value: FilterState;
  onChange: (next: FilterState) => void;
}

interface ChipProps {
  label: string;
  activeLabel: string;
  value: string;
  onChange: (val: string) => void;
  onClear: () => void;
  children: ReactNode;
}

function FilterChip({ label, activeLabel, value, onChange, onClear, children }: ChipProps) {
  const active = value !== '';
  return (
    <div className="relative shrink-0">
      <div
        className={
          active
            ? 'flex items-center gap-1 pl-3 pr-2 py-1.5 rounded-full text-sm font-medium bg-indigo-600 text-white'
            : 'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
        }
      >
        <span className="whitespace-nowrap">{active ? activeLabel : label}</span>
        {active ? (
          <button
            onClick={onClear}
            className="flex items-center justify-center w-4 h-4 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs leading-none transition-colors"
          >
            ✕
          </button>
        ) : (
          <span className="text-gray-400 dark:text-gray-500 text-xs">▾</span>
        )}
      </div>

      {/* Invisible native select — only when inactive to avoid blocking the ✕ button */}
      {!active && (
        <select
          value=""
          onChange={e => e.target.value && onChange(e.target.value)}
          className="absolute inset-0 opacity-0 w-full cursor-pointer"
        >
          <option value="">—</option>
          {children}
        </select>
      )}
    </div>
  );
}

export function HistoryFilters({ players, gameNames, value, onChange }: Props) {
  const { t } = useTranslation();
  const playerLabel = players.find(p => p.id === value.player)?.name ?? '';

  const toggleSort = () =>
    onChange({ ...value, sort: value.sort === 'desc' ? 'asc' : 'desc' });

  const periodLabels: Record<string, string> = {
    week: t('history.periodWeekShort'),
    month: t('history.periodMonth'),
    year: t('history.periodYear'),
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-2 overflow-x-auto flex-1">
        <FilterChip
          label={t('history.filterGame')}
          activeLabel={value.game}
          value={value.game}
          onChange={game => onChange({ ...value, game })}
          onClear={() => onChange({ ...value, game: '' })}
        >
          {gameNames.map(g => <option key={g} value={g}>{g}</option>)}
        </FilterChip>

        <FilterChip
          label={t('history.filterPlayer')}
          activeLabel={playerLabel}
          value={value.player}
          onChange={player => onChange({ ...value, player })}
          onClear={() => onChange({ ...value, player: '' })}
        >
          {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </FilterChip>

        <FilterChip
          label={t('history.filterDate')}
          activeLabel={periodLabels[value.period] ?? ''}
          value={value.period}
          onChange={period => onChange({ ...value, period: period as Period })}
          onClear={() => onChange({ ...value, period: '' })}
        >
          <option value="week">{t('history.periodWeek')}</option>
          <option value="month">{t('history.periodMonth')}</option>
          <option value="year">{t('history.periodYear')}</option>
        </FilterChip>
      </div>

      <button
        onClick={toggleSort}
        title={value.sort === 'desc' ? t('history.sortDescTitle') : t('history.sortAscTitle')}
        className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-base font-semibold transition-colors ${
          value.sort === 'asc'
            ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
        }`}
      >
        {value.sort === 'desc' ? '↓' : '↑'}
      </button>
    </div>
  );
}
