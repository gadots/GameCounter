import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// ─── Hoisted mocks ─────────────────────────────────────────────────────────
const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mocks.navigate,
}));

const mockAddPlayer = vi.fn();

vi.mock('../../hooks/usePlayers', () => ({
  usePlayers: vi.fn(() => ({
    players: [],
    addPlayer: mockAddPlayer,
    updatePlayer: vi.fn(),
    removePlayer: vi.fn(),
  })),
}));

vi.mock('../../hooks/useSession', () => ({
  useSessions: vi.fn(() => []),
}));

vi.mock('../../lib/sessionEngine', () => ({
  computeEloRatings: vi.fn(() => ({})),
}));

vi.mock('../../components/layout/PageHeader', () => ({
  PageHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

// ─── Import after mocks ────────────────────────────────────────────────────
import { PlayersPage } from '../PlayersPage';
import { usePlayers } from '../../hooks/usePlayers';

const mockUsePlayers = vi.mocked(usePlayers);

// ─── Tests ─────────────────────────────────────────────────────────────────
describe('PlayersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePlayers.mockReturnValue({
      players: [],
      addPlayer: mockAddPlayer,
      updatePlayer: vi.fn(),
      removePlayer: vi.fn(),
    });
  });

  it('shows empty message when no players', () => {
    render(<PlayersPage />);
    expect(screen.getByText('No hay jugadores todavía.')).toBeInTheDocument();
  });

  it('shows player names when players exist', () => {
    mockUsePlayers.mockReturnValue({
      players: [
        { id: 'p1', name: 'Ana', color: '#6366f1', avatar_emoji: '🎲', created_at: '' },
        { id: 'p2', name: 'Carlos', color: '#ec4899', avatar_emoji: '🏆', created_at: '' },
      ],
      addPlayer: mockAddPlayer,
      updatePlayer: vi.fn(),
      removePlayer: vi.fn(),
    });
    render(<PlayersPage />);
    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.getByText('Carlos')).toBeInTheDocument();
  });

  it('clicking a player navigates to /players/:id', () => {
    mockUsePlayers.mockReturnValue({
      players: [
        { id: 'p1', name: 'Ana', color: '#6366f1', avatar_emoji: '🎲', created_at: '' },
      ],
      addPlayer: mockAddPlayer,
      updatePlayer: vi.fn(),
      removePlayer: vi.fn(),
    });
    render(<PlayersPage />);
    // The player card is clickable
    fireEvent.click(screen.getByText('Ana'));
    expect(mocks.navigate).toHaveBeenCalledWith('/players/p1');
  });

  it('"Agregar jugador" button exists in the list tab', () => {
    render(<PlayersPage />);
    expect(screen.getByText('Agregar jugador')).toBeInTheDocument();
  });

  it('clicking "Agregar jugador" opens the modal with name input', () => {
    render(<PlayersPage />);
    fireEvent.click(screen.getByText('Agregar jugador'));
    expect(screen.getByPlaceholderText('Nombre del jugador')).toBeInTheDocument();
  });

  it('adding a player name and clicking Agregar in modal calls addPlayer', () => {
    render(<PlayersPage />);
    fireEvent.click(screen.getByText('Agregar jugador'));
    const input = screen.getByPlaceholderText('Nombre del jugador');
    fireEvent.change(input, { target: { value: 'Luis' } });
    fireEvent.click(screen.getByText('Agregar'));
    expect(mockAddPlayer).toHaveBeenCalledWith('Luis');
  });

  it('pressing Enter in the modal input calls addPlayer', () => {
    render(<PlayersPage />);
    fireEvent.click(screen.getByText('Agregar jugador'));
    const input = screen.getByPlaceholderText('Nombre del jugador');
    fireEvent.change(input, { target: { value: 'Sofia' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(mockAddPlayer).toHaveBeenCalledWith('Sofia');
  });
});
