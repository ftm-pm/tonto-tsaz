import { Observable } from 'rxjs/Rx';
import { Dictionary, DICTIONARY_FILE_TYPE, DICTIONARY_TYPE } from '../dictonaries/dictonary';
import { DAWG_FORMAT } from './dawg';

/**
 * LoaderConfig
 */
export interface LoaderConfig {
  url ?: string;
  fileType ?: DICTIONARY_FILE_TYPE;
  type ?: DICTIONARY_TYPE;
  format ?: DAWG_FORMAT;
  responseType?: string;
}

/**
 * RESPONSE_TYPE
 */
export enum RESPONSE_TYPE {
  JSON = 'json',
  ARRAY_BUFFER = 'arraybuffer'
}

/**
 * Loader interface
 */
export interface Loader {
  /**
   * Return loaded recourse
   *
   * @param {LoaderConfig} options
   * @returns {Observable<any>}
   */
  load(options: LoaderConfig): Observable<Dictionary>;
}
