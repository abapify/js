export {
  ObjectRegistry,
  createObject,
  ObjectTypeRegistry,
} from './object-registry';
export { Kind } from '../kind';

// Factory functions
import { Interface } from '../objects/interface';
import { Class } from '../objects/class';
import { Domain } from '../objects/domain';

export const createInterface = () => new Interface();
export const createClass = () => new Class();
export const createDomain = () => new Domain();

// Register object types with the registry when this module is imported
import { InterfaceConstructor } from '../objects/interface';
import { ClassConstructor } from '../objects/class';
import { DomainConstructor } from '../objects/domain';
import { ObjectRegistry } from './object-registry';
import { Kind } from '../kind';

ObjectRegistry.register(Kind.Interface, InterfaceConstructor as any);
ObjectRegistry.register(Kind.Class, ClassConstructor as any);
ObjectRegistry.register(Kind.Domain, DomainConstructor as any);
