import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { Session } from '../../lib/types';

// ─── Hoisted mocks ─────────────────────────────────────────────────────────
const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mocks.navigate,
}));

vi.mock('../../hooks/usePlayers', () => ({
  usePlayers: vi.fn(() => ({ players: [] })),
}));

vi.mock('../../hooks/useSession', () => ({
  useSessions: vi.fn(() => []),
}));

vi.mock('../../lib/sessionEngine', () => ({
  resolvePlayerName: vi.fn((id: string) => id),
}));

vi.mock('../../components/layout/PageHeader', () => ({
  PageHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

// ─── Import after mocks ────────────────────────────────────────────────────
import { HomePage } from '../HomePage';
import { usePlayers } from '../../hooks/usePlayers';
import { useSessions } from '../../hooks/useSession';

const mockUsePlayers = vi.mocked(usePlayers);
const mockUseSessions = vi.mocked(useSessions);

const completedSession: Session = {
  id: 's1',
  game_id: 'catan',
  game_name: 'Catan',
  player_ids: ['p1'],
  status: 'completed',
  current_round: 1,
  scores: [],
  started_at: '2024-01-01T00:00:00.000Z',
  completed_at: '2024-01-01T01:00:00.000Z',
  winner_ids: ['p1'],
};

const activeSession: Session = {
  id: 's2',
  game_id: 'splendor',
  game_name: 'Splendor',
  player_ids: ['p1'],
  status: 'active',
  current_round: 1,
  scores: [],
  started_at: '2024-01-01T00:00:00.000Z',
};

// ─── Tests ─────────────────────────────────────────────────────────────────
describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePlayers.mockReturnValue({ players: [], addPlayer: vi.fn(), updatePlayer: vi.fn(), removePlayer: vi.fn() });
    mockUseSessions.mockReturnValue([]);
  });

  it('renders without crashing (smoke test)', () => {
    expect(() => render(<HomePage />)).not.toThrow();
  });

  it('shows page header with GameCounter title', () => {
    render(<HomePage />);
    expect(screen.getByText('GameCounter')).toBeInTheDocument();
  });

  it('shows empty state with welcome message when no data', () => {
    render(<HomePage />);
    expect(screen.getByText('¡Bienvenido!')).toBeInTheDocument();
    expect(screen.getByText('Instalá un juego y sumá jugadores para empezar.')).toBeInTheDocument();
  });

  it('shows "Ver librería" button in empty state', () => {
    render(<HomePage />);
    expect(screen.getByText('Ver librería')).toBeInTheDocument();
  });

  it('"Ver librería" navigates to /library', () => {
    render(<HomePage />);
    fireEvent.click(screen.getByText('Ver librería'));
    expect(mocks.navigate).toHaveBeenCalledWith('/library');
  });

  it('does not show empty state when there are sessions', () => {
    mockUseSessions.mockReturnValue([completedSession]);
    render(<HomePage />);
    expect(screen.queryByText('¡Bienvenido!')).not.toBeInTheDocument();
  });

  it('shows last session name when there are completed sessions', () => {
    mockUseSessions.mockReturnValue([completedSession]);
    render(<HomePage />);
    expect(screen.getByText('Catan')).toBeInTheDocument();
  });

  it('shows "Revancha" button for the last session', () => {
    mockUseSessions.mockReturnValue([completedSession]);
    render(<HomePage />);
    expect(screen.getByText('Revancha')).toBeInTheDocument();
  });

  it('"Revancha" navigates to /session/new with correct params', () => {
    mockUseSessions.mockReturnValue([completedSession]);
    render(<HomePage />);
    fireEvent.click(screen.getByText('Revancha'));
    expect(mocks.navigate).toHaveBeenCalledWith(
      `/session/new?game=${completedSession.game_id}&players=${completedSession.player_ids.join(',')}`,
    );
  });

  it('shows active session banner when there is an active session', () => {
    mockUseSessions.mockReturnValue([activeSession]);
    render(<HomePage />);
    expect(screen.getByText('Partida en curso')).toBeInTheDocument();
    expect(screen.getByText('Splendor')).toBeInTheDocument();
  });

  it('clicking active session banner navigates to the session', () => {
    mockUseSessions.mockReturnValue([activeSession]);
    render(<HomePage />);
    // Click the banner (it has the game name inside)
    fireEvent.click(screen.getByText('Partida en curso'));
    expect(mocks.navigate).toHaveBeenCalledWith(`/session/${activeSession.id}`);
  });

  it('shows library shortcut when there is data', () => {
    mockUseSessions.mockReturnValue([completedSession]);
    render(<HomePage />);
    expect(screen.getByText('Librería de juegos')).toBeInTheDocument();
  });

  it('"Librería de juegos" shortcut navigates to /library', () => {
    mockUseSessions.mockReturnValue([completedSession]);
    render(<HomePage />);
    fireEvent.click(screen.getByText('Librería de juegos'));
    expect(mocks.navigate).toHaveBeenCalledWith('/library');
  });

  it('shows session count when there are completed sessions', () => {
    mockUseSessions.mockReturnValue([completedSession]);
    render(<HomePage />);
    expect(screen.getByText(/1 partida/)).toBeInTheDocument();
  });
});
