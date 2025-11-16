import { describe, test as it } from "node:test";
import { strict as assert } from "node:assert";
import { build, parse, tsxml } from "../src/index.ts";
import type { InferSchema } from "../src/index.ts";

describe("Basic Schema Tests", () => {
  describe("Simple element with attributes", () => {
    const PersonSchema = tsxml.schema({
      tag: "person",
      fields: {
        name: { kind: "attr", name: "name", type: "string" },
        age: { kind: "attr", name: "age", type: "number" },
        active: { kind: "attr", name: "active", type: "boolean" },
      },
    } as const);

    type Person = InferSchema<typeof PersonSchema>;

    it("should build XML from JSON", () => {
      const person: Person = { name: "Alice", age: 30, active: true };
      const xml = build(PersonSchema, person);
      assert.ok(xml.includes('<person name="Alice" age="30" active="true"/>'));
    });

    it("should parse XML to JSON", () => {
      const xml = '<person name="Bob" age="25" active="false"/>';
      const person = parse(PersonSchema, xml);
      assert.deepEqual(person, { name: "Bob", age: 25, active: false });
    });

    it("should round-trip", () => {
      const person: Person = { name: "Charlie", age: 35, active: true };
      const xml = build(PersonSchema, person);
      const parsed = parse(PersonSchema, xml);
      assert.deepEqual(parsed, person);
    });
  });

  describe("Element with text content", () => {
    const MessageSchema = tsxml.schema({
      tag: "message",
      fields: {
        id: { kind: "attr", name: "id", type: "string" },
        text: { kind: "text", type: "string" },
      },
    } as const);

    type Message = InferSchema<typeof MessageSchema>;

    it("should build XML with text content", () => {
      const msg: Message = { id: "msg1", text: "Hello World" };
      const xml = build(MessageSchema, msg);
      assert.ok(xml.includes('<message id="msg1">Hello World</message>'));
    });

    it("should parse XML with text content", () => {
      const xml = '<message id="msg2">Goodbye</message>';
      const msg = parse(MessageSchema, xml);
      assert.deepEqual(msg, { id: "msg2", text: "Goodbye" });
    });
  });

  describe("Nested elements", () => {
    const AddressSchema = tsxml.schema({
      tag: "address",
      fields: {
        street: { kind: "attr", name: "street", type: "string" },
        city: { kind: "attr", name: "city", type: "string" },
      },
    } as const);

    const PersonWithAddressSchema = tsxml.schema({
      tag: "person",
      fields: {
        name: { kind: "attr", name: "name", type: "string" },
        address: { kind: "elem", name: "address", schema: AddressSchema },
      },
    } as const);

    type PersonWithAddress = InferSchema<typeof PersonWithAddressSchema>;

    it("should build nested XML", () => {
      const person: PersonWithAddress = {
        name: "Alice",
        address: { street: "Main St", city: "NYC" },
      };
      const xml = build(PersonWithAddressSchema, person);
      assert.ok(xml.includes('<person name="Alice">'));
      assert.ok(xml.includes('<address street="Main St" city="NYC"/>'));
    });

    it("should parse nested XML", () => {
      const xml = '<person name="Bob"><address street="5th Ave" city="LA"/></person>';
      const person = parse(PersonWithAddressSchema, xml);
      assert.deepEqual(person, {
        name: "Bob",
        address: { street: "5th Ave", city: "LA" },
      });
    });
  });

  describe("Repeated elements", () => {
    const ItemSchema = tsxml.schema({
      tag: "item",
      fields: {
        name: { kind: "attr", name: "name", type: "string" },
        price: { kind: "attr", name: "price", type: "number" },
      },
    } as const);

    const CartSchema = tsxml.schema({
      tag: "cart",
      fields: {
        id: { kind: "attr", name: "id", type: "string" },
        items: { kind: "elems", name: "item", schema: ItemSchema },
      },
    } as const);

    type Cart = InferSchema<typeof CartSchema>;

    it("should build XML with repeated elements", () => {
      const cart: Cart = {
        id: "cart1",
        items: [
          { name: "apple", price: 1.5 },
          { name: "banana", price: 0.5 },
        ],
      };
      const xml = build(CartSchema, cart);
      assert.ok(xml.includes('<cart id="cart1">'));
      assert.ok(xml.includes('<item name="apple" price="1.5"/>'));
      assert.ok(xml.includes('<item name="banana" price="0.5"/>'));
    });

    it("should parse XML with repeated elements", () => {
      const xml = `
        <cart id="cart2">
          <item name="orange" price="2"/>
          <item name="grape" price="3"/>
          <item name="melon" price="5"/>
        </cart>
      `;
      const cart = parse(CartSchema, xml);
      assert.equal(cart.items.length, 3);
      assert.deepEqual(cart.items?.[0], { name: "orange", price: 2 });
      assert.deepEqual(cart.items?.[2], { name: "melon", price: 5 });
    });
  });

  describe("Namespaces and QNames", () => {
    const BookSchema = tsxml.schema({
      tag: "bk:book",
      ns: {
        bk: "http://example.com/books",
        dc: "http://purl.org/dc/elements/1.1/",
      },
      fields: {
        isbn: { kind: "attr", name: "bk:isbn", type: "string" },
        title: { kind: "attr", name: "dc:title", type: "string" },
        author: { kind: "attr", name: "dc:creator", type: "string" },
      },
    } as const);

    type Book = InferSchema<typeof BookSchema>;

    it("should build XML with namespaces", () => {
      const book: Book = {
        isbn: "123-456",
        title: "The Great Book",
        author: "Alice",
      };
      const xml = build(BookSchema, book);
      assert.ok(xml.includes('xmlns:bk="http://example.com/books"'));
      assert.ok(xml.includes('xmlns:dc="http://purl.org/dc/elements/1.1/"'));
      assert.ok(xml.includes('bk:isbn="123-456"'));
      assert.ok(xml.includes('dc:title="The Great Book"'));
    });

    it("should parse XML with namespaces", () => {
      const xml = `<bk:book xmlns:bk="http://example.com/books" xmlns:dc="http://purl.org/dc/elements/1.1/" bk:isbn="789" dc:title="Another Book" dc:creator="Bob"/>`;
      const book = parse(BookSchema, xml);
      assert.deepEqual(book, {
        isbn: "789",
        title: "Another Book",
        author: "Bob",
      });
    });
  });

  describe("Date handling", () => {
    const EventSchema = tsxml.schema({
      tag: "event",
      fields: {
        name: { kind: "attr", name: "name", type: "string" },
        timestamp: { kind: "attr", name: "timestamp", type: "date" },
      },
    } as const);

    type Event = InferSchema<typeof EventSchema>;

    it("should serialize Date to ISO string", () => {
      const event: Event = {
        name: "meeting",
        timestamp: new Date("2025-01-15T10:30:00Z"),
      };
      const xml = build(EventSchema, event);
      assert.ok(xml.includes('timestamp="2025-01-15T10:30:00.000Z"'));
    });

    it("should parse ISO string to Date", () => {
      const xml = '<event name="conference" timestamp="2025-02-20T14:00:00Z"/>';
      const event = parse(EventSchema, xml);
      assert.ok(event.timestamp instanceof Date);
      assert.equal((event.timestamp as Date).toISOString(), "2025-02-20T14:00:00.000Z");
    });
  });
});
