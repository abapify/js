import { AdtAdapter } from '../../../base/adapters/adt/adapter';
import { DomainSpec } from '..';
import { Kind } from '../../kind';

import { $attr, $xmlns, $namespaces } from 'fxmlp';

const { doma, adtcore } = $namespaces([
  ['doma', { recursive: true }],
  'adtcore',
  'atom',
]);

export class DomainAdtAdapter extends AdtAdapter<DomainSpec> {
  override toAdt(): Record<string, unknown> {
    return {
      ...doma({
        domain: {
          ...$attr({
            ...adtcore(this.adtcore),
            ...$xmlns({
              doma: 'http://www.sap.com/dictionary/domain',
              atom: 'http://www.w3.org/2005/Atom',
              adtcore: 'http://www.sap.com/adt/core',
            }),
          }),
          content: this.spec,
        },
      }),
    };
  }

  override fromAdt(adtObject: Record<string, unknown>): DomainSpec {
    // Find the domain element
    const domainElement = adtObject['doma:domain'] as any;
    if (!domainElement) {
      throw new Error('Invalid ADT object: missing doma:domain element');
    }

    // Extract metadata
    const name = domainElement['@adtcore:name'] || domainElement['@name'];
    if (!name) {
      throw new Error('Invalid ADT object: missing domain name');
    }

    // Extract description if present (might be in different places)
    const description =
      domainElement['@description'] ||
      domainElement['description'] ||
      domainElement['doma:description'];

    // Parse the domain content
    const content =
      domainElement['doma:content'] || domainElement.content || domainElement;

    const spec: DomainSpec = {
      kind: Kind.Domain,
      metadata: {
        name,
        ...(description && { description }),
      },
      spec: {
        typeInformation: {
          datatype:
            this.extractValue(
              content,
              ['doma:typeInformation', 'typeInformation'],
              'doma:datatype',
              'datatype'
            ) || 'CHAR',
          length:
            Number(
              this.extractValue(
                content,
                ['doma:typeInformation', 'typeInformation'],
                'doma:length',
                'length'
              )
            ) || 0,
          decimals:
            Number(
              this.extractValue(
                content,
                ['doma:typeInformation', 'typeInformation'],
                'doma:decimals',
                'decimals'
              )
            ) || 0,
        },
        outputInformation: {
          length:
            Number(
              this.extractValue(
                content,
                ['doma:outputInformation', 'outputInformation'],
                'doma:length',
                'length'
              )
            ) || 0,
          style:
            this.extractValue(
              content,
              ['doma:outputInformation', 'outputInformation'],
              'doma:style',
              'style'
            ) || '',
          conversionExit: this.extractValue(
            content,
            ['doma:outputInformation', 'outputInformation'],
            'doma:conversionExit',
            'conversionExit'
          ),
          signExists: this.parseBooleanValue(
            content,
            ['doma:outputInformation', 'outputInformation'],
            'doma:signExists',
            'signExists'
          ),
          lowercase: this.parseBooleanValue(
            content,
            ['doma:outputInformation', 'outputInformation'],
            'doma:lowercase',
            'lowercase'
          ),
          ampmFormat: this.parseBooleanValue(
            content,
            ['doma:outputInformation', 'outputInformation'],
            'doma:ampmFormat',
            'ampmFormat'
          ),
        },
        valueInformation: {
          valueTableRef: this.extractValue(
            content,
            ['doma:valueInformation', 'valueInformation'],
            'doma:valueTableRef',
            'valueTableRef'
          ),
          appendExists: this.parseBooleanValue(
            content,
            ['doma:valueInformation', 'valueInformation'],
            'doma:appendExists',
            'appendExists'
          ),
          fixValues: this.parseFixValues(content),
        },
      },
    };

    return spec;
  }

  private extractValue(
    content: any,
    sectionPaths: string[],
    ...fieldPaths: string[]
  ): string | undefined {
    // Try to find the section first
    let section = content;
    for (const sectionPath of sectionPaths) {
      if (section?.[sectionPath]) {
        section = section[sectionPath];
        break;
      }
    }

    // Then try to find the field in the section
    for (const fieldPath of fieldPaths) {
      if (section?.[fieldPath] !== undefined) {
        return String(section[fieldPath]);
      }
    }

    return undefined;
  }

  private parseBooleanValue(
    content: any,
    sectionPaths: string[],
    ...fieldPaths: string[]
  ): boolean {
    const value = this.extractValue(content, sectionPaths, ...fieldPaths);
    if (value === undefined) return false;

    const lowerValue = value.toLowerCase();
    return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'x';
  }

  private parseFixValues(content: any): Array<{
    position: number;
    low: string;
    high?: string;
    text: string;
  }> {
    const valueInfo =
      content['doma:valueInformation'] ||
      content['valueInformation'] ||
      content;
    const fixValues = valueInfo['doma:fixValues'] || valueInfo['fixValues'];

    if (!fixValues) return [];

    // Handle both single object and array
    const values = Array.isArray(fixValues) ? fixValues : [fixValues];

    return values.map((fixValue: any, index: number) => ({
      position:
        Number(fixValue['doma:position'] || fixValue['position']) || index + 1,
      low: String(fixValue['doma:low'] || fixValue['low'] || ''),
      high:
        fixValue['doma:high'] || fixValue['high']
          ? String(fixValue['doma:high'] || fixValue['high'])
          : undefined,
      text: String(fixValue['doma:text'] || fixValue['text'] || ''),
    }));
  }
}
