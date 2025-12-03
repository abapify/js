/**
 * Unit test for schemaElement function
 */
import { describe, it, expect } from 'vitest';
import { classes, schemaElement } from 'adt-schemas-xsd';

describe('schemaElement', () => {
  it('returns schema with parse and build functions', () => {
    const elementSchema = schemaElement(classes, 'abapClass');
    
    expect(elementSchema.parse).toBeTypeOf('function');
    expect(elementSchema.build).toBeTypeOf('function');
  });

  it('preserves original schema properties', () => {
    const elementSchema = schemaElement(classes, 'abapClass');
    
    // Should have ns, prefix, complexType from original schema
    expect(elementSchema.ns).toBe(classes.ns);
    expect(elementSchema.prefix).toBe(classes.prefix);
    expect(elementSchema.complexType).toBe(classes.complexType);
  });

  it('has _infer marker for type inference', () => {
    const elementSchema = schemaElement(classes, 'abapClass');
    
    // _infer is the marker speci uses for type inference
    expect('_infer' in elementSchema).toBe(true);
  });
});
