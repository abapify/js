/**
 * @file Base namespace factory tests
 * Tests createNamespace, createAdtSchema, and helper functions
 */

import { strict as assert } from "node:assert";
import { test, describe } from "node:test";
import { createNamespace, createAdtSchema, type AdtSchema } from "../src/base/namespace.ts";

describe("createNamespace", () => {
  test("creates namespace with uri and prefix", () => {
    const ns = createNamespace({
      uri: "http://example.com/test",
      prefix: "test",
    });

    assert.equal(ns.uri, "http://example.com/test");
    assert.equal(ns.prefix, "test");
  });

  test("provides schema factory method", () => {
    const ns = createNamespace({
      uri: "http://example.com/test",
      prefix: "test",
    });

    assert.equal(typeof ns.schema, "function");
    const schema = ns.schema({ tag: "test:element", fields: {} } as const);
    assert.ok(schema);
  });

  test("attr() creates prefixed attribute field", () => {
    const ns = createNamespace({
      uri: "http://example.com/test",
      prefix: "test",
    });

    const field = ns.attr("myattr");
    assert.equal(field.kind, "attr");
    assert.equal(field.name, "test:myattr");
    assert.equal(field.type, "string");
  });

  test("attr() accepts optional type parameter", () => {
    const ns = createNamespace({
      uri: "http://example.com/test",
      prefix: "test",
    });

    const field = ns.attr("myattr", "string");
    assert.equal(field.type, "string");
  });

  test("elem() creates prefixed element field", () => {
    const ns = createNamespace({
      uri: "http://example.com/test",
      prefix: "test",
    });

    const childSchema = ns.schema({ tag: "test:child", fields: {} } as const);
    const field = ns.elem("myelem", childSchema);

    assert.equal(field.kind, "elem");
    assert.equal(field.name, "test:myelem");
    assert.equal(field.schema, childSchema);
  });

  test("elems() creates prefixed multiple elements field", () => {
    const ns = createNamespace({
      uri: "http://example.com/test",
      prefix: "test",
    });

    const childSchema = ns.schema({ tag: "test:child", fields: {} } as const);
    const field = ns.elems("myelem", childSchema);

    assert.equal(field.kind, "elems");
    assert.equal(field.name, "test:myelem");
    assert.equal(field.schema, childSchema);
  });

  test("inferType() throws error when called at runtime", () => {
    const ns = createNamespace({
      uri: "http://example.com/test",
      prefix: "test",
    });

    const schema = ns.schema({ tag: "test:element", fields: {} } as const);

    assert.throws(
      () => ns.inferType(schema),
      /inferType is a compile-time helper and should never be called at runtime/
    );
  });
});

describe("createAdtSchema", () => {
  const ns = createNamespace({
    uri: "http://example.com/test",
    prefix: "test",
  });

  const TestSchema = ns.schema({
    tag: "test:element",
    ns: { test: ns.uri },
    fields: {
      name: ns.attr("name"),
    },
  } as const);

  test("returns AdtSchema with fromAdtXml and toAdtXml methods", () => {
    const adtSchema = createAdtSchema(TestSchema);

    assert.equal(typeof adtSchema.fromAdtXml, "function");
    assert.equal(typeof adtSchema.toAdtXml, "function");
  });

  test("fromAdtXml parses XML to typed object", () => {
    const adtSchema = createAdtSchema(TestSchema);
    const xml = '<test:element xmlns:test="http://example.com/test" test:name="TestName"/>';

    const result = adtSchema.fromAdtXml(xml);
    assert.equal(result.name, "TestName");
  });

  test("toAdtXml builds XML from typed object", () => {
    const adtSchema = createAdtSchema(TestSchema);
    const data = { name: "TestName" };

    const xml = adtSchema.toAdtXml(data);
    assert.ok(xml.includes('test:name="TestName"'));
    assert.ok(xml.includes("test:element"));
  });

  test("toAdtXml accepts xmlDecl option", () => {
    const adtSchema = createAdtSchema(TestSchema);
    const data = { name: "TestName" };

    const xmlWithDecl = adtSchema.toAdtXml(data, { xmlDecl: true });
    assert.ok(xmlWithDecl.startsWith('<?xml version="1.0"'));

    const xmlWithoutDecl = adtSchema.toAdtXml(data, { xmlDecl: false });
    assert.ok(!xmlWithoutDecl.startsWith('<?xml'));
  });

  test("toAdtXml accepts encoding option", () => {
    const adtSchema = createAdtSchema(TestSchema);
    const data = { name: "TestName" };

    const xml = adtSchema.toAdtXml(data, { xmlDecl: true, encoding: "UTF-8" });
    assert.ok(xml.includes('encoding="UTF-8"'));
  });

  test("round-trip transformation preserves data", () => {
    const adtSchema = createAdtSchema(TestSchema);
    const original = { name: "TestName" };

    const xml = adtSchema.toAdtXml(original);
    const parsed = adtSchema.fromAdtXml(xml);

    assert.deepEqual(parsed, original);
  });
});

describe("AdtSchema interface", () => {
  test("type signature is correct", () => {
    const ns = createNamespace({
      uri: "http://example.com/test",
      prefix: "test",
    });

    const TestSchema = ns.schema({
      tag: "test:element",
      fields: { name: ns.attr("name") },
    } as const);

    const adtSchema: AdtSchema<{ name?: string }> = createAdtSchema(TestSchema);

    // Should compile without errors
    assert.ok(adtSchema);
  });
});
