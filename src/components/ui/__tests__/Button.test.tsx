import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('renders children text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disabled button does not call onClick', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick} disabled>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('disabled button has disabled attribute', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('primary variant renders without throwing', () => {
    expect(() => render(<Button variant="primary">Primary</Button>)).not.toThrow();
  });

  it('secondary variant renders without throwing', () => {
    expect(() => render(<Button variant="secondary">Secondary</Button>)).not.toThrow();
  });

  it('ghost variant renders without throwing', () => {
    expect(() => render(<Button variant="ghost">Ghost</Button>)).not.toThrow();
  });

  it('danger variant renders without throwing', () => {
    expect(() => render(<Button variant="danger">Danger</Button>)).not.toThrow();
  });

  it('sm size renders without throwing', () => {
    expect(() => render(<Button size="sm">Small</Button>)).not.toThrow();
  });

  it('md size renders without throwing', () => {
    expect(() => render(<Button size="md">Medium</Button>)).not.toThrow();
  });

  it('lg size renders without throwing', () => {
    expect(() => render(<Button size="lg">Large</Button>)).not.toThrow();
  });
});
