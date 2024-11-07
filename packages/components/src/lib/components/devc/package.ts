import { Component } from '../component';

interface PackageInput {
  description: string;
}

export class Package extends Component<PackageInput> {
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
