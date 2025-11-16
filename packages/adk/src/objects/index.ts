/**
 * ADK Objects
 *
 * Organized by ADT type prefix:
 * - clas/ - ABAP Classes (CLAS/OC, CLAS/OI)
 * - intf/ - ABAP Interfaces (INTF/OI)
 * - doma/ - ABAP Domains (DOMA/DD)
 * - devc/ - ABAP Packages (DEVC/K)
 */

export { Interface, InterfaceConstructor } from './intf';
export { Class, ClassConstructor } from './clas';
export { Domain, DomainConstructor } from './doma';
export { Package, PackageConstructor } from './devc';
export { GenericAbapObject } from './generic';
