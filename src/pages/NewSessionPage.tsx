import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { getGameModules } from '../lib/gameLoader';
import { useInstalledGames } from '../hooks/useInstalledGames';
import { usePlayers } from '../hooks/usePlayers';
import { useSession } from '../hooks/useSession';
import { sessionsStorage, playersStorage } from '../lib/storage';
import { resolvePlayerName } from '../lib/sessionEngine';
import type { Player } from '../lib/types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { PageHeader } from '../components/layout/PageHeader';

interface SortableItemProps {
  pid: string;
  index: number;
  players: Player[];
  animating: 'dice' | 'cards' | null;
}

function SortablePlayerItem({ pid, index, players, animating }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: pid });
  const p = players.find(pl => pl.id === pid);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...(animating === 'cards' && !isDragging
      ? { animation: `card-flip 0.5s ease-in-out ${index * 90}ms both` }
      : {}),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/60 transition-shadow ${isDragging ? 'shadow-lg opacity-80 z-10 relative' : ''}`}
    >
      <span className="text-xs font-bold text-gray-400 w-5 shrink-0">{index + 1}°</span>
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0"
        style={{ backgroundColor: (p?.color ?? '#6366f1') + '33' }}
      >
        {p?.avatar_emoji ?? '🎲'}
      </div>
      <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-100">{p?.name ?? pid}</span>
      <button
        className="touch-none text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 cursor-grab active:cursor-grabbing p-1 -mr-1"
        {...attributes}
        {...listeners}
        tabIndex={-1}
      >
        <GripVertical size={18} />
      </button>
    </div>
  );
}

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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    const game = searchParams.get('game');
    const playerIds = searchParams.get('players')?.split(',').filter(Boolean) ?? [];
    if (game) {
      setSelectedGame(game);
      setSelectedPlayers(playerIds);
      setShuffled(false);
    }
  }, [searchParams]);

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSelectedPlayers(prev => {
        const oldIndex = prev.indexOf(active.id as string);
        const newIndex = prev.indexOf(over.id as string);
        return arrayMove(prev, oldIndex, newIndex);
      });
      setShuffled(true);
    }
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

  if (activeSession && !selectedGame) {
    const activePlayers = activeSession.player_ids
      .map(pid => players.find(p => p.id === pid)?.name ?? 'Jugador')
      .join(', ');

    return (
      <div className="p-4 space-y-6">
        <PageHeader title="Jugar" />

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
        <PageHeader title="Nueva partida" />

        {!selectedGame && (() => {
          const allPlayers = playersStorage.getAll();
          const last = sessionsStorage.getAll()
            .filter(s => s.status === 'completed')
            .sort((a, b) => new Date(b.completed_at ?? b.started_at).getTime() - new Date(a.completed_at ?? a.started_at).getTime())[0] ?? null;
          if (!last) return null;
          const winnerId = last.winner_ids?.[0];
          const winnerPlayer = winnerId ? allPlayers.find(p => p.id === winnerId) : null;
          const winnerColor = winnerPlayer?.color ?? '#6366f1';
          const winnerName = winnerId ? resolvePlayerName(winnerId, allPlayers, last) : null;
          return (
            <section>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Última partida</h2>
              <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
                <div className="h-1 w-full" style={{ backgroundColor: winnerColor }} />
                <div className="flex items-center gap-3 p-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{last.game_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(last.completed_at ?? last.started_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                      {winnerName && ` · 🏆 ${winnerName}`}
                    </p>
                  </div>
                  <button
                    className="shrink-0 px-3 py-1.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white active:bg-indigo-700"
                    onClick={() => navigate(`/session/new?game=${last.game_id}&players=${last.player_ids.join(',')}`)}
                  >
                    Revancha
                  </button>
                </div>
              </div>
            </section>
          );
        })()}

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
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={selectedPlayers} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-1.5">
                  {selectedPlayers.map((pid, i) => (
                    <SortablePlayerItem
                      key={pid}
                      pid={pid}
                      index={i}
                      players={players}
                      animating={animating}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            <p className="text-xs text-gray-400 text-center pt-0.5">Arrastrá las filas para cambiar el orden</p>
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
