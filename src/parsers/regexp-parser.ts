import { Parse } from './parse';
import { ParserInterface } from './parser';
import { Tag } from './tag';

/**
 * RegexpParser
 */
export class RegexpParser implements ParserInterface {
  private readonly regexp: RegExp|string;
  private readonly tag: Tag;
  private readonly score: number;

  /**
   * Constructor RegexpParser
   *
   * @param {RegExp | string} regexp
   * @param {Tag} tag
   * @param {number} score
   */
  public constructor(regexp: RegExp | string, tag: Tag, score: number) {
    this.regexp = regexp;
    this.tag = tag;
    this.score = score;
  }

  public parse(word: string, config: any = {}): any {
    const parses = [];
    if (config.ignoreCase) {
      word = word.toLocaleUpperCase();
    }
    if (word.length && word.match(this.regexp)) {
      const parse: Parse = new Parse({
        word: word,
        tag: this.tag,
        score: this.score
      });
      parses.push(parse);

    } else {
      return [];
    }

    return parses;
  }
}
