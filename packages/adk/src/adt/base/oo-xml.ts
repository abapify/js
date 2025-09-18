import { XMLRoot, attributes } from '../../decorators';
import { abapoo } from '../../namespaces/abapoo';
import type { AbapOOType } from '../../namespaces/abapoo';
import type { AdtCoreType } from '../../namespaces/adtcore';
import type { AbapSourceType } from '../../namespaces/abapsource';
import type { AtomLinkType } from '../../namespaces/atom';
import type { PackageRefType } from '../../namespaces/adtcore';
import { BaseXML } from './base-xml';

// Type-safe interface for parsed ABAP OO section - precise type safety
interface ParsedAbapOOSection {
  '@_abapoo:modeled'?: string;
}

/**
 * OoXML - Base class for Object-Oriented ADT objects (Classes, Interfaces)
 * Extends BaseXML with ABAP OO-specific attributes
 */
@XMLRoot('') // Will be overridden by child classes
export abstract class OoXML extends BaseXML {
  // ABAP OO-specific attributes - only for OO objects
  @abapoo
  @attributes
  oo: AbapOOType;

  constructor(data: {
    core: AdtCoreType;
    source: AbapSourceType;
    oo: AbapOOType;
    atomLinks?: AtomLinkType[];
    packageRef?: PackageRefType;
  }) {
    // BaseXML handles truly common attributes
    super({
      core: data.core,
      source: data.source,
      atomLinks: data.atomLinks,
      packageRef: data.packageRef,
    });

    // OoXML adds OO-specific attributes
    this.oo = data.oo;
  }

  /**
   * Parse common ABAP OO attributes from XML root
   * Precise type safety - catches type errors at compile time
   */
  protected static parseAbapOOAttributes(
    root: ParsedAbapOOSection
  ): AbapOOType {
    return {
      modeled: root['@_abapoo:modeled'] === 'true',
    };
  }
}
