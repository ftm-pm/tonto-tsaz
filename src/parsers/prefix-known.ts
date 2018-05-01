import { DictionaryParser } from './dictionary-parser';
import { ParserInterface } from './parser';

/**
 * PrefixKnown
 */
export class PrefixKnown implements ParserInterface {
  public static knownPrefixes = [
    'авиа', 'авто', 'аква', 'анти', 'анти-', 'антропо', 'архи', 'арт', 'арт-', 'астро', 'аудио', 'аэро',
    'без', 'бес', 'био', 'вело', 'взаимо', 'вне', 'внутри', 'видео', 'вице-', 'вперед', 'впереди',
    'гекто', 'гелио', 'гео', 'гетеро', 'гига', 'гигро', 'гипер', 'гипо', 'гомо',
    'дву', 'двух', 'де', 'дез', 'дека', 'деци', 'дис', 'до', 'евро', 'за', 'зоо', 'интер', 'инфра',
    'квази', 'квази-', 'кило', 'кино', 'контр', 'контр-', 'космо', 'космо-', 'крипто', 'лейб-', 'лже', 'лже-',
    'макро', 'макси', 'макси-', 'мало', 'меж', 'медиа', 'медиа-', 'мега', 'мета', 'мета-', 'метео', 'метро', 'микро',
    'милли', 'мини', 'мини-', 'моно', 'мото', 'много', 'мульти',
    'нано', 'нарко', 'не', 'небез', 'недо', 'нейро', 'нео', 'низко', 'обер-', 'обще', 'одно', 'около', 'орто',
    'палео', 'пан', 'пара', 'пента', 'пере', 'пиро', 'поли', 'полу', 'после', 'пост', 'пост-',
    'порно', 'пра', 'пра-', 'пред', 'пресс-', 'противо', 'противо-', 'прото', 'псевдо', 'псевдо-',
    'радио', 'разно', 'ре', 'ретро', 'ретро-', 'само', 'санти', 'сверх', 'сверх-', 'спец', 'суб', 'супер', 'супер-', 'супра',
    'теле', 'тетра', 'топ-', 'транс', 'транс-', 'ультра', 'унтер-', 'штаб-',
    'экзо', 'эко', 'эндо', 'эконом-', 'экс', 'экс-', 'экстра', 'экстра-', 'электро', 'энерго', 'этно'
  ];

  /**
   * DictionaryParser
   */
  private readonly dictionaryParser: DictionaryParser;

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
   * Constructor PrefixKnown
   */
  public constructor(dictionaryParser: DictionaryParser) {
    this.dictionaryParser = dictionaryParser;
  }

  public parse(word: string, config: any = {}): any[] {
    const parses = [];

    word = word.toLocaleLowerCase();
    for (const knownPrefix of PrefixKnown.knownPrefixes) {
      if (word.length - knownPrefix.length < 3) {
        continue;
      }

      if (word.substr(0, knownPrefix.length) === knownPrefix) {
        const end = word.substr(knownPrefix.length);
        const rightParts = this.dictionaryParser.parse(end, config);
        for (const right of rightParts) {
          if (!right.tag.isProductive()) {
            continue;
          }
          if (!config.ignoreCase && right.tag.isCapitalized() && !PrefixKnown.isCapitalized(word, config)) {
            continue;
          }
          right.score *= 0.7;
          right.prefix = knownPrefix;
          parses.push(right);
        }
      }
    }

    return parses;
  }
}
