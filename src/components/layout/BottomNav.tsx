import { NavLink } from 'react-router-dom';
import { Home, Play, Users, History, Settings } from 'lucide-react';
import { sessionsStorage } from '../../lib/storage';

export function BottomNav() {
  const activeSession = sessionsStorage.getActive();

  const tabs = [
    { to: '/home', label: 'Inicio', Icon: Home, exact: true },
    {
      to: activeSession ? `/session/${activeSession.id}` : '/session/new',
      label: 'Jugar',
      Icon: Play,
      badge: !!activeSession,
      matchPaths: ['/session/'],
    },
    { to: '/players', label: 'Jugadores', Icon: Users },
    { to: '/history', label: 'Historial', Icon: History },
    { to: '/settings', label: 'Ajustes', Icon: Settings },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex z-10"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {tabs.map(({ to, label, Icon, badge, matchPaths }) => (
        <NavLink
          key={label}
          to={to}
          end={!matchPaths}
          className={({ isActive }) => {
            const active = isActive || matchPaths?.some(p => location.pathname.startsWith(p));
            return `flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-[10px] transition-colors ${
              active ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'
            }`;
          }}
        >
          {({ isActive }) => {
            const active = isActive || matchPaths?.some(p => location.pathname.startsWith(p));
            return (
              <>
                <span className="relative">
                  <Icon size={21} strokeWidth={active ? 2.5 : 1.75} />
                  {badge && (
                    <span className="absolute -top-0.5 -right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
                  )}
                </span>
                <span>{label}</span>
              </>
            );
          }}
        </NavLink>
      ))}
    </nav>
  );
}
