import '@testing-library/jest-dom';
import { beforeEach } from 'vitest';
import { resetStorageCache } from '../lib/storage';

// The storage layer caches parsed values in memory. Tests clear localStorage
// directly between cases, so drop the cache too to keep them in sync.
beforeEach(() => {
  localStorage.clear();
  resetStorageCache();
});
