import { describe, it, expect } from 'vitest';
import { getGameModules, getGameModule, loadAllModules } from '../gameLoader';

// Built-ins are cached; custom games are merged fresh each call.

describe('getGameModules', () => {
  it('returns a non-empty array of game modules', () => {
    const modules = getGameModules();
    expect(Array.isArray(modules)).toBe(true);
    expect(modules.length).toBeGreaterThan(0);
  });

  it('returns equivalent content on repeated calls', () => {
    const first = getGameModules();
    const second = getGameModules();
    expect(first).toStrictEqual(second);
  });

  it('every module has metadata.id as a string', () => {
    const modules = getGameModules();
    modules.forEach(m => {
      expect(typeof m.metadata.id).toBe('string');
      expect(m.metadata.id.length).toBeGreaterThan(0);
    });
  });

  it('every module has metadata.name as a string', () => {
    const modules = getGameModules();
    modules.forEach(m => {
      expect(typeof m.metadata.name).toBe('string');
      expect(m.metadata.name.length).toBeGreaterThan(0);
    });
  });

  it('every module has an inputs array', () => {
    const modules = getGameModules();
    modules.forEach(m => {
      expect(Array.isArray(m.inputs)).toBe(true);
    });
  });

  it('every module has a score function', () => {
    const modules = getGameModules();
    modules.forEach(m => {
      expect(typeof m.score).toBe('function');
    });
  });
});

describe('getGameModule', () => {
  it('returns the Catan module when queried by id', () => {
    const mod = getGameModule('catan');
    expect(mod).not.toBeNull();
    expect(mod!.metadata.id).toBe('catan');
    expect(mod!.metadata.name).toBe('Catan');
  });

  it('returns null for a nonexistent game id', () => {
    const mod = getGameModule('nonexistent-game-xyz');
    expect(mod).toBeNull();
  });

  it('returned catan module has expected inputs', () => {
    const mod = getGameModule('catan');
    expect(mod!.inputs.length).toBeGreaterThan(0);
    const inputIds = mod!.inputs.map(i => i.id);
    expect(inputIds).toContain('settlements');
    expect(inputIds).toContain('cities');
  });

  it('catan score function returns expected value', () => {
    const mod = getGameModule('catan');
    const score = mod!.score(
      { settlements: 2, cities: 1, longest_road: false, largest_army: false, vp_cards: 0 },
      { round: 1 }
    );
    // 2 settlements * 1 + 1 city * 2 = 4
    expect(score).toBe(4);
  });
});

describe('loadAllModules', () => {
  it('returns an array of valid game modules', () => {
    const modules = loadAllModules();
    expect(Array.isArray(modules)).toBe(true);
    expect(modules.length).toBeGreaterThan(0);
  });

  it('all loaded modules satisfy the GameModule contract', () => {
    const modules = loadAllModules();
    modules.forEach(m => {
      expect(typeof m.metadata.id).toBe('string');
      expect(typeof m.metadata.name).toBe('string');
      expect(Array.isArray(m.inputs)).toBe(true);
      expect(typeof m.score).toBe('function');
    });
  });
});
