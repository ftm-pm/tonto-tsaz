/**
 * ParseReplacements
 */
export interface ParseReplacements {
  [index: string]: string;
}

/**
 * ParserConfig
 */
export interface ParserConfig {
  ignoreCase ?: boolean;
  replacements ?: ParseReplacements;
  stutter ?: any;
  typos ?: number;
  parsers ?: string[];
  forceParse ?: boolean;
  normalizeScore ?: boolean;
}

/**
 * ParserInterface
 */
export interface ParserInterface {
  parse(word: string, config): any;
}

/**
 * Parser
 */
export class Parser implements ParserInterface {
  public parse(word: string, config): any {
    return;
  }
}
