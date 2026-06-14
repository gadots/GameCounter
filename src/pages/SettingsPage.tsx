import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { settingsStorage, playersStorage, sessionsStorage, installedGamesStorage } from '../lib/storage';
import { applyTheme } from '../lib/theme';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import type { AppSettings } from '../lib/types';

export function SettingsPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(() => settingsStorage.get());
  const [exported, setExported] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [pendingImport, setPendingImport] = useState<object | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (!data.version || !data.players || !data.sessions) {
          setImportError('El archivo no es un backup válido de GameCounter.');
          return;
        }
        setPendingImport(data);
      } catch {
        setImportError('No se pudo leer el archivo.');
      }
    };
    reader.readAsText(file);
  };

  const applyImport = (data: any) => {
    if (data.players) playersStorage.save(data.players);
    if (data.sessions) sessionsStorage.save(data.sessions);
    if (data.installed_games) installedGamesStorage.save(data.installed_games);
    if (data.settings) {
      settingsStorage.update(data.settings);
      applyTheme(data.settings.theme ?? 'system');
      setSettings(settingsStorage.get());
    }
    setPendingImport(null);
  };

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
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Datos</p>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              exported
                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                : 'bg-indigo-600 text-white active:bg-indigo-700'
            }`}
          >
            {exported ? '✓ Exportado' : 'Exportar JSON'}
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 active:bg-gray-200 dark:active:bg-gray-600"
          >
            Importar JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleImportFile}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">Exportar descarga un backup · Importar restaura partidas y jugadores</p>
      </Card>

      <Modal
        open={pendingImport !== null}
        title="¿Restaurar backup?"
        description="Esto va a reemplazar todos tus datos actuales (jugadores, partidas, ajustes) con los del archivo. No se puede deshacer."
        confirmLabel="Restaurar"
        cancelLabel="Cancelar"
        confirmVariant="danger"
        onConfirm={() => applyImport(pendingImport)}
        onCancel={() => setPendingImport(null)}
      />

      <Modal
        open={importError !== null}
        title="Error al importar"
        description={importError ?? ''}
        confirmLabel="Entendido"
        cancelLabel="Cerrar"
        onConfirm={() => setImportError(null)}
        onCancel={() => setImportError(null)}
      />
    </div>
  );
}
