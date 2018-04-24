/**
 * DictionaryInterface
 */
import { DAWG_FORMAT } from '../loaders/dawg';

export interface DictionaryInterface {
  url: string;
  responseType: string;
  type: DICTIONARY_TYPE;
  format ?: DAWG_FORMAT;
  getData(): any;
}

export enum DICTIONARY_TYPE {
  JSON = 'json',
  DAWG = 'dawg'
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
  public type: DICTIONARY_TYPE;

  /**
   * @inheritDoc
   */
  public format ?: DAWG_FORMAT;

  /**
   * @inheritDoc
   */
  public getData(): any {
    return;
  }
}
