import test from 'node:test';
import * as cds from '@sap/cds';
import { csn2abap } from '@abapify/cds2abap';

test('generate abapgit project from CDS model', async () => {
  const model = await cds.load(__dirname + '/cds/model.cds');
  const abapComponents = csn2abap(model);
  for (const component of abapComponents.values()) {
    console.log('\n', component.type, component.id, component.toAbapgitXML());
  }
});
