import test from 'node:test';
import * as cds from '@sap/cds';

import { dset } from 'dset';
import { AbapAnnotation } from './lib/annotations';
import { Component } from '@abapify/components';

import { DdicFactory } from './lib/factory';
type ComponentFactory = {
  [key: string]: (
    input: unknown
  ) => Component<unknown> | Array<Component<unknown>>;
};

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

    //generic logic to generate components from abap annotation
    if (ddic) {
      for (const key in ddic) {
        const input = ddic[key];
        if (typeof input === 'object' && input.generate) {
          if (key in DdicFactory) {
            const component = (DdicFactory as unknown as ComponentFactory)[key];
            if (key) {
              const result = component(input);
              if (Array.isArray(result)) {
                for (const item of result) {
                  addComponent(item);
                }
              } else {
                addComponent(result);
              }
            }
          } else {
            console.warn(`No component factory for key: ${key}`);
          }
        }
      }
    }
  }

  for (const component of abapComponents.values()) {
    console.log('\n', component.type, component.id, component.toAbapgitXML());
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
