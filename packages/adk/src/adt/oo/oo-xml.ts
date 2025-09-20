import { xml } from '../../decorators/decorators-v2';
import { BaseXML } from '../base/base-xml-v2';
import { abapsource } from '../../namespaces/abapsource';
import { abapoo } from '../../namespaces/abapoo';
import type { AdtCoreType } from '../../namespaces/adtcore';
import type { AbapSourceType } from '../../namespaces/abapsource';
import type { AbapOOType } from '../../namespaces/abapoo';
import type { AtomLinkType } from '../../namespaces/atom';

/**
 * OoXML - Base class for Object-Oriented ADT objects (Classes, Interfaces)
 * Extends BaseXML with abapsource + abapoo attributes for source code objects
 */
@xml()
export abstract class OoXML extends BaseXML {
  // ABAP Source attributes - only for objects with source code
  @abapsource
  source: AbapSourceType;

  // ABAP OO-specific attributes - only for OO objects
  @abapoo
  oo: AbapOOType;

  constructor(data: {
    core: AdtCoreType;
    source: AbapSourceType;
    oo: AbapOOType;
    atomLinks?: AtomLinkType[];
  }) {
    // Call BaseXML constructor
    super({
      core: data.core,
      atomLinks: data.atomLinks,
    });

    // Set OO-specific properties
    this.source = data.source;
    this.oo = data.oo;
  }
}
