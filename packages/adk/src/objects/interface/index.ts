import { Spec } from '../base';
import { Kind } from '../kind';

export type InterfaceSpec = Spec<Interface, Kind.Interface>;
export * from './adapters';

interface Interface {
  category: 'IF' | 'CA'; // Interface or Category
  interfaces: string[]; // Implemented interfaces
  components: {
    methods: InterfaceMethod[];
    attributes: InterfaceAttribute[];
    events: InterfaceEvent[];
    types: InterfaceType[];
  };
}

interface InterfaceMethod {
  name: string;
  isAbstract: boolean;
  parameters: MethodParameter[];
  exceptions: string[];
  description?: string;
}

interface MethodParameter {
  name: string;
  type: 'IMPORTING' | 'EXPORTING' | 'CHANGING' | 'RETURNING';
  dataType: string;
  isOptional: boolean;
  defaultValue?: string;
  description?: string;
}

interface InterfaceAttribute {
  name: string;
  isReadOnly: boolean;
  dataType: string;
  value?: string;
  description?: string;
}

interface InterfaceEvent {
  name: string;
  parameters: EventParameter[];
  description?: string;
}

interface EventParameter {
  name: string;
  dataType: string;
  isOptional: boolean;
  description?: string;
}

interface InterfaceType {
  name: string;
  definition: string;
  description?: string;
}
