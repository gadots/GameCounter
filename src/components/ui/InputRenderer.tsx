import type { InputDef, InputValues } from '../../lib/types';

interface Props {
  inputs: InputDef[];
  values: InputValues;
  onChange: (id: string, value: number | boolean) => void;
  disabled?: boolean;
  takenBy?: Record<string, string>; // inputId → player name that claimed it
}

export function InputRenderer({ inputs, values, onChange, disabled, takenBy }: Props) {
  return (
    <div className="space-y-3">
      {inputs.map(input => (
        <InputField
          key={input.id}
          def={input}
          value={values[input.id] ?? (input.default ?? (input.type === 'toggle' ? false : 0))}
          onChange={val => onChange(input.id, val)}
          disabled={disabled}
          takenByPlayer={takenBy?.[input.id]}
        />
      ))}
    </div>
  );
}

interface FieldProps {
  def: InputDef;
  value: number | boolean;
  onChange: (val: number | boolean) => void;
  disabled?: boolean;
  takenByPlayer?: string;
}

function InputField({ def, value, onChange, disabled, takenByPlayer }: FieldProps) {
  const effectiveDisabled = disabled || !!takenByPlayer;
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{def.label}</span>
        {takenByPlayer ? (
          <p className="text-xs text-amber-500 dark:text-amber-400 mt-0.5">Asignado a {takenByPlayer}</p>
        ) : def.description && (
          <p className="text-xs text-gray-400 mt-0.5">{def.description}</p>
        )}
      </div>
      <div className="shrink-0">
        {def.type === 'toggle' && (
          <Toggle value={value as boolean} onChange={onChange} disabled={effectiveDisabled} label={def.label} />
        )}
        {def.type === 'stepper' && (
          <Stepper value={value as number} def={def} onChange={onChange} disabled={effectiveDisabled} />
        )}
        {def.type === 'number' && (
          <NumberField value={value as number} def={def} onChange={onChange} disabled={effectiveDisabled} />
        )}
        {def.type === 'select' && (
          <SelectField value={value as number} def={def} onChange={onChange} disabled={effectiveDisabled} />
        )}
      </div>
    </div>
  );
}

function Toggle({ value, onChange, disabled, label }: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${value ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

function Stepper({ value, def, onChange, disabled }: { value: number; def: InputDef; onChange: (v: number) => void; disabled?: boolean }) {
  const min = def.min ?? 0;
  const max = def.max ?? Infinity;

  return (
    <div role="group" aria-label={def.label} className="flex items-center gap-2">
      <button
        type="button"
        aria-label={`Restar ${def.label}`}
        disabled={disabled || value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 font-bold text-lg"
      >
        −
      </button>
      <span aria-live="polite" className="w-8 text-center text-base font-semibold tabular-nums text-gray-800 dark:text-gray-100">
        {value}
      </span>
      <button
        type="button"
        aria-label={`Sumar ${def.label}`}
        disabled={disabled || value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 font-bold text-lg"
      >
        +
      </button>
    </div>
  );
}

function NumberField({ value, def, onChange, disabled }: { value: number; def: InputDef; onChange: (v: number) => void; disabled?: boolean }) {
  return (
    <input
      type="number"
      aria-label={def.label}
      value={value}
      min={def.min}
      max={def.max}
      disabled={disabled}
      onChange={e => onChange(Number(e.target.value))}
      className="w-20 text-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-2 py-1 text-sm disabled:opacity-50"
    />
  );
}

function SelectField({ value, def, onChange, disabled }: { value: number; def: InputDef; onChange: (v: number) => void; disabled?: boolean }) {
  return (
    <select
      aria-label={def.label}
      value={value}
      disabled={disabled}
      onChange={e => onChange(Number(e.target.value))}
      className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-2 py-1 text-sm disabled:opacity-50"
    >
      {(def.options ?? []).map((opt, i) => (
        <option key={opt} value={i}>{opt}</option>
      ))}
    </select>
  );
}
