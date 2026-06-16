import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '../Modal';

describe('Modal', () => {
  it('renders nothing when open=false', () => {
    const { container } = render(
      <Modal open={false} title="Test" onConfirm={vi.fn()} onCancel={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders title when open=true', () => {
    render(
      <Modal open title="Mi título" onConfirm={vi.fn()} onCancel={vi.fn()} />,
    );
    expect(screen.getByText('Mi título')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(
      <Modal open title="T" description="Descripción del modal" onConfirm={vi.fn()} onCancel={vi.fn()} />,
    );
    expect(screen.getByText('Descripción del modal')).toBeInTheDocument();
  });

  it('clicking confirm button calls onConfirm', () => {
    const onConfirm = vi.fn();
    render(
      <Modal open title="T" confirmLabel="Confirmar" onConfirm={onConfirm} onCancel={vi.fn()} />,
    );
    fireEvent.click(screen.getByText('Confirmar'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('clicking cancel button calls onCancel', () => {
    const onCancel = vi.fn();
    render(
      <Modal open title="T" cancelLabel="Cancelar" onConfirm={vi.fn()} onCancel={onCancel} />,
    );
    fireEvent.click(screen.getByText('Cancelar'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('pressing Escape key calls onCancel', () => {
    const onCancel = vi.fn();
    render(
      <Modal open title="T" onConfirm={vi.fn()} onCancel={onCancel} />,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('clicking backdrop calls onCancel', () => {
    const onCancel = vi.fn();
    render(
      <Modal open title="T" onConfirm={vi.fn()} onCancel={onCancel} />,
    );
    // The backdrop is the absolute inset-0 div inside the dialog
    const dialog = screen.getByRole('dialog');
    // The backdrop is the first child of the dialog
    const backdrop = dialog.querySelector('.absolute.inset-0');
    expect(backdrop).not.toBeNull();
    fireEvent.click(backdrop!);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('confirmVariant="danger" renders the confirm button without throwing', () => {
    expect(() =>
      render(
        <Modal open title="T" confirmLabel="Eliminar" confirmVariant="danger" onConfirm={vi.fn()} onCancel={vi.fn()} />,
      ),
    ).not.toThrow();
    expect(screen.getByText('Eliminar')).toBeInTheDocument();
  });

  it('renders children content inside the modal', () => {
    render(
      <Modal open title="T" onConfirm={vi.fn()} onCancel={vi.fn()}>
        <p>Contenido del modal</p>
      </Modal>,
    );
    expect(screen.getByText('Contenido del modal')).toBeInTheDocument();
  });
});
