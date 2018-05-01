import { Parse, ParseConfig } from './parse';

/**
 * CombinedParseConfig
 */
export interface CombinedParseConfig extends ParseConfig {
  left ?: any;
  right ?: any;
}

/**
 * CombinedParse
 */
export class CombinedParse extends Parse implements CombinedParseConfig {
  public left: any;
  public right: any;

  /**
   * Constructor CombinedParse
   * @param {CombinedParseConfig} config
   */
  public constructor(config: CombinedParseConfig = <CombinedParseConfig> {}) {
    super(config);
    if (config.left) {
      this.left = config.left;
    }
    if (config.right) {
      this.right = config.right;
    }
  }

  public inflect(tag, grammemes ?: any): CombinedParse | boolean {
    let resp;

    let left;
    const right = this.right.inflect(tag, grammemes);
    if (!grammemes && typeof tag === 'number') {
      left = this.left.inflect(right.tag, ['POST', 'NMbr', 'CAse', 'PErs', 'TEns']);
    } else {
      left = this.left.inflect(tag, grammemes);
    }
    if (left && right) {
      resp = new CombinedParse({
        left: left,
        right: right
      });
    } else {
      resp =  false;
    }

    return resp;
  }

  public toString() {
    return `${this.left.word} - ${this.right.word}`;
  }
}
