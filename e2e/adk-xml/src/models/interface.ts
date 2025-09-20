/**
 * Real SAP Interface XML model using xmld
 * Based on actual SAP ADT XML fixture: zif_test.intf.xml
 * This generates actual SAP ADT XML that works with SAP systems
 */

import { xmld, root, element, attribute, namespace, unwrap, toXML } from 'xmld';
import { SAPXMLPlugin } from '../plugins/sap-xml';

// ===== REUSABLE INTERFACES =====

// Atom link attributes interface
export interface AtomLinkAttributes {
  href: string;
  rel: string;
  type?: string;
  etag?: string;
  title?: string;
}

// Package reference attributes interface
export interface PackageRefAttributes {
  uri: string;
  type: string;
  name: string;
}

// Syntax language elements interface
export interface SyntaxLanguageElements {
  version: string;
  description: string;
  link?: AtomLink;
}

// Syntax configuration elements interface
export interface SyntaxConfigurationElements {
  language: SyntaxLanguage;
}

// ===== XMLD CLASSES USING UNWRAP WHERE APPROPRIATE =====

// Atom link structure from real SAP XML - plain attributes (no namespace prefixes)
@xmld
@root('atom:link')
export class AtomLink {
  @attribute href!: string;
  @attribute rel!: string;
  @attribute type?: string;
  @attribute etag?: string;
  @attribute title?: string;
}

// Package reference structure from real SAP XML - direct attributes for SAP format
@xmld
@root('adtcore:packageRef')
@namespace('adtcore', 'http://www.sap.com/adt/core')
export class PackageRef {
  @namespace('adtcore', 'http://www.sap.com/adt/core')
  @attribute
  uri!: string;

  @namespace('adtcore', 'http://www.sap.com/adt/core')
  @attribute
  type!: string;

  @namespace('adtcore', 'http://www.sap.com/adt/core')
  @attribute
  name!: string;
}

// Syntax configuration language structure - direct elements for SAP format
@xmld
@root('abapsource:language')
@namespace('abapsource', 'http://www.sap.com/adt/abapsource')
export class SyntaxLanguage {
  @namespace('abapsource', 'http://www.sap.com/adt/abapsource')
  @element
  version!: string;

  @namespace('abapsource', 'http://www.sap.com/adt/abapsource')
  @element
  description!: string;

  @element({ type: AtomLink }) link?: AtomLink;
}

// Syntax configuration structure - direct elements for SAP format
@xmld
@root('abapsource:syntaxConfiguration')
@namespace('abapsource', 'http://www.sap.com/adt/abapsource')
export class SyntaxConfiguration {
  @element({ type: SyntaxLanguage }) language!: SyntaxLanguage;
}

// Reusable attribute interfaces for unwrapping
export interface AdtCoreAttributes {
  responsible: string;
  masterLanguage: string;
  masterSystem: string;
  abapLanguageVersion: string;
  name: string;
  type: string;
  changedAt: string;
  version: string;
  createdAt: string;
  changedBy: string;
  createdBy: string;
  description: string;
  descriptionTextLimit: string;
  language: string;
}

export interface AbapOOAttributes {
  modeled: string;
}

export interface AbapSourceAttributes {
  sourceUri: string;
  fixPointArithmetic: string;
  activeUnicodeCheck: string;
}

// Main Interface document based on real zif_test.intf.xml
@xmld
@root('intf:abapInterface')
@namespace('intf', 'http://www.sap.com/adt/oo/interfaces')
export class InterfaceDocument {
  // Unwrap all adtcore attributes - much shorter!
  @namespace('adtcore', 'http://www.sap.com/adt/core')
  @unwrap
  @attribute
  core!: AdtCoreAttributes;

  // Unwrap ABAP OO attributes
  @namespace('abapoo', 'http://www.sap.com/adt/oo')
  @unwrap
  @attribute
  oo!: AbapOOAttributes;

  // Unwrap ABAP Source attributes
  @namespace('abapsource', 'http://www.sap.com/adt/abapsource')
  @unwrap
  @attribute
  source!: AbapSourceAttributes;

  // Atom links array (multiple atom:link elements)
  @namespace('atom', 'http://www.w3.org/2005/Atom')
  @element({ type: AtomLink, array: true })
  link: AtomLink[] = [];

  // Package reference element
  @namespace('adtcore', 'http://www.sap.com/adt/core')
  @element({ type: PackageRef })
  packageRef!: PackageRef;

  // Syntax configuration element
  @namespace('abapsource', 'http://www.sap.com/adt/abapsource')
  @element({ type: SyntaxConfiguration })
  syntaxConfiguration!: SyntaxConfiguration;
}

/**
 * Generate real SAP ADT Interface XML
 */
export function generateInterfaceXML(intf: InterfaceDocument): string {
  const sapPlugin = new SAPXMLPlugin({
    xmlDeclaration: true,
    format: true,
    indentBy: '  ',
  });

  return toXML(intf, { plugin: sapPlugin });
}
