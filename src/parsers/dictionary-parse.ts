import { getDictionaryScore } from '../utils/utils';
import { Parse, ParseConfig, ParseInterface } from './parse';
import { Tag } from './tag';

/**
 * DictionaryParseConfig
 */
export interface DictionaryParseConfig extends ParseConfig {
  prefix ?: string;
  suffix ?: string;
  paradigmIdx ?: number;
  paradigm ?: any;
  formIdx: number;
  formCnt ?: any;
  tag ?: Tag;
  score ?: number;
}

/**
 * DictionaryParse
 */
export class DictionaryParse extends Parse implements DictionaryParseConfig {
  public static prefixes = ['', 'по', 'наи'];

  public prefix: string;
  public suffix: string;
  public paradigmIdx: number;
  public paradigm: any;
  public formIdx: number;
  public formCnt: any;
  public tag: Tag;
  public score: number;
  private base: any;

  /**
   * Paradigms
   */
  private readonly paradigms: any;

  /**
   * Tags
   */
  private readonly tags: Tag[];

  /**
   * Tags
   */
  private readonly suffixes: any[];

  /**
   * @param {any[]} paradigms
   * @param {any[]} tags
   * @param {any[]} suffixes
   * @param {string} word
   * @param paradigmIdx
   * @param formIdx
   * @param {number} stutterCnt
   * @param {number} typosCnt
   * @param {string} prefix
   * @param {string} suffix
   * @param {number} score
   * @returns {DictionaryParse}
   */
  public static createDictionaryParse(paradigms: any[], tags: any[], suffixes: any[],
                                      word: string, paradigmIdx, formIdx, stutterCnt: number = 0, typosCnt: number = 0, prefix: string = '',
                                      suffix: string = '', score: number = 0): DictionaryParse {
    const formCnt: number = paradigms.length / 3;
    const paradigm: any = paradigms[paradigmIdx];
    const config: DictionaryParseConfig = <DictionaryParseConfig> {
      word: word,
      paradigmIdx: paradigmIdx,
      paradigm: paradigm,
      formIdx: formIdx,
      formCnt: formCnt,
      tag: tags[paradigm[formCnt + formIdx]],
      score: getDictionaryScore(stutterCnt, typosCnt),
      prefix: prefix,
      suffix: suffix
    };

    return new DictionaryParse(paradigms, tags, suffixes, config);
  }

  /**
   * Constructor DictionaryParse
   *
   * @param {DictionaryParseConfig} config
   * @param paradigms
   * @param tags
   * @param suffixes
   */
  public constructor(paradigms, tags, suffixes, config ?: DictionaryParseConfig) {
    super(config);
    this.paradigms = paradigms;
    this.tags = tags;
    this.suffixes = suffixes;
    if (this.prefix == null) {
      this.prefix = '';
    }
    if (this.suffix == null) {
      this.suffix = '';
    }
  }

  /**
   * Возвращает основу слова
   *
   * @returns {string}
   */
  public getBase(): string {
    if (!this.base) {
      this.base = this.word.substring(DictionaryParse.prefixes[this.paradigm[(this.formCnt << 1) + this.formIdx]].length,
        this.word.length - this.suffixes[this.paradigm[this.formIdx]].length);
    }

    return this.base;
  }

  /**
   * Склоняет/спрягает слово так, чтобы оно соответствовало граммемам другого слова, тега или просто конкретным граммемам
   * (подробнее см. Tag.prototype.matches).
   * Всегда выбирается первый подходящий вариант.
   *
   * @param tag
   * @param grammemes
   * @returns {DictionaryParse | boolean}
   */
  public inflect(tag, grammemes ?: any): DictionaryParse | boolean  {
    if (!grammemes && typeof tag === 'number') {
      // Inflect to specific formIdx
      return DictionaryParse.createDictionaryParse(
        this.paradigms,
        this.tags,
        this.suffixes,
        DictionaryParse.prefixes[this.paradigm[(this.formCnt << 1) + tag]] + this.base() + this.suffixes[this.paradigm[tag]],
        this.paradigmIdx,
        tag, 0, 0, this.prefix, this.suffix
      );
    }

    for (let formIdx = 0; formIdx < this.formCnt; formIdx++) {
      if (this.tags[this.paradigm[this.formCnt + formIdx]].matches(tag, grammemes)) {
        return DictionaryParse.createDictionaryParse(
          this.paradigms,
          this.tags,
          this.suffixes,
          DictionaryParse.prefixes[this.paradigm[(this.formCnt << 1) + formIdx]] + this.base() + this.suffixes[this.paradigm[formIdx]],
          this.paradigmIdx,
          formIdx, 0, 0, this.prefix, this.suffix
        );
      }
    }

    return false;
  }

  /**
   * Log
   */
  public log() {
    console.group(this.toString());
    console.log('Stutter?', this.stutterCnt, 'Typos?', this.typosCnt);
    console.log(DictionaryParse.prefixes[this.paradigm[(this.formCnt << 1) + this.formIdx]] + '|' + this.base() + '|' +
      this.suffixes[this.paradigm[this.formIdx]]);
    console.log(this.tag.ext.toString());
    const norm = this.normalize(false);
    console.log('=> ', norm + ' (' + (<any> norm).tag.ext.toString() + ')');
    norm = this.normalize(true);
    console.log('=> ', norm + ' (' + (<any> norm).tag.ext.toString() + ')');
    console.groupCollapsed('Все формы: ' + this.formCnt);
    for (let formIdx = 0; formIdx < this.formCnt; formIdx++) {
      const form = this.inflect(formIdx);
      console.log(form + ' (' + (<any> form).tag.ext.toString() + ')');
    }
    console.groupEnd();
    console.groupEnd();
  }

  public toString() {
    let str: string;
    if (this.prefix) {
      const pref = DictionaryParse.prefixes[this.paradigm[(this.formCnt << 1) + this.formIdx]];
      str = pref + this.prefix + this.word.substr(pref.length) + this.suffix;
    } else {
      str = this.word + this.suffix;
    }

    return str;
  }
}
