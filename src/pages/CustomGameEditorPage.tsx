import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trash2, Plus, GripVertical } from 'lucide-react';
import { customGamesStorage, installedGamesStorage } from '../lib/storage';
import { useCustomGames } from '../hooks/useCustomGames';
import type { CustomGameDef, ScoringRule, ScoringMode } from '../lib/types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/layout/PageHeader';

type InputType = 'number' | 'stepper' | 'toggle';

interface InputRow {
  _key: string;
  id: string;
  label: string;
  type: InputType;
  min: string;
  max: string;
  description: string;
  multiplier: string;
}

interface FormState {
  name: string;
  min_players: number;
  max_players: number;
  scoring_mode: ScoringMode;
  has_target: boolean;
  target_score: string;
  inputs: InputRow[];
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').slice(0, 40);
}

function makeKey() {
  return Math.random().toString(36).slice(2);
}

function blankRow(): InputRow {
  return { _key: makeKey(), id: '', label: '', type: 'number', min: '', max: '', description: '', multiplier: '1' };
}

function defaultForm(): FormState {
  return {
    name: '',
    min_players: 2,
    max_players: 4,
    scoring_mode: 'end_of_game',
    has_target: false,
    target_score: '',
    inputs: [blankRow()],
  };
}

function defToForm(def: CustomGameDef): FormState {
  return {
    name: def.name,
    min_players: def.min_players,
    max_players: def.max_players,
    scoring_mode: def.scoring_mode,
    has_target: def.target_score != null,
    target_score: def.target_score?.toString() ?? '',
    inputs: def.inputs.map((inp, _i) => ({
      _key: makeKey(),
      id: inp.id,
      label: inp.label,
      type: inp.type as InputType,
      min: inp.min?.toString() ?? '',
      max: inp.max?.toString() ?? '',
      description: inp.description ?? '',
      multiplier: (def.scoring_rules.find(r => r.input_id === inp.id)?.multiplier ?? 1).toString(),
    })),
  };
}

function validate(form: FormState): string | null {
  if (!form.name.trim()) return 'El nombre del juego es obligatorio.';
  if (form.min_players < 1) return 'Mínimo 1 jugador.';
  if (form.max_players < form.min_players) return 'Máximo debe ser ≥ mínimo.';
  if (form.inputs.length === 0) return 'Necesitás al menos un campo de puntuación.';
  const ids = new Set<string>();
  for (const row of form.inputs) {
    if (!row.label.trim()) return 'Todos los campos deben tener una etiqueta.';
    const id = row.id.trim() || slugify(row.label);
    if (!id) return 'No se puede generar un ID para un campo.';
    if (ids.has(id)) return `ID duplicado: "${id}". Cambiá el nombre de uno de los campos.`;
    ids.add(id);
  }
  return null;
}

function formToDef(form: FormState, existingId?: string): CustomGameDef {
  const now = new Date().toISOString();
  const id = existingId ?? `custom_${slugify(form.name)}_${Date.now()}`;
  const inputs = form.inputs.map(row => {
    const inp: CustomGameDef['inputs'][number] = {
      id: row.id.trim() || slugify(row.label),
      label: row.label.trim(),
      type: row.type,
    };
    if (row.min !== '') inp.min = Number(row.min);
    if (row.max !== '') inp.max = Number(row.max);
    if (row.description.trim()) inp.description = row.description.trim();
    if (row.type === 'toggle') inp.default = false;
    if (row.type === 'stepper') inp.default = row.min !== '' ? Number(row.min) : 0;
    return inp;
  });
  const scoring_rules: ScoringRule[] = inputs.map((inp, i) => ({
    input_id: inp.id,
    multiplier: Number(form.inputs[i].multiplier) || 1,
  }));
  return {
    id,
    name: form.name.trim(),
    min_players: form.min_players,
    max_players: form.max_players,
    scoring_mode: form.scoring_mode,
    target_score: form.has_target && form.target_score ? Number(form.target_score) : undefined,
    inputs,
    scoring_rules,
    created_at: existingId ? (customGamesStorage.getById(existingId)?.created_at ?? now) : now,
    updated_at: now,
  };
}

export function CustomGameEditorPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { saveGame } = useCustomGames();
  const isEdit = !!id;

  const [form, setForm] = useState<FormState>(defaultForm);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const def = customGamesStorage.getById(id);
      if (def) setForm(defToForm(def));
    }
  }, [id]);

  const setField = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm(f => ({ ...f, [key]: val }));

  const updateRow = (key: string, patch: Partial<InputRow>) =>
    setForm(f => ({ ...f, inputs: f.inputs.map(r => r._key === key ? { ...r, ...patch } : r) }));

  const addRow = () => setForm(f => ({ ...f, inputs: [...f.inputs, blankRow()] }));

  const removeRow = (key: string) =>
    setForm(f => ({ ...f, inputs: f.inputs.filter(r => r._key !== key) }));

  const handleLabelChange = (key: string, label: string) => {
    const row = form.inputs.find(r => r._key === key)!;
    const autoId = !row.id || row.id === slugify(row.label);
    updateRow(key, { label, ...(autoId ? { id: slugify(label) } : {}) });
  };

  const handleSave = () => {
    const err = validate(form);
    if (err) { setError(err); return; }
    setError(null);
    const def = formToDef(form, id);
    saveGame(def);
    installedGamesStorage.install(def.id);
    navigate('/library');
  };

  const handleDelete = () => {
    if (!id) return;
    customGamesStorage.remove(id);
    installedGamesStorage.uninstall(id);
    navigate('/library');
  };

  const multiplierHint = (type: InputType) =>
    type === 'toggle'
      ? 'Puntos si está activo'
      : 'Multiplicador (puede ser negativo para penalizaciones)';

  return (
    <div className="p-4 space-y-4 pb-10">
      <PageHeader title={isEdit ? 'Editar juego' : 'Nuevo juego'} backPath="/library" />

      {/* Metadata */}
      <Card className="space-y-4">
        <p className="text-xs font-semibold text-gray-400 uppercase">Datos del juego</p>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Nombre</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setField('name', e.target.value)}
            placeholder="Mi juego de mesa"
            className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1 space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Mín. jugadores</label>
            <input
              type="number"
              min={1} max={20}
              value={form.min_players}
              onChange={e => setField('min_players', Math.max(1, Number(e.target.value)))}
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-3 py-2 text-sm text-center"
            />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Máx. jugadores</label>
            <input
              type="number"
              min={1} max={20}
              value={form.max_players}
              onChange={e => setField('max_players', Math.max(form.min_players, Number(e.target.value)))}
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-3 py-2 text-sm text-center"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Modo de puntuación</label>
          <div className="flex gap-2">
            {(['end_of_game', 'per_round'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setField('scoring_mode', mode)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                  form.scoring_mode === mode
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                {mode === 'end_of_game' ? 'Al final' : 'Por ronda'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            role="switch"
            aria-checked={form.has_target}
            onClick={() => setField('has_target', !form.has_target)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.has_target ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}
          >
            <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${form.has_target ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Puntaje objetivo</label>
          {form.has_target && (
            <input
              type="number"
              min={1}
              value={form.target_score}
              onChange={e => setField('target_score', e.target.value)}
              placeholder="ej: 100"
              className="w-24 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-3 py-1.5 text-sm text-center"
            />
          )}
        </div>
      </Card>

      {/* Inputs */}
      <Card className="space-y-3">
        <p className="text-xs font-semibold text-gray-400 uppercase">Campos de puntuación</p>
        <p className="text-xs text-gray-400">El puntaje final es la suma de (valor × multiplicador) para cada campo.</p>

        <div className="space-y-3">
          {form.inputs.map((row, idx) => (
            <div key={row._key} className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <GripVertical size={16} className="text-gray-300 dark:text-gray-600 shrink-0" />
                <span className="text-xs font-semibold text-gray-400 w-5">{idx + 1}</span>
                <input
                  type="text"
                  placeholder="Etiqueta (ej: Puntos de ciudad)"
                  value={row.label}
                  onChange={e => handleLabelChange(row._key, e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-2.5 py-1.5 text-sm"
                />
                <button
                  onClick={() => removeRow(row._key)}
                  disabled={form.inputs.length === 1}
                  className="p-1.5 text-gray-400 hover:text-red-400 disabled:opacity-30 transition-colors"
                  aria-label="Eliminar campo"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex gap-2 pl-7">
                <div className="flex-1 space-y-0.5">
                  <p className="text-xs text-gray-400">Tipo</p>
                  <select
                    value={row.type}
                    onChange={e => updateRow(row._key, { type: e.target.value as InputType })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-2 py-1.5 text-sm"
                  >
                    <option value="number">Número libre</option>
                    <option value="stepper">Contador +/−</option>
                    <option value="toggle">Sí / No</option>
                  </select>
                </div>
                <div className="w-24 space-y-0.5">
                  <p className="text-xs text-gray-400">{multiplierHint(row.type)}</p>
                  <input
                    type="number"
                    value={row.multiplier}
                    onChange={e => updateRow(row._key, { multiplier: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-2 py-1.5 text-sm text-center"
                  />
                </div>
              </div>

              {row.type !== 'toggle' && (
                <div className="flex gap-2 pl-7">
                  <div className="flex-1 space-y-0.5">
                    <p className="text-xs text-gray-400">Mínimo (opcional)</p>
                    <input
                      type="number"
                      value={row.min}
                      onChange={e => updateRow(row._key, { min: e.target.value })}
                      placeholder="0"
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-2 py-1.5 text-sm text-center"
                    />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <p className="text-xs text-gray-400">Máximo (opcional)</p>
                    <input
                      type="number"
                      value={row.max}
                      onChange={e => updateRow(row._key, { max: e.target.value })}
                      placeholder="∞"
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-2 py-1.5 text-sm text-center"
                    />
                  </div>
                </div>
              )}

              <div className="pl-7">
                <input
                  type="text"
                  placeholder="Descripción (opcional)"
                  value={row.description}
                  onChange={e => updateRow(row._key, { description: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-2.5 py-1.5 text-sm text-gray-500 dark:text-gray-400"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addRow}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-sm text-gray-500 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors"
        >
          <Plus size={16} />
          Agregar campo
        </button>
      </Card>

      {error && (
        <p className="text-sm text-red-500 dark:text-red-400 text-center">{error}</p>
      )}

      <Button className="w-full" size="lg" onClick={handleSave}>
        {isEdit ? 'Guardar cambios' : 'Crear juego'}
      </Button>

      {isEdit && (
        <button
          onClick={handleDelete}
          className="w-full text-sm text-red-400 hover:text-red-600 dark:hover:text-red-300 py-1 transition-colors"
        >
          Eliminar juego
        </button>
      )}
    </div>
  );
}
