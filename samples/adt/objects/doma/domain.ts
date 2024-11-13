import { Component } from '../../common/component';
// Namespace: doma/content
interface DomaContent {
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

export type Domain = Component<{ content: DomaContent }>;
