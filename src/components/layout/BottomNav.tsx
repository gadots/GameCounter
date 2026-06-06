import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/library',  label: 'Librería',  icon: '🎲' },
  { to: '/session/new', label: 'Jugar',  icon: '▶️' },
  { to: '/players',  label: 'Jugadores', icon: '👥' },
  { to: '/history',  label: 'Historial', icon: '📋' },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex z-10">
      {tabs.map(tab => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors ${
              isActive
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-gray-500 dark:text-gray-400'
            }`
          }
        >
          <span className="text-xl leading-none">{tab.icon}</span>
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
