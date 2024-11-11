import { Component } from '../component';
import { ComponentType } from '../componentTypes';

interface PackageInput {
  name: string;
  description: string;
}

export class Package extends Component<PackageInput> {
  override get type(): ComponentType {
    return ComponentType.package;
  }
  override get id(): string {
    return this.input.name;
  }
  override get abapgitSerializer(): string {
    return 'LCL_OBJECT_DEVC';
  }
  override toAbapgit(): unknown {
    return {
      DEVC: {
        CTEXT: this.input.description,
      },
    };
  }
}
