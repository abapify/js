/**
 * tsod - Transform Schema Object Definition
 * Core transformer tests (TDD)
 */

import { describe, it, expect } from 'vitest';
import { Transformer } from './transformer';
import type { TransformSchema } from './types';

describe('Transformer', () => {
  describe('Simple field mapping', () => {
    it('should transform simple string field forward', () => {
      const schema: TransformSchema = {
        rules: [{ from: 'name', to: 'userName' }],
      };

      const transformer = new Transformer(schema);
      const result = transformer.forward({ name: 'John' });

      expect(result).toEqual({ userName: 'John' });
    });

    it('should transform simple string field reverse', () => {
      const schema: TransformSchema = {
        rules: [{ from: 'name', to: 'userName' }],
      };

      const transformer = new Transformer(schema);
      const result = transformer.reverse({ userName: 'John' });

      expect(result).toEqual({ name: 'John' });
    });

    it('should handle multiple fields', () => {
      const schema: TransformSchema = {
        rules: [
          { from: 'firstName', to: 'given_name' },
          { from: 'lastName', to: 'family_name' },
          { from: 'age', to: 'years' },
        ],
      };

      const transformer = new Transformer(schema);
      const source = { firstName: 'John', lastName: 'Doe', age: 30 };
      const result = transformer.forward(source);

      expect(result).toEqual({
        given_name: 'John',
        family_name: 'Doe',
        years: 30,
      });
    });
  });

  describe('Nested objects', () => {
    it('should transform nested paths forward', () => {
      const schema: TransformSchema = {
        rules: [
          { from: 'user.name', to: 'userName' },
          { from: 'user.email', to: 'contact.email' },
        ],
      };

      const transformer = new Transformer(schema);
      const result = transformer.forward({
        user: { name: 'John', email: 'john@example.com' },
      });

      expect(result).toEqual({
        userName: 'John',
        contact: { email: 'john@example.com' },
      });
    });

    it('should transform nested paths reverse', () => {
      const schema: TransformSchema = {
        rules: [
          { from: 'user.name', to: 'userName' },
          { from: 'user.email', to: 'contact.email' },
        ],
      };

      const transformer = new Transformer(schema);
      const result = transformer.reverse({
        userName: 'John',
        contact: { email: 'john@example.com' },
      });

      expect(result).toEqual({
        user: { name: 'John', email: 'john@example.com' },
      });
    });

    it('should handle deep nesting', () => {
      const schema: TransformSchema = {
        rules: [{ from: 'a.b.c.d', to: 'x.y.z' }],
      };

      const transformer = new Transformer(schema);
      const result = transformer.forward({ a: { b: { c: { d: 'value' } } } });

      expect(result).toEqual({ x: { y: { z: 'value' } } });
    });
  });

  describe('Transform functions', () => {
    it('should apply forward transform function', () => {
      const schema: TransformSchema = {
        rules: [
          {
            from: 'name',
            to: 'userName',
            transform: (value: string) => value.toUpperCase(),
          },
        ],
      };

      const transformer = new Transformer(schema);
      const result = transformer.forward({ name: 'john' });

      expect(result).toEqual({ userName: 'JOHN' });
    });

    it('should apply reverse transform function', () => {
      const schema: TransformSchema = {
        rules: [
          {
            from: 'name',
            to: 'userName',
            transform: (value: string) => value.toUpperCase(),
            reverse: (value: string) => value.toLowerCase(),
          },
        ],
      };

      const transformer = new Transformer(schema);
      const result = transformer.reverse({ userName: 'JOHN' });

      expect(result).toEqual({ name: 'john' });
    });

    it('should pass context to transform functions', () => {
      const schema: TransformSchema = {
        rules: [
          {
            from: 'value',
            to: 'result',
            transform: (value, ctx) => ({
              value,
              direction: ctx.direction,
              path: ctx.path.join('.'),
            }),
          },
        ],
      };

      const transformer = new Transformer(schema);
      const result = transformer.forward({ value: 'test' });

      expect(result).toEqual({
        result: {
          value: 'test',
          direction: 'forward',
          path: 'value',
        },
      });
    });
  });

  describe('Arrays', () => {
    it('should transform simple arrays', () => {
      const schema: TransformSchema = {
        rules: [{ from: 'tags[]', to: 'labels[]' }],
      };

      const transformer = new Transformer(schema);
      const result = transformer.forward({ tags: ['a', 'b', 'c'] });

      expect(result).toEqual({ labels: ['a', 'b', 'c'] });
    });

    it('should transform arrays with nested rules', () => {
      const schema: TransformSchema = {
        rules: [
          {
            from: 'users[]',
            to: 'people[]',
            rules: [
              { from: 'name', to: 'fullName' },
              { from: 'age', to: 'years' },
            ],
          },
        ],
      };

      const transformer = new Transformer(schema);
      const result = transformer.forward({
        users: [
          { name: 'John', age: 30 },
          { name: 'Jane', age: 25 },
        ],
      });

      expect(result).toEqual({
        people: [
          { fullName: 'John', years: 30 },
          { fullName: 'Jane', years: 25 },
        ],
      });
    });

    it('should transform nested array paths', () => {
      const schema: TransformSchema = {
        rules: [{ from: 'data.items[]', to: 'result.list[]' }],
      };

      const transformer = new Transformer(schema);
      const result = transformer.forward({
        data: { items: ['a', 'b', 'c'] },
      });

      expect(result).toEqual({
        result: { list: ['a', 'b', 'c'] },
      });
    });

    it('should handle empty arrays', () => {
      const schema: TransformSchema = {
        rules: [{ from: 'items[]', to: 'data[]' }],
      };

      const transformer = new Transformer(schema);
      const result = transformer.forward({ items: [] });

      expect(result).toEqual({ data: [] });
    });
  });

  describe('Schema initialization', () => {
    it('should use init function for forward direction', () => {
      const schema: TransformSchema = {
        init: (direction) =>
          direction === 'forward' ? { initialized: true } : {},
        rules: [{ from: 'value', to: 'result' }],
      };

      const transformer = new Transformer(schema);
      const result = transformer.forward({ value: 'test' });

      expect(result).toEqual({
        initialized: true,
        result: 'test',
      });
    });

    it('should use init function for reverse direction', () => {
      const schema: TransformSchema = {
        init: (direction) =>
          direction === 'reverse' ? { reversed: true } : {},
        rules: [{ from: 'value', to: 'result' }],
      };

      const transformer = new Transformer(schema);
      const result = transformer.reverse({ result: 'test' });

      expect(result).toEqual({
        reversed: true,
        value: 'test',
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined values', () => {
      const schema: TransformSchema = {
        rules: [{ from: 'name', to: 'userName' }],
      };

      const transformer = new Transformer(schema);
      const result = transformer.forward({ name: undefined });

      expect(result).toEqual({});
    });

    it('should handle null values', () => {
      const schema: TransformSchema = {
        rules: [{ from: 'name', to: 'userName' }],
      };

      const transformer = new Transformer(schema);
      const result = transformer.forward({ name: null });

      expect(result).toEqual({ userName: null });
    });

    it('should handle missing source paths gracefully', () => {
      const schema: TransformSchema = {
        rules: [{ from: 'missing.path', to: 'result' }],
      };

      const transformer = new Transformer(schema);
      const result = transformer.forward({ other: 'value' });

      expect(result).toEqual({});
    });

    it('should handle nested rules with missing arrays', () => {
      const schema: TransformSchema = {
        rules: [
          {
            from: 'items[]',
            to: 'data[]',
            rules: [{ from: 'id', to: 'identifier' }],
          },
        ],
      };

      const transformer = new Transformer(schema);
      const result = transformer.forward({ other: 'value' });

      expect(result).toEqual({});
    });
  });

  describe('Complex real-world scenarios', () => {
    it('should transform GitHub API to internal format', () => {
      const schema: TransformSchema = {
        rules: [
          { from: 'login', to: 'username' },
          { from: 'avatar_url', to: 'avatar' },
          { from: 'html_url', to: 'profileUrl' },
          {
            from: 'repos[]',
            to: 'repositories[]',
            rules: [
              { from: 'name', to: 'title' },
              { from: 'full_name', to: 'id' },
              { from: 'stargazers_count', to: 'stars' },
            ],
          },
        ],
      };

      const githubData = {
        login: 'octocat',
        avatar_url: 'https://github.com/images/error/octocat_happy.gif',
        html_url: 'https://github.com/octocat',
        repos: [
          {
            name: 'Hello-World',
            full_name: 'octocat/Hello-World',
            stargazers_count: 1234,
          },
          {
            name: 'Spoon-Knife',
            full_name: 'octocat/Spoon-Knife',
            stargazers_count: 5678,
          },
        ],
      };

      const transformer = new Transformer(schema);
      const result = transformer.forward(githubData);

      expect(result).toEqual({
        username: 'octocat',
        avatar: 'https://github.com/images/error/octocat_happy.gif',
        profileUrl: 'https://github.com/octocat',
        repositories: [
          { title: 'Hello-World', id: 'octocat/Hello-World', stars: 1234 },
          { title: 'Spoon-Knife', id: 'octocat/Spoon-Knife', stars: 5678 },
        ],
      });
    });

    it('should transform flat to nested structure', () => {
      const schema: TransformSchema = {
        rules: [
          { from: 'customer_name', to: 'customer.name' },
          { from: 'customer_email', to: 'customer.email' },
          { from: 'order_id', to: 'order.id' },
          { from: 'order_total', to: 'order.total' },
          { from: 'product_name', to: 'order.product.name' },
          { from: 'product_price', to: 'order.product.price' },
        ],
      };

      const flat = {
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        order_id: '12345',
        order_total: 99.99,
        product_name: 'Widget',
        product_price: 99.99,
      };

      const transformer = new Transformer(schema);
      const result = transformer.forward(flat);

      expect(result).toEqual({
        customer: {
          name: 'John Doe',
          email: 'john@example.com',
        },
        order: {
          id: '12345',
          total: 99.99,
          product: {
            name: 'Widget',
            price: 99.99,
          },
        },
      });
    });
  });

  describe('Bidirectional round-trip', () => {
    it('should maintain data integrity in round-trip transformation', () => {
      const schema: TransformSchema = {
        rules: [
          { from: 'name', to: 'userName' },
          { from: 'age', to: 'userAge' },
          {
            from: 'address.street', to: 'location.street' },
          {
            from: 'tags[]',
            to: 'labels[]',
            rules: [{ from: 'name', to: 'title' }],
          },
        ],
      };

      const original = {
        name: 'John',
        age: 30,
        address: { street: '123 Main St' },
        tags: [{ name: 'developer' }, { name: 'typescript' }],
      };

      const transformer = new Transformer(schema);
      const forward = transformer.forward(original);
      const roundTrip = transformer.reverse(forward);

      expect(roundTrip).toEqual(original);
    });
  });
});
