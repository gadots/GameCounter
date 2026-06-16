import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { GameModule } from '../../lib/types';

// ─── Hoisted mocks ─────────────────────────────────────────────────────────
const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mocks.navigate,
}));

const mockInstall = vi.fn();
const mockUninstall = vi.fn();
const mockToggleFavorite = vi.fn();
const mockIsInstalled = vi.fn((_id: string) => false);
const mockInstalled = vi.fn(() => [] as { game_id: string; installed_at: string; is_favorite: boolean }[]);

vi.mock('../../hooks/useInstalledGames', () => ({
  useInstalledGames: vi.fn(() => ({
    get installed() { return mockInstalled(); },
    install: mockInstall,
    uninstall: mockUninstall,
    toggleFavorite: mockToggleFavorite,
    isInstalled: mockIsInstalled,
  })),
}));

vi.mock('../../hooks/usePlayers', () => ({
  usePlayers: vi.fn(() => ({ players: [] })),
}));

vi.mock('../../hooks/useSession', () => ({
  useSessions: vi.fn(() => []),
}));

vi.mock('../../lib/sessionEngine', () => ({
  computeGameRecords: vi.fn(() => ({ totalPlayed: 0, highScore: null, topWinner: null })),
}));

vi.mock('../../components/layout/PageHeader', () => ({
  PageHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

const mockGames: GameModule[] = [
  {
    metadata: { id: 'catan', name: 'Catan', min_players: 3, max_players: 4, scoring_mode: 'end_of_game' },
    inputs: [],
    score: () => 0,
  },
  {
    metadata: { id: 'splendor', name: 'Splendor', min_players: 2, max_players: 4, scoring_mode: 'end_of_game' },
    inputs: [],
    score: () => 0,
  },
];

vi.mock('../../lib/gameLoader', () => ({
  getGameModules: vi.fn(() => mockGames),
}));

// ─── Import after mocks ────────────────────────────────────────────────────
import { LibraryPage } from '../LibraryPage';
import { useInstalledGames } from '../../hooks/useInstalledGames';

const mockUseInstalledGames = vi.mocked(useInstalledGames);

// ─── Tests ─────────────────────────────────────────────────────────────────
describe('LibraryPage — tab "Todos"', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsInstalled.mockReturnValue(false);
    mockInstalled.mockReturnValue([]);
    mockUseInstalledGames.mockReturnValue({
      installed: [],
      install: mockInstall,
      uninstall: mockUninstall,
      toggleFavorite: mockToggleFavorite,
      isInstalled: mockIsInstalled,
    });
  });

  it('renders the page header', () => {
    render(<LibraryPage />);
    expect(screen.getByText('Librería de juegos')).toBeInTheDocument();
  });

  it('shows all games when Todos tab is active', () => {
    render(<LibraryPage />);
    // Switch to "Todos" tab
    fireEvent.click(screen.getByText(/Todos/));
    expect(screen.getByText('Catan')).toBeInTheDocument();
    expect(screen.getByText('Splendor')).toBeInTheDocument();
  });

  it('each game shows an install button when not installed', () => {
    render(<LibraryPage />);
    fireEvent.click(screen.getByText(/Todos/));
    const installButtons = screen.getAllByText('+ Instalar');
    expect(installButtons.length).toBe(2);
  });

  it('clicking install button calls install with game id', () => {
    render(<LibraryPage />);
    fireEvent.click(screen.getByText(/Todos/));
    const installButtons = screen.getAllByText('+ Instalar');
    fireEvent.click(installButtons[0]);
    expect(mockInstall).toHaveBeenCalledWith('catan');
  });

  it('installed games show Jugar and Quitar buttons instead of Instalar', () => {
    mockIsInstalled.mockImplementation((id: string) => id === 'catan');
    mockInstalled.mockReturnValue([{ game_id: 'catan', installed_at: '', is_favorite: false }]);
    mockUseInstalledGames.mockReturnValue({
      installed: [{ game_id: 'catan', installed_at: '', is_favorite: false }],
      install: mockInstall,
      uninstall: mockUninstall,
      toggleFavorite: mockToggleFavorite,
      isInstalled: mockIsInstalled,
    });
    render(<LibraryPage />);
    fireEvent.click(screen.getByText(/Todos/));
    expect(screen.getByText('Jugar')).toBeInTheDocument();
    expect(screen.getByText('Quitar')).toBeInTheDocument();
  });

  it('search input filters the game list', () => {
    render(<LibraryPage />);
    fireEvent.click(screen.getByText(/Todos/));
    const searchInput = screen.getByPlaceholderText('Buscar juego...');
    fireEvent.change(searchInput, { target: { value: 'catan' } });
    expect(screen.getByText('Catan')).toBeInTheDocument();
    expect(screen.queryByText('Splendor')).not.toBeInTheDocument();
  });

  it('shows no-match message when search returns nothing', () => {
    render(<LibraryPage />);
    fireEvent.click(screen.getByText(/Todos/));
    const searchInput = screen.getByPlaceholderText('Buscar juego...');
    fireEvent.change(searchInput, { target: { value: 'xxxxxxxxxx' } });
    expect(screen.getByText('No hay juegos que coincidan.')).toBeInTheDocument();
  });
});

describe('LibraryPage — tab "Librería" (installed)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsInstalled.mockReturnValue(false);
    mockInstalled.mockReturnValue([]);
    mockUseInstalledGames.mockReturnValue({
      installed: [],
      install: mockInstall,
      uninstall: mockUninstall,
      toggleFavorite: mockToggleFavorite,
      isInstalled: mockIsInstalled,
    });
  });

  it('shows empty state when no games installed', () => {
    render(<LibraryPage />);
    // Default tab is "installed" - no games installed means empty message
    expect(screen.getByText('No hay juegos que coincidan.')).toBeInTheDocument();
  });

  it('shows installed game name', () => {
    mockIsInstalled.mockImplementation((id: string) => id === 'splendor');
    mockInstalled.mockReturnValue([{ game_id: 'splendor', installed_at: '', is_favorite: false }]);
    mockUseInstalledGames.mockReturnValue({
      installed: [{ game_id: 'splendor', installed_at: '', is_favorite: false }],
      install: mockInstall,
      uninstall: mockUninstall,
      toggleFavorite: mockToggleFavorite,
      isInstalled: mockIsInstalled,
    });
    render(<LibraryPage />);
    expect(screen.getByText('Splendor')).toBeInTheDocument();
  });
});
