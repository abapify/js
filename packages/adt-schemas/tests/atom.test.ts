/**
 * @file Atom namespace tests
 * Tests atom namespace and AtomLinkSchema
 */

import { strict as assert } from "node:assert";
import { test, describe } from "node:test";
import { atom, AtomLinkSchema } from "../src/namespaces/atom/index.ts";

describe("Atom Namespace", () => {
  test("namespace has correct uri and prefix", () => {
    assert.equal(atom.uri, "http://www.w3.org/2005/Atom");
    assert.equal(atom.prefix, "atom");
  });

  test("provides schema factory method", () => {
    assert.equal(typeof atom.schema, "function");
  });

  test("provides attr helper", () => {
    assert.equal(typeof atom.attr, "function");
  });

  test("provides elem helper", () => {
    assert.equal(typeof atom.elem, "function");
  });

  test("provides elems helper", () => {
    assert.equal(typeof atom.elems, "function");
  });
});

describe("AtomLinkSchema", () => {
  test("schema is defined", () => {
    assert.ok(AtomLinkSchema);
  });

  test("schema has correct tag", () => {
    // @ts-expect-error - accessing internal structure for testing
    assert.equal(AtomLinkSchema.tag, "atom:link");
  });

  test("schema has unprefixed attribute fields", () => {
    // @ts-expect-error - accessing internal structure for testing
    const fields = AtomLinkSchema.fields;

    // Atom link attributes should be unprefixed (per Atom spec)
    assert.ok(fields.href);
    assert.equal(fields.href.kind, "attr");
    assert.equal(fields.href.name, "href"); // No prefix!

    assert.ok(fields.rel);
    assert.equal(fields.rel.kind, "attr");
    assert.equal(fields.rel.name, "rel"); // No prefix!

    assert.ok(fields.title);
    assert.equal(fields.title.kind, "attr");
    assert.equal(fields.title.name, "title"); // No prefix!

    assert.ok(fields.type);
    assert.equal(fields.type.kind, "attr");
    assert.equal(fields.type.name, "type"); // No prefix!
  });

  test("demonstrates schema independence from namespace helpers", () => {
    // This test documents that schemas can work without namespace helpers
    // The Atom schema uses unprefixed attributes, NOT atom.attr()

    // @ts-expect-error - accessing internal structure
    const fields = AtomLinkSchema.fields;

    // These fields were NOT created with atom.attr()
    // They were manually defined to be unprefixed
    assert.notEqual(fields.href.name, "atom:href");
    assert.notEqual(fields.rel.name, "atom:rel");

    // This proves schemas are independent and fundamental
  });
});
