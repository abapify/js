/**
 * @file ADT Core namespace tests
 * Tests adtcore namespace and field mixins
 */

import { strict as assert } from "node:assert";
import { test, describe } from "node:test";
import { adtcore, AdtCoreFields, AdtCoreObjectFields } from "../src/namespaces/adt/core/index.ts";

describe("ADT Core Namespace", () => {
  test("namespace has correct uri and prefix", () => {
    assert.equal(adtcore.uri, "http://www.sap.com/adt/core");
    assert.equal(adtcore.prefix, "adtcore");
  });

  test("provides schema factory method", () => {
    assert.equal(typeof adtcore.schema, "function");
  });

  test("provides attr helper", () => {
    assert.equal(typeof adtcore.attr, "function");
  });

  test("provides elem helper", () => {
    assert.equal(typeof adtcore.elem, "function");
  });

  test("provides elems helper", () => {
    assert.equal(typeof adtcore.elems, "function");
  });
});

describe("AdtCoreFields mixin", () => {
  test("contains basic core attributes", () => {
    assert.ok(AdtCoreFields.uri);
    assert.ok(AdtCoreFields.type);
    assert.ok(AdtCoreFields.name);
    assert.ok(AdtCoreFields.description);
  });

  test("fields have correct structure", () => {
    assert.equal(AdtCoreFields.uri.kind, "attr");
    assert.equal(AdtCoreFields.uri.name, "adtcore:uri");
    assert.equal(AdtCoreFields.uri.type, "string");

    assert.equal(AdtCoreFields.type.kind, "attr");
    assert.equal(AdtCoreFields.type.name, "adtcore:type");

    assert.equal(AdtCoreFields.name.kind, "attr");
    assert.equal(AdtCoreFields.name.name, "adtcore:name");

    assert.equal(AdtCoreFields.description.kind, "attr");
    assert.equal(AdtCoreFields.description.name, "adtcore:description");
  });
});

describe("AdtCoreObjectFields mixin", () => {
  test("extends AdtCoreFields", () => {
    // Should contain all AdtCoreFields
    assert.ok(AdtCoreObjectFields.uri);
    assert.ok(AdtCoreObjectFields.type);
    assert.ok(AdtCoreObjectFields.name);
    assert.ok(AdtCoreObjectFields.description);
  });

  test("contains additional object attributes", () => {
    assert.ok(AdtCoreObjectFields.version);
    assert.ok(AdtCoreObjectFields.language);
    assert.ok(AdtCoreObjectFields.masterLanguage);
    assert.ok(AdtCoreObjectFields.responsible);
    assert.ok(AdtCoreObjectFields.createdBy);
    assert.ok(AdtCoreObjectFields.changedBy);
    assert.ok(AdtCoreObjectFields.createdAt);
    assert.ok(AdtCoreObjectFields.changedAt);
  });

  test("additional fields have correct structure", () => {
    assert.equal(AdtCoreObjectFields.version.kind, "attr");
    assert.equal(AdtCoreObjectFields.version.name, "adtcore:version");

    assert.equal(AdtCoreObjectFields.language.kind, "attr");
    assert.equal(AdtCoreObjectFields.language.name, "adtcore:language");

    assert.equal(AdtCoreObjectFields.createdBy.kind, "attr");
    assert.equal(AdtCoreObjectFields.createdBy.name, "adtcore:createdBy");
  });
});
