import { NavLink } from 'react-router-dom';
import { Library, Play, Users, History } from 'lucide-react';
import { sessionsStorage } from '../../lib/storage';

export function BottomNav() {
  const activeSession = sessionsStorage.getActive();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex z-10"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <NavLink
        to="/library"
        className={({ isActive }) =>
          `flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-xs transition-colors ${
            isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <Library size={22} strokeWidth={isActive ? 2.5 : 1.75} />
            <span>Librería</span>
          </>
        )}
      </NavLink>

      <NavLink
        to={activeSession ? `/session/${activeSession.id}` : '/session/new'}
        className={({ isActive }) =>
          `flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-xs transition-colors relative ${
            isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <span className="relative">
              <Play size={22} strokeWidth={isActive ? 2.5 : 1.75} />
              {activeSession && (
                <span className="absolute -top-0.5 -right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
              )}
            </span>
            <span>Jugar</span>
          </>
        )}
      </NavLink>

      <NavLink
        to="/players"
        className={({ isActive }) =>
          `flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-xs transition-colors ${
            isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <Users size={22} strokeWidth={isActive ? 2.5 : 1.75} />
            <span>Jugadores</span>
          </>
        )}
      </NavLink>

      <NavLink
        to="/history"
        className={({ isActive }) =>
          `flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-xs transition-colors ${
            isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <History size={22} strokeWidth={isActive ? 2.5 : 1.75} />
            <span>Historial</span>
          </>
        )}
      </NavLink>
    </nav>
  );
}
