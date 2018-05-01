import { DictionaryParser } from './dictionary-parser';
import { ParserInterface } from './parser';

/**
 * PrefixUnknown
 */
export class PrefixUnknown implements ParserInterface {
  /**
   * DictionaryParser
   */
  private readonly dictionaryParser: DictionaryParser;

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
   * Constructor PrefixUnknown
   */
  public constructor(dictionaryParser: DictionaryParser) {
    this.dictionaryParser = dictionaryParser;
  }

  public parse(word: string, config: any = {}): any[] {
    const parses = [];
    word = word.toLocaleLowerCase();
    for (let len = 1; len <= 5; len++) {
      if (word.length - len < 3) {
        break;
      }
      const end = word.substr(len);
      const rightParts = this.dictionaryParser.parse(end, config);
      for (const right of rightParts) {
        if (!right.tag.isProductive()) {
          continue;
        }
        if (!config.ignoreCase && right.tag.isCapitalized() && !PrefixUnknown.isCapitalized(word, config)) {
          continue;
        }
        right.score *= 0.3;
        right.prefix = word.substr(0, len);
        parses.push(right);
      }
    }

    return parses;
  }
}
