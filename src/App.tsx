import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { BottomNav } from './components/layout/BottomNav';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

// Pages are code-split so each route loads its own chunk. This keeps the
// initial bundle small — heavy deps like dnd-kit (NewSessionPage) and supabase
// (SessionPage / SharePage) are only fetched when those routes are visited.
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const LibraryPage = lazy(() => import('./pages/LibraryPage').then(m => ({ default: m.LibraryPage })));
const NewSessionPage = lazy(() => import('./pages/NewSessionPage').then(m => ({ default: m.NewSessionPage })));
const SessionPage = lazy(() => import('./pages/SessionPage').then(m => ({ default: m.SessionPage })));
const PlayersPage = lazy(() => import('./pages/PlayersPage').then(m => ({ default: m.PlayersPage })));
const HistoryPage = lazy(() => import('./pages/HistoryPage').then(m => ({ default: m.HistoryPage })));
const SessionSummaryPage = lazy(() => import('./pages/SessionSummaryPage').then(m => ({ default: m.SessionSummaryPage })));
const PlayerDetailPage = lazy(() => import('./pages/PlayerDetailPage').then(m => ({ default: m.PlayerDetailPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const SharePage = lazy(() => import('./pages/SharePage').then(m => ({ default: m.SharePage })));
const CustomGameEditorPage = lazy(() => import('./pages/CustomGameEditorPage').then(m => ({ default: m.CustomGameEditorPage })));

function PageFallback() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-gray-700 border-t-indigo-500 animate-spin" />
    </div>
  );
}

function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))' }}>
      <div className="max-w-lg mx-auto">
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </div>
      <BottomNav />
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: 'share/:id',
    element: (
      <Suspense fallback={<PageFallback />}>
        <SharePage />
      </Suspense>
    ),
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/library" replace /> },
      { path: 'home', element: <HomePage /> },
      { path: 'library', element: <LibraryPage /> },
      { path: 'session/new', element: <NewSessionPage /> },
      { path: 'session/:id', element: <SessionPage /> },
      { path: 'players', element: <PlayersPage /> },
      { path: 'players/:id', element: <PlayerDetailPage /> },
      { path: 'history', element: <HistoryPage /> },
      { path: 'history/:id', element: <SessionSummaryPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'games/new', element: <CustomGameEditorPage /> },
      { path: 'games/:id/edit', element: <CustomGameEditorPage /> },
    ],
  },
]);

export default function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}
