import { DAWG_FORMAT } from '../loaders/dawg';

/**
 * DictionaryInterface
 */
export interface DictionaryInterface {
  url: string;
  responseType: string;
  fileType: DICTIONARY_FILE_TYPE;
  type: DICTIONARY_TYPE;
  format ?: DAWG_FORMAT;
  getData(): any;
}

/**
 * Dictionary file type
 */
export enum DICTIONARY_FILE_TYPE {
  JSON = 'json',
  EMPTY = '',
  DAWG = 'dawg'
}

/**
 * Dictionary type
 */
export enum DICTIONARY_TYPE {
  WORDS = 'words',
  PREDICTION_SUFFIXES = 'predictionSuffixes',
  PROBABILITIES = 'probabilities',
  GRAMMEMES = 'grammemes',
  TAGS_INT = 'tagsInt',
  TAGS_EXT = 'tagsExt',
  SUFFIXES = 'suffixes',
  PARADIGMS = 'paradigms',
}

/**
 * Dictionary
 */
export class Dictionary implements DictionaryInterface {
  /**
   * @inheritDoc
   */
  public url: string;

  /**
   * @inheritDoc
   */
  public responseType: string;

  /**
   * @inheritDoc
   */
  public fileType: DICTIONARY_FILE_TYPE;

  /**
   * @inheritDoc
   */
  public format ?: DAWG_FORMAT;

  /**
   * @inheritDoc
   */
  public type: DICTIONARY_TYPE;

  /**
   * Data
   */
  public data: any;

  /**
   * Constructor Dictionary
   * @param {DictionaryInterface} config
   */
  public constructor(config: any = {}) {
    for (const key of Object.keys(config)) {
      this[key] = config[key];
    }
  }


  public getUrl(): string {
    return this.url;
  }

  public setUrl(value: string) {
    this.url = value;
  }

  public getResponseType(): string {
    return this.responseType;
  }

  public setResponseType(value: string) {
    this.responseType = value;
  }

  public getFileType(): DICTIONARY_FILE_TYPE {
    return this.fileType;
  }

  public setFileType(value: DICTIONARY_FILE_TYPE) {
    this.fileType = value;
  }

  public getFormat(): DAWG_FORMAT {
    return this.format;
  }

  public setFormat(value: DAWG_FORMAT) {
    this.format = value;
  }

  public getType(): DICTIONARY_TYPE {
    return this.type;
  }

  public setType(value: DICTIONARY_TYPE) {
    this.type = value;
  }

  /**
   * @inheritDoc
   */
  public getData(): any {
    return this.data;
  }

  public setData(value: any) {
    this.data = value;
  }
}
