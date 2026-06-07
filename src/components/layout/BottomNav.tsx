import { NavLink } from 'react-router-dom';
import { sessionsStorage } from '../../lib/storage';

export function BottomNav() {
  const activeSession = sessionsStorage.getActive();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex z-10">
      {/* Library tab */}
      <NavLink
        to="/library"
        className={({ isActive }) =>
          `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors ${
            isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'
          }`
        }
      >
        <span className="text-xl leading-none">🎲</span>
        <span>Librería</span>
      </NavLink>

      {/* Play tab — dynamic: goes to active session or new session */}
      <NavLink
        to={activeSession ? `/session/${activeSession.id}` : '/session/new'}
        className={({ isActive }) =>
          `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors relative ${
            isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'
          }`
        }
      >
        <span className="text-xl leading-none relative">
          ▶️
          {activeSession && (
            <span className="absolute -top-0.5 -right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
          )}
        </span>
        <span>Jugar</span>
      </NavLink>

      {/* Players tab */}
      <NavLink
        to="/players"
        className={({ isActive }) =>
          `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors ${
            isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'
          }`
        }
      >
        <span className="text-xl leading-none">👥</span>
        <span>Jugadores</span>
      </NavLink>

      {/* History tab */}
      <NavLink
        to="/history"
        className={({ isActive }) =>
          `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors ${
            isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'
          }`
        }
      >
        <span className="text-xl leading-none">📋</span>
        <span>Historial</span>
      </NavLink>
    </nav>
  );
}
