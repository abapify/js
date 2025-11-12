import { xml, root, namespace, unwrap } from '../../decorators';
import { BaseSpec } from '../../base/base-spec';
import type { PakNamespace, PackageData } from './types';
import { type } from 'os';

/**
 * AdtPackageSpec - ADT Package Specification
 *
 * Represents the XML structure for ABAP packages from ADT API.
 * Uses ADT packages namespace: http://www.sap.com/adt/packages
 */
@xml
@namespace('pak', 'http://www.sap.com/adt/packages')
@root('pak:package')
export class AdtPackageSpec extends BaseSpec {
  /**
   * Package namespace elements (unwrapped)
   * Contains: attributes, superPackage, applicationComponent, transport, subPackages
   */
  @unwrap
  @namespace('pak', 'http://www.sap.com/adt/packages')
  pak!: PakNamespace;

  /**
   * Parse XML string and create AdtPackageSpec instance
   * Overload signature for type safety
   */
  static override fromXMLString(xml: string): AdtPackageSpec;
  static override fromXMLString<T extends BaseSpec>(this: new () => T, xml: string): T;
  static override fromXMLString(xml: string): AdtPackageSpec {
    const parsed = this.parseXMLToObject(xml);
    const root = parsed['pak:package'];

    if (!root) {
      throw new Error('Invalid package XML: missing pak:package root element');
    }

    const instance = new AdtPackageSpec();

    // Parse adtcore attributes and atom links (inherited from BaseSpec)
    instance.core = this.parseAdtCoreAttributes(root);
    instance.links = this.parseAtomLinks(root);

    // Extract pak namespace - automatically unwraps all namespace prefixes!
    const extracted = this.extractNamespace('pak', root);

    // Post-process: unwrap subPackages.packageRef -> subPackages
    if (extracted.subPackages?.packageRef) {
      const refs = extracted.subPackages.packageRef;
      extracted.subPackages = Array.isArray(refs) ? refs : [refs];
    }

    instance.pak = extracted as PakNamespace;

    return instance;
  }

  /**
   * Convert to PackageData interface
   */
  toData(): PackageData {
    return {
      name: this.core?.name || '',
      description: this.core?.description,
      type: this.core?.type,
      responsible: this.core?.responsible,
      masterLanguage: this.core?.masterLanguage,
      createdAt: this.core?.createdAt,
      createdBy: this.core?.createdBy,
      changedAt: this.core?.changedAt,
      changedBy: this.core?.changedBy,
      version: this.core?.version,
      language: this.core?.language,
      // Spread all pak namespace properties
      ...this.pak,
    };
  }
}

const xml = 
  {
    package: {
      adtcore: {
        responsible: "PPLENKOV",
        masterLanguage: "EN",
        name: "$ABAPGIT_EXAMPLES",
        type: "DEVC/K",
        changedAt: "2025-11-09T00:00:00Z",
        version: "active",
        createdAt: "2025-11-09T00:00:00Z",
        changedBy: "PPLENKOV",
        createdBy: "PPLENKOV",
        description: "Abapgit examples",
        descriptionTextLimit: "60",
        language: "EN"
      },
      attributes: {
        packageType: "development",
        isPackageTypeEditable: "false",
        isAddingObjectsAllowed: "false",
        isAddingObjectsAllowedEditable: "true",
        isEncapsulated: "false",
        isEncapsulationEditable: "false",
        isEncapsulationVisible: "false",
        recordChanges: "false",
        isRecordChangesEditable: "false",
        isSwitchVisible: "false",
        languageVersion: "",
        isLanguageVersionVisible: "true",
        isLanguageVersionEditable: "true"
      },
      superPackage: {
        adtcore: {
          uri: "/sap/bc/adt/packages/%24tmp",
          type: "DEVC/K",
          name: "$TMP",
          description: "Temporary Objects (never transported!)"
        },
        applicationComponent: {
          name: "",
          description: "No application component assigned",
          isVisible: "true",
          isEditable: "false"
        },
        transport: {
          softwareComponent: {
            name: "LOCAL",
            description: "Local Developments (No Automatic Transport)",
            isVisible: "true",
            isEditable: "false"
          },
          transportLayer: {
            name: "",
            description: "",
            isVisible: "false",
            isEditable: "false"
          }
        }
      }
    } }

const schema = [{}];