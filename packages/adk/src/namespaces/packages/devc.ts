import { xml, root, namespace, element } from '../../decorators';
import { BaseSpec } from '../../base/base-spec';
import type { DevcData } from './types';

/**
 * PackageSpec - ABAP Package Specification
 * 
 * Represents the XML structure for ABAP packages.
 * Uses ADT packages namespace: http://www.sap.com/adt/packages
 */
@xml
@namespace('pkg', 'http://www.sap.com/adt/packages')
@root('asx:abap')
export class PackageSpec extends BaseSpec {
  /**
   * ASX values container
   */
  @namespace('asx', 'http://www.sap.com/abapxml')
  @element({ name: 'values' })
  values?: {
    DEVC?: DevcCore;
  };

  /**
   * Parse XML string and create PackageSpec instance
   */
  static override fromXMLString(xml: string): PackageSpec {
    const parsed = this.parseXMLToObject(xml);
    const root = parsed['asx:abap'];

    if (!root) {
      throw new Error('Invalid package XML: missing asx:abap root element');
    }

    const instance = new PackageSpec();

    // Parse ASX values
    const values = root['asx:values'];
    if (values?.DEVC) {
      instance.values = {
        DEVC: this.parseDevcCore(values.DEVC)
      };
    }

    return instance;
  }

  /**
   * Parse DEVC core data
   */
  private static parseDevcCore(devc: Record<string, unknown>): DevcCore {
    const core = new DevcCore();
    core.devclass = devc.DEVCLASS as string | undefined;
    core.ctext = devc.CTEXT as string | undefined;
    core.parentcl = devc.PARENTCL as string | undefined;
    core.dlvunit = devc.DLVUNIT as string | undefined;
    core.component = devc.COMPONENT as string | undefined;
    return core;
  }

  /**
   * Convert to DevcData interface
   */
  toData(): DevcData | undefined {
    if (!this.values?.DEVC) {
      return undefined;
    }

    return {
      devclass: this.values.DEVC.devclass || '',
      ctext: this.values.DEVC.ctext,
      parentcl: this.values.DEVC.parentcl,
      dlvunit: this.values.DEVC.dlvunit,
      component: this.values.DEVC.component
    };
  }
}

/**
 * DEVC core structure
 */
@xml
export class DevcCore {
  /** Package name */
  @element({ name: 'DEVCLASS' })
  devclass?: string;

  /** Package description */
  @element({ name: 'CTEXT' })
  ctext?: string;

  /** Parent package */
  @element({ name: 'PARENTCL' })
  parentcl?: string;

  /** Delivery unit */
  @element({ name: 'DLVUNIT' })
  dlvunit?: string;

  /** Component */
  @element({ name: 'COMPONENT' })
  component?: string;
}
