import type { HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  padding?: boolean;
}

export function Card({ padding = true, className = '', children, ...props }: Props) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm ${padding ? 'p-4' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
