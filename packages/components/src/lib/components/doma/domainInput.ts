import { DataTypes } from './dataTypes';
import { OutputStyle } from './outputStyle';

export interface DomainInput {
  name: string;
  formatVersion: '1';
  header?: {
    description: string;
    originalLanguage: string;
    abapLanguageVersion?: 'standard' | 'keyUser' | 'cloudDevelopment';
  };
  dataType: DataTypes;
  length: number;
  decimals?: number;
  negativeValues?: boolean;
  caseSensitive?: boolean;
  outputLength?: number;
  conversionRoutine?: string;
  valueTable?: string;
  fixedValues?: Array<{
    fixedValue: string;
    description: string;
  }>;
  fixedValueIntervals?: Array<{
    lowLimit?: string;
    highLimit: string;
    description?: string;
  }>;
  outputStyle?: OutputStyle;
}
