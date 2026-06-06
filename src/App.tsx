import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BottomNav } from './components/layout/BottomNav';
import { LibraryPage } from './pages/LibraryPage';
import { NewSessionPage } from './pages/NewSessionPage';
import { SessionPage } from './pages/SessionPage';
import { PlayersPage } from './pages/PlayersPage';
import { HistoryPage } from './pages/HistoryPage';
import { SessionSummaryPage } from './pages/SessionSummaryPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16">
        <div className="max-w-lg mx-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/library" replace />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/session/new" element={<NewSessionPage />} />
            <Route path="/session/:id" element={<SessionPage />} />
            <Route path="/players" element={<PlayersPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/history/:id" element={<SessionSummaryPage />} />
          </Routes>
        </div>
      </div>
      <BottomNav />
    </BrowserRouter>
  );
}
