import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ObjectRegistry,
  Kind,
  createObject,
} from '../registry';
import { Interface, Class, Domain } from '../objects';
import type { AdkObject, AdkObjectConstructor } from '../base/adk-object';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const fixturesPath = join(__dirname, '../../../adk/fixtures');

describe('ADK Registry Tests', () => {
  it('should register and retrieve constructors', () => {
    expect(ObjectRegistry.isRegistered(Kind.Interface)).toBe(true);
    expect(ObjectRegistry.isRegistered(Kind.Class)).toBe(true);
    expect(ObjectRegistry.isRegistered(Kind.Domain)).toBe(true);
    expect(ObjectRegistry.isRegistered('NonExistent')).toBe(false);

    const interfaceConstructor = ObjectRegistry.getConstructor(Kind.Interface);
    expect(interfaceConstructor).toBeDefined();

    const registeredKinds = ObjectRegistry.getRegisteredKinds();
    expect(registeredKinds).toContain(Kind.Interface);
    expect(registeredKinds).toContain(Kind.Class);
    expect(registeredKinds).toContain(Kind.Domain);
  });

  it('should create objects from XML using registry', () => {
    const interfaceXml = readFileSync(
      join(fixturesPath, 'zif_test.intf.xml'),
      'utf-8'
    );
    const classXml = readFileSync(
      join(fixturesPath, 'zcl_test.clas.xml'),
      'utf-8'
    );
    const domainXml = readFileSync(
      join(fixturesPath, 'zdo_test.doma.xml'),
      'utf-8'
    );

    // Factory-generated objects now have fromAdtXml static method
    const interfaceObj = ObjectRegistry.fromAdtXml(
      Kind.Interface,
      interfaceXml
    );
    expect(interfaceObj).toBeDefined(); // Factory provides fromAdtXml method
    expect(interfaceObj?.kind).toBe('Interface');

    const classObj = ObjectRegistry.fromAdtXml(Kind.Class, classXml);
    expect(classObj).toBeDefined(); // Factory provides fromAdtXml method
    expect(classObj?.kind).toBe('Class');

    const domainObj = ObjectRegistry.fromAdtXml(Kind.Domain, domainXml);
    expect(domainObj).toBeDefined(); // Factory provides fromAdtXml method
    expect(domainObj?.kind).toBe('Domain');

    // Test with non-existent kind
    const nonExistent = ObjectRegistry.fromAdtXml('NonExistent', interfaceXml);
    expect(nonExistent).toBeUndefined();
  });

  it('should create objects using generic factory', () => {
    const interfaceObj = createObject(Kind.Interface);
    expect(interfaceObj).toBeInstanceOf(Interface);
    expect(interfaceObj?.kind).toBe('Interface');

    const classObj = createObject(Kind.Class);
    expect(classObj).toBeInstanceOf(Class);
    expect(classObj?.kind).toBe('Class');

    const domainObj = createObject(Kind.Domain);
    expect(domainObj).toBeInstanceOf(Domain);
    expect(domainObj?.kind).toBe('Domain');

    const nonExistent = createObject('NonExistent');
    expect(nonExistent).toBeUndefined();
  });

  it('should allow registering new object types', () => {
    // Mock constructor for testing
    const mockConstructor: AdkObjectConstructor<AdkObject> = {
      fromAdtXml: (_xml: string): AdkObject => ({
        kind: 'MockObject',
        name: 'MOCK',
        type: 'MOCK/MO',
        toAdtXml: () => '<mock></mock>',
      }),
    };

    ObjectRegistry.register('MockObject', mockConstructor);

    expect(ObjectRegistry.isRegistered('MockObject')).toBe(true);
    expect(ObjectRegistry.getRegisteredKinds()).toContain('MockObject');

    const mockObj = ObjectRegistry.fromAdtXml('MockObject', '<mock></mock>');
    expect(mockObj?.kind).toBe('MockObject');
    expect(mockObj?.name).toBe('MOCK');
  });
});
