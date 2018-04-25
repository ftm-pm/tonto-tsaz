import * as fs from 'fs';

import { Observable } from 'rxjs/Observable';

import { Loader, LoaderConfig } from './loader';

import { Dictionary } from '../dictonaries/dictonary';

/**
 * HttpLoaderConfig
 */
// export interface FSLoaderConfig extends LoaderConfig {
// }

/**
 * FSLoader
 */
export class FSLoader implements Loader {
  /**
   * @inheritDoc
   */
  public load(options: LoaderConfig = <LoaderConfig> {}): Observable<Dictionary> {
    return;
  }
}
