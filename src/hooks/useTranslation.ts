import { useSyncExternalStore } from 'react';
import { settingsStorage } from '../lib/storage';
import { t as translate, tTag as translateTag, type TranslationKey } from '../lib/i18n';
import type { Language } from '../lib/types';

export function useTranslation() {
  const settings = useSyncExternalStore(settingsStorage.subscribe, settingsStorage.get);
  const lang: Language = settings?.language ?? 'es';
  return {
    t: (key: TranslationKey, vars?: Record<string, string | number>) =>
      translate(key, lang, vars),
    tTag: (tag: string) => translateTag(tag, lang),
    lang,
  };
}
