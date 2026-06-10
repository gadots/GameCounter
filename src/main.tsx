import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { applyTheme } from './lib/theme'
import type { AppSettings } from './lib/types'

const stored = JSON.parse(localStorage.getItem('gc_settings') ?? '{}') as Partial<AppSettings>;
applyTheme(stored.theme ?? 'system');

if (!stored.theme || stored.theme === 'system') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    applyTheme('system');
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
