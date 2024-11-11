import test from 'node:test';
import * as cds from '@sap/cds';

import { dset } from 'dset';
import { AbapAnnotation } from './lib/annotations';
import {
  Component,
  DataElement,
  DataElementInput,
  Domain,
  DomainInput,
} from '@abapify/components';

test('generate abapgit project from CDS model', async () => {
  const model = await cds.load(__dirname + '/cds/model.cds');
  const generator = cds2abap(model);

  const abapComponents = new Map<string, Component<unknown>>();

  function addComponent(component: Component<unknown>) {
    const componentId = `${component.type}/${component.id}`;

    if (abapComponents.has(componentId)) {
      throw new Error(`Duplicate component ID: ${componentId}`);
    }
    abapComponents.set(componentId, component);
  }

  for (const annotation of generator) {
    const ddic = annotation['@abap']?.ddic;

    //data element
    if (typeof ddic?.dataElement === 'object' && ddic.dataElement.generate) {
      processDataElement(ddic.dataElement, ddic.dataElement.generate);
    }

    //domain
    if (typeof ddic?.domain === 'object' && ddic.domain.generate) {
      processDomain(ddic.domain, ddic.domain.generate);
    }
  }

  for (const component of abapComponents.values()) {
    console.log('\n', component.type, component.id, component.toAbapgitXML());
  }

  function processDataElement(
    dataElement: DataElementInput,
    generate?: boolean
  ) {
    if (generate) {
      const component = new DataElement(dataElement);
      addComponent(component);
    }

    if (
      'domain' in dataElement &&
      typeof dataElement.domain === 'object' &&
      'generate' in dataElement.domain
    ) {
      processDomain(dataElement.domain, generate);
    }
  }

  function processDomain(domain: DomainInput, generate?: boolean) {
    if (generate) {
      const component = new Domain(domain);
      addComponent(component);
    }
  }
});
function* cds2abap(csn: cds.csn.CSN) {
  for (const definition_key in csn.definitions) {
    const definition = csn.definitions[definition_key];

    for (const element_key in definition.elements) {
      const element = definition.elements[element_key];

      const properties: Record<string, unknown> = {};

      for (const property_key in element) {
        if (Object.prototype.hasOwnProperty.call(element, property_key)) {
          const property = element[property_key as keyof typeof element];
          dset(properties, property_key, property);
        }
      }

      yield properties as unknown as AbapAnnotation;
    }
  }
}
