import * as cds from '@sap/cds';
import { Component } from '@abapify/components';
import { AbapAnnotation } from './annotations';
import { dset } from 'dset';
import { DdicFactory } from './factory';
import { mkdir, writeFile } from 'fs/promises';
import path = require('path');

interface Cds2AbapInput {
  model: string;
  output: string;
}

export async function cds2abap(input: Cds2AbapInput) {
  const model = await cds.load(input.model);
  const components = csn2abap(model);

  // creating output folder if not exists
  await mkdir(input.output, { recursive: true });

  for (const component of components.values()) {
    //generate abapgit file

    const filename = `${component.id}.${component.type}.xml`.toLowerCase();
    const xml = component.toAbapgitXML();

    await writeFile(path.join(input.output, filename), xml);
    console.log('✅', filename);
  }
}

export function csn2abap(model: cds.csn.CSN): Map<string, Component<unknown>> {
  const generator = anotationGenerator(model);

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

  return abapComponents;
}

function* anotationGenerator(csn: cds.csn.CSN) {
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

type ComponentFactory = {
  [key: string]: (
    input: unknown
  ) => Component<unknown> | Array<Component<unknown>>;
};
