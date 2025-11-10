import { xml, root, namespace, attribute, attributes, element } from '../../decorators';
import { OoSpec } from '../../base/oo-xml';
import { BaseSpec } from '../../base/base-spec';
import type { ClassAttrs } from './types';
import { AtomLink } from '../atom';
import type { LazyContent } from '../../base/lazy-content';

/**
 * ClassInclude - Represents a class include with nested atom links
 * Extends BaseSpec to inherit adtcore attributes and atom links
 *
 * Supports lazy loading of content via the `content` property.
 */
@xml
export class ClassInclude extends BaseSpec {
  @namespace('class', 'http://www.sap.com/adt/oo/classes')
  @attribute
  includeType!: string;

  @namespace('abapsource', 'http://www.sap.com/adt/abapsource')
  @attribute
  sourceUri?: string;

  /**
   * Content of the include
   * Can be immediate (string) or lazy (async function)
   *
   * @example
   * // Immediate content
   * include.content = 'CLASS lcl_test DEFINITION...';
   *
   * // Lazy content
   * include.content = async () => await adtClient.request(sourceUri);
   */
  content?: LazyContent;

  // adtcore attributes and atom links inherited from BaseSpec

  // Convenience getter for core.name
  get name(): string {
    return this.core?.name ?? '';
  }
}

/**
 * ClassSpec - ABAP Class Specification
 *
 * Extends OoSpec for adtcore + atom + abapsource + abapoo, adds class specifics.
 */
@xml
@namespace('class', 'http://www.sap.com/adt/oo/classes')
@root('class:abapClass')
export class ClassSpec extends OoSpec {
  // Class-specific attributes (flattened on root)
  @attributes
  @namespace('class', 'http://www.sap.com/adt/oo/classes')
  class!: ClassAttrs;

  // Class includes
  @namespace('class', 'http://www.sap.com/adt/oo/classes')
  @element({ array: true, name: 'include' })
  include?: ClassInclude[];

  /**
   * Parse XML string and create ClassSpec instance using shared parsing utilities
   */
  static fromXMLString(xml: string): ClassSpec {
    const parsed = this.parseXMLToObject(xml);
    const root = parsed['class:abapClass'];

    if (!root) {
      throw new Error(
        'Invalid class XML: missing class:abapClass root element'
      );
    }

    const instance = new ClassSpec();

    // Use shared parsing utilities - NO DUPLICATION!
    instance.core = this.parseAdtCoreAttributes(root);
    instance.links = this.parseAtomLinks(root);
    instance.source = this.parseAbapSourceAttributes(root);
    instance.oo = this.parseAbapOOAttributes(root);
    instance.syntaxConfiguration = this.parseSyntaxConfiguration(root);

    // Parse class-specific attributes
    instance.class = {
      final: root['@_class:final'],
      abstract: root['@_class:abstract'],
      visibility: root['@_class:visibility'],
      category: root['@_class:category'],
      hasTests: root['@_class:hasTests'],
      sharedMemoryEnabled: root['@_class:sharedMemoryEnabled'],
    };

    // Parse class includes
    const rawIncludes = root['class:include'];
    if (rawIncludes) {
      const includeArray = Array.isArray(rawIncludes)
        ? rawIncludes
        : [rawIncludes];
      instance.include = includeArray.map((inc: any) => {
        const includeElement = new ClassInclude();
        includeElement.includeType = inc['@_class:includeType'];
        includeElement.sourceUri = inc['@_abapsource:sourceUri'];
        includeElement.core = this.parseAdtCoreAttributes(inc);
        includeElement.links = this.parseAtomLinks(inc);
        return includeElement;
      });
    }

    return instance;
  }
}
