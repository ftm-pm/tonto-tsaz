import { Tag } from './tag';

export interface ParseConfig {
  /**
   * Слово в текущей форме (с исправленными ошибками,
   */
  word?: string;

  /**
   * Тег, описывающий текущую форму слова.
   */
  tag?: Tag;

  /**
   * Число «заиканий», исправленных в слове
   */
  stutterCnt?: number;

  /**
   * Число опечаток, исправленных в слове.
   */
  typosCnt?: number;

  /**
   * Число от 0 до 1, соответствующее «уверенности» в данном разборе (чем оно выше, тем вероятнее данный вариант).
   */
  score?: number;
}

/**
 * ParseInterface
 */
export interface ParseInterface {
  /**
   * Приводит слово к его начальной форме.
   *
   * @param {boolean} keepPOS Не менять часть речи при нормализации (например, не делать из причастия инфинитив).
   * @returns {ParseInterface| boolean} Разбор, соответствующий начальной форме или False, если произвести нормализацию не удалось.
   */
  normalize(keepPOS: boolean): ParseInterface | boolean;

  /**
   * Приводит слово к указанной форме.
   *
   * @param {Tag|Parse} [tag] Тег или другой разбор слова, с которым следует
   *  согласовать данный.
   * @param {Array|Object} grammemes Граммемы, по которым нужно согласовать слово.
   * @returns {ParseInterface | boolean} Разбор, соответствующий указанной форме или False,
   *  если произвести согласование не удалось.
   * @see Tag.matches
   */
  inflect(tag: any, grammemes ?: any): ParseInterface | boolean;

  /**
   * Приводит слово к форме, согласующейся с указанным числом.
   * Вместо числа можно указать категорию (согласно http://www.unicode.org/cldr/charts/29/supplemental/language_plural_rules.html).
   *
   * @param {number|string} numb Число, с которым нужно согласовать данное слово или категория, описывающая правило построения
   * множественного числа.
   * @returns {ParseInterface | boolean} Разбор, соответствующий указанному числу или False,
   * если произвести согласование не удалось.
   */
  pluralize(numb: number): ParseInterface | boolean;

  /**
   * Проверяет, согласуется ли текущая форма слова с указанной.
   *
   * @param {Tag|Parse} [tag] Тег или другой разбор слова, с которым следует
   *  проверить согласованность.
   * @param {Array|Object} grammemes Граммемы, по которым нужно проверить
   *  согласованность.
   * @returns {boolean} Является ли текущая форма слова согласованной с указанной.
   * @see Tag.matches
   */
  matches(tag: any, grammemes ?: any): boolean;

  /**
   * Возвращает текущую форму слова.
   *
   * @returns {string} Текущая форма слова.
   */
  toString(): string;

  /**
   * Выводит информацию о слове в консоль.
   */
  log(): void;
}

/**
 * Parse Один из возможных вариантов морфологического разбора.
 *
 * @property {string} word Слово в текущей форме (с исправленными ошибками,
 *  если они были)
 * @property {Tag} tag Тег, описывающий текущую форму слова.
 * @property {number} score Число от 0 до 1, соответствующее «уверенности»
 *  в данном разборе (чем оно выше, тем вероятнее данный вариант).
 * @property {number} stutterCnt Число «заиканий», исправленных в слове.
 * @property {number} typosCnt Число опечаток, исправленных в слове.
 */
export class Parse implements ParseConfig, ParseInterface {
  public word: string;

  public tag: Tag;

  public stutterCnt: number;

  public typosCnt: number;

  public score: number;

  /**
   * Constructor Parse
   * @param {ParseInterface} config
   */
  public constructor(config ?: ParseConfig) {
    Object.assign(this, config);
    if (this.stutterCnt == null) {
      this.stutterCnt = 0;
    }
    if (this.typosCnt == null) {
      this.typosCnt = 0;
    }
    if (this.score == null) {
      this.score = 0;
    }
  }

  // TODO: некоторые смены частей речи, возможно, стоит делать в любом случае (т.к., например, компаративы, краткие формы причастий
  // TODO: и прилагательных разделены, инфинитив отделен от глагола)
  public normalize(keepPOS: boolean): ParseInterface | boolean {
    return this.inflect(keepPOS ? {POS: this.tag.POS} : 0);
  }

  public inflect(tag: any, grammemes ?: any): ParseInterface | boolean {
    return this;
  }

  public pluralize(numb: number | string): ParseInterface | boolean {
    if (!this.tag.NOUN && !this.tag.ADJF && !this.tag.PRTF) {
      return this;
    }

    if (typeof numb === 'number') {
      numb = numb % 100;
      if ((numb % 10 === 0) || (numb % 10 > 4) || (numb > 4 && numb < 21)) {
        numb = 'many';
      } else if (numb % 10 === 1) {
        numb = 'one';
      } else {
        numb = 'few';
      }
    }

    if (this.tag.NOUN && !this.tag.nomn && !this.tag.accs) {
      return this.inflect([numb === 'one' ? 'sing' : 'plur', this.tag.CAse]);
    } else if (numb === 'one') {
      return this.inflect(['sing', this.tag.nomn ? 'nomn' : 'accs']);
    } else if (this.tag.NOUN && (numb === 'few')) {
      return this.inflect(['sing', 'gent']);
    } else if ((this.tag.ADJF || this.tag.PRTF) && this.tag.femn && (numb === 'few')) {
      return this.inflect(['plur', 'nomn']);
    } else {
      return this.inflect(['plur', 'gent']);
    }
  }

  public matches(tag: any, grammemes ?: any): boolean {
    return this.tag.matches(tag, grammemes);
  }

  public toString(): string {
    return this.word;
  }

  public log(): void {
    console.group(this.toString());
    console.log('Stutter?', this.stutterCnt, 'Typos?', this.typosCnt);
    console.log(this.tag.ext.toString());
    console.groupEnd();
  }
}
