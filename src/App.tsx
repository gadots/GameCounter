import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { BottomNav } from './components/layout/BottomNav';
import { LibraryPage } from './pages/LibraryPage';
import { NewSessionPage } from './pages/NewSessionPage';
import { SessionPage } from './pages/SessionPage';
import { PlayersPage } from './pages/PlayersPage';
import { HistoryPage } from './pages/HistoryPage';
import { SessionSummaryPage } from './pages/SessionSummaryPage';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16">
      <div className="max-w-lg mx-auto">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/library" replace /> },
      { path: 'library', element: <LibraryPage /> },
      { path: 'session/new', element: <NewSessionPage /> },
      { path: 'session/:id', element: <SessionPage /> },
      { path: 'players', element: <PlayersPage /> },
      { path: 'history', element: <HistoryPage /> },
      { path: 'history/:id', element: <SessionSummaryPage /> },
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
