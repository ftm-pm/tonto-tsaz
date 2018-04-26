import { Observable } from 'rxjs/Observable';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { map } from 'rxjs/operators';

import { _throw } from 'rxjs/observable/throw';

import { Loader, RESPONSE_TYPE } from '../loaders/loader';
import { Dictionary, DICTIONARY_FILE_TYPE, DICTIONARY_TYPE, DictionaryInterface } from './dictonary';

import { DAWG_FORMAT } from '../loaders/dawg';
import { FSLoader } from '../loaders/fs-loader';
import { HttpLoader } from '../loaders/http-loader';
import { Thesaurus, ThesaurusInterface } from './thesaurus';

/**
 * DictionaryManagerInterface
 */
export interface DictionaryManagerInterface {
  loads(): Observable<ThesaurusInterface>;
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
 * Grammeme
 */
export interface Grammeme {
  parent: number;
  internal: number;
  external: number;
  externalFull: number;
}

/**
 * DictionaryManager
 */
export class DictionaryManager implements DictionaryManagerInterface {
  /**
   * Loader dictionaries from files
   */
  private readonly loader: Loader;

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
      } else {
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
      this.dictionaries = DictionaryManager.getBaseDictionaries();
    } else {
      this.dictionaries = config.dictionaries;
    }
  }

  /**
   * Return bases dictionaries
   * @returns {Dictionary[]}
   */
  private static getBaseDictionaries(): Dictionary[] {
    return [
      new Dictionary(<DictionaryInterface> {
        url: '/dicts/grammemes.json',
        fileType: DICTIONARY_FILE_TYPE.JSON,
        responseType: RESPONSE_TYPE.JSON,
        type: DICTIONARY_TYPE.GRAMMEMES
      }),
      new Dictionary(<DictionaryInterface> {
        url: '/dicts/gramtab-opencorpora-ext.json',
        fileType: DICTIONARY_FILE_TYPE.JSON,
        responseType: RESPONSE_TYPE.JSON,
        type: DICTIONARY_TYPE.TAGS_EXT
      }),
      new Dictionary(<DictionaryInterface> {
        url: '/dicts/gramtab-opencorpora-int.json',
        fileType: DICTIONARY_FILE_TYPE.JSON,
        responseType: RESPONSE_TYPE.JSON,
        type: DICTIONARY_TYPE.TAGS_INT
      }),
      new Dictionary(<DictionaryInterface> {
        url: '/dicts/p_t_given_w.intdawg',
        fileType: DICTIONARY_FILE_TYPE.DAWG,
        format: DAWG_FORMAT.INT,
        responseType: RESPONSE_TYPE.ARRAY_BUFFER,
        type: DICTIONARY_TYPE.PROBABILITIES
      }),
      new Dictionary(<DictionaryInterface> {
        url: '/dicts/paradigms.array',
        fileType: DICTIONARY_FILE_TYPE.EMPTY,
        responseType: RESPONSE_TYPE.ARRAY_BUFFER,
        type: DICTIONARY_TYPE.PARADIGMS
      }),
      new Dictionary(<DictionaryInterface> {
        url: '/dicts/prediction-suffixes-0.dawg',
        fileType: DICTIONARY_FILE_TYPE.DAWG,
        format: DAWG_FORMAT.PROBS,
        responseType: RESPONSE_TYPE.ARRAY_BUFFER,
        type: DICTIONARY_TYPE.PREDICTION_SUFFIXES
      }),
      new Dictionary(<DictionaryInterface> {
        url: '/dicts/prediction-suffixes-1.dawg',
        fileType: DICTIONARY_FILE_TYPE.DAWG,
        format: DAWG_FORMAT.PROBS,
        responseType: RESPONSE_TYPE.ARRAY_BUFFER,
        type: DICTIONARY_TYPE.PREDICTION_SUFFIXES
      }),
      new Dictionary(<DictionaryInterface> {
        url: '/dicts/prediction-suffixes-2.dawg',
        fileType: DICTIONARY_FILE_TYPE.DAWG,
        format: DAWG_FORMAT.PROBS,
        responseType: RESPONSE_TYPE.ARRAY_BUFFER,
        type: DICTIONARY_TYPE.PREDICTION_SUFFIXES
      }),
      new Dictionary(<DictionaryInterface> {
        url: '/dicts/suffixes.json',
        fileType: DICTIONARY_FILE_TYPE.JSON,
        responseType: RESPONSE_TYPE.JSON,
        type: DICTIONARY_TYPE.SUFFIXES
      }),
      new Dictionary(<DictionaryInterface> {
        url: '/dicts/words.dawg',
        fileType: DICTIONARY_FILE_TYPE.DAWG,
        format: DAWG_FORMAT.WORDS,
        responseType: RESPONSE_TYPE.ARRAY_BUFFER,
        type: DICTIONARY_TYPE.WORDS
      })
    ];
  }

  public loads(): Observable<ThesaurusInterface> {
    if (!this.loader) {
      return _throw('Loader is undefind');
    }
    const dicts = this.dictionaries.map((dictionary: Dictionary) => this.loader.load(dictionary));

    return combineLatest(dicts).pipe(map((dictionaries: Dictionary[]) => {
        this.dictionaries = dictionaries;
        const dictonaryResponse: ThesaurusInterface = new Thesaurus();
        dictionaries.forEach(dictonary => {
          const data: any = dictonary.getData();
          switch (dictonary.type) {
            case DICTIONARY_TYPE.WORDS:
              dictonaryResponse.words = data;
              break;
            case DICTIONARY_TYPE.PREDICTION_SUFFIXES:
              if (!dictonaryResponse.predictionSuffixes) {
                dictonaryResponse.predictionSuffixes = [];
              }
              dictonaryResponse.predictionSuffixes.push(data);
              break;
            case DICTIONARY_TYPE.PROBABILITIES:
              dictonaryResponse.probabilities = data;
              break;
            case DICTIONARY_TYPE.GRAMMEMES:
              if (!dictonaryResponse.grammemes) {
                dictonaryResponse.grammemes = [];
              }
              for (const key of Object.keys(data)) {
                dictonaryResponse.grammemes[data[key][0]] = dictonaryResponse.grammemes[data[key][2]] = <Grammeme> {
                  parent: data[key][1],
                  internal: data[key][0],
                  external: data[key][2],
                  externalFull: data[key][3]
                };
              }
              break;
            case DICTIONARY_TYPE.TAGS_INT:
              dictonaryResponse.tagsInt = data;
              break;
            case DICTIONARY_TYPE.TAGS_EXT:
              dictonaryResponse.tagsExpr = data;
              break;
            case DICTIONARY_TYPE.SUFFIXES:
              dictonaryResponse.suffixes = data;
              break;
            case DICTIONARY_TYPE.PARADIGMS:
              if (!dictonaryResponse.paradigms) {
                dictonaryResponse.paradigms = [];
              }
              const list: Uint16Array = new Uint16Array(data);
              const count: number = list[0];
              let pos: number = 1;

              for (let i = 0; i < count; i++) {
                const size: number = list[pos++];
                dictonaryResponse.paradigms.push(list.subarray(pos, pos + size));
                pos += size;
              }
              break;
            default:
              return _throw(`Unknown DICTIONARY_TYPE ${dictonary.type}`);
          }
        });

        return dictonaryResponse;
      })
    );
  }
}
