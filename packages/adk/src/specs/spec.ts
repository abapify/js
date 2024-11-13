import { Kind } from './kind';

export type Spec<T> = {
  kind: Kind;
  metadata: {
    name: string;
    description?: string;
  };
  spec: T;
};
