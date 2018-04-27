import { deepFreeze } from '../utils/utils';
import { Parse } from './parse';

export interface TagConfig {
  /**
   * Полный список неизменяемых граммем.
   */
  stat: string[];

  /**
   * Полный список изменяемых граммем.
   */
  flex: string[];

  /**
   * ???
   */
  gram: boolean;

  /**
   * Копия тега с русскими обозначениями (по версии OpenCorpora).
   */
  ext: TagInterface;
}

/**
 * TagInterface
 */
export interface TagInterface extends TagConfig {
  /**
   * Возвращает текстовое представление тега.
   *
   * @returns {string} Список неизменяемых граммем через запятую, пробел,
   *  и список изменяемых граммем через запятую.
   */
  toString(): string;

  /**
   * If index === 1 return flex else return stat
   * @returns {string[]}
   */
  getGrams(index: number): string[];

  /**
   * Проверяет согласованность с конкретными значениями граммем либо со списком
   * граммем из другого тега (или слова).
   *
   * @param {Tag|Parse} [tag] Тег или разбор слова, с которым следует
   *  проверить согласованность.
   * @param {Array|Object} grammemes Граммемы, по которым нужно проверить
   *  согласованность.
   *
   *  Если указан тег (или разбор), то grammemes должен быть массивом тех
   *  граммем, которые у обоих тегов должны совпадать. Например:
   *  tag.matches(otherTag, ['POS', 'GNdr'])
   *
   *  Если тег не указан, а указан массив граммем, то проверяется просто их
   *  наличие. Например, аналог выражения (tag.NOUN && tag.masc):
   *  tag.matches([ 'NOUN', 'masc' ])
   *
   *  Если тег не указан, а указан объект, то ключи в нем — названия граммем,
   *  значения — дочерние граммемы, массивы граммем, либо true/false:
   *  tag.matches({ 'POS' : 'NOUN', 'GNdr': ['masc', 'neut'] })
   * @returns {boolean} Является ли текущий тег согласованным с указанным.
   */
  matches(tag: any, grammemes: any[]): boolean;

  /**
   * Is productive
   *
   * @returns {boolean}
   */
  isProductive(): boolean;

  /**
   * ???
   *
   * @returns {any}
   */
  isCapitalized(): any;
}

/**
 * Тег. Содержит в себе информацию о конкретной форме слова, но при этом
 * к конкретному слову не привязан. Всевозможные значения тегов переиспользуются
 * для всех разборов слов.
 *
 * Все граммемы навешаны на тег как поля. Если какая-то граммема содержит в себе
 * дочерние граммемы, то значением поля является именно название дочерней
 * граммемы (например, tag.GNdr == 'masc'). В то же время для дочерних граммем
 * значением является просто true (т.е. условие можно писать и просто как
 * if (tag.masc) ...).
 */
export class Tag implements TagInterface {
  public stat: string[];
  public flex: string[];
  public gram: boolean;
  public ext: TagInterface;
  public POS: any;
  public POST: any;
  public NUMR: any;
  public NPRO: any;
  public PRED: any;
  public PREP: any;
  public CONJ: any;
  public PRCL: any;
  public INTJ: any;
  public Apro: any;
  public NUMB: any;
  public ROMN: any;
  public LATN: any;
  public PNCT: any;
  public UNKN: any;
  public Name: any;
  public Surn: any;
  public Patr: any;
  public Geox: any;
  public Init: any;
  public NOUN: any;
  public ADJF: any;
  public PRTF: any;
  public nomn: any;
  public accs: any;
  public CAse: any;
  public femn: any;

  public static createTag(word: string, grammemes: any[]): Tag {
    const tag: Tag = new Tag();
    // let par;
    const pair = word.split(' ');
    tag.stat = pair[0].split(',');
    tag.flex = pair[1] ? pair[1].split(',') : [];

    for (const index of [0, 1]) {
      const grams = tag.getGrams(index);
      for (let gram of grams) {
        tag.gram = true;
        // loc2 -> loct -> CAse
        while (grammemes[gram] && grammemes[gram].parent) {
          const par = grammemes[gram].parent;
          tag[par] = gram;
          gram = par;
        }
      }
    }

    if ('POST' in tag) {
      tag.POS = tag.POST;
    }

    return tag;
  }

  public static makeTag(tagInt: string, tagExt: string, grammemes: any[]): Tag {
    const tag: TagInterface = Tag.createTag(tagInt, grammemes);
    tag.ext = Tag.createTag(tagExt, grammemes);

    return deepFreeze(tag);
  }

  public toString(): string {
    return `${this.stat.join(',')} ${this.flex.join(',')}`.trim();
  }

  public getGrams(index: number): string[] {
    return index === 1 ? this.flex : this.stat;
  }

  // TODO: научиться понимать, что некоторые граммемы можно считать эквивалентными при сравнении двух тегов (вариации падежей и т.п.)
  public matches(tag: any, grammemes: any[] = null): boolean {
    if (!grammemes) {
      if (Object.prototype.toString.call(tag) === '[object Array]') {
        for (const key in tag) {
          if (!this.hasOwnProperty(tag[key])) {
            return false;
          }
        }
        return true;
      } else {
        // Match to map
        for (const key of Object.keys(tag)) {
          if (Object.prototype.toString.call(tag[key]) === '[object Array]') {
            if (!tag[key].indexOf(this[key])) {
              return false;
            }
          } else {
            if (tag[key] !== this[key]) {
              return false;
            }
          }
        }
      }

    } else {
      if (tag instanceof Parse) {
        tag = (<any> tag).tag;
      }

      // Match to another tag
      for (const key in grammemes) {
        if (tag[grammemes[key]] !== this[grammemes[key]]) {
          // Special case: tag.CAse
          return false;
        }
      }
    }

    return true;
  }

  public isProductive(): boolean {
    return !(this.NUMR || this.NPRO || this.PRED || this.PREP ||
      this.CONJ || this.PRCL || this.INTJ || this.Apro ||
      this.NUMB || this.ROMN || this.LATN || this.PNCT ||
      this.UNKN);
  }

  public isCapitalized(): any {
    return this.Name || this.Surn || this.Patr || this.Geox || this.Init;
  }
}
