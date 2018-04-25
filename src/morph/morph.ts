import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators/map';

import {
  DictionaryManager,
  DictionaryManagerConfig,
  DictionaryManagerInterface,
  Thesaurus
} from '../dictonaries/dictionary-manager';

/**
 * MorphInterface
 */
export interface MorphInterface {
  /**
   * @returns {boolean}
   */
  init(): Observable<any>;

  /**
   * @param {string} lexeme
   */
  parse(lexeme: string): void;
}

export interface MorphConfig {
  dictionary ?: DictionaryManagerConfig;
}

/**
 * Morph
 */
export class Morph implements MorphInterface {
  /**
   * Dictionary manager
   */
  private dictionaryManager: DictionaryManagerInterface;

  /**
   * All dictionaries
   */
  private thesaurus: Thesaurus;

  /**
   * Constructor Morph
   * @param {MorphConfig} config
   */
  public constructor(config: MorphConfig = {}) {
    this.dictionaryManager = new DictionaryManager(config.dictionary);
  }

  /**
   * @inheritDoc
   */
  public init(): Observable<any> {
    return this.dictionaryManager.loads().pipe(
      map( (thesaurus: Thesaurus) => {
        this.thesaurus = thesaurus;
        return thesaurus;
      })
    );
  }

  /**
   * @inheritDoc
   */
  public parse(lexeme: string): void {
    // console.log();
  }

  /**
   * Взято из https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
   *
   * @param obj
   * @returns {ReadonlyArray<any>}
   */
  public static deepFreeze(obj: any) {
    if (!('freeze' in Object)) {
      return;
    }

    const propNames = Object.getOwnPropertyNames(obj);
    propNames.forEach(name => {
      const prop = obj[name];

      if (typeof prop === 'object' && prop !== null) {
        this.deepFreeze(prop);
      }
    });

    return Object.freeze(obj);
  }
}
