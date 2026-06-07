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
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [showAbandonModal, setShowAbandonModal] = useState(false);
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
