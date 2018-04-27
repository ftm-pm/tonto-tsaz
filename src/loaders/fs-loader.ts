import * as fs from 'fs';
import { Observable } from 'rxjs/Observable';

import { Dictionary } from '../dictonaries/dictonary';
import { Loader, LoaderConfig } from './loader';

/**
 * HttpLoaderConfig
 */
// export interface FSLoaderConfig extends LoaderConfig {
// }

/**
 * FSLoader
 */
export class FSLoader implements Loader {
  public load(options: LoaderConfig = <LoaderConfig> {}): Observable<Dictionary> {
    return;
  }
}
