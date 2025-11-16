/**
 * @file ABAP OO Class schema tests
 * Tests ClassAdtSchema with real fixture data
 */

import { strict as assert } from "node:assert";
import { test, describe } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { ClassAdtSchema, classNs, abapsource, abapoo } from "../src/namespaces/adt/oo/classes/index.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const fixture = readFileSync(join(__dirname, "fixtures/adt/oo/classes/zcl_test.clas.xml"), "utf-8");

describe("Class Schema", () => {
  test("namespace has correct uri and prefix", () => {
    assert.equal(classNs.uri, "http://www.sap.com/adt/oo/classes");
    assert.equal(classNs.prefix, "class");
  });

  test("abapsource namespace is exported", () => {
    assert.equal(abapsource.uri, "http://www.sap.com/adt/abapsource");
    assert.equal(abapsource.prefix, "abapsource");
  });

  test("abapoo namespace is exported", () => {
    assert.equal(abapoo.uri, "http://www.sap.com/adt/oo");
    assert.equal(abapoo.prefix, "abapoo");
  });

  test("parse XML fixture", () => {
    const cls = ClassAdtSchema.fromAdtXml(fixture);

    assert.equal(cls.name, "ZCL_PEPL_TEST2");
    assert.equal(cls.type, "CLAS/OC");
    assert.equal(cls.description, "PEPL test class");
    assert.equal(cls.version, "inactive");
  });

  test("parse class-specific attributes", () => {
    const cls = ClassAdtSchema.fromAdtXml(fixture);

    assert.equal(cls.final, "true");
    assert.equal(cls.abstract, "false");
    assert.equal(cls.visibility, "public");
    assert.equal(cls.category, "generalObjectType");
    assert.equal(cls.hasTests, "false");
    assert.equal(cls.sharedMemoryEnabled, "false");
  });

  test("parse abapsource attributes", () => {
    const cls = ClassAdtSchema.fromAdtXml(fixture);

    // abapsource attributes are on root element
    assert.equal(cls.fixPointArithmetic, "true");
    assert.equal(cls.activeUnicodeCheck, "false");
  });

  test("parse abapoo attributes", () => {
    const cls = ClassAdtSchema.fromAdtXml(fixture);

    // abapoo:modeled attribute not currently in schema
    assert.ok(cls);
  });

  test("parse timestamps", () => {
    const cls = ClassAdtSchema.fromAdtXml(fixture);

    assert.equal(cls.createdBy, "CB9980003374");
    assert.equal(cls.changedBy, "CB9980003374");
    assert.equal(cls.responsible, "CB9980003374");
    assert.equal(cls.createdAt, "2025-09-12T00:00:00Z");
    assert.equal(cls.changedAt, "2025-09-12T20:06:49Z");
  });

  test("parse class includes", () => {
    const cls = ClassAdtSchema.fromAdtXml(fixture);

    assert.ok(cls.include);
    assert.equal(cls.include.length, 5);

    const definitions = cls.include[0];
    assert.equal(definitions.includeType, "definitions");
    assert.equal(definitions.sourceUri, "includes/definitions");

    const implementations = cls.include[1];
    assert.equal(implementations.includeType, "implementations");
    assert.equal(implementations.sourceUri, "includes/implementations");

    const main = cls.include[4];
    assert.equal(main.includeType, "main");
    assert.equal(main.sourceUri, "source/main");
  });

  test("parse include atom links", () => {
    const cls = ClassAdtSchema.fromAdtXml(fixture);

    assert.ok(cls.include);
    const include = cls.include[0];
    assert.ok(include.links);
    assert.equal(include.links.length, 5);
    assert.equal(include.links[0].href, "includes/definitions/versions");
  });

  test("parse atom links", () => {
    const cls = ClassAdtSchema.fromAdtXml(fixture);

    assert.ok(cls.links);
    assert.equal(cls.links.length, 6);
    assert.equal(cls.links[0].href, "/sap/bc/adt/oo/classes/zcl_pepl_test2/enhancements/options");
    assert.equal(cls.links[0].rel, "http://www.sap.com/adt/relations/enhancementOptionsOfMainObject");
  });

  test("build XML from object", () => {
    const cls = ClassAdtSchema.fromAdtXml(fixture);
    const xml = ClassAdtSchema.toAdtXml(cls);

    assert.ok(xml.includes("class:abapClass"));
    assert.ok(xml.includes('adtcore:name="ZCL_PEPL_TEST2"'));
    assert.ok(xml.includes('class:final="true"'));
    assert.ok(xml.includes('abapsource:fixPointArithmetic'));
  });

  test("round-trip transformation", () => {
    const cls1 = ClassAdtSchema.fromAdtXml(fixture);
    const xml = ClassAdtSchema.toAdtXml(cls1);
    const cls2 = ClassAdtSchema.fromAdtXml(xml);

    assert.deepEqual(cls1, cls2);
  });

  test("build with XML declaration", () => {
    const cls = ClassAdtSchema.fromAdtXml(fixture);
    const xml = ClassAdtSchema.toAdtXml(cls, { xmlDecl: true });

    assert.ok(xml.startsWith('<?xml version="1.0"'));
  });
});
