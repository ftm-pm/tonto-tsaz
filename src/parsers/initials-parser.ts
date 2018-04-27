import { Parse } from './parse';
import { ParserInterface } from './parser';
import { Tag } from './tag';

/**
 * InitialsParser
 */
export class InitialsParser implements ParserInterface {
  public static initials = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЭЮЯ';

  /**
   * AbbrTags
   */
  private initialsTags: Tag[];

  /**
   * Return abbrTags
   *
   * @param grammemes
   * @returns {any[]}
   */
  public static getInitialsTags(grammemes) {
    const initialsTags = [];
    for (let i = 0; i <= 2; i++) {
      for (let j = 0; j <= 5; j++) {
        for (let k = 0; k <= 1; k++) {
          initialsTags.push(Tag.makeTag(
            'NOUN,anim,' + ['masc', 'femn'][i] + ',Sgtm,Name,Fixd,Abbr,Init sing,' + ['nomn', 'gent', 'datv', 'accs', 'ablt', 'loct'][j],
            'СУЩ,од,' + ['мр', 'жр'][i] + ',sg,имя,0,аббр,иниц ед,' + ['им', 'рд', 'дт', 'вн', 'тв', 'пр'][j],
            grammemes
          ));
        }
      }
    }

    return initialsTags;
  }

  /**
   * Constructor InitialsParser
   *
   * @param {any[]} grammemes
   * @param {boolean} isPatronymic
   * @param {number} score
   */
  public constructor(grammemes: any[], isPatronymic: boolean, score: number) {
    this.initialsTags = InitialsParser.getInitialsTags(grammemes);
  }

  public parse(word: string, config: any = {}): any {
    const parses = [];
    if (word.length !== 1) {
      // skip
    } else {
      if (config.ignoreCase) {
        word = word.toLocaleUpperCase();
      }
      if (InitialsParser.initials.indexOf(word) === -1) {
        // skip
      } else {
        for (const tag of this.initialsTags) {
          const parse: Parse = new Parse({
            word: word,
            tag: tag,
            score: 0.5
          });
          parses.push(parse);
        }
      }
    }

    return parses;
  }
}
