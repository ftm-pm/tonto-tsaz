import { DAWG } from '../loaders/dawg';

export const autoTypos: number[] = [4, 9];

/**
 * Взято из https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
 *
 * @param obj
 * @returns {ReadonlyArray<any>}
 */
export function deepFreeze(obj: any) {
  if (!('freeze' in Object)) {
    return;
  }

  const propNames = Object.getOwnPropertyNames(obj);
  propNames.forEach(name => {
    const prop = obj[name];

    if (typeof prop === 'object' && prop !== null) {
      this.deepFreeze(prop);
    }
  });

  return Object.freeze(obj);
}

/**
 * Get dictionary score
 *
 * @param stutterCnt
 * @param typosCnt
 * @returns {number}
 */
export function getDictionaryScore(stutterCnt, typosCnt): number {
  return Math.pow(0.3, typosCnt) * Math.pow(0.6, Math.min(stutterCnt, 1));
}

/**
 * Lookup
 *
 * @param {DAWG} dawg
 * @param {string} word
 * @param config
 * @returns {any}
 */
export function lookup(dawg: DAWG, word: string, config: any) {
  let entries;
  if (config.typos === 'auto') {
    entries = dawg.findAll(word, config.replacements, config.stutter, 0);
    for (let i = 0; i < autoTypos.length && !entries.length && word.length > autoTypos[i]; i++) {
      entries = dawg.findAll(word, config.replacements, config.stutter, i + 1);
    }
  } else {
    entries = dawg.findAll(word, config.replacements, config.stutter, config.typos);
  }
  return entries;
}
