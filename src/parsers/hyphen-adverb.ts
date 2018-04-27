import { DAWG } from '../loaders/dawg';
import { lookup } from '../utils/utils';
import { DictionaryParse } from './dictionary-parse';
import { Parse } from './parse';
import { ParserInterface } from './parser';
import { Tag } from './tag';

/**
 * HyphenAdverb
 * 'по-' + прилагательное в дательном падеже: "по-западному"
 */
export class HyphenAdverb implements ParserInterface {
  private ADVB: Tag;

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
   * Grammemes
   */
  private readonly grammemes: any[];

  /**
   * Constructor HyphenAdverb
   *
   * @param {DAWG} words
   * @param paradigms
   * @param {Tag[]} tags
   * @param {any[]} grammemes
   */
  public constructor(words: DAWG, paradigms: any, tags: Tag[], grammemes: any[]) {
    this.words = words;
    this.paradigms = paradigms;
    this.tags = tags;
    this.grammemes = grammemes;

    this.ADVB = Tag.makeTag('ADVB', 'Н', this.grammemes);
  }

  public parse(word: string, config: any = {}): any {
    const parses = [];
    word = word.toLocaleLowerCase();

    if ((word.length < 5) || (word.substr(0, 3) != 'по-')) {
      return [];
    }

    const opts = lookup(this.words, word.substr(3), config);
    const used: any = {};

    for (const opt of opts) {
      if (!used[opt[0]]) {
        for (const opt1 of opt[1]) {
          const dictParse = DictionaryParse.createDictionaryParse(this.paradigms, this.tags, opt[0], opt1[0], opt1[1], opt[2], opt[3]);
          if (dictParse.matches(['ADJF', 'sing', 'datv'])) {
            used[opt[0]] = true;

            const parse = new Parse({
              word: 'по-' + opt[0],
              tag: this.ADVB,
              score: dictParse.score * 0.9,
              stutterCnt: opt[2],
              typosCnt: opt[3]
            });
            parses.push(parse);
            break;
          }
        }
      }
    }

    return parses;
  }
}
