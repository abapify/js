import { Spec } from '../../base';
import { Kind } from '../../kind';

export type ClassSpec = Spec<Class, Kind.Class>;
// export * from './adapters'; // Adapters directory doesn't exist yet

// Export the actual Class implementation
export * from './class.js';

interface Class {
  visibility: 'PUBLIC' | 'PRIVATE';
  isFinal: boolean;
  isAbstract: boolean;
  superclass?: string;
  interfaces: string[];
  components: {
    methods: ClassMethod[];
    attributes: ClassAttribute[];
    events: ClassEvent[];
    types: ClassType[];
  };
}

interface ClassMethod {
  name: string;
  visibility: 'PUBLIC' | 'PROTECTED' | 'PRIVATE';
  isStatic: boolean;
  isAbstract: boolean;
  isFinal: boolean;
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

interface ClassAttribute {
  name: string;
  visibility: 'PUBLIC' | 'PROTECTED' | 'PRIVATE';
  isStatic: boolean;
  isReadOnly: boolean;
  dataType: string;
  value?: string;
  description?: string;
}

interface ClassEvent {
  name: string;
  visibility: 'PUBLIC' | 'PROTECTED' | 'PRIVATE';
  parameters: EventParameter[];
  description?: string;
}

interface EventParameter {
  name: string;
  dataType: string;
  isOptional: boolean;
  description?: string;
}

interface ClassType {
  name: string;
  visibility: 'PUBLIC' | 'PROTECTED' | 'PRIVATE';
  definition: string;
  description?: string;
}
