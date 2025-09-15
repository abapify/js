import { Kind } from './kind';

export type Spec<T, K extends Kind = Kind> = {
  kind: K;
  metadata: {
    name: string;
    description?: string;
  };
  spec: T;
};
