import { DictionaryParse } from './dictionary-parse';
import { ParserInterface } from './parser';
import { Tag } from './tag';

/**
 * SuffixKnown
 */
export class SuffixKnown implements ParserInterface {
  public static prefixes: string[] = [ '', 'по', 'наи' ];

  /**
   * Paradigms
   */
  private readonly paradigms: any;

  /**
   * Tags
   */
  private readonly tags: Tag[];

  /**
   * Suffixes
   */
  private readonly suffixes: any[];

  /**
   * predictionSuffixes
   */
  private readonly predictionSuffixes: any[];

  private readonly coeffs: number[] = [0, 0.2, 0.3, 0.4, 0.5, 0.6];

  /**
   * Is capitalized
   *
   * @param {string} word
   * @param config
   * @returns {boolean}
   */
  public static isCapitalized(word: string, config: any): boolean {
    return !config.ignoreCase && word.length && (word[0].toLocaleLowerCase() !== word[0]) &&
      (word.substr(1).toLocaleUpperCase() !== word.substr(1));
  }

  /**
   * Constructor SuffixKnown
   *
   * @param paradigms
   * @param {Tag[]} tags
   * @param {any[]} suffixes
   * @param {any[]} predictionSuffixes
   */
  public constructor(paradigms: any, tags: Tag[], suffixes: any[], predictionSuffixes: any[]) {
    this.paradigms = paradigms;
    this.tags = tags;
    this.suffixes = suffixes;
    this.predictionSuffixes = predictionSuffixes;
  }

  public parse(word: string, config: any = {}): any[] {
    let parses = [];

    word = word.toLocaleLowerCase();
    let minlen = 1;
    const used = {};

    for (const prefixIndex of Object.keys(SuffixKnown.prefixes)) {
      const prefix = SuffixKnown.prefixes[prefixIndex];
      if (prefix.length && (word.substr(0, prefix.length) !== prefix)) {
        continue;
      }
      const base = word.substr(prefix.length);
      for (let len = 5; len >= minlen; len--) {
        if (len >= base.length) {
          continue;
        }
        const leftParts = base.substr(0, base.length - len);
        const rightParts = base.substr(base.length - len);
        const entries = this.predictionSuffixes[prefixIndex].findAll(rightParts, config.replacements, 0, 0);
        if (!entries) {
          continue;
        }

        const p = [];
        let max = 1;
        for (const entry of entries) {
          const suffix = entry[0];
          const stats = entry[1];

          for (const stat of stats) {
            const parse = DictionaryParse.createDictionaryParse(
              this.paradigms,
              this.tags,
              this.suffixes,
              prefix + leftParts + suffix,
              stat[1],
              stat[2]);
            // Why there is even non-productive forms in suffix DAWGs?
            if (!parse.tag.isProductive()) {
              continue;
            }
            if (!config.ignoreCase && parse.tag.isCapitalized() && !SuffixKnown.isCapitalized(word, config)) {
              continue;
            }
            const key = parse.toString() + ':' + stat[1] + ':' + stat[2];
            if (key in used) {
              continue;
            }
            max = Math.max(max, stat[0]);
            parse.score = stat[0] * this.coeffs[len];
            p.push(parse);
            used[key] = true;
          }
        }
        if (p.length > 0) {
          for (const item of p) {
            item.score /= max;
          }
          parses = parses.concat(p);
          // Check also suffixes 1 letter shorter
          minlen = Math.max(len - 1, 1);
        }
      }
    }

    return parses;
  }
}
