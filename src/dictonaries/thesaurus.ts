import { DAWG } from '../loaders/dawg';
import { Grammeme } from './dictionary-manager';

/**
 * ThesaurusInterface
 */
export interface ThesaurusInterface {
  words: DAWG;
  predictionSuffixes: DAWG[];
  probabilities: DAWG;
  grammemes: Grammeme[];
  tagsInt: string[];
  tagsExpr: string[];
  suffixes: string[];
  paradigms: Uint16Array[];
}

/**
 * Thesaurus
 */
export class Thesaurus implements ThesaurusInterface {
  public words: DAWG;
  public predictionSuffixes: DAWG[];
  public probabilities: DAWG;
  public grammemes: Grammeme[];
  public tagsInt: string[];
  public tagsExpr: string[];
  public suffixes: string[];
  public paradigms: Uint16Array[];
}
