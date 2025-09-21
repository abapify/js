import { describe, it, expect } from 'vitest';
import type { AdtCoreAttrs, PackageRefType } from './types';

describe('ADT Core Namespace', () => {
  it('should define AdtCoreAttrs interface correctly', () => {
    const coreAttrs: AdtCoreAttrs = {
      name: 'ZIF_TEST',
      type: 'INTF/OI',
      version: 'active',
      description: 'Test interface',
      descriptionTextLimit: '60',
      language: 'EN',
      masterLanguage: 'EN',
      masterSystem: 'DEV',
      abapLanguageVersion: 'standard',
      responsible: 'DEVELOPER',
      changedBy: 'DEVELOPER',
      createdBy: 'DEVELOPER',
      changedAt: '2025-09-21T13:00:00Z',
      createdAt: '2025-09-21T12:00:00Z',
    };

    // Test required properties
    expect(coreAttrs.name).toBe('ZIF_TEST');
    expect(coreAttrs.type).toBe('INTF/OI');

    // Test optional properties
    expect(coreAttrs.version).toBe('active');
    expect(coreAttrs.description).toBe('Test interface');
    expect(coreAttrs.language).toBe('EN');
  });

  it('should define PackageRefType interface correctly', () => {
    const packageRef: PackageRefType = {
      uri: '/sap/bc/adt/packages/ztest',
      type: 'DEVC/K',
      name: 'ZTEST',
    };

    expect(packageRef.uri).toBe('/sap/bc/adt/packages/ztest');
    expect(packageRef.type).toBe('DEVC/K');
    expect(packageRef.name).toBe('ZTEST');
  });

  it('should allow partial AdtCoreAttrs objects', () => {
    const minimalCore: Partial<AdtCoreAttrs> = {
      name: 'ZCL_MINIMAL',
      type: 'CLAS/OC',
    };

    expect(minimalCore.name).toBe('ZCL_MINIMAL');
    expect(minimalCore.type).toBe('CLAS/OC');
    expect(minimalCore.description).toBeUndefined();
  });

  it('should allow optional PackageRefType properties', () => {
    const minimalPackageRef: Pick<PackageRefType, 'name'> = {
      name: 'ZPACKAGE',
    };

    expect(minimalPackageRef.name).toBe('ZPACKAGE');
  });
});
