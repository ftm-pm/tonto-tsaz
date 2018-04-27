import { getDictionaryScore } from '../utils/utils';
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
export class DictionaryParse extends Parse implements DictionaryParseConfig, ParseInterface {
  public prefix: string;
  public suffix: string;
  public paradigmIdx: number;
  public paradigm: any;
  public formIdx: number;
  public formCnt: any;
  public tag: Tag;
  public score: number;

  public static createDictionaryParse(paradigms, tags, word: string, paradigmIdx, formIdx, stutterCnt: number,
                                      typosCnt: number = 0, prefix: string = '', suffix: string = '', score: number = 0): DictionaryParse {
    const formCnt: number = paradigms.length / 3;
    const paradigm: any = paradigms[paradigmIdx];
    const config: DictionaryParseConfig = <DictionaryParseConfig> {
      word: word,
      paradigmIdx: paradigmIdx,
      paradigm: paradigm,
      formIdx: formIdx,
      formCnt: formCnt,
      tag: tags[paradigm[formCnt + formIdx]],
      score: getDictionaryScore(stutterCnt, typosCnt),
      prefix: prefix,
      suffix: suffix
    };

    return new DictionaryParse(config);
  }

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
