import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InputRenderer } from '../InputRenderer';
import type { InputDef } from '../../../lib/types';

describe('InputRenderer — toggle', () => {
  it('renders a switch element', () => {
    const inputs: InputDef[] = [{ id: 'won', label: 'Ganó', type: 'toggle' }];
    render(<InputRenderer inputs={inputs} values={{ won: false }} onChange={vi.fn()} />);
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('aria-checked reflects current value (false)', () => {
    const inputs: InputDef[] = [{ id: 'won', label: 'Ganó', type: 'toggle' }];
    render(<InputRenderer inputs={inputs} values={{ won: false }} onChange={vi.fn()} />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('aria-checked reflects current value (true)', () => {
    const inputs: InputDef[] = [{ id: 'won', label: 'Ganó', type: 'toggle' }];
    render(<InputRenderer inputs={inputs} values={{ won: true }} onChange={vi.fn()} />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onChange with true when clicked while false', () => {
    const onChange = vi.fn();
    const inputs: InputDef[] = [{ id: 'won', label: 'Ganó', type: 'toggle' }];
    render(<InputRenderer inputs={inputs} values={{ won: false }} onChange={onChange} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith('won', true);
  });

  it('calls onChange with false when clicked while true', () => {
    const onChange = vi.fn();
    const inputs: InputDef[] = [{ id: 'won', label: 'Ganó', type: 'toggle' }];
    render(<InputRenderer inputs={inputs} values={{ won: true }} onChange={onChange} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith('won', false);
  });
});

describe('InputRenderer — stepper', () => {
  const stepperInput: InputDef[] = [{ id: 'pts', label: 'Puntos', type: 'stepper', min: 0, max: 10 }];

  it('renders + and − buttons', () => {
    render(<InputRenderer inputs={stepperInput} values={{ pts: 5 }} onChange={vi.fn()} />);
    expect(screen.getByText('+')).toBeInTheDocument();
    expect(screen.getByText('−')).toBeInTheDocument();
  });

  it('clicking + calls onChange with value+1', () => {
    const onChange = vi.fn();
    render(<InputRenderer inputs={stepperInput} values={{ pts: 5 }} onChange={onChange} />);
    fireEvent.click(screen.getByText('+'));
    expect(onChange).toHaveBeenCalledWith('pts', 6);
  });

  it('clicking − calls onChange with value-1', () => {
    const onChange = vi.fn();
    render(<InputRenderer inputs={stepperInput} values={{ pts: 5 }} onChange={onChange} />);
    fireEvent.click(screen.getByText('−'));
    expect(onChange).toHaveBeenCalledWith('pts', 4);
  });

  it('− button is disabled at min', () => {
    render(<InputRenderer inputs={stepperInput} values={{ pts: 0 }} onChange={vi.fn()} />);
    expect(screen.getByText('−').closest('button')).toBeDisabled();
  });

  it('+ button is disabled at max', () => {
    render(<InputRenderer inputs={stepperInput} values={{ pts: 10 }} onChange={vi.fn()} />);
    expect(screen.getByText('+').closest('button')).toBeDisabled();
  });
});

describe('InputRenderer — number', () => {
  const numberInput: InputDef[] = [{ id: 'score', label: 'Puntaje', type: 'number' }];

  it('renders an input of type number', () => {
    render(<InputRenderer inputs={numberInput} values={{ score: 0 }} onChange={vi.fn()} />);
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
  });

  it('changing value calls onChange with the numeric value', () => {
    const onChange = vi.fn();
    render(<InputRenderer inputs={numberInput} values={{ score: 0 }} onChange={onChange} />);
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '42' } });
    expect(onChange).toHaveBeenCalledWith('score', 42);
  });
});

describe('InputRenderer — select', () => {
  const selectInput: InputDef[] = [
    { id: 'pos', label: 'Posición', type: 'select', options: ['1°', '2°', '3°'] },
  ];

  it('renders a select element', () => {
    render(<InputRenderer inputs={selectInput} values={{ pos: 0 }} onChange={vi.fn()} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('changing option calls onChange with the index', () => {
    const onChange = vi.fn();
    render(<InputRenderer inputs={selectInput} values={{ pos: 0 }} onChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '2' } });
    expect(onChange).toHaveBeenCalledWith('pos', 2);
  });
});

describe('InputRenderer — takenBy', () => {
  it('shows "Asignado a [name]" text when takenBy is provided', () => {
    const inputs: InputDef[] = [{ id: 'won', label: 'Ganó', type: 'toggle' }];
    render(
      <InputRenderer
        inputs={inputs}
        values={{ won: false }}
        onChange={vi.fn()}
        takenBy={{ won: 'Ana' }}
      />,
    );
    expect(screen.getByText('Asignado a Ana')).toBeInTheDocument();
  });

  it('disables the toggle when takenBy is provided', () => {
    const inputs: InputDef[] = [{ id: 'won', label: 'Ganó', type: 'toggle' }];
    render(
      <InputRenderer
        inputs={inputs}
        values={{ won: false }}
        onChange={vi.fn()}
        takenBy={{ won: 'Ana' }}
      />,
    );
    expect(screen.getByRole('switch')).toBeDisabled();
  });

  it('shows description when no takenBy', () => {
    const inputs: InputDef[] = [
      { id: 'won', label: 'Ganó', type: 'toggle', description: 'Si ganó la partida' },
    ];
    render(<InputRenderer inputs={inputs} values={{ won: false }} onChange={vi.fn()} />);
    expect(screen.getByText('Si ganó la partida')).toBeInTheDocument();
  });
});
