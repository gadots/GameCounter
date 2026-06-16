import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGameModules } from '../lib/gameLoader';
import { useInstalledGames } from '../hooks/useInstalledGames';
import { usePlayers } from '../hooks/usePlayers';
import { useSessions } from '../hooks/useSession';
import { computeGameRecords } from '../lib/sessionEngine';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Star } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';

export function LibraryPage() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'installed' | 'all' | 'stats'>('installed');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const { installed, install, uninstall, isInstalled, toggleFavorite } = useInstalledGames();
  const navigate = useNavigate();

  const allModules = getGameModules();
  const allSessions = useSessions();
  const { players: allPlayers } = usePlayers();

  // Collect tags that appear in 2+ games, sorted by frequency
  const availableTags = useMemo(() => {
    const freq: Record<string, number> = {};
    allModules.forEach(m => (m.metadata.tags ?? []).forEach(t => { freq[t] = (freq[t] ?? 0) + 1; }));
    return Object.entries(freq)
      .filter(([, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag);
  }, [allModules]);

  const toggleTag = (tag: string) => setSelectedTags(prev => {
    const next = new Set(prev);
    next.has(tag) ? next.delete(tag) : next.add(tag);
    return next;
  });

  const matchesSearch = (name: string) => name.toLowerCase().includes(search.toLowerCase());
  const matchesTags = (tags: string[] = []) =>
    selectedTags.size === 0 || tags.some(t => selectedTags.has(t));
  const matchesFilters = (m: ReturnType<typeof getGameModules>[number]) =>
    matchesSearch(m.metadata.name) && matchesTags(m.metadata.tags);

  const countAll = allModules.filter(m => matchesFilters(m)).length;
  const countInstalled = allModules.filter(m => matchesFilters(m) && isInstalled(m.metadata.id)).length;

  const filtered = allModules
    .filter(m => {
      const matchesTab = tab === 'all' || isInstalled(m.metadata.id);
      return matchesFilters(m) && matchesTab;
    })
    .sort((a, b) => {
      if (tab !== 'installed') return 0;
      const aFav = installed.find(g => g.game_id === a.metadata.id)?.is_favorite ? 1 : 0;
      const bFav = installed.find(g => g.game_id === b.metadata.id)?.is_favorite ? 1 : 0;
      return bFav - aFav;
    });

  const gameStats = useMemo(
    () => allModules
      .filter(m => isInstalled(m.metadata.id))
      .map(m => ({ module: m, records: computeGameRecords(m.metadata.id, allSessions, allPlayers) }))
      .filter(g => g.records.totalPlayed > 0)
      .sort((a, b) => b.records.totalPlayed - a.records.totalPlayed),
    [allModules, allSessions, allPlayers, isInstalled],
  );

  return (
    <div className="p-4 space-y-4">
      <PageHeader title="Librería de juegos" />

      <div className="flex gap-2 overflow-x-auto">
        <button
          onClick={() => setTab('installed')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${tab === 'installed' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
        >
          Librería ({countInstalled})
        </button>
        <button
          onClick={() => setTab('all')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${tab === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
        >
          Todos ({countAll})
        </button>
        <button
          onClick={() => setTab('stats')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${tab === 'stats' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
        >
          Métricas
        </button>
      </div>

      {tab !== 'stats' && (
        <div className="space-y-2">
          <input
            type="search"
            placeholder="Buscar juego..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-4 py-2.5 text-sm"
          />
          <div className="flex gap-2 overflow-x-auto pb-0.5 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
            {availableTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
                  selectedTags.has(tag)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {tag}
              </button>
            ))}
            {selectedTags.size > 0 && (
              <button
                onClick={() => setSelectedTags(new Set())}
                className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap shrink-0 text-indigo-500 dark:text-indigo-400 hover:text-indigo-700"
              >
                Limpiar ×
              </button>
            )}
          </div>
        </div>
      )}

      {tab !== 'stats' && (
        <>
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
                  <div className="flex items-center gap-2 shrink-0">
                    {inst && (
                      <button onClick={() => toggleFavorite(m.metadata.id)} className="p-1.5 transition-colors" aria-label="Favorito">
                        {installed.find(g => g.game_id === m.metadata.id)?.is_favorite
                          ? <Star size={18} className="text-indigo-500" fill="currentColor" />
                          : <Star size={18} className="text-gray-300 dark:text-gray-600" />
                        }
                      </button>
                    )}
                    <div className="flex flex-col gap-2">
                      {inst ? (
                        <>
                          <Button size="sm" onClick={() => navigate(`/session/new?game=${m.metadata.id}`)}>Jugar</Button>
                          <Button size="sm" variant="ghost" onClick={() => uninstall(m.metadata.id)}>Quitar</Button>
                        </>
                      ) : (
                        <Button size="sm" variant="secondary" onClick={() => install(m.metadata.id)}>+ Instalar</Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {tab === 'stats' && (
        <>
          {gameStats.length === 0 ? (
            <p className="text-center text-gray-400 py-12">Todavía no hay partidas jugadas.</p>
          ) : (
            <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-sm overflow-hidden divide-y divide-gray-100 dark:divide-gray-700/50">
              {gameStats.map(({ module: m, records: rec }) => (
                <div key={m.metadata.id} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-gray-800 dark:text-gray-100 truncate">{m.metadata.name}</p>
                    <span className="text-xs text-gray-400 shrink-0">
                      {rec.totalPlayed} {rec.totalPlayed === 1 ? 'partida' : 'partidas'}
                    </span>
                  </div>
                  <div className="flex gap-4 mt-2">
                    {rec.highScore && (
                      <div className="flex-1 bg-gray-50 dark:bg-gray-700/50 rounded-xl px-3 py-2">
                        <p className="text-xs text-gray-400 mb-0.5">Récord</p>
                        <p className="score-num text-base font-bold text-gray-900 dark:text-white">{rec.highScore.value} pts</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{rec.highScore.playerName}</p>
                      </div>
                    )}
                    {rec.topWinner && (
                      <div className="flex-1 bg-gray-50 dark:bg-gray-700/50 rounded-xl px-3 py-2">
                        <p className="text-xs text-gray-400 mb-0.5">Más victorias</p>
                        <p className="score-num text-base font-bold text-gray-900 dark:text-white">{rec.topWinner.wins} vic.</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{rec.topWinner.playerName}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
