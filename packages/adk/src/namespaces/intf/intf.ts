import { xml, root, namespace } from '../../decorators';
import { OoSpec } from '../../base/oo-xml';

/**
 * IntfSpec - ABAP Interface Specification
 *
 * Extends OoSpec for automatic parsing of common OO attributes.
 * Uses xmld decorators for complete automatic XML handling.
 *
 * All parsing and serialization is handled automatically by decorators:
 * - ADT Core attributes (inherited from BaseSpec)
 * - ABAP Source attributes (inherited from OoSpec)
 * - ABAP OO attributes (inherited from OoSpec)
 * - Atom links (inherited from BaseSpec)
 * - Syntax configuration (inherited from OoSpec)
 */
@xml
@namespace('intf', 'http://www.sap.com/adt/oo/interfaces')
@root('intf:abapInterface')
export class IntfSpec extends OoSpec {
  // All common attributes and elements are inherited from OoSpec
  // No interface-specific attributes or elements needed currently

  /**
   * Parse XML string and create IntfSpec instance using shared parsing utilities
   */
  static fromXMLString(xml: string): IntfSpec {
    const parsed = this.parseXMLToObject(xml);
    const root = parsed['intf:abapInterface'];

    if (!root) {
      throw new Error(
        'Invalid interface XML: missing intf:abapInterface root element'
      );
    }

    const instance = new IntfSpec();

    // Use shared parsing utilities - NO DUPLICATION!
    instance.core = this.parseAdtCoreAttributes(root);
    instance.links = this.parseAtomLinks(root);
    instance.source = this.parseAbapSourceAttributes(root);
    instance.oo = this.parseAbapOOAttributes(root);
    instance.syntaxConfiguration = this.parseSyntaxConfiguration(root);

    return instance;
  }
}
