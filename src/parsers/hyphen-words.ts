import { CombinedParse } from './combined-parse';
import { DictionaryParse } from './dictionary-parse';
import { DictionaryParser } from './dictionary-parser';
import { ParserInterface } from './parser';

/**
 * HyphenWords
 * слово + '-' + слово: "интернет-магазин", "компания-производитель"
 */
export class HyphenWords implements ParserInterface {
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
   * Constructor HyphenAdverb
   */
  public constructor(dictionaryParser: DictionaryParser) {
    this.dictionaryParser = dictionaryParser;
  }

  public parse(word: string, config: any = {}): any {
    const parses = [];

    let isSkip: boolean = false;
    word = word.toLocaleLowerCase();
    for (const knownPrefix of HyphenWords.knownPrefixes) {
      if (knownPrefix[knownPrefix.length - 1] === '-' &&
        word.substr(0, knownPrefix.length) === knownPrefix) {
        isSkip = true;
        break;
      }
    }
    if (!isSkip) {
      const parts = word.split('-');
      if (parts.length !== 2 || !parts[0].length || !parts[1].length) {
        if (parts.length > 2) {
          const end = parts[parts.length - 1];
          const rightParts = this.dictionaryParser.parse(end, config);
          for (const right of rightParts) {
            if (right instanceof DictionaryParse) {
              right.score *= 0.2;
              right.prefix = word.substr(0, word.length - end.length - 1) + '-';
              parses.push(right);
            }
          }
        }
      } else {
        const leftParts = this.dictionaryParser.parse(parts[0], config);
        const rightParts = this.dictionaryParser.parse(parts[1], config);

        // Variable
        for (const left of leftParts) {
          if (left.tag.Abbr) {
            continue;
          }
          for (const right of rightParts) {
            if (!left.matches(right, ['POST', 'NMbr', 'CAse', 'PErs', 'TEns'])) {
              continue;
            }
            if (left.stutterCnt + right.stutterCnt > config.stutter ||
              left.typosCnt + right.typosCnt > config.typos) {
              continue;
            }
            parses.push(new CombinedParse({
              left: left,
              right: right
            }));
          }
        }
        // Fixed
        for (const right of rightParts) {
          if (right instanceof DictionaryParse) {
            right.score *= 0.3;
            right.prefix = parts[0] + '-';
            parses.push(right);
          }
        }
      }
    }

    return parses;
  }
}
