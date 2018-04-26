import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators/map';

import { of } from 'rxjs/observable/of';
import { _throw } from 'rxjs/observable/throw';

import {
  DictionaryManager,
  DictionaryManagerConfig,
  DictionaryManagerInterface
} from '../dictonaries/dictionary-manager';
import { ThesaurusInterface } from '../dictonaries/thesaurus';
import { DictionaryParser } from '../parsers/dictionary-parser';
import { Parse } from '../parsers/parse';
import { ParserConfig, ParserInterface } from '../parsers/parser';
import { Tag } from '../parsers/tag';
import { deepFreeze, getDictionaryScore } from '../utils/utils';

/**
 * MorphInterface
 */
export interface MorphInterface {
  /**
   * @returns {boolean}
   */
  init(): Observable<any>;

  /**
   * Create tag
   *
   * @param {string} lexeme
   * @returns {Tag}
   */
  createTag(lexeme: string): Tag;

  /**
   * Make tag
   *
   * @param {string} tagInt
   * @param {string} tagExt
   * @returns {any}
   */
  makeTag(tagInt: string, tagExt: string): any;

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
        for (const key of tagsInt) {
          tags[key] = this.createTag(tagsInt[key]);
          tags[key].ext = this.createTag(tagsExt[key]);
        }
        this.tags = deepFreeze(tags);

        // Init parsers
        this.initParsers();

        return thesaurus;
      })
    );
  }

  public createTag(word: string): Tag {
    const tag: Tag = new Tag();
    let par;
    const pair = word.split(' ');
    tag.stat = pair[0].split(',');
    tag.flex = pair[1] ? pair[1].split(',') : [];

    for (const j of [0, 1]) {
      const grams = tag.getGrams(j);
      for (const i of Object.keys(grams)) {
        let gram = grams[i];
        tag.gram = true;
        // loc2 -> loct -> CAse
        while (this.thesaurus.grammemes[gram] && this.thesaurus.grammemes[gram].parent) {
          par = this.thesaurus.grammemes[gram].parent;
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

  public makeTag(tagInt: string, tagExt: string): any {
    const tag = this.createTag(tagInt);
    tag.ext = this.createTag(tagExt);

    return deepFreeze(tag);
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

    for (const key of config.parsers) {
      let name = config.parsers[key];
      const terminal = name[name.length - 1] !== '?';
      name = terminal ? name : name.slice(0, -1);
      if (name in this.parsers) {
        const vars = this.parsers[name].parse(word, config);
        for (const j of vars) {
          vars[j].parser = name;
          if (!vars[j].stutterCnt && !vars[j].typosCnt) {
            matched = true;
          }
        }

        parses = parses.concat(vars);
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
    for (const key of parses) {
      if (parses[key].parser === 'Dictionary') {
        const res = this.thesaurus.probabilities.findAll(parses[key] + ':' + parses[key].tag);
        if (res && res[0]) {
          parses[key].score = (res[0][1] / 1000000) * getDictionaryScore(parses[key].stutterCnt, parses[key].typosCnt);
          total += parses[key].score;
        }
      }
    }

    // Normalize Dictionary & non-Dictionary scores separately
    if (config.normalizeScore) {
      if (total > 0) {
        for (const key of parses) {
          if (parses[key].parser === 'Dictionary') {
            parses[key].score /= total;
          }
        }
      }

      total = 0;
      for (const key of parses) {
        if (parses[key].parser !== 'Dictionary') {
          total += parses[key].score;
        }
      }
      if (total > 0) {
        for (const key of parses) {
          if (parses[key].parser !==  'Dictionary') {
            parses[key].score /= total;
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
    // console.log();
    this.parsers.dictonary = new DictionaryParser(this.thesaurus.words, this.thesaurus.paradigms, this.tags);
  }
}
