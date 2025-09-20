/**
 * Test for the new attributesInterface symbol pattern
 * Demonstrates mixed attributes and elements in XML
 */

import { XMLRoot, element } from '../../../decorators';
import {
  class_,
  ClassType,
  ClassAttributes,
  ClassIncludeType,
  ClassIncludeAttributes,
  attributesInterface,
} from '../../../namespaces/class';
import { BaseXML } from '../../base/base-xml';
import type { AdtCoreType, AbapSourceType } from '../../../namespaces';

/**
 * Simple test ClassXML using the new attributesInterface symbol pattern
 */
@XMLRoot('class:abapClass')
export class SimpleClassXML extends BaseXML {
  @class_
  @element
  abapClass: ClassType;

  constructor(data: {
    core: AdtCoreType;
    abapClass: ClassType;
    source?: AbapSourceType;
  }) {
    super({
      core: data.core,
      source: data.source || { sourceUri: 'source/main' },
    });

    this.abapClass = data.abapClass;
  }
}

describe('ClassXML with attributesInterface Symbol', () => {
  test('should serialize class with mixed attributes and elements', () => {
    // Create test data using the symbol pattern
    const classAttributes: ClassAttributes = {
      final: true,
      abstract: false,
      visibility: 'public',
    };

    const classData: ClassType = {
      [attributesInterface]: classAttributes,
      // Actual attribute values on the object (these should become XML attributes)
      final: true,
      abstract: false,
      visibility: 'public',
      // Child elements
      includes: [
        {
          [attributesInterface]: { includeType: 'main' },
          includeType: 'main',
        },
        {
          [attributesInterface]: { includeType: 'testclasses' },
          includeType: 'testclasses',
        },
      ],
    };

    const classXML = new SimpleClassXML({
      core: {
        name: 'ZCL_TEST_CLASS',
        type: 'CLAS/OC',
        description: 'Test Class',
        responsible: 'DEVELOPER',
        masterLanguage: 'E',
        changedAt: '2023-12-01T10:30:00.000Z',
        createdAt: '2023-11-01T09:00:00.000Z',
        changedBy: 'DEVELOPER',
        createdBy: 'DEVELOPER',
        version: 'inactive',
        language: 'E',
      },
      abapClass: classData,
    });

    const xml = classXML.toXMLString();

    // Should have class attributes on the root element
    expect(xml).toContain('class:final="true"');
    expect(xml).toContain('class:abstract="false"');
    expect(xml).toContain('class:visibility="public"');

    // Should have include child elements (no wrapper, direct elements)
    expect(xml).toContain('<class:include class:includeType="main">');
    expect(xml).toContain('<class:include class:includeType="testclasses">');
    expect(xml).not.toContain('<class:includes>'); // No wrapper element
  });
});
