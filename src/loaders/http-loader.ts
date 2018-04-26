import { Loader, LoaderConfig } from './loader';

import { Observable } from 'rxjs/observable';
import { ajax } from 'rxjs/observable/dom/ajax';

import { _throw } from 'rxjs/observable/throw';
import { map } from 'rxjs/operators';

import { AjaxRequest, AjaxResponse } from 'rxjs/Rx';
import { Dictionary, DICTIONARY_FILE_TYPE } from '../dictonaries/dictonary';
import { DAWG } from './dawg';

/**
 * HttpLoaderConfig
 */
export interface HttpLoaderConfig extends LoaderConfig, AjaxRequest {
  method?: string;
}

/**
 * HttpLoader
 */
export class HttpLoader implements Loader {
  public load(options: HttpLoaderConfig = <HttpLoaderConfig> {method: 'GET'}): Observable<Dictionary> {
    if (!options.hasOwnProperty('url')) {
      return _throw('Path is empty');
    }
    if (!options.responseType && options.url.lastIndexOf('.') < options.url.length) {
      const ext = options.url.substr(1 + options.url.lastIndexOf('.'));
      if (ext !== 'json') {
        options.responseType = 'arraybuffer';
      }
    }

    return ajax(options)
      .pipe(map((response: AjaxResponse) => {
          if (options.fileType === DICTIONARY_FILE_TYPE.DAWG) {
            // const ab: ArrayBuffer = new ArrayBuffer(response.response.length);
            // const view: Uint8Array = new Uint8Array(ab);
            // for (let i = 0; i < response.response.length; ++i) {
            //   view[i] = response.response[i];
            // }
            // response.response = ab;
            response.response = DAWG.createDAWGfromArrayBuffer(response.response, options.format);
          }
          options['data'] = response.response;

          return <Dictionary> options;
        })
      );
  }
}
