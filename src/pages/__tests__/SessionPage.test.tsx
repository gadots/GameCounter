import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { Session } from '../../lib/types';

// ─── Hoisted mocks (available inside vi.mock factories) ────────────────────
const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  useBlocker: vi.fn(() => ({ state: 'unblocked' as const, reset: vi.fn(), proceed: vi.fn() })),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mocks.navigate,
  useParams: () => ({ id: 'session-1' }),
  useBlocker: mocks.useBlocker,
}));

const mockSubmitRound = vi.fn();
const mockEndSession = vi.fn();

const activeSession: Session = {
  id: 'session-1',
  game_id: 'catan',
  game_name: 'Catan',
  player_ids: ['p1'],
  status: 'active',
  current_round: 1,
  scores: [],
  started_at: '2024-01-01T00:00:00.000Z',
};

const completedSession: Session = {
  ...activeSession,
  status: 'completed',
  winner_ids: ['p1'],
  completed_at: '2024-01-01T01:00:00.000Z',
};

vi.mock('../../hooks/useSession', () => ({
  useSession: vi.fn(() => ({
    session: activeSession,
    submitRound: mockSubmitRound,
    endSession: mockEndSession,
  })),
}));

vi.mock('../../hooks/usePlayers', () => ({
  usePlayers: () => ({
    players: [{ id: 'p1', name: 'Ana', color: '#6366f1', avatar_emoji: '🎲', created_at: '' }],
  }),
}));

vi.mock('../../lib/gameLoader', () => ({
  getGameModule: () => ({
    metadata: {
      id: 'catan',
      name: 'Catan',
      min_players: 3,
      max_players: 4,
      scoring_mode: 'end_of_game' as const,
    },
    inputs: [{ id: 'pts', label: 'Puntos', type: 'number' as const }],
    score: () => 5,
  }),
}));

// ─── Import after mocks ────────────────────────────────────────────────────
import { SessionPage } from '../SessionPage';
import { useSession } from '../../hooks/useSession';

const mockUseSession = vi.mocked(useSession);

// ─── Tests ─────────────────────────────────────────────────────────────────
describe('SessionPage — modal de salida', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSession.mockReturnValue({
      session: activeSession,
      submitRound: mockSubmitRound,
      endSession: mockEndSession,
      refresh: vi.fn(),
      createSession: vi.fn(),
      undoLastRound: vi.fn(),
    });
  });

  it('no muestra el modal cuando el blocker está inactivo', () => {
    mocks.useBlocker.mockReturnValue({ state: 'unblocked', reset: vi.fn(), proceed: vi.fn() });
    render(<SessionPage />);
    expect(screen.queryByText('¿Salir de la partida?')).not.toBeInTheDocument();
  });

  it('muestra el modal cuando el blocker está bloqueado', () => {
    mocks.useBlocker.mockReturnValue({ state: 'blocked', reset: vi.fn(), proceed: vi.fn() } as any);
    render(<SessionPage />);
    expect(screen.getByText('¿Salir de la partida?')).toBeInTheDocument();
  });

  it('"Salir" navega a /session/new y llama reset() sin llamar proceed()', () => {
    const mockReset = vi.fn();
    const mockProceed = vi.fn();
    mocks.useBlocker.mockReturnValue({ state: 'blocked', reset: mockReset, proceed: mockProceed } as any);
    render(<SessionPage />);
    fireEvent.click(screen.getByText('Salir'));
    expect(mocks.navigate).toHaveBeenCalledWith('/session/new');
    expect(mocks.navigate).toHaveBeenCalledTimes(1);
    expect(mockReset).toHaveBeenCalledTimes(1);
    expect(mockProceed).not.toHaveBeenCalled();
  });

  it('"Seguir jugando" llama reset() sin navegar', () => {
    const mockReset = vi.fn();
    mocks.useBlocker.mockReturnValue({ state: 'blocked', reset: mockReset, proceed: vi.fn() } as any);
    render(<SessionPage />);
    fireEvent.click(screen.getByText('Seguir jugando'));
    expect(mockReset).toHaveBeenCalledTimes(1);
    expect(mocks.navigate).not.toHaveBeenCalled();
  });
});

describe('SessionPage — estados de sesión', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useBlocker.mockReturnValue({ state: 'unblocked', reset: vi.fn(), proceed: vi.fn() });
  });

  it('muestra "Sesión no encontrada" cuando no hay sesión', () => {
    mockUseSession.mockReturnValue({
      session: null,
      submitRound: vi.fn(),
      endSession: vi.fn(),
      refresh: vi.fn(),
      createSession: vi.fn(),
      undoLastRound: vi.fn(),
    });
    render(<SessionPage />);
    expect(screen.getByText('Sesión no encontrada.')).toBeInTheDocument();
  });

  it('muestra la pantalla de ganador cuando la sesión está completada', () => {
    mockUseSession.mockReturnValue({
      session: completedSession,
      submitRound: vi.fn(),
      endSession: vi.fn(),
      refresh: vi.fn(),
      createSession: vi.fn(),
      undoLastRound: vi.fn(),
    });
    render(<SessionPage />);
    expect(screen.getByText('¡Ganó Ana!')).toBeInTheDocument();
    expect(screen.getByText('Nueva partida')).toBeInTheDocument();
    expect(screen.getByText('Ver historial')).toBeInTheDocument();
  });

  it('"Nueva partida" en pantalla de ganador navega a /session/new', () => {
    mockUseSession.mockReturnValue({
      session: completedSession,
      submitRound: vi.fn(),
      endSession: vi.fn(),
      refresh: vi.fn(),
      createSession: vi.fn(),
      undoLastRound: vi.fn(),
    });
    render(<SessionPage />);
    fireEvent.click(screen.getByText('Nueva partida'));
    expect(mocks.navigate).toHaveBeenCalledWith('/session/new');
  });

  it('"Ver historial" en pantalla de ganador navega a /history', () => {
    mockUseSession.mockReturnValue({
      session: completedSession,
      submitRound: vi.fn(),
      endSession: vi.fn(),
      refresh: vi.fn(),
      createSession: vi.fn(),
      undoLastRound: vi.fn(),
    });
    render(<SessionPage />);
    fireEvent.click(screen.getByText('Ver historial'));
    expect(mocks.navigate).toHaveBeenCalledWith('/history');
  });

  it('muestra el nombre del juego y el input del jugador en sesión activa', () => {
    mockUseSession.mockReturnValue({
      session: activeSession,
      submitRound: mockSubmitRound,
      endSession: mockEndSession,
      refresh: vi.fn(),
      createSession: vi.fn(),
      undoLastRound: vi.fn(),
    });
    render(<SessionPage />);
    expect(screen.getByText('Catan')).toBeInTheDocument();
    expect(screen.getAllByText('Ana').length).toBeGreaterThan(0);
  });
});
