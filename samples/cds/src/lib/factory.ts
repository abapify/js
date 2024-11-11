import {
  DataElement,
  DataElementInput,
  Domain,
  DomainInput,
} from '@abapify/components';
import { dset } from 'dset';

export class DdicFactory {
  static dataElement(
    input: DataElementInput
  ): DataElement | Array<DataElement | Domain> {
    const result: Array<DataElement | Domain> = [new DataElement(input)];

    if ('domain' in input && typeof input.domain === 'object') {
      // inherit name from data element if not specified
      if (!input.domain.name) {
        input.domain.name = input.name;
      }
      //inherit description from data element if not specified
      if (!input.domain.header?.description) {
        dset(input.domain, 'header.description', input.description);
      }
      result.push(DdicFactory.domain(input.domain));
    }

    return result;
  }
  static domain(input: DomainInput): Domain {
    return new Domain(input);
  }
}
