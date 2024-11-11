import { toAbapGitXML } from '../abapgit/abapgit';
import { ComponentType } from './componentTypes';

export abstract class Component<T> {
  input: T;
  constructor(input: T) {
    this.input = input;
  }
  abstract toAbapgit(): unknown;
  abstract get abapgitSerializer(): string;
  abstract get type(): ComponentType;
  abstract get id(): string;
  toAbapgitXML(): string {
    return toAbapGitXML(this.toAbapgit(), this.abapgitSerializer);
  }
}
