/**
 * JOTL Test Suite
 * Comprehensive tests for v0.1 features ($ref and $schema)
 */

import { describe, it, expect } from 'vitest';
import { makeSchemaProxy, transform } from './index';

describe('JOTL v0.1 - Basic Transformations', () => {
  describe('Simple field mapping with $ref', () => {
    it('should map a single field', () => {
      const source = { name: 'John' };
      const schema = { fullName: { $ref: 'name' } };
      const result = transform(source, schema);

      expect(result).toEqual({ fullName: 'John' });
    });

    it('should map multiple fields', () => {
      const source = { firstName: 'John', lastName: 'Doe' };
      const schema = {
        first: { $ref: 'firstName' },
        last: { $ref: 'lastName' },
      };
      const result = transform(source, schema);

      expect(result).toEqual({ first: 'John', last: 'Doe' });
    });

    it('should handle nested paths with dot notation', () => {
      const source = { user: { profile: { name: 'John' } } };
      const schema = { userName: { $ref: 'user.profile.name' } };
      const result = transform(source, schema);

      expect(result).toEqual({ userName: 'John' });
    });

    it('should return undefined for missing paths in non-strict mode', () => {
      const source = { name: 'John' };
      const schema = { missing: { $ref: 'nonexistent' } };
      const result = transform(source, schema);

      expect(result).toEqual({});
    });

    it('should throw error for missing paths in strict mode', () => {
      const source = { name: 'John' };
      const schema = { missing: { $ref: 'nonexistent' } };

      expect(() => transform(source, schema, { strict: true })).toThrow();
    });
  });

  describe('Array mapping with $schema', () => {
    it('should map array elements', () => {
      const source = {
        items: [
          { id: '1', name: 'Item 1' },
          { id: '2', name: 'Item 2' },
        ],
      };

      const schema = {
        items: {
          $ref: 'items',
          $schema: {
            itemId: { $ref: 'id' },
            itemName: { $ref: 'name' },
          },
        },
      };

      const result = transform(source, schema);

      expect(result).toEqual({
        items: [
          { itemId: '1', itemName: 'Item 1' },
          { itemId: '2', itemName: 'Item 2' },
        ],
      });
    });

    it('should handle empty arrays', () => {
      const source = { items: [] };
      const schema = {
        items: {
          $ref: 'items',
          $schema: { id: { $ref: 'id' } },
        },
      };

      const result = transform(source, schema);
      expect(result).toEqual({ items: [] });
    });

    it('should handle nested arrays', () => {
      const source = {
        orders: [
          {
            id: 'order1',
            lines: [
              { itemId: 'item1', qty: 5 },
              { itemId: 'item2', qty: 3 },
            ],
          },
        ],
      };

      const schema = {
        orders: {
          $ref: 'orders',
          $schema: {
            orderId: { $ref: 'id' },
            lineItems: {
              $ref: 'lines',
              $schema: {
                id: { $ref: 'itemId' },
                quantity: { $ref: 'qty' },
              },
            },
          },
        },
      };

      const result = transform(source, schema);

      expect(result).toEqual({
        orders: [
          {
            orderId: 'order1',
            lineItems: [
              { id: 'item1', quantity: 5 },
              { id: 'item2', quantity: 3 },
            ],
          },
        ],
      });
    });
  });

  describe('Object mapping with $schema', () => {
    it('should map nested objects', () => {
      const source = {
        user: {
          id: '123',
          profile: { name: 'John', age: 30 },
        },
      };

      const schema = {
        userData: {
          $ref: 'user',
          $schema: {
            userId: { $ref: 'id' },
            userName: { $ref: 'profile.name' },
          },
        },
      };

      const result = transform(source, schema);

      expect(result).toEqual({
        userData: {
          userId: '123',
          userName: 'John',
        },
      });
    });
  });

  describe('Proxy-based authoring', () => {
    it('should create schema from proxy access', () => {
      interface User {
        firstName: string;
        lastName: string;
      }

      const src = makeSchemaProxy<User>('user');
      const schema = {
        first: src.firstName,
        last: src.lastName,
      };

      const source = { firstName: 'John', lastName: 'Doe' };
      const result = transform(source, schema);

      expect(result).toEqual({ first: 'John', last: 'Doe' });
    });

    it('should handle nested proxy access', () => {
      interface Data {
        user: {
          profile: {
            name: string;
            age: number;
          };
        };
      }

      const src = makeSchemaProxy<Data>('data');
      const schema = {
        userName: src.user.profile.name,
        userAge: src.user.profile.age,
      };

      const source = {
        user: { profile: { name: 'John', age: 30 } },
      };
      const result = transform(source, schema);

      expect(result).toEqual({ userName: 'John', userAge: 30 });
    });

    it('should handle array mapping via proxy function call', () => {
      interface Invoice {
        lines: Array<{ id: string; qty: number; price: number }>;
      }

      const src = makeSchemaProxy<Invoice>('invoice');
      const schema = {
        items: src.lines((item) => ({
          id: item.id,
          quantity: item.qty,
        })),
      };

      const source = {
        lines: [
          { id: 'item1', qty: 5, price: 10 },
          { id: 'item2', qty: 3, price: 20 },
        ],
      };
      const result = transform(source, schema as any);

      expect(result).toEqual({
        items: [
          { id: 'item1', quantity: 5 },
          { id: 'item2', quantity: 3 },
        ],
      });
    });
  });

  describe('Complex real-world scenarios', () => {
    it('should transform REST API response', () => {
      interface APIResponse {
        data: {
          user_id: string;
          user_name: string;
          created_at: string;
          posts: Array<{
            post_id: string;
            title: string;
            published: boolean;
          }>;
        };
      }

      const src = makeSchemaProxy<APIResponse>('response');
      const schema = {
        userId: src.data.user_id,
        userName: src.data.user_name,
        createdAt: src.data.created_at,
        posts: src.data.posts((post) => ({
          id: post.post_id,
          title: post.title,
          isPublished: post.published,
        })),
      };

      const apiResponse = {
        data: {
          user_id: 'u123',
          user_name: 'johndoe',
          created_at: '2023-01-15',
          posts: [
            { post_id: 'p1', title: 'First Post', published: true },
            { post_id: 'p2', title: 'Draft Post', published: false },
          ],
        },
      };

      const result = transform(apiResponse, schema as any);

      expect(result).toEqual({
        userId: 'u123',
        userName: 'johndoe',
        createdAt: '2023-01-15',
        posts: [
          { id: 'p1', title: 'First Post', isPublished: true },
          { id: 'p2', title: 'Draft Post', isPublished: false },
        ],
      });
    });

    it('should transform ABAP transport data', () => {
      interface Transport {
        trkorr: string;
        as4user: string;
        as4date: string;
        objects: Array<{
          obj_name: string;
          object: string;
          obj_func: string;
        }>;
      }

      const src = makeSchemaProxy<Transport>('transport');
      const schema = {
        transportId: src.trkorr,
        owner: src.as4user,
        date: src.as4date,
        objects: src.objects((obj) => ({
          name: obj.obj_name,
          type: obj.object,
          function: obj.obj_func,
        })),
      };

      const transport = {
        trkorr: 'NPLK900123',
        as4user: 'DEVELOPER',
        as4date: '20231115',
        objects: [
          { obj_name: 'ZCL_TEST', object: 'CLAS', obj_func: 'K' },
          { obj_name: 'ZIF_TEST', object: 'INTF', obj_func: 'K' },
        ],
      };

      const result = transform(transport, schema as any);

      expect(result).toEqual({
        transportId: 'NPLK900123',
        owner: 'DEVELOPER',
        date: '20231115',
        objects: [
          { name: 'ZCL_TEST', type: 'CLAS', function: 'K' },
          { name: 'ZIF_TEST', type: 'INTF', function: 'K' },
        ],
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle null values', () => {
      const source = { name: null };
      const schema = { userName: { $ref: 'name' } };
      const result = transform(source, schema);

      expect(result).toEqual({ userName: null });
    });

    it('should handle undefined values', () => {
      const source = { name: undefined };
      const schema = { userName: { $ref: 'name' } };
      const result = transform(source, schema);

      expect(result).toEqual({});
    });

    it('should handle primitive values in arrays', () => {
      const source = { tags: ['tag1', 'tag2', 'tag3'] };
      const schema = {
        tagList: { $ref: 'tags' },
      };
      const result = transform(source, schema);

      expect(result).toEqual({ tagList: ['tag1', 'tag2', 'tag3'] });
    });

    it('should handle deeply nested paths', () => {
      const source = {
        a: { b: { c: { d: { e: { f: 'deep' } } } } },
      };
      const schema = { deepValue: { $ref: 'a.b.c.d.e.f' } };
      const result = transform(source, schema);

      expect(result).toEqual({ deepValue: 'deep' });
    });

    it('should preserve literal values in schema', () => {
      const source = { name: 'John' };
      const schema = {
        userName: { $ref: 'name' },
        version: '1.0.0',
        count: 42,
        active: true,
      };
      const result = transform(source, schema);

      expect(result).toEqual({
        userName: 'John',
        version: '1.0.0',
        count: 42,
        active: true,
      });
    });
  });

  describe('Type safety (TypeScript compilation tests)', () => {
    it('should infer correct types from schema', () => {
      interface Source {
        name: string;
        age: number;
      }

      interface Target {
        userName: string;
        userAge: number;
      }

      const source: Source = { name: 'John', age: 30 };
      const schema = {
        userName: { $ref: 'name' },
        userAge: { $ref: 'age' },
      };

      const result: Target = transform<Source, Target>(source, schema);

      expect(result.userName).toBe('John');
      expect(result.userAge).toBe(30);
    });
  });
});
