import { Parse, ParseInterface } from './parse';
import { ParserInterface } from './parser';
import { Tag } from './tag';

/**
 * AbbrParser
 */
export class AbbrParser implements ParserInterface {
  public static initials = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЭЮЯ';

  /**
   * AbbrTags
   */
  private abbrTags: Tag[];

  /**
   * Return abbrTags
   *
   * @param grammemes
   * @returns {any[]}
   */
  public static getAbbrTags(grammemes) {
    const abbrTags = [];
    for (let i = 0; i <= 2; i++) {
      for (let j = 0; j <= 5; j++) {
        for (let k = 0; k <= 1; k++) {
          abbrTags.push(Tag.makeTag(
            'NOUN,inan,' + ['masc', 'femn', 'neut'][i] + ',Fixd,Abbr ' + ['sing', 'plur'][k] +
            ',' + ['nomn', 'gent', 'datv', 'accs', 'ablt', 'loct'][j],
            'СУЩ,неод,' + ['мр', 'жр', 'ср'][i] + ',0,аббр ' + ['ед', 'мн'][k] + ',' + ['им', 'рд', 'дт', 'вн', 'тв', 'пр'][j],
            grammemes
          ));
        }
      }
    }

    return abbrTags;
  }

  /**
   * Constructor AbbrParser
   * @param {any[]} grammemes
   */
  public constructor(grammemes: any[]) {
    this.abbrTags = AbbrParser.getAbbrTags(grammemes);
  }

  public parse(word: string, config: any = {}): any {
    const parses = [];
    if (word.length < 2) {
      // Однобуквенные считаются инициалами и для них заведены отдельные парсеры
      // skip
    } else if (word.indexOf('-') > -1) {
      // Дефисов в аббревиатуре быть не должно
      // skip
    } else  if ((AbbrParser.initials.indexOf(word[0]) > -1) && (AbbrParser.initials.indexOf(word[word.length - 1]) > -1)) {
      // Первая буква должна быть заглавной: сокращения с маленькой буквы (типа iOS) мало распространены
      // Последняя буква должна быть заглавной: иначе сокращение, вероятно, склоняется
      let caps = 0;
      for (const char of word) {
        if (AbbrParser.initials.indexOf(char) > -1) {
          caps++;
        }
      }
      if (caps <= 5) {
        for (const tag of this.abbrTags) {
          const parse: ParseInterface = new Parse({
            word: word,
            tag: tag,
            score: 0.5
          });
          parses.push(parse);
        }
      }
    } else if (!config.ignoreCase || (word.length > 5)) {
      // При игнорировании регистра разбираем только короткие аббревиатуры
      // (и требуем, чтобы каждая буква была «инициалом», т.е. без мягких/твердых знаков)
      // skip
    } else {
      word = word.toLocaleUpperCase();
      let isIgnore: boolean = false;
      for (const char of word) {
        if (AbbrParser.initials.indexOf(char) === -1) {
          isIgnore = true;
          break;
        }
      }
      if (!isIgnore) {
        for (const tag of this.abbrTags) {
          const parse = new Parse({
            word: word,
            tag: tag,
            score: 0.2
          });
          parses.push(parse);
        }
      }
    }

    return parses;
  }
}
