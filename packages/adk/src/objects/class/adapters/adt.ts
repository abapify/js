import { AdtAdapter } from '../../../base/adapters/adt/adapter';
import { ClassSpec } from '..';
import { Kind } from '../../kind';

import { $attr, $xmlns, $namespaces } from 'fxmlp';

const { clas, adtcore } = $namespaces([
  ['clas', { recursive: true }],
  'adtcore',
  'atom',
]);

export class ClassAdtAdapter extends AdtAdapter<ClassSpec> {
  override toAdt(): Record<string, unknown> {
    return {
      ...clas({
        class: {
          ...$attr({
            ...adtcore(this.adtcore),
            ...$xmlns({
              clas: 'http://www.sap.com/adt/oo/classes',
              atom: 'http://www.w3.org/2005/Atom',
              adtcore: 'http://www.sap.com/adt/core',
            }),
          }),
          content: {
            visibility: this.spec.visibility,
            final: this.spec.isFinal,
            abstract: this.spec.isAbstract,
            superclass: this.spec.superclass,
            interfaces: this.spec.interfaces,
            components: this.spec.components,
          },
        },
      }),
    };
  }

  override fromAdt(adtObject: Record<string, unknown>): ClassSpec {
    // Find the class element
    const classElement = adtObject['clas:class'] as any;
    if (!classElement) {
      throw new Error('Invalid ADT object: missing clas:class element');
    }

    // Extract metadata
    const name = classElement['@adtcore:name'] || classElement['@name'];
    if (!name) {
      throw new Error('Invalid ADT object: missing class name');
    }

    // Extract description if present
    const description =
      classElement['@description'] ||
      classElement['description'] ||
      classElement['clas:description'];

    // Parse the class content
    const content =
      classElement['clas:content'] || classElement.content || classElement;

    const spec: ClassSpec = {
      kind: Kind.Class,
      metadata: {
        name,
        ...(description && { description }),
      },
      spec: {
        visibility:
          (this.extractValue(content, 'clas:visibility', 'visibility') as
            | 'PUBLIC'
            | 'PRIVATE') || 'PUBLIC',
        isFinal: this.parseBooleanValue(
          content,
          'clas:final',
          'final',
          'isFinal'
        ),
        isAbstract: this.parseBooleanValue(
          content,
          'clas:abstract',
          'abstract',
          'isAbstract'
        ),
        superclass: this.extractValue(content, 'clas:superclass', 'superclass'),
        interfaces: this.parseStringArray(
          content,
          'clas:interfaces',
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
  ): ClassSpec['spec']['components']['methods'] {
    const components =
      content['clas:components'] || content['components'] || content;
    const methods = components['clas:methods'] || components['methods'];

    if (!methods) return [];

    const methodArray = Array.isArray(methods) ? methods : [methods];

    return methodArray.map((method: any) => ({
      name: String(method['clas:name'] || method['name'] || ''),
      visibility: (method['clas:visibility'] ||
        method['visibility'] ||
        'PUBLIC') as 'PUBLIC' | 'PROTECTED' | 'PRIVATE',
      isStatic: this.parseBooleanValue(
        method,
        'clas:isStatic',
        'isStatic',
        'static'
      ),
      isAbstract: this.parseBooleanValue(
        method,
        'clas:isAbstract',
        'isAbstract',
        'abstract'
      ),
      isFinal: this.parseBooleanValue(
        method,
        'clas:isFinal',
        'isFinal',
        'final'
      ),
      parameters: this.parseParameters(method),
      exceptions: this.parseStringArray(
        method,
        'clas:exceptions',
        'exceptions'
      ),
      description: this.extractValue(method, 'clas:description', 'description'),
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
    const parameters = method['clas:parameters'] || method['parameters'];

    if (!parameters) return [];

    const paramArray = Array.isArray(parameters) ? parameters : [parameters];

    return paramArray.map((param: any) => ({
      name: String(param['clas:name'] || param['name'] || ''),
      type: (param['clas:type'] || param['type'] || 'IMPORTING') as
        | 'IMPORTING'
        | 'EXPORTING'
        | 'CHANGING'
        | 'RETURNING',
      dataType: String(param['clas:dataType'] || param['dataType'] || 'STRING'),
      isOptional: this.parseBooleanValue(
        param,
        'clas:isOptional',
        'isOptional',
        'optional'
      ),
      defaultValue: this.extractValue(
        param,
        'clas:defaultValue',
        'defaultValue',
        'default'
      ),
      description: this.extractValue(param, 'clas:description', 'description'),
    }));
  }

  private parseAttributes(
    content: any
  ): ClassSpec['spec']['components']['attributes'] {
    const components =
      content['clas:components'] || content['components'] || content;
    const attributes =
      components['clas:attributes'] || components['attributes'];

    if (!attributes) return [];

    const attrArray = Array.isArray(attributes) ? attributes : [attributes];

    return attrArray.map((attr: any) => ({
      name: String(attr['clas:name'] || attr['name'] || ''),
      visibility: (attr['clas:visibility'] ||
        attr['visibility'] ||
        'PRIVATE') as 'PUBLIC' | 'PROTECTED' | 'PRIVATE',
      isStatic: this.parseBooleanValue(
        attr,
        'clas:isStatic',
        'isStatic',
        'static'
      ),
      isReadOnly: this.parseBooleanValue(
        attr,
        'clas:isReadOnly',
        'isReadOnly',
        'readOnly'
      ),
      dataType: String(attr['clas:dataType'] || attr['dataType'] || 'STRING'),
      value: this.extractValue(attr, 'clas:value', 'value'),
      description: this.extractValue(attr, 'clas:description', 'description'),
    }));
  }

  private parseEvents(content: any): ClassSpec['spec']['components']['events'] {
    const components =
      content['clas:components'] || content['components'] || content;
    const events = components['clas:events'] || components['events'];

    if (!events) return [];

    const eventArray = Array.isArray(events) ? events : [events];

    return eventArray.map((event: any) => ({
      name: String(event['clas:name'] || event['name'] || ''),
      visibility: (event['clas:visibility'] ||
        event['visibility'] ||
        'PUBLIC') as 'PUBLIC' | 'PROTECTED' | 'PRIVATE',
      parameters: this.parseEventParameters(event),
      description: this.extractValue(event, 'clas:description', 'description'),
    }));
  }

  private parseEventParameters(event: any): Array<{
    name: string;
    dataType: string;
    isOptional: boolean;
    description?: string;
  }> {
    const parameters = event['clas:parameters'] || event['parameters'];

    if (!parameters) return [];

    const paramArray = Array.isArray(parameters) ? parameters : [parameters];

    return paramArray.map((param: any) => ({
      name: String(param['clas:name'] || param['name'] || ''),
      dataType: String(param['clas:dataType'] || param['dataType'] || 'STRING'),
      isOptional: this.parseBooleanValue(
        param,
        'clas:isOptional',
        'isOptional',
        'optional'
      ),
      description: this.extractValue(param, 'clas:description', 'description'),
    }));
  }

  private parseTypes(content: any): ClassSpec['spec']['components']['types'] {
    const components =
      content['clas:components'] || content['components'] || content;
    const types = components['clas:types'] || components['types'];

    if (!types) return [];

    const typeArray = Array.isArray(types) ? types : [types];

    return typeArray.map((type: any) => ({
      name: String(type['clas:name'] || type['name'] || ''),
      visibility: (type['clas:visibility'] ||
        type['visibility'] ||
        'PRIVATE') as 'PUBLIC' | 'PROTECTED' | 'PRIVATE',
      definition: String(type['clas:definition'] || type['definition'] || ''),
      description: this.extractValue(type, 'clas:description', 'description'),
    }));
  }
}
