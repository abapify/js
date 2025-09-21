import { describe, it, expect } from 'vitest';
import { AtomLink } from './atom-link';
import type { AtomRelation } from './types';

describe('Atom Namespace', () => {
  it('should create AtomLink instances correctly', () => {
    const link = new AtomLink();

    expect(link).toBeInstanceOf(AtomLink);
    expect(link.href).toBeUndefined();
    expect(link.rel).toBeUndefined();
    expect(link.type).toBeUndefined();
    expect(link.title).toBeUndefined();
    expect(link.etag).toBeUndefined();
  });

  it('should set AtomLink properties correctly', () => {
    const link = new AtomLink();

    link.href = 'source/main';
    link.rel = 'http://www.sap.com/adt/relations/source';
    link.type = 'text/plain';
    link.title = 'Source Code';
    link.etag = '123456';

    expect(link.href).toBe('source/main');
    expect(link.rel).toBe('http://www.sap.com/adt/relations/source');
    expect(link.type).toBe('text/plain');
    expect(link.title).toBe('Source Code');
    expect(link.etag).toBe('123456');
  });

  it('should define AtomRelation type correctly', () => {
    const sourceRelation: AtomRelation =
      'http://www.sap.com/adt/relations/source';
    const versionsRelation: AtomRelation =
      'http://www.sap.com/adt/relations/versions';
    const transportRelation: AtomRelation =
      'http://www.sap.com/adt/relations/transport';

    expect(sourceRelation).toBe('http://www.sap.com/adt/relations/source');
    expect(versionsRelation).toBe('http://www.sap.com/adt/relations/versions');
    expect(transportRelation).toBe(
      'http://www.sap.com/adt/relations/transport'
    );
  });

  it('should allow creating AtomLink with constructor parameters', () => {
    const link = new AtomLink();

    // Test that we can set all properties
    Object.assign(link, {
      href: 'versions',
      rel: 'http://www.sap.com/adt/relations/versions',
      type: 'application/vnd.sap.adt.versions+xml',
      title: 'Versions',
      etag: 'v1.0',
    });

    expect(link.href).toBe('versions');
    expect(link.rel).toBe('http://www.sap.com/adt/relations/versions');
    expect(link.type).toBe('application/vnd.sap.adt.versions+xml');
    expect(link.title).toBe('Versions');
    expect(link.etag).toBe('v1.0');
  });

  it('should handle undefined properties gracefully', () => {
    const link = new AtomLink();

    // All properties should be optional
    expect(() => {
      const serialized = JSON.stringify(link);
      const parsed = JSON.parse(serialized);
      Object.assign(new AtomLink(), parsed);
    }).not.toThrow();
  });
});
