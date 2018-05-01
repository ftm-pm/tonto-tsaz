import { DAWG } from '../loaders/dawg';
import { lookup } from '../utils/utils';
import { DictionaryParse } from './dictionary-parse';
import { ParserInterface } from './parser';
import { Tag } from './tag';

/**
 * DictionaryParser
 */
export class DictionaryParser implements ParserInterface {
  /**
   * Words
   */
  private readonly words: DAWG;

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
   * Constructor DictionaryParser
   *
   * @param {DAWG} words
   * @param paradigms
   * @param {Tag[]} tags
   * @param {any[]} suffixes
   */
  public constructor(words: DAWG, paradigms: any, tags: Tag[], suffixes: any[]) {
    this.words = words;
    this.paradigms = paradigms;
    this.tags = tags;
    this.suffixes = suffixes;
  }

  public parse(word: string, config: any): any {
    const isCapitalized = DictionaryParser.isCapitalized(word, config);
    word = word.toLocaleLowerCase();
    const opts = lookup(this.words, word, config);

    const parses: DictionaryParse[] = [];
    for (const opt of opts) {
      for (const j of Object.keys(opt)) {
        const dictornaryParse: DictionaryParse = DictionaryParse.createDictionaryParse(
          this.paradigms, this.tags, this.suffixes, opt[0], opt[1][j][0], opt[1][j][1], opt[2], opt[3]);
        if (config.ignoreCase || !dictornaryParse.tag.isCapitalized() || isCapitalized) {
          parses.push(dictornaryParse);
        }
      }
    }

    return parses;
  }
}
