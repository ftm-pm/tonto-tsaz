import { Parse, ParseConfig, ParseInterface } from './parse';
import { Tag } from './tag';

/**
 * DictionaryParseConfig
 */
export interface DictionaryParseConfig extends ParseConfig {
  prefix ?: string;
  suffix ?: string;
  paradigmIdx ?: number;
  paradigm ?: any;
  formIdx: number;
  formCnt ?: any;
  tag ?: Tag;
  score ?: number;
}

/**
 * DictionaryParse
 */
export class DictionaryParse extends Parse implements ParseInterface {
  public prefix: string;
  public suffix: string;

  /**
   * DictionaryParse
   *
   * @param {DictionaryParseConfig} config
   */
  public constructor(config ?: DictionaryParseConfig) {
    super(config);
    if (this.prefix == null) {
      this.prefix = '';
    }
    if (this.suffix == null) {
      this.suffix = '';
    }
  }
}
