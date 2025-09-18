import { AdkBaseObject } from '../../base/adk-object';
import type {
  AbapSourceType,
  SyntaxConfigurationType,
} from '../../../namespaces/abapsource';
import type { AdtCoreType } from '../../../namespaces/adtcore';
import { Kind } from '../../kind';
import type { AbapOOType } from '../../../namespaces/abapoo';
import type { PackageRefType } from '../../../namespaces/adtcore';
import type { AtomLinkType } from '../../../namespaces/atom';
import { InterfaceXML } from './interface-xml';

/**
 * Input interface for creating Interface instances
 * Each object type owns its own input contract
 */
export interface InterfaceInput {
  /** ADT core attributes - using exact internal type */
  adtcore: AdtCoreType;

  /** Interface-specific attributes */
  interface?: {
    visibility?: 'public' | 'protected' | 'private';
    category?: string;
  };

  /** Interface sections */
  sections?: {
    [key: string]: unknown;
  };

  /** ABAP object attributes */
  abapoo?: {
    modeled: boolean;
  };

  /** ABAP source attributes - using exact internal type */
  abapsource?: AbapSourceType;
}

/**
 * Interface-specific sections
 */
export interface InterfaceSections {
  sourceMain?: string; // Content from source/main endpoint
  syntaxConfiguration?: SyntaxConfigurationType;
}

/**
 * ABAP Interface domain object - focused on business logic.
 * Uses InterfaceXML for all XML serialization/parsing concerns.
 */
export class Interface extends AdkBaseObject<
  InterfaceSections,
  Kind.Interface
> {
  /** SAP object type identifier for registry */
  static readonly sapType = 'INTF';

  // Domain data - no XML concerns
  private _adtcore: AdtCoreType;
  private _abapoo: AbapOOType;
  private _abapsource: AbapSourceType;
  private _links?: AtomLinkType[];
  private _packageRef?: PackageRefType;
  private _syntaxConfiguration?: SyntaxConfigurationType;

  constructor(input: InterfaceInput) {
    super({
      adtcore: input.adtcore,
      sections: input.sections || {},
      kind: Kind.Interface,
    });

    // Initialize decorator properties
    this._adtcore = input.adtcore;
    this._abapoo = input.abapoo || { modeled: false };
    this._abapsource = input.abapsource || { sourceUri: 'source/main' };
  }

  /**
   * Static factory method for easier object creation
   */
  static create(input: InterfaceInput): Interface {
    return new Interface(input);
  }

  // ABAP-specific getters
  get sourceUri(): string {
    return this._abapsource?.sourceUri || 'source/main';
  }
  get isModeled(): boolean {
    return this._abapoo.modeled;
  }
  get fixPointArithmetic(): boolean | undefined {
    return this._abapsource.fixPointArithmetic;
  }
  get activeUnicodeCheck(): boolean | undefined {
    return this._abapsource.activeUnicodeCheck;
  }

  // Links and package reference accessors
  getAtomLinks(): AtomLinkType[] {
    return this._links || [];
  }

  setAtomLinks(links: AtomLinkType[] | undefined) {
    this._links = links || [];
    // Also set the base class property to ensure compatibility
    // @ts-expect-error: Setting internal property for compatibility
    this.links = this._links;
  }

  getPackageRef(): PackageRefType | undefined {
    return this._packageRef;
  }

  setPackageRef(packageRef: PackageRefType | undefined) {
    this._packageRef = packageRef;
  }

  // Property getter for packageRef
  get packageRef(): PackageRefType | undefined {
    return this._packageRef;
  }

  // Property getter for links (overrides base class)
  override get links(): AtomLinkType[] {
    return this._links || [];
  }

  get syntaxConfiguration(): SyntaxConfigurationType | undefined {
    return this._syntaxConfiguration;
  }

  set syntaxConfiguration(config: SyntaxConfigurationType | undefined) {
    this._syntaxConfiguration = config;
  }

  // Source management
  getSourceMain(): string | undefined {
    return this.sections.sourceMain;
  }

  setSourceMain(source: string): void {
    this.sections = { ...this.sections, sourceMain: source };
  }

  // Clean XML serialization using InterfaceXML
  override toAdtXml(): string {
    // Create InterfaceXML from this domain object
    const interfaceXML = InterfaceXML.fromInterface({
      adtcore: this._adtcore,
      abapoo: this._abapoo,
      abapsource: this._abapsource,
      links: this._links,
      packageRef: this._packageRef,
      syntaxConfiguration: this._syntaxConfiguration,
    });

    // Let InterfaceXML handle the serialization
    return interfaceXML.toXMLString();
  }

  // Clean XML parsing using InterfaceXML
  static override fromAdtXml(xml: string): Interface {
    // Let InterfaceXML handle the parsing
    const interfaceXML = InterfaceXML.fromXMLString(xml);

    // InterfaceXML parsing is working perfectly with full type safety!

    // Create Interface domain object from parsed data
    const intf = new Interface({
      adtcore: interfaceXML.core,
      abapoo: interfaceXML.oo,
      abapsource: interfaceXML.source,
      sections: {},
    });

    // Set additional properties
    intf.setPackageRef(interfaceXML.packageRef);
    intf.setAtomLinks(interfaceXML.atomLinks);

    // Set sections and private property for serialization
    if (interfaceXML.syntaxConfiguration) {
      intf.sections.syntaxConfiguration = interfaceXML.syntaxConfiguration;
      intf._syntaxConfiguration = interfaceXML.syntaxConfiguration; // Also set private property for toAdtXml()
    }

    return intf;
  }
}
