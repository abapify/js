import { AdkBaseObject } from '../../base/adk-object';
import { AbapSourceType } from '../../../namespaces/abapsource';
import { AdtCoreType } from '../../../namespaces/adtcore';
import { AtomLinkType } from '../../../namespaces/atom';
import { Kind } from '../../kind';
import { ClassXML } from './class-xml';
import { objectRegistry } from '../../base/object-registry';

/**
 * Input interface for creating Class instances
 * Each object type owns its own input contract
 */
export interface ClassInput {
  /** ADT core attributes - using exact internal type */
  adtcore: AdtCoreType;

  /** Class-specific attributes */
  class?: {
    final?: boolean;
    abstract?: boolean;
    visibility?: 'public' | 'protected' | 'private';
    category?: string;
    hasTests?: boolean;
    sharedMemoryEnabled?: boolean;
  };

  /** Class-specific sections - simplified format that gets converted to internal */
  sections?: {
    includes?: ClassInclude[];
  };

  /** ABAP object attributes */
  abapoo?: {
    modeled: boolean;
  };

  /** ABAP source attributes - using exact internal type */
  abapsource?: AbapSourceType;
}

// Legacy types removed - now handled by ClassXML decorators

/**
 * Class-specific sections
 */
interface ClassSections {
  class: {
    final: boolean;
    abstract: boolean;
    visibility: 'public' | 'protected' | 'private';
    category?: string;
    hasTests?: boolean;
    sharedMemoryEnabled?: boolean;
  };
  includes: ClassInclude[];
}

interface ClassInclude {
  includeType:
    | 'definitions'
    | 'implementations'
    | 'macros'
    | 'testclasses'
    | 'main';
  sourceUri: string;
  name: string;
  type: string;
  changedAt?: Date;
  version?: string;
  createdAt?: Date;
  changedBy?: string;
  createdBy?: string;
  links: AtomLinkType[];
}

/**
 * ABAP Class ADT object with proper TypeScript types
 */
export class Class extends AdkBaseObject<ClassSections, Kind.Class, ClassXML> {
  /** SAP object type identifier for registry */
  static override readonly sapType = 'CLAS';

  constructor(input: ClassInput) {
    // Convert input format to internal sections format
    const sections: ClassSections = {
      class: {
        final: input.class?.final || false,
        abstract: input.class?.abstract || false,
        visibility: input.class?.visibility || 'public',
        category: input.class?.category,
        hasTests: false,
        sharedMemoryEnabled: false,
      },
      includes: input.sections?.includes || [],
    };

    super({
      adtcore: input.adtcore,
      sections,
      kind: Kind.Class,
    });

    // Create composed XML representation - single source of truth
    this.xmlRep = new ClassXML({
      core: input.adtcore,
      oo: input.abapoo || { modeled: false },
      source: input.abapsource || {
        sourceUri: 'source/main',
        fixPointArithmetic: false,
        activeUnicodeCheck: false,
      },
      classAttrs: sections.class,
      atomLinks: [], // Will be set separately if needed
      packageRef: undefined, // Will be set separately if needed
    });
  }

  /**
   * Static factory method for easier object creation
   */
  static create(input: ClassInput): Class {
    return new Class(input);
  }

  // ABAP-specific getters - delegate to strongly-typed composed XML representation
  get sourceUri(): string | undefined {
    return this.xmlRep.source.sourceUri;
  }
  get fixPointArithmetic(): boolean | undefined {
    return this.xmlRep.source.fixPointArithmetic;
  }
  get activeUnicodeCheck(): boolean | undefined {
    return this.xmlRep.source.activeUnicodeCheck;
  }
  get isModeled(): boolean {
    return this.xmlRep.oo.modeled;
  }

  // Class-specific getters - delegate to strongly-typed composed XML representation
  get final(): boolean {
    return this.xmlRep.classAttrs.final || false;
  }
  get abstract(): boolean {
    return this.xmlRep.classAttrs.abstract || false;
  }
  get visibility(): 'public' | 'protected' | 'private' {
    return this.xmlRep.classAttrs.visibility || 'public';
  }
  get category(): string | undefined {
    return this.xmlRep.classAttrs.category;
  }
  get hasTests(): boolean | undefined {
    return this.xmlRep.classAttrs.hasTests;
  }
  get sharedMemoryEnabled(): boolean | undefined {
    return this.xmlRep.classAttrs.sharedMemoryEnabled;
  }
  get includes(): ClassInclude[] {
    return this.sections.includes;
  }

  // XML serialization using ClassXML
  override toAdtXml(): string {
    // Create ClassXML from this domain object
    const classXML = ClassXML.fromClass({
      adtcore: this.xmlRep.core,
      abapoo: this.xmlRep.oo,
      abapsource: this.xmlRep.source,
      classAttrs: this.sections.class,
      links: this.xmlRep.atomLinks || [],
      packageRef: this.xmlRep.packageRef, // Access inherited property
      // includes: this.sections.includes, // Skip includes for now
    });

    // Let ClassXML handle the serialization
    return classXML.toXMLString();
  }

  // XML parsing using ClassXML
  static override fromAdtXml<
    U extends AdkBaseObject<unknown, K>,
    K extends Kind
  >(xml: string): U {
    // Let ClassXML handle the parsing
    const classXML = ClassXML.fromXMLString(xml);

    // Create Class domain object from parsed data
    const cls = new this({
      adtcore: classXML.core,
      abapoo: classXML.oo,
      abapsource: classXML.source,
      class: classXML.classAttrs,
      sections: { includes: [] }, // Skip includes for now
    });

    // Set additional properties
    if (classXML.packageRef) {
      (cls.xmlRep as ClassXML).packageRef = classXML.packageRef;
    }
    if (classXML.atomLinks) {
      (cls.xmlRep as ClassXML).atomLinks = classXML.atomLinks;
    }

    // Type assertion to handle the generic return type
    return cls as unknown as U;
  }
}

// Auto-register Class with the object registry
objectRegistry.register(Class.sapType, Class);
