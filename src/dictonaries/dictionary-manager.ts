import { Loader, LoaderConfig, RESPONSE_TYPE } from '../loaders/loader';

import { Observable } from 'rxjs/Observable';
import { combineLatest } from 'rxjs/observable/combineLatest';

import { FSLoader } from '../loaders/fs-loader';
import { HttpLoader } from '../loaders/http-loader';

import { _throw } from 'rxjs/observable/throw';
import { Dictionary, DICTIONARY_TYPE } from './dictonary';

import { DAWG_FORMAT } from '../loaders/dawg';

/**
 * DictionaryManagerInterface
 */
export interface DictionaryManagerInterface {
  loads(): Observable<any[]>;
}

/**
 * DictionaryManagerInterface
 */
export interface DictionaryManagerConfig {
  loader?: Loader;
  useLoader?: string;
  dictionaries?: Dictionary[];
}

/**
 * DictionaryManager
 */
export class DictionaryManager implements DictionaryManagerInterface {
  /**
   * List dictionaries
   * @type {string[]}
   */
  public static BASE_DICTIONARIES: Dictionary[] = [
    <Dictionary> {
      url: '/dicts/grammemes.json',
      type: DICTIONARY_TYPE.JSON,
      responseType: RESPONSE_TYPE.JSON
    },
    <Dictionary> {
      url: '/dicts/gramtab-opencorpora-ext.json',
      type: DICTIONARY_TYPE.JSON,
      responseType: RESPONSE_TYPE.JSON
    },
    <Dictionary> {
      url: '/dicts/gramtab-opencorpora-int.json',
      type: DICTIONARY_TYPE.JSON,
      responseType: RESPONSE_TYPE.JSON
    },
    <Dictionary> {
      url: '/dicts/meta.json',
      type: DICTIONARY_TYPE.JSON,
      responseType: RESPONSE_TYPE.JSON
    },
    <Dictionary> {
      url: '/dicts/p_t_given_w.intdawg',
      type: DICTIONARY_TYPE.DAWG,
      format: DAWG_FORMAT.INT,
      responseType: RESPONSE_TYPE.ARRAY_BUFFER
    },
    <Dictionary> {
      url: '/dicts/paradigms.array',
      type: 'json',
      responseType: RESPONSE_TYPE.ARRAY_BUFFER
    },
    <Dictionary> {
      url: '/dicts/prediction-suffixes-0.dawg',
      type: DICTIONARY_TYPE.DAWG,
      format: DAWG_FORMAT.PROBS,
      responseType: RESPONSE_TYPE.ARRAY_BUFFER
    },
    <Dictionary> {
      url: '/dicts/prediction-suffixes-1.dawg',
      type: DICTIONARY_TYPE.DAWG,
      format: DAWG_FORMAT.PROBS,
      responseType: RESPONSE_TYPE.ARRAY_BUFFER
    },
    <Dictionary> {
      url: '/dicts/prediction-suffixes-2.dawg',
      type: DICTIONARY_TYPE.DAWG,
      format: DAWG_FORMAT.PROBS,
      responseType: RESPONSE_TYPE.ARRAY_BUFFER
    },
    <Dictionary> {
      url: '/dicts/suffixes.json',
      type: DICTIONARY_TYPE.JSON,
      responseType: RESPONSE_TYPE.JSON
    },
    <Dictionary> {
      url: '/dicts/words.dawg',
      type: DICTIONARY_TYPE.DAWG,
      format: DAWG_FORMAT.WORDS,
      responseType: RESPONSE_TYPE.ARRAY_BUFFER
    }
  ];

  /**
   * Loader dictionaries from files
   */
  private loader: Loader;

  /**
   * List dictionaries
   */
  private dictionaries: Dictionary[];

  /**
   * Constructor DictionaryManager
   *
   * @param {DictionaryManagerConfig} config
   */
  public constructor(config: DictionaryManagerConfig = {}) {
    // Set loader
    if (!config.loader) {
      if (typeof require !== 'undefined') {
        this.loader = new FSLoader();
      } else  {
        this.loader = new HttpLoader();
      }
    } else {
      this.loader = config.loader;
    }

    if (config.useLoader) {
      switch (config.useLoader) {
        case 'http':
          this.loader = new HttpLoader();
          break;
        case 'fs':
          this.loader = new FSLoader();
          break;
        default:
          throw new Error('Type loader not found');
      }
    }
    // Set dictionaries
    if (!config.dictionaries) {
      this.dictionaries = DictionaryManager.BASE_DICTIONARIES;
    } else {
      this.dictionaries = config.dictionaries;
    }
  }

  /**
   * @inheritDoc
   */
  public loads(): Observable<any[]> {
    if (!this.loader) {
      return _throw('Loader is undefind');
    }
    const dictionaries = this.dictionaries.map((dictionary: Dictionary) => this.loader.load(dictionary));

    return combineLatest(dictionaries);
  }
}
