import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSettings } from '../../hooks/useSettings';
import { resetStorageCache } from '../../lib/storage';

// jsdom does not implement window.matchMedia — provide a minimal stub
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

beforeEach(() => {
  localStorage.clear();
  resetStorageCache();
});

describe('useSettings', () => {
  it('returns default settings on initial render', () => {
    const { result } = renderHook(() => useSettings());
    expect(result.current.settings.theme).toBe('system');
    expect(result.current.settings.show_running_totals).toBe(true);
  });

  it('update changes theme to dark', () => {
    const { result } = renderHook(() => useSettings());
    act(() => { result.current.update({ theme: 'dark' }); });
    expect(result.current.settings.theme).toBe('dark');
  });

  it('update changes theme to light', () => {
    const { result } = renderHook(() => useSettings());
    act(() => { result.current.update({ theme: 'light' }); });
    expect(result.current.settings.theme).toBe('light');
  });

  it('update can change theme back to system', () => {
    const { result } = renderHook(() => useSettings());
    act(() => { result.current.update({ theme: 'dark' }); });
    act(() => { result.current.update({ theme: 'system' }); });
    expect(result.current.settings.theme).toBe('system');
  });

  it('multiple updates are merged, not replaced', () => {
    const { result } = renderHook(() => useSettings());
    act(() => { result.current.update({ theme: 'dark' }); });
    act(() => { result.current.update({ show_running_totals: false }); });
    expect(result.current.settings.theme).toBe('dark');
    expect(result.current.settings.show_running_totals).toBe(false);
  });

  it('update show_running_totals to false', () => {
    const { result } = renderHook(() => useSettings());
    act(() => { result.current.update({ show_running_totals: false }); });
    expect(result.current.settings.show_running_totals).toBe(false);
  });

  it('settings object has both theme and show_running_totals keys', () => {
    const { result } = renderHook(() => useSettings());
    expect(result.current.settings).toHaveProperty('theme');
    expect(result.current.settings).toHaveProperty('show_running_totals');
  });
});
