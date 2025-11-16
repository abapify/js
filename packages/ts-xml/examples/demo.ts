import { build, parse, tsxml } from "../src/index.js";
import type { InferSchema } from "../src/index.js";

// Define a simple schema for a book catalog
const AuthorSchema = tsxml.schema({
  tag: "author",
  fields: {
    name: { kind: "attr", name: "name", type: "string" },
    email: { kind: "attr", name: "email", type: "string" },
  },
} as const);

const BookSchema = tsxml.schema({
  tag: "bk:book",
  ns: {
    bk: "http://example.com/books",
    dc: "http://purl.org/dc/elements/1.1/",
  },
  fields: {
    isbn: { kind: "attr", name: "bk:isbn", type: "string" },
    title: { kind: "attr", name: "dc:title", type: "string" },
    published: { kind: "attr", name: "bk:published", type: "date" },
    inStock: { kind: "attr", name: "bk:inStock", type: "boolean" },
    price: { kind: "attr", name: "bk:price", type: "number" },
    authors: { kind: "elems", name: "author", schema: AuthorSchema },
  },
} as const);

// Infer TypeScript type from schema
type Book = InferSchema<typeof BookSchema>;

// Create sample data
const book: Book = {
  isbn: "978-0-123456-78-9",
  title: "TypeScript XML Processing",
  published: new Date("2025-01-15"),
  inStock: true,
  price: 49.99,
  authors: [
    { name: "Alice Smith", email: "alice@example.com" },
    { name: "Bob Johnson", email: "bob@example.com" },
  ],
};

console.log("=== Demo: ts-xml-claude ===\n");

// Build XML from JSON
console.log("1. Building XML from JSON data:");
console.log("--------------------------------");
const xml = build(BookSchema, book);
console.log(xml);
console.log();

// Parse XML back to JSON
console.log("2. Parsing XML back to JSON:");
console.log("----------------------------");
const parsed = parse(BookSchema, xml);
console.log(JSON.stringify(parsed, null, 2));
console.log();

// Verify round-trip
console.log("3. Verifying round-trip integrity:");
console.log("----------------------------------");
const xml2 = build(BookSchema, parsed);
const parsed2 = parse(BookSchema, xml2);
console.log("Round-trip successful:", JSON.stringify(parsed) === JSON.stringify(parsed2));
console.log();

// Demonstrate type safety
console.log("4. Type Safety Demo:");
console.log("--------------------");
console.log("TypeScript knows the shape of parsed data:");
console.log(`  - ISBN: ${parsed.isbn}`);
console.log(`  - Title: ${parsed.title}`);
console.log(`  - Published: ${parsed.published instanceof Date ? parsed.published.toISOString() : parsed.published}`);
console.log(`  - In Stock: ${parsed.inStock}`);
console.log(`  - Price: $${parsed.price}`);
console.log(`  - Authors: ${parsed.authors?.length}`);
parsed.authors?.forEach((author, i) => {
  console.log(`    ${i + 1}. ${author.name} <${author.email}>`);
});
