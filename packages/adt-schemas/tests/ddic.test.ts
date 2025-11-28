/**
 * @file DDIC Domain schema tests
 * Tests DdicDomainAdtSchema with real fixture data
 */

import { strict as assert } from "node:assert";
import { test, describe } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { DdicDomainAdtSchema, ddic } from "../src/namespaces/adt/ddic/index.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const fixture = readFileSync(join(__dirname, "fixtures/adt/ddic/zdo_test.doma.xml"), "utf-8");

describe("DDIC Domain Schema", () => {
  test("namespace has correct uri and prefix", () => {
    assert.equal(ddic.uri, "http://www.sap.com/adt/ddic");
    assert.equal(ddic.prefix, "ddic");
  });

  test("parse XML fixture", () => {
    const domain = DdicDomainAdtSchema.fromAdtXml(fixture);

    assert.ok(domain.name);
    assert.equal(domain.type, "DOMA/DD");
    assert.ok(domain.description);
  });

  test("parse domain data type", () => {
    const domain = DdicDomainAdtSchema.fromAdtXml(fixture);

    assert.ok(domain.dataType);
    // Check that dataType element exists (content is parsed by ts-xml)
  });

  test("parse domain dimensions", () => {
    const domain = DdicDomainAdtSchema.fromAdtXml(fixture);

    assert.ok(domain.length);
    assert.ok(domain.decimals);
    assert.ok(domain.outputLength);
  });

  test("parse conversion exit", () => {
    const domain = DdicDomainAdtSchema.fromAdtXml(fixture);

    // Empty conversionExit element
    assert.ok("conversionExit" in domain);
  });

  test("parse value table", () => {
    const domain = DdicDomainAdtSchema.fromAdtXml(fixture);

    // Empty valueTable element
    assert.ok("valueTable" in domain);
  });

  test("parse fixed values", () => {
    const domain = DdicDomainAdtSchema.fromAdtXml(fixture);

    assert.ok(domain.fixedValues);
    assert.ok(domain.fixedValues.fixedValue);
    assert.equal(domain.fixedValues.fixedValue.length, 2);
  });

  test("parse individual fixed value entries", () => {
    const domain = DdicDomainAdtSchema.fromAdtXml(fixture);

    const fixedValue1 = domain.fixedValues?.fixedValue?.[0];
    assert.ok(fixedValue1);
    assert.ok(fixedValue1.lowValue);
    assert.ok("highValue" in fixedValue1);
    assert.ok(fixedValue1.description);

    const fixedValue2 = domain.fixedValues?.fixedValue?.[1];
    assert.ok(fixedValue2);
    assert.ok(fixedValue2.lowValue);
  });

  test("parse atom links", () => {
    const domain = DdicDomainAdtSchema.fromAdtXml(fixture);

    assert.ok(domain.links);
    assert.ok(Array.isArray(domain.links));
  });

  test("build XML from object", () => {
    const domain = DdicDomainAdtSchema.fromAdtXml(fixture);
    const xml = DdicDomainAdtSchema.toAdtXml(domain);

    assert.ok(xml.includes("ddic:domain"));
    assert.ok(xml.includes(`adtcore:name="${domain.name}"`));
    assert.ok(xml.includes("ddic:dataType"));
  });

  test("round-trip transformation", () => {
    const domain1 = DdicDomainAdtSchema.fromAdtXml(fixture);
    const xml = DdicDomainAdtSchema.toAdtXml(domain1);
    const domain2 = DdicDomainAdtSchema.fromAdtXml(xml);

    assert.deepEqual(domain1, domain2);
  });

  test("build with XML declaration", () => {
    const domain = DdicDomainAdtSchema.fromAdtXml(fixture);
    const xml = DdicDomainAdtSchema.toAdtXml(domain, { xmlDecl: true });

    assert.ok(xml.startsWith('<?xml version="1.0"'));
  });

  test("build with custom encoding", () => {
    const domain = DdicDomainAdtSchema.fromAdtXml(fixture);
    const xml = DdicDomainAdtSchema.toAdtXml(domain, { xmlDecl: true, encoding: "UTF-8" });

    assert.ok(xml.includes('encoding="UTF-8"'));
  });
});
