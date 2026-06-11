import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getGameModules } from '../lib/gameLoader';
import { useInstalledGames } from '../hooks/useInstalledGames';
import { usePlayers } from '../hooks/usePlayers';
import { useSession } from '../hooks/useSession';
import { sessionsStorage } from '../lib/storage';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

export function NewSessionPage() {
  const [searchParams] = useSearchParams();
  const [selectedGame, setSelectedGame] = useState(searchParams.get('game') ?? '');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>(
    () => searchParams.get('players')?.split(',').filter(Boolean) ?? []
  );
  const [showAbandonModal, setShowAbandonModal] = useState(false);
  const [shuffled, setShuffled] = useState(false);
  const [animating, setAnimating] = useState<'dice' | 'cards' | null>(null);
  const navigate = useNavigate();

  const { isInstalled } = useInstalledGames();
  const { players } = usePlayers();
  const { createSession } = useSession(null);

  const activeSession = sessionsStorage.getActive();
  const installedModules = getGameModules().filter(m => isInstalled(m.metadata.id));
  const selectedModule = installedModules.find(m => m.metadata.id === selectedGame);

  const togglePlayer = (id: string) => {
    setSelectedPlayers(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleShuffle = () => {
    const arr = [...selectedPlayers];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setSelectedPlayers(arr);
    const type = Math.random() > 0.5 ? 'dice' : 'cards';
    setAnimating(type);
    setShuffled(true);
    setTimeout(() => setAnimating(null), 700);
  };

  const canStart =
    selectedModule &&
    selectedPlayers.length >= selectedModule.metadata.min_players &&
    selectedPlayers.length <= selectedModule.metadata.max_players;

  const handleStart = () => {
    if (!canStart) return;
    if (activeSession) {
      setShowAbandonModal(true);
      return;
    }
    startNewSession();
  };

  const startNewSession = () => {
    const id = createSession(selectedGame, selectedPlayers);
    navigate(`/session/${id}`);
  };

  // If there's an active session and no new game selected yet, show the resume screen
  if (activeSession && !selectedGame) {
    const activePlayers = activeSession.player_ids
      .map(pid => players.find(p => p.id === pid)?.name ?? 'Jugador')
      .join(', ');

    return (
      <div className="p-4 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Jugar</h1>

        <Card className="border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20">
          <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-1">Partida en curso</p>
          <p className="font-semibold text-gray-900 dark:text-white text-lg">{activeSession.game_name}</p>
          {activeSession.current_round > 1 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Ronda {activeSession.current_round}</p>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{activePlayers}</p>
          <Button
            className="w-full mt-4"
            onClick={() => navigate(`/session/${activeSession.id}`)}
          >
            Continuar partida
          </Button>
        </Card>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-gray-50 dark:bg-gray-900 px-3 text-xs text-gray-400">o empezar una nueva</span>
          </div>
        </div>

        <Button variant="secondary" className="w-full" onClick={() => setSelectedGame('__pick__')}>
          Nueva partida
        </Button>
      </div>
    );
  }

  return (
    <>
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
                  {m.metadata.scoring_mode === 'per_round' && ` · ${m.metadata.total_rounds} rondas`}
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

        {selectedPlayers.length >= 2 && (
          <section className="space-y-2">
            <style>{`
              @keyframes dice-spin {
                0%   { transform: rotate(0deg) scale(1); }
                20%  { transform: rotate(-30deg) scale(1.5); }
                55%  { transform: rotate(20deg) scale(1.3); }
                80%  { transform: rotate(-10deg) scale(1.1); }
                100% { transform: rotate(0deg) scale(1); }
              }
              @keyframes card-flip {
                0%   { transform: scaleX(1); opacity: 1; }
                35%  { transform: scaleX(0); opacity: 0.2; }
                65%  { transform: scaleX(0); opacity: 0.2; }
                100% { transform: scaleX(1); opacity: 1; }
              }
            `}</style>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Orden de turno
              </h2>
              <button
                onClick={handleShuffle}
                disabled={!!animating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 transition-opacity disabled:opacity-50"
              >
                <span style={animating === 'dice' ? { display: 'inline-block', animation: 'dice-spin 0.65s ease-in-out' } : {}}>
                  🎲
                </span>
                {shuffled ? '↺ Mezclar de nuevo' : 'Orden aleatorio'}
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              {selectedPlayers.map((pid, i) => {
                const p = players.find(pl => pl.id === pid);
                return (
                  <div
                    key={pid}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/60"
                    style={animating === 'cards' ? { animation: `card-flip 0.5s ease-in-out ${i * 90}ms both` } : {}}
                  >
                    <span className="text-xs font-bold text-gray-400 w-5 shrink-0">{i + 1}°</span>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0" style={{ backgroundColor: (p?.color ?? '#6366f1') + '33' }}>
                      {p?.avatar_emoji ?? '🎲'}
                    </div>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{p?.name ?? pid}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <Button className="w-full" disabled={!canStart} onClick={handleStart} size="lg">
          Empezar partida
        </Button>

        {activeSession && (
          <button
            className="w-full text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 py-1"
            onClick={() => navigate(`/session/${activeSession.id}`)}
          >
            ← Volver a partida en curso ({activeSession.game_name})
          </button>
        )}
      </div>

      <Modal
        open={showAbandonModal}
        title="¿Abandonar la partida en curso?"
        description={`Hay una partida de ${activeSession?.game_name} en progreso. Si empezás una nueva, la anterior se perderá.`}
        confirmLabel="Abandonar y empezar nueva"
        cancelLabel="Cancelar"
        confirmVariant="danger"
        onConfirm={() => { setShowAbandonModal(false); startNewSession(); }}
        onCancel={() => setShowAbandonModal(false)}
      />
    </>
  );
}
