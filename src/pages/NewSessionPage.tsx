import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getGameModules } from '../lib/gameLoader';
import { useInstalledGames } from '../hooks/useInstalledGames';
import { usePlayers } from '../hooks/usePlayers';
import { useSession } from '../hooks/useSession';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function NewSessionPage() {
  const [searchParams] = useSearchParams();
  const [selectedGame, setSelectedGame] = useState(searchParams.get('game') ?? '');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const navigate = useNavigate();

  const { isInstalled } = useInstalledGames();
  const { players } = usePlayers();
  const { createSession } = useSession(null);

  const installedModules = getGameModules().filter(m => isInstalled(m.metadata.id));
  const selectedModule = installedModules.find(m => m.metadata.id === selectedGame);

  const togglePlayer = (id: string) => {
    setSelectedPlayers(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const canStart =
    selectedModule &&
    selectedPlayers.length >= selectedModule.metadata.min_players &&
    selectedPlayers.length <= selectedModule.metadata.max_players;

  const handleStart = () => {
    if (!canStart) return;
    const id = createSession(selectedGame, selectedPlayers);
    navigate(`/session/${id}`);
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nueva partida</h1>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Juego</h2>
        {installedModules.length === 0 && (
          <p className="text-gray-400 text-sm">No tenés juegos instalados. Instalá uno desde la Librería.</p>
        )}
        <div className="space-y-2">
          {installedModules.map(m => (
            <Card
              key={m.metadata.id}
              className={`cursor-pointer transition-all ${selectedGame === m.metadata.id ? 'ring-2 ring-indigo-500' : ''}`}
              onClick={() => { setSelectedGame(m.metadata.id); setSelectedPlayers([]); }}
            >
              <p className="font-medium text-gray-800 dark:text-gray-100">{m.metadata.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {m.metadata.min_players}–{m.metadata.max_players} jugadores
              </p>
            </Card>
          ))}
        </div>
      </section>

      {selectedModule && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Jugadores ({selectedPlayers.length}/{selectedModule.metadata.max_players})
          </h2>
          {players.length === 0 && (
            <p className="text-gray-400 text-sm">Agregá jugadores en la sección Jugadores.</p>
          )}
          <div className="space-y-2">
            {players.map(p => {
              const sel = selectedPlayers.includes(p.id);
              return (
                <Card
                  key={p.id}
                  className={`cursor-pointer flex items-center gap-3 transition-all ${sel ? 'ring-2 ring-indigo-500' : ''}`}
                  onClick={() => togglePlayer(p.id)}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0"
                    style={{ backgroundColor: p.color + '33' }}
                  >
                    {p.avatar_emoji}
                  </div>
                  <p className="flex-1 font-medium text-gray-800 dark:text-gray-100">{p.name}</p>
                  {sel && <span className="text-indigo-500">✓</span>}
                </Card>
              );
            })}
          </div>
          {selectedPlayers.length > 0 && !canStart && (
            <p className="text-xs text-amber-500">
              Necesitás {selectedModule.metadata.min_players}–{selectedModule.metadata.max_players} jugadores.
            </p>
          )}
        </section>
      )}

      <Button className="w-full" disabled={!canStart} onClick={handleStart} size="lg">
        Empezar partida
      </Button>
    </div>
  );
}
