import { AdtAdapter } from '../../../base/adapters/adt/adapter';
import { InterfaceSpec } from '..';
import { Kind } from '../../kind';

import { $attr, $xmlns, $namespaces } from 'fxmlp';

const { intf, adtcore } = $namespaces([
  ['intf', { recursive: true }],
  'adtcore',
  'atom',
]);

export class InterfaceAdtAdapter extends AdtAdapter<InterfaceSpec> {
  override toAdt(): Record<string, unknown> {
    return {
      ...intf({
        interface: {
          ...$attr({
            ...adtcore(this.adtcore),
            ...$xmlns({
              intf: 'http://www.sap.com/adt/oo/interfaces',
              atom: 'http://www.w3.org/2005/Atom',
              adtcore: 'http://www.sap.com/adt/core',
            }),
          }),
          content: {
            category: this.spec.category,
            interfaces: this.spec.interfaces,
            components: this.spec.components,
          },
        },
      }),
    };
  }

  override fromAdt(adtObject: Record<string, unknown>): InterfaceSpec {
    // Find the interface element
    const interfaceElement = adtObject['intf:interface'] as any;
    if (!interfaceElement) {
      throw new Error('Invalid ADT object: missing intf:interface element');
    }

    // Extract metadata
    const name = interfaceElement['@adtcore:name'] || interfaceElement['@name'];
    if (!name) {
      throw new Error('Invalid ADT object: missing interface name');
    }

    // Extract description if present
    const description =
      interfaceElement['@description'] ||
      interfaceElement['description'] ||
      interfaceElement['intf:description'];

    // Parse the interface content
    const content =
      interfaceElement['intf:content'] ||
      interfaceElement.content ||
      interfaceElement;

    const spec: InterfaceSpec = {
      kind: Kind.Interface,
      metadata: {
        name,
        ...(description && { description }),
      },
      spec: {
        category:
          (this.extractValue(content, 'intf:category', 'category') as
            | 'IF'
            | 'CA') || 'IF',
        interfaces: this.parseStringArray(
          content,
          'intf:interfaces',
          'interfaces'
        ),
        components: {
          methods: this.parseMethods(content),
          attributes: this.parseAttributes(content),
          events: this.parseEvents(content),
          types: this.parseTypes(content),
        },
      },
    };

    return spec;
  }

  private extractValue(
    content: any,
    ...fieldPaths: string[]
  ): string | undefined {
    for (const fieldPath of fieldPaths) {
      if (content?.[fieldPath] !== undefined) {
        return String(content[fieldPath]);
      }
    }
    return undefined;
  }

  private parseBooleanValue(content: any, ...fieldPaths: string[]): boolean {
    const value = this.extractValue(content, ...fieldPaths);
    if (value === undefined) return false;

    const lowerValue = value.toLowerCase();
    return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'x';
  }

  private parseStringArray(content: any, ...fieldPaths: string[]): string[] {
    for (const fieldPath of fieldPaths) {
      const value = content?.[fieldPath];
      if (value) {
        if (Array.isArray(value)) {
          return value.map(String);
        }
        if (typeof value === 'string') {
          return [value];
        }
      }
    }
    return [];
  }

  private parseMethods(
    content: any
  ): InterfaceSpec['spec']['components']['methods'] {
    const components =
      content['intf:components'] || content['components'] || content;
    const methods = components['intf:methods'] || components['methods'];

    if (!methods) return [];

    const methodArray = Array.isArray(methods) ? methods : [methods];

    return methodArray.map((method: any) => ({
      name: String(method['intf:name'] || method['name'] || ''),
      isAbstract:
        this.parseBooleanValue(
          method,
          'intf:isAbstract',
          'isAbstract',
          'abstract'
        ) || true, // Interface methods are abstract by default
      parameters: this.parseParameters(method),
      exceptions: this.parseStringArray(
        method,
        'intf:exceptions',
        'exceptions'
      ),
      description: this.extractValue(method, 'intf:description', 'description'),
    }));
  }

  private parseParameters(method: any): Array<{
    name: string;
    type: 'IMPORTING' | 'EXPORTING' | 'CHANGING' | 'RETURNING';
    dataType: string;
    isOptional: boolean;
    defaultValue?: string;
    description?: string;
  }> {
    const parameters = method['intf:parameters'] || method['parameters'];

    if (!parameters) return [];

    const paramArray = Array.isArray(parameters) ? parameters : [parameters];

    return paramArray.map((param: any) => ({
      name: String(param['intf:name'] || param['name'] || ''),
      type: (param['intf:type'] || param['type'] || 'IMPORTING') as
        | 'IMPORTING'
        | 'EXPORTING'
        | 'CHANGING'
        | 'RETURNING',
      dataType: String(param['intf:dataType'] || param['dataType'] || 'STRING'),
      isOptional: this.parseBooleanValue(
        param,
        'intf:isOptional',
        'isOptional',
        'optional'
      ),
      defaultValue: this.extractValue(
        param,
        'intf:defaultValue',
        'defaultValue',
        'default'
      ),
      description: this.extractValue(param, 'intf:description', 'description'),
    }));
  }

  private parseAttributes(
    content: any
  ): InterfaceSpec['spec']['components']['attributes'] {
    const components =
      content['intf:components'] || content['components'] || content;
    const attributes =
      components['intf:attributes'] || components['attributes'];

    if (!attributes) return [];

    const attrArray = Array.isArray(attributes) ? attributes : [attributes];

    return attrArray.map((attr: any) => ({
      name: String(attr['intf:name'] || attr['name'] || ''),
      isReadOnly: this.parseBooleanValue(
        attr,
        'intf:isReadOnly',
        'isReadOnly',
        'readOnly'
      ),
      dataType: String(attr['intf:dataType'] || attr['dataType'] || 'STRING'),
      value: this.extractValue(attr, 'intf:value', 'value'),
      description: this.extractValue(attr, 'intf:description', 'description'),
    }));
  }

  private parseEvents(
    content: any
  ): InterfaceSpec['spec']['components']['events'] {
    const components =
      content['intf:components'] || content['components'] || content;
    const events = components['intf:events'] || components['events'];

    if (!events) return [];

    const eventArray = Array.isArray(events) ? events : [events];

    return eventArray.map((event: any) => ({
      name: String(event['intf:name'] || event['name'] || ''),
      parameters: this.parseEventParameters(event),
      description: this.extractValue(event, 'intf:description', 'description'),
    }));
  }

  private parseEventParameters(event: any): Array<{
    name: string;
    dataType: string;
    isOptional: boolean;
    description?: string;
  }> {
    const parameters = event['intf:parameters'] || event['parameters'];

    if (!parameters) return [];

    const paramArray = Array.isArray(parameters) ? parameters : [parameters];

    return paramArray.map((param: any) => ({
      name: String(param['intf:name'] || param['name'] || ''),
      dataType: String(param['intf:dataType'] || param['dataType'] || 'STRING'),
      isOptional: this.parseBooleanValue(
        param,
        'intf:isOptional',
        'isOptional',
        'optional'
      ),
      description: this.extractValue(param, 'intf:description', 'description'),
    }));
  }

  private parseTypes(
    content: any
  ): InterfaceSpec['spec']['components']['types'] {
    const components =
      content['intf:components'] || content['components'] || content;
    const types = components['intf:types'] || components['types'];

    if (!types) return [];

    const typeArray = Array.isArray(types) ? types : [types];

    return typeArray.map((type: any) => ({
      name: String(type['intf:name'] || type['name'] || ''),
      definition: String(type['intf:definition'] || type['definition'] || ''),
      description: this.extractValue(type, 'intf:description', 'description'),
    }));
  }
}
