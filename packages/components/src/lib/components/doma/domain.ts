import { Component } from '../component';
import { ComponentType } from '../componentTypes';
import { DomainInput } from './domainInput';

export class Domain extends Component<DomainInput> {
  override get type(): ComponentType {
    return ComponentType.domain;
  }
  override get id(): string {
    return this.input.name;
  }
  override get abapgitSerializer(): string {
    return 'LCL_OBJECT_DOMA';
  }
  override toAbapgit() {
    const input = this.input;
    return {
      DD01V: {
        DOMNAME: input.name,
        DDLANGUAGE: input.header?.originalLanguage,
        DATATYPE: input.dataType,
        LENG: input.length,
        OUTPUTLEN: input.outputLength,
        DDTEXT: input.header?.description,
      },
    };
  }
}

export * from './domainInput';
