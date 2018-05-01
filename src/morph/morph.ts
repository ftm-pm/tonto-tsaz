import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { _throw } from 'rxjs/observable/throw';
import { map } from 'rxjs/operators/map';

import {
  DictionaryManager,
  DictionaryManagerConfig,
  DictionaryManagerInterface
} from '../dictonaries/dictionary-manager';
import { ThesaurusInterface } from '../dictonaries/thesaurus';
import { AbbrParser } from '../parsers/abbr-parser';
import { DictionaryParser } from '../parsers/dictionary-parser';
import { InitialsParser } from '../parsers/initials-parser';
import { Parse } from '../parsers/parse';
import { ParserConfig, ParserInterface } from '../parsers/parser';
import { RegexpParser } from '../parsers/regexp-parser';
import { Tag } from '../parsers/tag';
import { deepFreeze, getDictionaryScore } from '../utils/utils';
import { HyphenParticle } from '../parsers/hyphen-particle';
import { HyphenAdverb } from '../parsers/hyphen-adverb';
import { HyphenWords } from '../parsers/hyphen-words';
import { PrefixKnown } from '../parsers/prefix-known';
import { PrefixUnknown } from '../parsers/prefix-unknown';
import { SuffixKnown } from '../parsers/suffix-known';

/**
 * MorphInterface
 */
export interface MorphInterface {
  /**
   * @returns {boolean}
   */
  init(): Observable<any>;

  /**
   * Parse word
   *
   * @param {string} word
   * @param {ParserConfig} config
   * @returns {Observable<any[]>}
   */
  parse(word: string, config ?: ParserConfig): Observable<any[]>;
}

export interface MorphConfig {
  dictionary ?: DictionaryManagerConfig;
}

export interface MorphParsers {
  [index: string]: ParserInterface;
}

/**
 * Morph
 */
export class Morph implements MorphInterface {
  public static DEFAULT_CONFIG: ParserConfig = <ParserConfig> {
    ignoreCase: false,
    replacements: { 'е': 'ё' },
    stutter: Infinity,
    typos: 0,
    parsers: [
      // Словарные слова + инициалы
      'Dictionary?', 'AbbrName?', 'AbbrPatronymic',
      // Числа, пунктуация, латиница (по-хорошему, токенизатор не должен эту ерунду сюда пускать)
      'IntNumber', 'RealNumber', 'Punctuation', 'RomanNumber?', 'Latin',
      // Слова с дефисами
      'HyphenParticle', 'HyphenAdverb', 'HyphenWords',
      // Предсказатели по префиксам/суффиксам
      'PrefixKnown', 'PrefixUnknown?', 'SuffixKnown?', 'Abbr'
    ],
    forceParse: false,
    normalizeScore: true
  };

  /**
   * Dictionary manager
   */
  private dictionaryManager: DictionaryManagerInterface;

  /**
   * All dictionaries
   */
  private thesaurus: ThesaurusInterface;

  /**
   * Parsers
   */
  private parsers: MorphParsers;

  private UNKN: any;

  private tags: Tag[];

  /**
   * Constructor Morph
   * @param {MorphConfig} config
   */
  public constructor(config: MorphConfig = {}) {
    this.dictionaryManager = new DictionaryManager(config.dictionary);
  }

  public init(): Observable<any> {
    return this.dictionaryManager.loads().pipe(
      map( (thesaurus: ThesaurusInterface) => {
        // save thesaurus
        this.thesaurus = thesaurus;

        // create tags
        const tags: Tag[] = [];
        const tagsInt = this.thesaurus.tagsInt;
        const tagsExt = this.thesaurus.tagsExpr;
        for (const key of Object.keys(tagsInt)) {
          tags[key] = Tag.createTag(key, this.thesaurus.grammemes);
          tags[key].ext = Tag.createTag(key, this.thesaurus.grammemes);
        }
        this.tags = deepFreeze(tags);

        // Init parsers
        this.initParsers();

        return thesaurus;
      })
    );
  }

  public parse(word: string, config ?: ParserConfig): Observable<any[]> {
    if (!this.thesaurus) {
      return _throw('Thesaurus was not loaded');
    }
    if (config) {
      config = Object.assign(Morph.DEFAULT_CONFIG, config);
    } else {
      config = Morph.DEFAULT_CONFIG;
    }

    let parses: any[] = [];
    let matched = false;

    for (const parse of config.parsers) {
      let name = parse;
      const terminal = name[name.length - 1] !== '?';
      name = terminal ? name : name.slice(0, -1);
      if (name in this.parsers) {
        const allParses = this.parsers[name].parse(word, config);
        for (const parseVar of allParses) {
          parseVar.parser = name;
          if (!parseVar.stutterCnt && !parseVar.typosCnt) {
            matched = true;
          }
        }

        parses = parses.concat(allParses);
        if (matched && terminal) {
          break;
        }
      } else {
        console.warn(`Parser ${name} is not found. Skipping`);
      }
    }

    if (!parses.length && config.forceParse) {
      parses.push(new Parse({word: word.toLocaleLowerCase(), tag: this.UNKN}));
    }

    let total = 0;
    for (const parse of parses) {
      if (parse.parser === 'Dictionary') {
        const res = this.thesaurus.probabilities.findAll(parse + ':' + parse.tag);
        if (res && res[0]) {
          parse.score = (res[0][1] / 1000000) * getDictionaryScore(parse.stutterCnt, parse.typosCnt);
          total += parse.score;
        }
      }
    }

    // Normalize Dictionary & non-Dictionary scores separately
    if (config.normalizeScore) {
      if (total > 0) {
        for (const parse of parses) {
          if (parse.parser === 'Dictionary') {
            parse.score /= total;
          }
        }
      }

      total = 0;
      for (const parse of parses) {
        if (parse.parser !== 'Dictionary') {
          total += parse.score;
        }
      }
      if (total > 0) {
        for (const parse of parses) {
          if (parse.parser !==  'Dictionary') {
            parse.score /= total;
          }
        }
      }
    }

    parses.sort((e1, e2) => {
      return e2.score - e1.score;
    });

    return of(parses);
  }

  /**
   * Init parsers
   */
  private initParsers(): void {
    this.parsers.dictonary = new DictionaryParser(this.thesaurus.words, this.thesaurus.paradigms, this.tags, this.thesaurus.suffixes);
    this.parsers.abbr = new AbbrParser(this.thesaurus.grammemes);
    this.parsers.abbrName = new InitialsParser(this.thesaurus.grammemes, false, 0.1);
    this.parsers.abbrPatronymic = new InitialsParser(this.thesaurus.grammemes, true, 0.1)

    this.parsers.intNumber = new RegexpParser(/^[−-]?[0-9]+$/,
      Tag.makeTag('NUMB,intg', 'ЧИСЛО,цел', this.thesaurus.grammemes), 0.9);
    this.parsers.realNumber = new RegexpParser(/^[−-]?([0-9]*[.,][0-9]+)$/,
      Tag.makeTag('NUMB,real', 'ЧИСЛО,вещ', this.thesaurus.grammemes), 0.9);
    this.parsers.punctuation = new RegexpParser(/^[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]+$/,
      Tag.makeTag('PNCT', 'ЗПР', this.thesaurus.grammemes), 0.9);
    this.parsers.romanNumber = new RegexpParser(
      /^M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/,
      Tag.makeTag('ROMN', 'РИМ', this.thesaurus.grammemes), 0.9);
    this.parsers.latin = new RegexpParser(
      /[A-Za-z\u00C0-\u00D6\u00D8-\u00f6\u00f8-\u024f]$/,
      Tag.makeTag('LATN', 'ЛАТ', this.thesaurus.grammemes), 0.9);

    this.parsers.hyphenParticle = new HyphenParticle(this.thesaurus.words, this.thesaurus.paradigms, this.tags, this.thesaurus.suffixes);
    this.parsers.hyphenAdverb = new HyphenAdverb(this.thesaurus.words, this.thesaurus.paradigms, this.tags,
      this.thesaurus.grammemes, this.thesaurus.suffixes);

    this.parsers.hyphenWords = new HyphenWords(<DictionaryParser> this.parsers.dictonary);
    this.parsers.prefixKnown = new PrefixKnown(<DictionaryParser> this.parsers.dictonary);
    this.parsers.suffixKnown = new SuffixKnown(this.thesaurus.paradigms, this.tags,
      this.thesaurus.suffixes, this.thesaurus.predictionSuffixes);
  }
}
