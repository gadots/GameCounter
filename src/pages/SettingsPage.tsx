import { useState, useRef } from 'react';
import { playersStorage, sessionsStorage, installedGamesStorage, customGamesStorage } from '../lib/storage';
import { applyTheme } from '../lib/theme';
import { validateBackup, type BackupData } from '../lib/backup';
import { useSettings } from '../hooks/useSettings';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { PageHeader } from '../components/layout/PageHeader';
import type { AppSettings } from '../lib/types';

interface ExportOptions {
  players: boolean;
  sessions: boolean;
  custom_games: boolean;
  settings: boolean;
}

export function SettingsPage() {
  const { settings, update } = useSettings();
  const [exported, setExported] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [pendingImport, setPendingImport] = useState<BackupData | null>(null);
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    players: true,
    sessions: true,
    custom_games: true,
    settings: true,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = ev => {
      const result = validateBackup(ev.target?.result as string);
      if (!result.ok) {
        setImportError(result.error);
        return;
      }
      setPendingImport(result.data);
    };
    reader.readAsText(file);
  };

  const applyImport = (data: BackupData) => {
    playersStorage.save(data.players);
    sessionsStorage.save(data.sessions);
    if (data.installed_games) installedGamesStorage.save(data.installed_games);
    if (data.custom_games) data.custom_games.forEach(g => customGamesStorage.upsert(g));
    if (data.settings) {
      update(data.settings);
      applyTheme(data.settings.theme ?? 'system');
    }
    setPendingImport(null);
  };

  const updateTheme = (theme: AppSettings['theme']) => {
    update({ theme });
  };

  const updateShowTotals = (show_running_totals: boolean) => {
    update({ show_running_totals });
  };

  const toggleExportOption = (key: keyof ExportOptions) =>
    setExportOptions(o => ({ ...o, [key]: !o[key] }));

  const handleExport = () => {
    const data: Record<string, unknown> = {
      exported_at: new Date().toISOString(),
      version: 1,
      players: exportOptions.players ? playersStorage.getAll() : [],
      sessions: exportOptions.sessions ? sessionsStorage.getAll() : [],
      installed_games: installedGamesStorage.getAll(),
    };
    if (exportOptions.custom_games) data.custom_games = customGamesStorage.getAll();
    if (exportOptions.settings) data.settings = settings;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gamecounter-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportOptions(false);
    setExported(true);
    setTimeout(() => setExported(false), 2500);
  };

  return (
    <div className="p-4 space-y-6">
      <PageHeader title="Configuración" backPath="/home" showSettings={false} />

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
            onClick={() => setShowExportOptions(true)}
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

        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={() => setShowDeleteAll(true)}
            className="w-full py-2 rounded-lg text-sm font-medium text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 active:bg-red-100 dark:active:bg-red-900/40 transition-colors"
          >
            Borrar todos los datos
          </button>
          <p className="text-xs text-gray-400 mt-1.5 text-center">Borra partidas y jugadores. No afecta la librería.</p>
        </div>
      </Card>

      <Modal
        open={showExportOptions}
        title="¿Qué querés exportar?"
        confirmLabel="Descargar"
        cancelLabel="Cancelar"
        onConfirm={handleExport}
        onCancel={() => setShowExportOptions(false)}
      >
        <div className="space-y-3 py-1">
          {(
            [
              { key: 'players', label: 'Jugadores', desc: `${playersStorage.getAll().length} jugadores` },
              { key: 'sessions', label: 'Partidas', desc: `${sessionsStorage.getAll().length} partidas` },
              { key: 'custom_games', label: 'Mis juegos', desc: `${customGamesStorage.getAll().length} juegos personalizados` },
              { key: 'settings', label: 'Preferencias', desc: 'Tema y ajustes de la app' },
            ] as { key: keyof ExportOptions; label: string; desc: string }[]
          ).map(({ key, label, desc }) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={exportOptions[key]}
                onChange={() => toggleExportOption(key)}
                className="w-4 h-4 rounded accent-indigo-600"
              />
              <span className="flex-1">
                <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{label}</span>
                <span className="text-xs text-gray-400 ml-1.5">{desc}</span>
              </span>
            </label>
          ))}
        </div>
      </Modal>

      <Modal
        open={showDeleteAll}
        title="¿Borrar todos los datos?"
        description="Se van a eliminar todas las partidas y jugadores. Los juegos instalados no se tocan. Esta acción no se puede deshacer."
        confirmLabel="Borrar todo"
        cancelLabel="Cancelar"
        confirmVariant="danger"
        onConfirm={() => {
          sessionsStorage.save([]);
          playersStorage.save([]);
          setShowDeleteAll(false);
        }}
        onCancel={() => setShowDeleteAll(false)}
      />

      <Modal
        open={pendingImport !== null}
        title="¿Restaurar backup?"
        description="Esto va a reemplazar todos tus datos actuales (jugadores, partidas, ajustes) con los del archivo. No se puede deshacer."
        confirmLabel="Restaurar"
        cancelLabel="Cancelar"
        confirmVariant="danger"
        onConfirm={() => pendingImport && applyImport(pendingImport)}
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
