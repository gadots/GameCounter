import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { settingsStorage, playersStorage, sessionsStorage, installedGamesStorage } from '../lib/storage';
import { applyTheme } from '../lib/theme';
import { Card } from '../components/ui/Card';
import type { AppSettings } from '../lib/types';

export function SettingsPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(() => settingsStorage.get());
  const [exported, setExported] = useState(false);

  const updateTheme = (theme: AppSettings['theme']) => {
    settingsStorage.update({ theme });
    applyTheme(theme);
    setSettings(s => ({ ...s, theme }));
  };

  const updateShowTotals = (show_running_totals: boolean) => {
    settingsStorage.update({ show_running_totals });
    setSettings(s => ({ ...s, show_running_totals }));
  };

  const handleExport = () => {
    const data = {
      exported_at: new Date().toISOString(),
      version: 1,
      players: playersStorage.getAll(),
      sessions: sessionsStorage.getAll(),
      installed_games: installedGamesStorage.getAll(),
      settings: settingsStorage.get(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gamecounter-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 2500);
  };

  return (
    <div className="p-4 space-y-6">
      <button onClick={() => navigate(-1)} className="text-sm text-indigo-500 flex items-center gap-1">
        ← Volver
      </button>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configuración</h1>

      <Card>
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Tema</p>
        <div className="flex gap-2">
          {(['system', 'light', 'dark'] as const).map(t => (
            <button
              key={t}
              onClick={() => updateTheme(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                settings.theme === t
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
              }`}
            >
              {t === 'system' ? 'Sistema' : t === 'light' ? 'Claro' : 'Oscuro'}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Puntajes en vivo</p>
            <p className="text-xs text-gray-400 mt-0.5">Mostrar tabla de puntajes durante la partida</p>
          </div>
          <button
            onClick={() => updateShowTotals(!settings.show_running_totals)}
            className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
              settings.show_running_totals ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                settings.show_running_totals ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Exportar datos</p>
            <p className="text-xs text-gray-400 mt-0.5">Descargá un backup JSON de todas tus partidas y jugadores</p>
          </div>
          <button
            onClick={handleExport}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              exported
                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                : 'bg-indigo-600 text-white active:bg-indigo-700'
            }`}
          >
            {exported ? '✓ Listo' : 'Exportar'}
          </button>
        </div>
      </Card>
    </div>
  );
}
