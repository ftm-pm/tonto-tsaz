import { DAWG } from '../loaders/dawg';
import { getDictionaryScore, lookup } from '../utils/utils';
import { DictionaryParse, DictionaryParseConfig } from './dictionary-parse';
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
   * @param {any} paradigms
   * @param {Tag[]} tags
   */
  public constructor(words: DAWG, paradigms: any, tags: Tag[]) {
    this.words = words;
    this.paradigms = paradigms;
    this.tags = tags;
  }

  public parse(word: string, config: any): any {
    const isCapitalized = DictionaryParser.isCapitalized(word, config);
    word = word.toLocaleLowerCase();
    const opts = lookup(this.words, word, config);

    const parses: DictionaryParse[] = [];
    for (const i of opts) {
      for (const j of opts[i]) {
        const dictornaryParse: DictionaryParse = this.createDictionaryParse(
          opts[i][0], opts[i][1][j][0], opts[i][1][j][1], opts[i][2], opts[i][3]);
        if (config.ignoreCase || !dictornaryParse.tag.isCapitalized() || isCapitalized) {
          parses.push(dictornaryParse);
        }
      }
    }

    return parses;
  }

  public createDictionaryParse(word: string, paradigmIdx, formIdx, stutterCnt: number,
                               typosCnt: number = 0, prefix: string = '', suffix: string = ''): DictionaryParse {
    const formCnt: number = this.paradigms.length / 3;
    const paradigm: any = this.paradigms[paradigmIdx];
    const config: DictionaryParseConfig = <DictionaryParseConfig> {
      word: word,
      paradigmIdx: paradigmIdx,
      paradigm: paradigm,
      formIdx: formIdx,
      formCnt: formCnt,
      tag: this.tags[paradigm[formCnt + formIdx]],
      score: getDictionaryScore(stutterCnt, typosCnt),
      prefix: prefix,
      suffix: suffix
    };

    return new DictionaryParse(config);
  }
}
