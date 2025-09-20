import { xml, root, namespace, name } from '../../../decorators/decorators-v2';
import { class_ } from '../../../namespaces/class';
import type { ClassType } from '../../../namespaces/class';
import type { AdtCoreType } from '../../../namespaces/adtcore';
import type { AbapOOType } from '../../../namespaces/abapoo';
import type { AbapSourceType } from '../../../namespaces/abapsource';
import type { AtomLinkType } from '../../../namespaces/atom';
import type { PackageRefType } from '../../../namespaces/adtcore';
import { OoXML } from '../oo-xml';

/**
 * ClassXML - Class-specific XML representation extending BaseXML
 * Focuses only on class-specific attributes, inherits common ADT attributes
 */
@xml()
export class ClassXML extends OoXML {
  // Root element
  @root
  @namespace('class')
  @name('abapClass')
  classRoot: any = {};

  // Only class-specific attributes - BaseXML handles the common ones
  @class_
  classAttrs: ClassType;

  constructor(data: {
    core: AdtCoreType;
    oo: AbapOOType;
    source: AbapSourceType;
    classAttrs: ClassType;
    atomLinks?: AtomLinkType[];
  }) {
    // OoXML handles common OO attributes
    super({
      core: data.core,
      source: data.source,
      oo: data.oo,
      atomLinks: data.atomLinks,
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
  }): ClassXML {
    return new ClassXML({
      core: classData.adtcore,
      oo: classData.abapoo,
      source: classData.abapsource,
      classAttrs: classData.classAttrs,
      atomLinks: classData.links,
    });
  }
}
