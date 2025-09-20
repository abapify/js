import { AdkBaseObject } from '../../base/adk-object';
import type { AdtCoreType, PackageRefType } from '../../../namespaces/adtcore';
import type { AtomLinkType } from '../../../namespaces/atom';
import type { DdicType, DdicFixedValueType } from '../../../namespaces/ddic';
import { Kind } from '../../kind';
import { DomainXML } from './domain-xml';

/**
 * Input interface for creating Domain instances
 * Each object type owns its own input contract
 */
export interface DomainInput {
  /** ADT core attributes - using exact internal type */
  adtcore: AdtCoreType;

  /** Domain-specific attributes */
  domain?: DdicType;

  /** Fixed values for the range */
  fixedValues?: DdicFixedValueType[];
}

/**
 * Domain-specific sections
 */
export interface DomainSections {
  fixedValues?: DdicFixedValueType[];
}

/**
 * ABAP Domain domain object - focused on business logic.
 * Uses DomainXML for all XML serialization/parsing concerns.
 */
export class Domain extends AdkBaseObject<DomainSections, Kind.Domain> {
  /** SAP object type identifier for registry */
  static override readonly sapType = 'DOMA';

  // XML representation - follows base class pattern
  declare xmlRep: DomainXML;

  constructor(input: DomainInput) {
    super({
      adtcore: input.adtcore,
      sections: {
        fixedValues: input.fixedValues,
      },
      kind: Kind.Domain,
    });

    // Initialize XML representation
    this.xmlRep = new DomainXML({
      core: input.adtcore,
      domain: {
        ...input.domain,
        fixedValues: input.fixedValues,
      },
      // atomLinks and packageRef will be set later if needed
    });
  }

  /**
   * Static factory method for easier object creation
   */
  static create(input: DomainInput): Domain {
    return new Domain(input);
  }

  // Domain-specific getters - delegate to xmlRep
  get dataType(): string | undefined {
    return this.xmlRep.domain.dataType;
  }

  get length(): number | undefined {
    return this.xmlRep.domain.length;
  }

  get decimals(): number | undefined {
    return this.xmlRep.domain.decimals;
  }

  get outputLength(): number | undefined {
    return this.xmlRep.domain.outputLength;
  }

  get conversionExit(): string | undefined {
    return this.xmlRep.domain.conversionExit;
  }

  get valueTable(): string | undefined {
    return this.xmlRep.domain.valueTable;
  }

  get fixedValues(): DdicFixedValueType[] {
    return this.xmlRep.domain.fixedValues || [];
  }

  // Links and package reference accessors - delegate to xmlRep
  getAtomLinks(): AtomLinkType[] {
    return this.xmlRep.atomLinks || [];
  }

  // Property getter for links (matching interface pattern)
  get links(): AtomLinkType[] {
    return this.xmlRep.atomLinks || [];
  }

  setAtomLinks(links: AtomLinkType[] | undefined) {
    this.xmlRep.atomLinks = links;
  }

  getPackageRef(): PackageRefType | undefined {
    return this.xmlRep.packageRef;
  }

  setPackageRef(packageRef: PackageRefType | undefined) {
    this.xmlRep.packageRef = packageRef;
  }

  // Property getter for packageRef
  get packageRef(): PackageRefType | undefined {
    return this.xmlRep.packageRef;
  }

  // Domain-specific setters for business operations
  setDataType(dataType: string | undefined): void {
    this.xmlRep.domain = { ...this.xmlRep.domain, dataType };
  }

  setLength(length: number | undefined): void {
    this.xmlRep.domain = { ...this.xmlRep.domain, length };
  }

  setDecimals(decimals: number | undefined): void {
    this.xmlRep.domain = { ...this.xmlRep.domain, decimals };
  }

  setOutputLength(outputLength: number | undefined): void {
    this.xmlRep.domain = { ...this.xmlRep.domain, outputLength };
  }

  setConversionExit(conversionExit: string | undefined): void {
    this.xmlRep.domain = { ...this.xmlRep.domain, conversionExit };
  }

  setValueTable(valueTable: string | undefined): void {
    this.xmlRep.domain = { ...this.xmlRep.domain, valueTable };
  }

  setFixedValues(fixedValues: DdicFixedValueType[]): void {
    this.xmlRep.domain = { ...this.xmlRep.domain, fixedValues };
    this.sections = { ...this.sections, fixedValues };
  }

  // Clean XML serialization using DomainXML
  override toAdtXml(): string {
    // DomainXML handles the serialization
    return this.xmlRep.toXMLString();
  }

  // Clean XML parsing using DomainXML
  static override fromAdtXml(xml: string): Domain {
    // Let DomainXML handle the parsing
    const domainXML = DomainXML.fromXMLString(xml);

    // Create Domain domain object from parsed data
    const domain = new Domain({
      adtcore: domainXML.core,
      domain: domainXML.domain,
      fixedValues: domainXML.domain.fixedValues,
    });

    // Update the xmlRep with the parsed data (including links and packageRef)
    domain.xmlRep = domainXML;

    return domain;
  }
}
