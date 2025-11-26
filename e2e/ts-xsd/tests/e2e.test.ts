/**
 * E2E Tests for ts-xsd
 *
 * Tests the full workflow:
 * 1. Import XSD schemas into TypeScript
 * 2. Parse XML fixtures using the schemas
 * 3. Build XML from typed objects
 * 4. Round-trip verification
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { parse, build } from 'ts-xsd';
import { Person, type PersonType } from '../src/schemas/person';
import { Order, type OrderType } from '../src/schemas/order';

// Helper functions
function loadFixture(filename: string): string {
  return readFileSync(join(__dirname, '..', 'fixtures', filename), 'utf-8');
}

function saveGenerated(filename: string, content: string): void {
  const generatedDir = join(__dirname, '..', 'generated');
  mkdirSync(generatedDir, { recursive: true });
  writeFileSync(join(generatedDir, filename), content, 'utf-8');
}

describe('ts-xsd E2E Tests', () => {
  describe('Person Schema', () => {
    it('should parse XML fixture to typed object', () => {
      const xml = loadFixture('person.xml');
      const person = parse(Person, xml);

      // Type-safe access - these are all correctly typed!
      expect(person.id).toBe('user-123');
      expect(person.status).toBe('active');
      expect(person.FirstName).toBe('John');
      expect(person.LastName).toBe('Doe');
      expect(person.Age).toBe(30);
      expect(person.Email).toBe('john.doe@example.com');
    });

    it('should build XML from typed object', () => {
      const person: PersonType = {
        id: 'user-456',
        status: 'inactive',
        FirstName: 'Jane',
        LastName: 'Smith',
        Age: 25,
        Email: 'jane.smith@example.com',
      };

      const xml = build(Person, person);
      saveGenerated('person-built.xml', xml);

      // Verify structure
      expect(xml).toContain('<?xml version="1.0"');
      expect(xml).toContain('per:Person');
      expect(xml).toContain('per:id="user-456"');
      expect(xml).toContain('<per:FirstName>Jane</per:FirstName>');
      expect(xml).toContain('<per:LastName>Smith</per:LastName>');
      expect(xml).toContain('<per:Age>25</per:Age>');
      expect(xml).toContain('<per:Email>jane.smith@example.com</per:Email>');
    });

    it('should round-trip Person data', () => {
      const original: PersonType = {
        id: 'round-trip-001',
        status: 'active',
        FirstName: 'Round',
        LastName: 'Trip',
        Age: 42,
        Email: 'round.trip@test.com',
      };

      const xml = build(Person, original);
      const parsed = parse(Person, xml);

      expect(parsed.id).toBe(original.id);
      expect(parsed.status).toBe(original.status);
      expect(parsed.FirstName).toBe(original.FirstName);
      expect(parsed.LastName).toBe(original.LastName);
      expect(parsed.Age).toBe(original.Age);
      expect(parsed.Email).toBe(original.Email);
    });

    it('should handle optional fields correctly', () => {
      const person: PersonType = {
        id: 'minimal-001',
        status: undefined,
        FirstName: 'Minimal',
        LastName: 'Person',
        Age: undefined,
        Email: undefined,
      };

      const xml = build(Person, person);
      const parsed = parse(Person, xml);

      expect(parsed.id).toBe('minimal-001');
      expect(parsed.FirstName).toBe('Minimal');
      expect(parsed.LastName).toBe('Person');
      expect(parsed.Age).toBeUndefined();
      expect(parsed.Email).toBeUndefined();
    });
  });

  describe('Order Schema (Nested Elements)', () => {
    it('should parse complex nested XML', () => {
      const xml = loadFixture('order.xml');
      const order = parse(Order, xml);

      // Root attributes
      expect(order.id).toBe('ORD-2024-001');
      expect(order.date).toBeInstanceOf(Date);

      // Simple elements
      expect(order.customer).toBe('Acme Corp');
      expect(order.total).toBe(249.93);

      // Nested array
      expect(order.items.item).toHaveLength(2);
      expect(order.items.item[0].sku).toBe('WIDGET-001');
      expect(order.items.item[0].name).toBe('Premium Widget');
      expect(order.items.item[0].quantity).toBe(5);
      expect(order.items.item[0].price).toBe(29.99);

      expect(order.items.item[1].sku).toBe('GADGET-002');
      expect(order.items.item[1].name).toBe('Super Gadget');
    });

    it('should build complex nested XML', () => {
      const order: OrderType = {
        id: 'ORD-2024-002',
        date: new Date('2024-11-26T15:00:00Z'),
        customer: 'Test Corp',
        items: {
          item: [
            { sku: 'ITEM-001', name: 'Test Item', quantity: 3, price: 19.99 },
            { sku: 'ITEM-002', name: 'Another Item', quantity: 1, price: 99.99 },
          ],
        },
        total: 159.96,
      };

      const xml = build(Order, order);
      saveGenerated('order-built.xml', xml);

      expect(xml).toContain('ord:Order');
      expect(xml).toContain('ord:id="ORD-2024-002"');
      expect(xml).toContain('<ord:customer>Test Corp</ord:customer>');
      expect(xml).toContain('<ord:item');
      expect(xml).toContain('ord:sku="ITEM-001"');
      expect(xml).toContain('<ord:name>Test Item</ord:name>');
      expect(xml).toContain('<ord:total>159.96</ord:total>');
    });

    it('should round-trip Order data', () => {
      const original: OrderType = {
        id: 'ORD-ROUNDTRIP',
        date: new Date('2024-12-01T10:00:00Z'),
        customer: 'Roundtrip Inc',
        items: {
          item: [
            { sku: 'RT-001', name: 'Roundtrip Product', quantity: 10, price: 5.00 },
          ],
        },
        total: 50.00,
      };

      const xml = build(Order, original);
      saveGenerated('order-roundtrip.xml', xml);
      const parsed = parse(Order, xml);

      expect(parsed.id).toBe(original.id);
      expect(parsed.customer).toBe(original.customer);
      expect(parsed.total).toBe(original.total);
      expect(parsed.items.item).toHaveLength(1);
      expect(parsed.items.item[0].sku).toBe('RT-001');
      expect(parsed.items.item[0].name).toBe('Roundtrip Product');
      expect(parsed.items.item[0].quantity).toBe(10);
      expect(parsed.items.item[0].price).toBe(5.00);
    });

    it('should handle empty item list', () => {
      const order: OrderType = {
        id: 'ORD-EMPTY',
        date: undefined,
        customer: 'Empty Order Corp',
        items: {
          item: [],
        },
        total: 0,
      };

      const xml = build(Order, order);
      const parsed = parse(Order, xml);

      expect(parsed.id).toBe('ORD-EMPTY');
      expect(parsed.items.item).toHaveLength(0);
      expect(parsed.total).toBe(0);
    });
  });

  describe('Type Safety', () => {
    it('should provide correct TypeScript types', () => {
      // This test verifies compile-time type safety
      // If it compiles, the types are correct

      const person: PersonType = {
        id: 'type-test',
        status: 'active',
        FirstName: 'Type',
        LastName: 'Test',
        Age: 100,
        Email: 'type@test.com',
      };

      // Type assertions - these should all compile
      const id: string = person.id;
      const firstName: string = person.FirstName;
      const age: number | undefined = person.Age;

      expect(id).toBe('type-test');
      expect(firstName).toBe('Type');
      expect(age).toBe(100);
    });

    it('should infer nested types correctly', () => {
      const order: OrderType = {
        id: 'nested-type-test',
        date: new Date(),
        customer: 'Nested Corp',
        items: {
          item: [
            { sku: 'SKU-1', name: 'Item 1', quantity: 1, price: 10 },
          ],
        },
        total: 10,
      };

      // Type assertions for nested structures
      const items: { item: Array<{ sku: string; name: string; quantity: number; price: number }> } = order.items;
      const firstItem = items.item[0];
      const sku: string = firstItem.sku;

      expect(sku).toBe('SKU-1');
    });
  });
});
