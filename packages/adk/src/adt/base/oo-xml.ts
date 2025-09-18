import { XMLRoot, attributes } from '../../decorators';
import { abapoo } from '../../namespaces/abapoo.js';
import type { AbapOOType } from '../../namespaces/abapoo.js';
import type { AdtCoreType } from '../../namespaces/adtcore.js';
import type { AbapSourceType } from '../../namespaces/abapsource.js';
import type { AtomLinkType } from '../../namespaces/atom.js';
import type { PackageRefType } from '../../namespaces/adtcore.js';
import { BaseXML } from './base-xml.js';

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
   * Used by child OO classes in their parsing logic
   */
  protected static parseAbapOOAttributes(root: any): AbapOOType {
    return {
      modeled: root['@_abapoo:modeled'] === 'true',
    };
  }
}
