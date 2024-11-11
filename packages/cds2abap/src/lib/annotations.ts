import { DomainInput } from '@abapify/components';
import { DataElementInput } from '@abapify/components';

// create generic type GeneratorInput extending the given type with { generate?: true }

type GeneratorInput<T> = T & { generate?: true };

export interface AbapAnnotation {
  '@abap': {
    ddic?: {
      dataElement?: GeneratorInput<DataElementInput> | string;
      domain?: GeneratorInput<DomainInput> | string;
      [key: string]: string | GeneratorInput<unknown> | undefined; // Index signature
    };
  };
}
