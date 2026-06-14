import { useCallback, useSyncExternalStore } from 'react';
import { settingsStorage } from '../lib/storage';
import { applyTheme } from '../lib/theme';
import type { AppSettings } from '../lib/types';

export function useSettings() {
  const settings = useSyncExternalStore(settingsStorage.subscribe, settingsStorage.get);

  const update = useCallback((patch: Partial<AppSettings>) => {
    settingsStorage.update(patch);
    if (patch.theme) applyTheme(patch.theme);
  }, []);

  return { settings, update };
}
