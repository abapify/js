import { describe, it } from 'node:test';
import assert from 'node:assert';
import { visitSchema, walkSchemaNodes, XsdNodeType } from '../../src/visitor';
import type { Schema, TopLevelComplexType } from '../../src/xsd/types';

describe('visitor', () => {
  const testSchema: Schema = {
    targetNamespace: 'http://test.com',
    complexType: [
      {
        name: 'PersonType',
        sequence: {
          element: [
            { name: 'firstName', type: 'xs:string' },
            { name: 'lastName', type: 'xs:string' },
            { name: 'age', type: 'xs:int', minOccurs: 0 },
          ],
        },
        attribute: [
          { name: 'id', type: 'xs:string', use: 'required' },
        ],
      },
      {
        name: 'AddressType',
        sequence: {
          element: [
            { name: 'street', type: 'xs:string' },
            { name: 'city', type: 'xs:string' },
          ],
        },
      },
    ],
    simpleType: [
      {
        name: 'StatusType',
        restriction: {
          base: 'xs:string',
          enumeration: [
            { value: 'active' },
            { value: 'inactive' },
          ],
        },
      },
    ],
    element: [
      { name: 'person', type: 'PersonType' },
      { name: 'address', type: 'AddressType' },
    ],
  };

  describe('visitSchema', () => {
    it('should visit all complex types', () => {
      const visited: string[] = [];
      
      visitSchema(testSchema, {
        visitComplexType(node) {
          if ('name' in node && typeof node.name === 'string') {
            visited.push(node.name);
          }
        },
      });
      
      assert.deepStrictEqual(visited, ['PersonType', 'AddressType']);
    });

    it('should visit all elements (top-level and local)', () => {
      const visited: string[] = [];
      
      visitSchema(testSchema, {
        visitElement(node, ctx) {
          const name = node.name || node.ref || 'anonymous';
          visited.push(`${ctx.isTopLevel ? 'top:' : 'local:'}${name}`);
        },
      });
      
      assert.ok(visited.includes('top:person'));
      assert.ok(visited.includes('top:address'));
      assert.ok(visited.includes('local:firstName'));
      assert.ok(visited.includes('local:lastName'));
      assert.ok(visited.includes('local:age'));
      assert.ok(visited.includes('local:street'));
      assert.ok(visited.includes('local:city'));
    });

    it('should visit sequences', () => {
      const visited: number[] = [];
      
      visitSchema(testSchema, {
        visitSequence(node) {
          visited.push(node.element?.length ?? 0);
        },
      });
      
      assert.deepStrictEqual(visited, [3, 2]);
    });

    it('should visit attributes', () => {
      const visited: string[] = [];
      
      visitSchema(testSchema, {
        visitAttribute(node) {
          if (node.name) {
            visited.push(node.name);
          }
        },
      });
      
      assert.deepStrictEqual(visited, ['id']);
    });

    it('should visit simple types', () => {
      const visited: string[] = [];
      
      visitSchema(testSchema, {
        visitSimpleType(node) {
          if ('name' in node && typeof node.name === 'string') {
            visited.push(node.name);
          }
        },
      });
      
      assert.deepStrictEqual(visited, ['StatusType']);
    });

    it('should allow skipping children by returning false', () => {
      const visited: string[] = [];
      
      visitSchema(testSchema, {
        visitComplexType(node) {
          if ('name' in node && typeof node.name === 'string') {
            visited.push(node.name);
            if (node.name === 'PersonType') {
              return false;
            }
          }
        },
        visitElement(node) {
          visited.push(`el:${node.name}`);
        },
      });
      
      assert.ok(visited.includes('PersonType'));
      assert.ok(visited.includes('AddressType'));
      assert.ok(!visited.includes('el:firstName'));
      assert.ok(!visited.includes('el:lastName'));
      assert.ok(visited.includes('el:street'));
      assert.ok(visited.includes('el:city'));
    });

    it('should support filtering with only option', () => {
      const visited: XsdNodeType[] = [];
      
      visitSchema(testSchema, {
        visitComplexType() { visited.push(XsdNodeType.ComplexType); },
        visitSimpleType() { visited.push(XsdNodeType.SimpleType); },
        visitElement() { visited.push(XsdNodeType.Element); },
      }, { only: [XsdNodeType.ComplexType, XsdNodeType.SimpleType] });
      
      assert.ok(visited.includes(XsdNodeType.ComplexType));
      assert.ok(visited.includes(XsdNodeType.SimpleType));
      assert.ok(!visited.includes(XsdNodeType.Element));
    });

    it('should support filtering with skip option', () => {
      const visited: XsdNodeType[] = [];
      
      visitSchema(testSchema, {
        visitComplexType() { visited.push(XsdNodeType.ComplexType); },
        visitElement() { visited.push(XsdNodeType.Element); },
        visitSequence() { visited.push(XsdNodeType.Sequence); },
      }, { skip: [XsdNodeType.Sequence] });
      
      assert.ok(visited.includes(XsdNodeType.ComplexType));
      assert.ok(visited.includes(XsdNodeType.Element));
      assert.ok(!visited.includes(XsdNodeType.Sequence));
    });
  });

  describe('walkSchemaNodes', () => {
    it('should yield all nodes as generator', () => {
      const nodes = Array.from(walkSchemaNodes(testSchema));
      const types = new Set(nodes.map(n => n.type));
      
      assert.ok(types.has(XsdNodeType.Schema));
      assert.ok(types.has(XsdNodeType.ComplexType));
      assert.ok(types.has(XsdNodeType.SimpleType));
      assert.ok(types.has(XsdNodeType.Element));
      assert.ok(types.has(XsdNodeType.Sequence));
      assert.ok(types.has(XsdNodeType.Attribute));
    });

    it('should allow filtering by type in iteration', () => {
      const complexTypes: string[] = [];
      
      const nodes = Array.from(walkSchemaNodes(testSchema));
      for (const { type, node } of nodes) {
        if (type === XsdNodeType.ComplexType) {
          const ct = node as TopLevelComplexType;
          if (ct.name) {
            complexTypes.push(ct.name);
          }
        }
      }
      
      assert.deepStrictEqual(complexTypes, ['PersonType', 'AddressType']);
    });
  });

  describe('complex schema with inheritance', () => {
    const schemaWithInheritance: Schema = {
      complexType: [
        {
          name: 'BaseType',
          sequence: {
            element: [{ name: 'id', type: 'xs:string' }],
          },
        },
        {
          name: 'DerivedType',
          complexContent: {
            extension: {
              base: 'BaseType',
              sequence: {
                element: [{ name: 'extra', type: 'xs:string' }],
              },
            },
          },
        },
      ],
    };

    it('should visit extension nodes', () => {
      const extensions: string[] = [];
      
      visitSchema(schemaWithInheritance, {
        visitExtension(node) {
          extensions.push(node.base);
        },
      });
      
      assert.deepStrictEqual(extensions, ['BaseType']);
    });

    it('should visit complexContent', () => {
      let complexContentCount = 0;
      
      visitSchema(schemaWithInheritance, {
        visitComplexContent() {
          complexContentCount++;
        },
      });
      
      assert.strictEqual(complexContentCount, 1);
    });
  });

  describe('$imports support', () => {
    const baseSchema: Schema = {
      $filename: 'base.xsd',
      targetNamespace: 'http://base.com',
      complexType: [
        { name: 'BaseType', sequence: { element: [{ name: 'id', type: 'xs:string' }] } },
      ],
      simpleType: [
        { name: 'BaseEnum', restriction: { base: 'xs:string' } },
      ],
    };

    const importedSchema: Schema = {
      $filename: 'imported.xsd',
      targetNamespace: 'http://imported.com',
      complexType: [
        { name: 'ImportedType', sequence: { element: [{ name: 'value', type: 'xs:int' }] } },
      ],
    };

    const mainSchema: Schema = {
      $filename: 'main.xsd',
      targetNamespace: 'http://main.com',
      $imports: [baseSchema, importedSchema],
      complexType: [
        { name: 'MainType', sequence: { element: [{ name: 'data', type: 'xs:string' }] } },
      ],
    };

    it('should NOT visit $imports by default', () => {
      const visited: string[] = [];
      
      visitSchema(mainSchema, {
        visitComplexType(node) {
          if ('name' in node && typeof node.name === 'string') {
            visited.push(node.name);
          }
        },
      });
      
      // Only MainType from main schema
      assert.deepStrictEqual(visited, ['MainType']);
    });

    it('should visit $imports when followImports is true', () => {
      const visited: string[] = [];
      
      visitSchema(mainSchema, {
        visitComplexType(node) {
          if ('name' in node && typeof node.name === 'string') {
            visited.push(node.name);
          }
        },
      }, { followImports: true });
      
      // MainType + BaseType + ImportedType
      assert.ok(visited.includes('MainType'));
      assert.ok(visited.includes('BaseType'));
      assert.ok(visited.includes('ImportedType'));
      assert.strictEqual(visited.length, 3);
    });

    it('should track which schema each node belongs to', () => {
      const typesByNamespace: Record<string, string[]> = {};
      
      visitSchema(mainSchema, {
        visitComplexType(node, ctx) {
          const ns = ctx.schema.targetNamespace || 'unknown';
          if (!typesByNamespace[ns]) typesByNamespace[ns] = [];
          if ('name' in node && typeof node.name === 'string') {
            typesByNamespace[ns].push(node.name);
          }
        },
      }, { followImports: true });
      
      assert.deepStrictEqual(typesByNamespace['http://main.com'], ['MainType']);
      assert.deepStrictEqual(typesByNamespace['http://base.com'], ['BaseType']);
      assert.deepStrictEqual(typesByNamespace['http://imported.com'], ['ImportedType']);
    });

    it('should include $imports in path', () => {
      const paths: (string | number)[][] = [];
      
      visitSchema(mainSchema, {
        visitComplexType(node, ctx) {
          if ('name' in node && node.name === 'BaseType') {
            paths.push([...ctx.path]);
          }
        },
      }, { followImports: true });
      
      // Path should include '$imports' for imported types
      assert.ok(paths.length > 0);
      assert.ok(paths[0].includes('$imports'));
    });

    it('should visit all node types across imports', () => {
      const simpleTypes: string[] = [];
      
      visitSchema(mainSchema, {
        visitSimpleType(node) {
          if ('name' in node && typeof node.name === 'string') {
            simpleTypes.push(node.name);
          }
        },
      }, { followImports: true });
      
      // BaseEnum from baseSchema
      assert.deepStrictEqual(simpleTypes, ['BaseEnum']);
    });
  });
  
  describe('hasVisited/markVisited helpers', () => {
    it('should provide hasVisited and markVisited in context', () => {
      const schema: Schema = {
        complexType: [
          { name: 'TypeA', sequence: { element: [{ name: 'a', type: 'xs:string' }] } },
        ],
      };
      
      let hasVisitedFn: ((node: unknown) => boolean) | undefined;
      let markVisitedFn: ((node: unknown) => boolean) | undefined;
      
      visitSchema(schema, {
        visitComplexType(ct, ctx) {
          hasVisitedFn = ctx.hasVisited;
          markVisitedFn = ctx.markVisited;
        },
      });
      
      assert.ok(hasVisitedFn, 'hasVisited should be provided');
      assert.ok(markVisitedFn, 'markVisited should be provided');
    });
    
    it('should track visited nodes across the traversal', () => {
      const sharedElement = { name: 'shared', type: 'xs:string' };
      const schema: Schema = {
        complexType: [
          { name: 'TypeA', sequence: { element: [sharedElement] } },
          { name: 'TypeB', sequence: { element: [sharedElement] } }, // Same object reference
        ],
      };
      
      let firstVisitCount = 0;
      let alreadyVisitedCount = 0;
      
      visitSchema(schema, {
        visitElement(el, ctx) {
          // First time seeing this node? Mark it
          if (ctx.markVisited(el)) {
            firstVisitCount++;
          } else {
            // Already visited
            alreadyVisitedCount++;
          }
        },
      });
      
      // The shared element should be visited twice (once per complexType)
      // markVisited returns true on first visit, false on second
      assert.strictEqual(firstVisitCount, 1, 'markVisited should return true only on first visit');
      assert.strictEqual(alreadyVisitedCount, 1, 'markVisited should return false on subsequent visits');
    });
    
    it('should allow checking without marking', () => {
      const schema: Schema = {
        complexType: [
          { name: 'TypeA', sequence: { element: [{ name: 'a', type: 'xs:string' }] } },
        ],
      };
      
      const typeA = schema.complexType![0];
      let hasVisitedResult: boolean | undefined;
      let markVisitedResult: boolean | undefined;
      
      visitSchema(schema, {
        visitComplexType(ct, ctx) {
          // Check without marking
          hasVisitedResult = ctx.hasVisited(typeA);
          // Now mark it
          markVisitedResult = ctx.markVisited(typeA);
        },
      });
      
      assert.strictEqual(hasVisitedResult, false, 'hasVisited should return false before marking');
      assert.strictEqual(markVisitedResult, true, 'markVisited should return true on first mark');
    });
  });
});
