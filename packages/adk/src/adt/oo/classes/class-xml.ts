import { XMLRoot, attributes } from '../../../decorators';
import { classNs } from '../../../namespaces/class';
import type { ClassType } from '../../../namespaces/class';
import type { AdtCoreType } from '../../../namespaces/adtcore';
import type { AbapOOType } from '../../../namespaces/abapoo';
import type { AbapSourceType } from '../../../namespaces/abapsource';
import type { AtomLinkType } from '../../../namespaces/atom';
import type { PackageRefType } from '../../../namespaces/adtcore';
import { OoXML } from '../../base/oo-xml';
import type {
  ExtractXMLTypeWithSchema,
  AttrSchema,
  ElemSchema,
} from '../../../decorators/type-inference';

// Use the intelligent type system - no manual type definitions needed!

/**
 * ClassXML - Class-specific XML representation extending BaseXML
 * Focuses only on class-specific attributes, inherits common ADT attributes
 */
@XMLRoot('class:abapClass')
export class ClassXML extends OoXML {
  // Only class-specific attributes - BaseXML handles the common ones
  @classNs
  @attributes
  classAttrs: ClassType;

  constructor(data: {
    core: AdtCoreType;
    oo: AbapOOType;
    source: AbapSourceType;
    classAttrs: ClassType;
    atomLinks?: AtomLinkType[];
    packageRef?: PackageRefType;
  }) {
    // OoXML handles common OO attributes
    super({
      core: data.core,
      oo: data.oo,
      source: data.source,
      atomLinks: data.atomLinks,
      packageRef: data.packageRef,
    });

    // Only set class-specific attributes
    this.classAttrs = data.classAttrs;
  }

  /**
   * Create ClassXML from Class domain data
   */
  static fromClass(classData: {
    adtcore: AdtCoreType;
    abapoo: AbapOOType;
    abapsource: AbapSourceType;
    classAttrs: ClassType;
    links?: AtomLinkType[];
    packageRef?: PackageRefType;
  }): ClassXML {
    return new ClassXML({
      core: classData.adtcore,
      oo: classData.abapoo,
      source: classData.abapsource,
      classAttrs: classData.classAttrs,
      atomLinks: classData.links,
      packageRef: classData.packageRef,
    });
  }

  /**
   * Parse ADT XML string to ClassXML instance
   * Uses BaseXML for common parsing, focuses on class-specific logic
   */
  static fromXMLString(xml: string): ClassXML {
    const parsed = OoXML.parseXMLString(xml);
    const root = parsed['class:abapClass'] as ClassXMLParsedType;

    // Use OoXML helpers for common attributes
    const adtcore = OoXML.parseAdtCoreAttributes(root);
    const abapoo = OoXML.parseAbapOOAttributes(root);
    const abapsource = OoXML.parseAbapSourceAttributes(root);
    const packageRef = OoXML.parsePackageRef(root);
    const atomLinks = OoXML.parseAtomLinks(root);

    // Parse only class-specific attributes
    const classAttrs: ClassType = {
      final: root['@_class:final'] === 'true' || root['@_class:final'] === '',
      abstract:
        root['@_class:abstract'] === 'true' || root['@_class:abstract'] === '',
      visibility: root['@_class:visibility'] as
        | 'public'
        | 'protected'
        | 'private',
      category: root['@_class:category'],
      hasTests:
        root['@_class:hasTests'] === 'true' || root['@_class:hasTests'] === '',
      sharedMemoryEnabled:
        root['@_class:sharedMemoryEnabled'] === 'true' ||
        root['@_class:sharedMemoryEnabled'] === '',
    };

    return new ClassXML({
      core: adtcore,
      oo: abapoo,
      source: abapsource,
      classAttrs,
      atomLinks,
      packageRef,
    });
  }
}

/**
 * Schema definition for ClassXML automatic type generation
 * Extends the intelligent type system like InterfaceXML does
 */
type ClassXMLSchema = {
  core: AttrSchema<'adtcore'>;
  oo: AttrSchema<'abapoo'>;
  source: AttrSchema<'abapsource'>;
  classAttrs: AttrSchema<'class'>;
  atomLinks: ElemSchema<'atom', 'link'>;
  packageRef: ElemSchema<'adtcore', 'packageRef'>;
};

/**
 * Automatically generated XML parsed type from the intelligent schema
 * Uses the same system as InterfaceXML
 */
export type ClassXMLParsedType = ExtractXMLTypeWithSchema<
  ClassXML,
  ClassXMLSchema
>;

// Type-safe parsing now handled by BaseXML helper methods with proper interfaces
