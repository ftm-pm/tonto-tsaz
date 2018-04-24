import { Observable } from 'rxjs/Rx';
import { DICTIONARY_TYPE } from '../dictonaries/dictonary';
import { DAWG_FORMAT } from './dawg';

export interface LoaderConfig {
  url ?: string;
  type ?: DICTIONARY_TYPE;
  format ?: DAWG_FORMAT;
  responseType?: string;
}

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
  load(options: LoaderConfig): Observable<any>;
}
