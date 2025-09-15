import { Spec } from '../../base';
import { Kind } from '../../kind';

export type InterfaceSpec = Spec<Interface, Kind.Interface>;

export interface Interface {
  category: 'IF' | 'CA'; // Interface or Category
  interfaces: string[]; // Implemented interfaces
  components: {
    methods: InterfaceMethod[];
    attributes: InterfaceAttribute[];
    events: InterfaceEvent[];
    types: InterfaceType[];
  };
}

export interface InterfaceMethod {
  name: string;
  isAbstract: boolean;
  parameters: MethodParameter[];
  exceptions: string[];
  description?: string;
}

export interface MethodParameter {
  name: string;
  type: 'IMPORTING' | 'EXPORTING' | 'CHANGING' | 'RETURNING';
  dataType: string;
  isOptional: boolean;
  defaultValue?: string;
  description?: string;
}

export interface InterfaceAttribute {
  name: string;
  isReadOnly: boolean;
  dataType: string;
  value?: string;
  description?: string;
}

export interface InterfaceEvent {
  name: string;
  parameters: EventParameter[];
  description?: string;
}

export interface EventParameter {
  name: string;
  dataType: string;
  isOptional: boolean;
  description?: string;
}

export interface InterfaceType {
  name: string;
  definition: string;
  description?: string;
}
