import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGameModules } from '../lib/gameLoader';
import { useInstalledGames } from '../hooks/useInstalledGames';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function LibraryPage() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'all' | 'installed'>('all');
  const { installed, install, uninstall, isInstalled } = useInstalledGames();
  const navigate = useNavigate();

  const allModules = getGameModules();
  const filtered = allModules.filter(m => {
    const matchesSearch = m.metadata.name.toLowerCase().includes(search.toLowerCase());
    const matchesTab = tab === 'all' || isInstalled(m.metadata.id);
    return matchesSearch && matchesTab;
  });

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Librería de juegos</h1>

      <input
        type="search"
        placeholder="Buscar juego..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-4 py-2.5 text-sm"
      />

      <div className="flex gap-2">
        {(['all', 'installed'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tab === t
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            {t === 'all' ? `Todos (${allModules.length})` : `Instalados (${installed.length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-400 py-12">No hay juegos que coincidan.</p>
      )}

      <div className="space-y-3">
        {filtered.map(m => {
          const inst = isInstalled(m.metadata.id);
          return (
            <Card key={m.metadata.id} className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white truncate">{m.metadata.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {m.metadata.min_players}–{m.metadata.max_players} jugadores
                  {m.metadata.scoring_mode === 'per_round' && ` · ${m.metadata.total_rounds} rondas`}
                </p>
                {m.metadata.tags && (
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {m.metadata.tags.map(tag => (
                      <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full px-2 py-0.5">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                {inst ? (
                  <>
                    <Button size="sm" onClick={() => navigate(`/session/new?game=${m.metadata.id}`)}>
                      Jugar
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => uninstall(m.metadata.id)}>
                      Quitar
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="secondary" onClick={() => install(m.metadata.id)}>
                    + Instalar
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
