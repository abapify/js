import type { Spec } from '../base.js';
import { Kind } from '../kind.js';

export type DomainSpec = Spec<Domain, Kind.Domain>;
export * from './adapters';

interface Domain {
  typeInformation: {
    datatype: string;
    length: number;
    decimals: number;
  };
  outputInformation: {
    length: number;
    style: string;
    conversionExit?: string;
    signExists: boolean;
    lowercase: boolean;
    ampmFormat: boolean;
  };
  valueInformation: {
    valueTableRef?: string;
    appendExists: boolean;
    fixValues: {
      position: number;
      low: string;
      high?: string;
      text: string;
    }[];
  };
}
