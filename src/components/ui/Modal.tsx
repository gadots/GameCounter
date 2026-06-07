import type { ReactNode } from 'react';
import { Button } from './Button';

interface Props {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'primary' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
}

export function Modal({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
  children,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-xl">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
          )}
        </div>
        {children}
        <div className="flex flex-col gap-2 pt-1">
          <Button variant={confirmVariant} className="w-full" onClick={onConfirm}>
            {confirmLabel}
          </Button>
          <Button variant="ghost" className="w-full" onClick={onCancel}>
            {cancelLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
