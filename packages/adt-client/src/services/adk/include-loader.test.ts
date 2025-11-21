import { describe, it, expect, beforeEach, vi } from 'vitest';
import { addLazyLoadingToIncludes, fetchAllIncludes } from './include-loader';
import { Class, ClassSpec, ClassInclude } from '@abapify/adk';
import type { ConnectionManager } from '../../client/connection-manager';

// Mock connection manager
const createMockConnectionManager = (): ConnectionManager => {
  return {
    request: vi.fn(async (uri: string) => {
      return {
        text: async () => `Content from ${uri}`,
        json: async () => ({}),
        status: 200,
        ok: true,
      } as Response;
    }),
  } as any;
};

// Create a mock Class object with includes
const createMockClassWithIncludes = (): any => {
  const classSpec = new ClassSpec();
  classSpec.core = {
    name: 'ZCL_TEST',
    description: 'Test Class',
    type: 'CLAS/OC',
  } as any;

  const include1 = new ClassInclude();
  include1.includeType = 'definitions';
  include1.sourceUri = '/sap/bc/adt/oo/classes/zcl_test/includes/definitions';

  const include2 = new ClassInclude();
  include2.includeType = 'implementations';
  include2.sourceUri = '/sap/bc/adt/oo/classes/zcl_test/includes/implementations';

  classSpec.include = [include1, include2];

  // Create mock Class object
  return {
    kind: 'Class',
    name: 'ZCL_TEST',
    spec: classSpec,
  };
};

describe('addLazyLoadingToIncludes', () => {
  let mockConnectionManager: ConnectionManager;

  beforeEach(() => {
    mockConnectionManager = createMockConnectionManager();
  });

  it('should add lazy loaders to all includes', () => {
    const classObject = createMockClassWithIncludes();

    const result = addLazyLoadingToIncludes(
      classObject,
      mockConnectionManager
    );

    expect(result.spec.include).toHaveLength(2);
    expect(result.spec.include[0].content).toBeDefined();
    expect(typeof result.spec.include[0].content).toBe('function');
    expect(result.spec.include[1].content).toBeDefined();
    expect(typeof result.spec.include[1].content).toBe('function');
  });

  it('should not fetch content until lazy loader is called', () => {
    const classObject = createMockClassWithIncludes();

    addLazyLoadingToIncludes(classObject, mockConnectionManager);

    // Content should not be fetched yet
    expect(mockConnectionManager.request).not.toHaveBeenCalled();
  });

  it('should fetch content when lazy loader is called', async () => {
    const classObject = createMockClassWithIncludes();

    addLazyLoadingToIncludes(classObject, mockConnectionManager);

    // Call the lazy loader
    const content = await (classObject.spec.include[0].content as Function)();

    expect(mockConnectionManager.request).toHaveBeenCalledWith(
      '/sap/bc/adt/oo/classes/zcl_test/includes/definitions',
      expect.objectContaining({
        method: 'GET',
        headers: { Accept: 'text/plain' },
      })
    );
    expect(content).toContain('definitions');
  });

  it('should cache lazy loaded content', async () => {
    const classObject = createMockClassWithIncludes();

    addLazyLoadingToIncludes(classObject, mockConnectionManager);

    // Call the lazy loader twice
    const content1 = await (classObject.spec.include[0].content as Function)();
    const content2 = await (classObject.spec.include[0].content as Function)();

    // Should only fetch once (cached)
    expect(mockConnectionManager.request).toHaveBeenCalledTimes(1);
    expect(content1).toBe(content2);
  });

  it('should handle class with no includes', () => {
    const classObject = {
      kind: 'Class',
      name: 'ZCL_NO_INCLUDES',
      spec: new ClassSpec(),
    };

    const result = addLazyLoadingToIncludes(
      classObject as any,
      mockConnectionManager
    );

    expect(result).toBe(classObject);
    expect(mockConnectionManager.request).not.toHaveBeenCalled();
  });

  it('should skip includes without sourceUri', () => {
    const classObject = createMockClassWithIncludes();
    classObject.spec.include[0].sourceUri = undefined;

    addLazyLoadingToIncludes(classObject, mockConnectionManager);

    // First include should not have lazy loader
    expect(classObject.spec.include[0].content).toBeUndefined();
    // Second include should have lazy loader
    expect(classObject.spec.include[1].content).toBeDefined();
  });
});

describe('fetchAllIncludes', () => {
  let mockConnectionManager: ConnectionManager;

  beforeEach(() => {
    mockConnectionManager = createMockConnectionManager();
  });

  it('should fetch all includes immediately', async () => {
    const classObject = createMockClassWithIncludes();

    await fetchAllIncludes(classObject, mockConnectionManager);

    expect(mockConnectionManager.request).toHaveBeenCalledTimes(2);
    expect(classObject.spec.include[0].content).toBe(
      'Content from /sap/bc/adt/oo/classes/zcl_test/includes/definitions'
    );
    expect(classObject.spec.include[1].content).toBe(
      'Content from /sap/bc/adt/oo/classes/zcl_test/includes/implementations'
    );
  });

  it('should handle class with no includes', async () => {
    const classObject = {
      kind: 'Class',
      name: 'ZCL_NO_INCLUDES',
      spec: new ClassSpec(),
    };

    await fetchAllIncludes(classObject as any, mockConnectionManager);

    expect(mockConnectionManager.request).not.toHaveBeenCalled();
  });

  it('should skip includes without sourceUri', async () => {
    const classObject = createMockClassWithIncludes();
    classObject.spec.include[0].sourceUri = undefined;

    await fetchAllIncludes(classObject, mockConnectionManager);

    // Only second include should be fetched
    expect(mockConnectionManager.request).toHaveBeenCalledTimes(1);
    expect(classObject.spec.include[0].content).toBeUndefined();
    expect(classObject.spec.include[1].content).toBeDefined();
  });

  it('should fetch includes in parallel', async () => {
    const classObject = createMockClassWithIncludes();

    const startTime = Date.now();
    await fetchAllIncludes(classObject, mockConnectionManager);
    const duration = Date.now() - startTime;

    // Should complete quickly (parallel execution)
    // If sequential, would take much longer
    expect(duration).toBeLessThan(100);
    expect(mockConnectionManager.request).toHaveBeenCalledTimes(2);
  });
});
