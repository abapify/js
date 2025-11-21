/**
 * @file ABAP OO Interface schema tests
 * Tests InterfaceAdtSchema with real fixture data
 */

import { strict as assert } from "node:assert";
import { test, describe } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { InterfaceAdtSchema, intf } from "../src/namespaces/adt/oo/interfaces/index.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const fixture = readFileSync(join(__dirname, "fixtures/adt/oo/interfaces/zif_test.intf.xml"), "utf-8");

describe("Interface Schema", () => {
  test("namespace has correct uri and prefix", () => {
    assert.equal(intf.uri, "http://www.sap.com/adt/oo/interfaces");
    assert.equal(intf.prefix, "intf");
  });

  test("parse XML fixture", () => {
    const iface = InterfaceAdtSchema.fromAdtXml(fixture);

    assert.ok(iface.name);
    assert.equal(iface.type, "INTF/OI");
    assert.ok(iface.description);
    assert.ok(iface.version);
  });

  test("parse interface-specific attributes", () => {
    const iface = InterfaceAdtSchema.fromAdtXml(fixture);

    assert.ok(iface);
  });

  test("parse abapsource attributes", () => {
    const iface = InterfaceAdtSchema.fromAdtXml(fixture);

    assert.ok(iface.sourceUri);
  });

  test("parse abapoo attributes", () => {
    const iface = InterfaceAdtSchema.fromAdtXml(fixture);

    assert.ok(iface);
  });

  test("parse atom links", () => {
    const iface = InterfaceAdtSchema.fromAdtXml(fixture);

    assert.ok(iface.links);
    assert.ok(Array.isArray(iface.links));
  });

  test("build XML from object", () => {
    const iface = InterfaceAdtSchema.fromAdtXml(fixture);
    const xml = InterfaceAdtSchema.toAdtXml(iface);

    assert.ok(xml.includes("intf:abapInterface"));
    assert.ok(xml.includes(`adtcore:name="${iface.name}"`));
  });

  test("round-trip transformation", () => {
    const iface1 = InterfaceAdtSchema.fromAdtXml(fixture);
    const xml = InterfaceAdtSchema.toAdtXml(iface1);
    const iface2 = InterfaceAdtSchema.fromAdtXml(xml);

    assert.deepEqual(iface1, iface2);
  });

  test("build with XML declaration", () => {
    const iface = InterfaceAdtSchema.fromAdtXml(fixture);
    const xml = InterfaceAdtSchema.toAdtXml(iface, { xmlDecl: true });

    assert.ok(xml.startsWith('<?xml version="1.0"'));
  });

  test("build with custom encoding", () => {
    const iface = InterfaceAdtSchema.fromAdtXml(fixture);
    const xml = InterfaceAdtSchema.toAdtXml(iface, { xmlDecl: true, encoding: "UTF-8" });

    assert.ok(xml.includes('encoding="UTF-8"'));
  });
});
