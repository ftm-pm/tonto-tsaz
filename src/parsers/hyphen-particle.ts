import { DAWG } from '../loaders/dawg';
import { lookup } from '../utils/utils';
import { DictionaryParse } from './dictionary-parse';
import { ParserInterface } from './parser';
import { Tag } from './tag';

/**
 * HyphenParticle
 * слово + частица: "смотри-ка"
 */
export class HyphenParticle implements ParserInterface {
  public static particles: string[] = ['-то', '-ка', '-таки', '-де', '-тко', '-тка', '-с', '-ста'];
  /**
   * Words
   */
  private readonly words: DAWG;

  /**
   * Paradigms
   */
  private readonly paradigms: any[];

  /**
   * Tags
   */
  private readonly tags: Tag[];

  /**
   * Suffixes
   */
  private readonly suffixes: any[];

  /**
   * Constructor HyphenParticle
   *
   * @param {DAWG} words
   * @param {any[]} paradigms
   * @param {Tag[]} tags
   * @param {any[]} suffixes
   */
  public constructor(words: DAWG, paradigms: any[], tags: Tag[], suffixes: any[]) {
    this.words = words;
    this.paradigms = paradigms;
    this.tags = tags;
    this.tags = suffixes;
  }

  public parse(word: string, config: any = {}): any {
    const parses = [];
    for (const particle of HyphenParticle.particles) {
      if (word.substr(word.length - particle.length) === particle) {
        const base = word.slice(0, -particle.length);
        const opts = lookup(this.words, base, config);

        for (const i of  opts) {
          for (const j of i[1]) {
            const parse = DictionaryParse.createDictionaryParse(
              this.paradigms,
              this.tags,
              this.suffixes,
              opts[i][0],
              opts[i][1][j][0],
              opts[i][1][j][1],
              opts[i][2],
              opts[i][3],
              '',
              particle);

            parse.score *= 0.9;
            parses.push(parse);
          }
        }
      }
    }

    return parses;
  }
}
