import { AdtObject } from '../../base/adt-object';
import { AdtCoreAttributes } from '../../namespaces/adtcore';
import { Kind } from '../../kind';

/**
 * Domain-specific sections and types
 */
export interface DomainSections {
  dataType?: string;
  length?: number;
  decimals?: number;
  outputLength?: number;
  conversionExit?: string;
  valueTable?: string;
  fixedValues?: DomainFixedValue[];
}

export interface DomainFixedValue {
  lowValue: string;
  highValue?: string;
  description?: string;
}

/**
 * ABAP Domain ADT object with proper TypeScript types
 */
export class Domain extends AdtObject<DomainSections, Kind.Domain> {
  constructor(adtcore: AdtCoreAttributes, sections: DomainSections = {}) {
    super(adtcore, sections, Kind.Domain);
  }

  // Domain-specific getters
  get dataType(): string | undefined {
    return this.sections.dataType;
  }
  get length(): number | undefined {
    return this.sections.length;
  }
  get decimals(): number | undefined {
    return this.sections.decimals;
  }
  get outputLength(): number | undefined {
    return this.sections.outputLength;
  }
  get conversionExit(): string | undefined {
    return this.sections.conversionExit;
  }
  get valueTable(): string | undefined {
    return this.sections.valueTable;
  }
  get fixedValues(): DomainFixedValue[] {
    return this.sections.fixedValues || [];
  }

  // XML serialization
  toAdtXml(): string {
    const links = this.links
      .map(
        (link) =>
          `    <atom:link xmlns:atom="http://www.w3.org/2005/Atom" href="${
            link.href
          }" rel="${link.rel}"${link.type ? ` type="${link.type}"` : ''}${
            link.title ? ` title="${link.title}"` : ''
          }${link.etag ? ` etag="${link.etag}"` : ''} />`
      )
      .join('\n');

    const packageRefXml = this.packageRef
      ? `    <adtcore:packageRef adtcore:uri="${this.packageRef.uri}" adtcore:type="${this.packageRef.type}" adtcore:name="${this.packageRef.name}" />`
      : '';

    const fixedValuesXml =
      this.sections.fixedValues && this.sections.fixedValues.length > 0
        ? `    <ddic:fixedValues>
${this.sections.fixedValues
  .map(
    (fv) =>
      `        <ddic:fixedValue>
            <ddic:lowValue>${fv.lowValue}</ddic:lowValue>
            <ddic:highValue>${fv.highValue || ''}</ddic:highValue>
            ${
              fv.description
                ? `<ddic:description>${fv.description}</ddic:description>`
                : ''
            }
        </ddic:fixedValue>`
  )
  .join('\n')}
    </ddic:fixedValues>`
        : '';

    return `<?xml version="1.0" encoding="UTF-8"?>
<ddic:domain
        xmlns:ddic="http://www.sap.com/adt/ddic"
        adtcore:name="${this.adtcore.name}"
        adtcore:type="${this.adtcore.type}"
        ${
          this.adtcore.description
            ? `adtcore:description="${this.adtcore.description}"`
            : ''
        }
        ${
          this.adtcore.language
            ? `adtcore:language="${this.adtcore.language}"`
            : ''
        }
        ${
          this.adtcore.masterLanguage
            ? `adtcore:masterLanguage="${this.adtcore.masterLanguage}"`
            : ''
        }
        ${
          this.adtcore.responsible
            ? `adtcore:responsible="${this.adtcore.responsible}"`
            : ''
        }
        ${
          this.adtcore.changedBy
            ? `adtcore:changedBy="${this.adtcore.changedBy}"`
            : ''
        }
        ${
          this.adtcore.createdBy
            ? `adtcore:createdBy="${this.adtcore.createdBy}"`
            : ''
        }
        ${
          this.adtcore.changedAt
            ? `adtcore:changedAt="${this.adtcore.changedAt.toISOString()}"`
            : ''
        }
        ${
          this.adtcore.createdAt
            ? `adtcore:createdAt="${this.adtcore.createdAt.toISOString()}"`
            : ''
        }
        ${
          this.adtcore.version
            ? `adtcore:version="${this.adtcore.version}"`
            : ''
        }
        xmlns:adtcore="http://www.sap.com/adt/core">
${links}
${packageRefXml}
    ${
      this.sections.dataType
        ? `<ddic:dataType>${this.sections.dataType}</ddic:dataType>`
        : ''
    }
    ${
      this.sections.length !== undefined
        ? `<ddic:length>${this.sections.length}</ddic:length>`
        : ''
    }
    ${
      this.sections.decimals !== undefined
        ? `<ddic:decimals>${this.sections.decimals}</ddic:decimals>`
        : ''
    }
    ${
      this.sections.outputLength !== undefined
        ? `<ddic:outputLength>${this.sections.outputLength}</ddic:outputLength>`
        : ''
    }
    ${
      this.sections.conversionExit
        ? `<ddic:conversionExit>${this.sections.conversionExit}</ddic:conversionExit>`
        : ''
    }
    ${
      this.sections.valueTable
        ? `<ddic:valueTable>${this.sections.valueTable}</ddic:valueTable>`
        : ''
    }
${fixedValuesXml}
</ddic:domain>`;
  }

  // XML parsing
  static override fromAdtXml<U extends AdtObject<DomainSections, Kind.Domain>>(
    xml: string,
    kind: Kind.Domain
  ): U {
    const parsed = AdtObject.parseXml(xml);
    const root = parsed['ddic:domain'] as any;

    // Parse adtcore attributes
    const adtcore: AdtCoreAttributes = {
      name: root['@_adtcore:name'],
      type: root['@_adtcore:type'],
      description: root['@_adtcore:description'],
      language: root['@_adtcore:language'],
      masterLanguage: root['@_adtcore:masterLanguage'],
      responsible: root['@_adtcore:responsible'],
      changedBy: root['@_adtcore:changedBy'],
      createdBy: root['@_adtcore:createdBy'],
      changedAt: root['@_adtcore:changedAt']
        ? new Date(root['@_adtcore:changedAt'])
        : undefined,
      createdAt: root['@_adtcore:createdAt']
        ? new Date(root['@_adtcore:createdAt'])
        : undefined,
      version: root['@_adtcore:version'],
    };

    // Parse domain-specific sections
    const sections: DomainSections = {
      dataType: root['ddic:dataType'],
      length:
        root['ddic:length'] !== undefined
          ? Number(root['ddic:length'])
          : undefined,
      decimals:
        root['ddic:decimals'] !== undefined
          ? Number(root['ddic:decimals'])
          : undefined,
      outputLength:
        root['ddic:outputLength'] !== undefined
          ? Number(root['ddic:outputLength'])
          : undefined,
      conversionExit: root['ddic:conversionExit'],
      valueTable: root['ddic:valueTable'],
    };

    // Parse fixed values
    if (
      root['ddic:fixedValues'] &&
      root['ddic:fixedValues']['ddic:fixedValue']
    ) {
      const fixedValueElements = Array.isArray(
        root['ddic:fixedValues']['ddic:fixedValue']
      )
        ? root['ddic:fixedValues']['ddic:fixedValue']
        : [root['ddic:fixedValues']['ddic:fixedValue']];

      sections.fixedValues = fixedValueElements.map((fv: any) => ({
        lowValue: String(fv['ddic:lowValue']),
        highValue: fv['ddic:highValue'] ? String(fv['ddic:highValue']) : '',
        description: fv['ddic:description'],
      }));
    }

    const domain = new this(adtcore, sections);

    // Parse package reference
    if (root['adtcore:packageRef']) {
      const pkgRef = root['adtcore:packageRef'];
      domain.packageRef = {
        uri: pkgRef['@_adtcore:uri'],
        type: pkgRef['@_adtcore:type'],
        name: pkgRef['@_adtcore:name'],
      };
    }

    // Parse atom links
    const links = Array.isArray(root['atom:link'])
      ? root['atom:link']
      : [root['atom:link']].filter(Boolean);
    domain.links = links.map((link: any) => ({
      href: link['@_href'],
      rel: link['@_rel'],
      type: link['@_type'],
      title: link['@_title'],
      etag: link['@_etag'],
    }));

    // Type assertion to handle the generic return type
    return domain as unknown as U;
  }
}
