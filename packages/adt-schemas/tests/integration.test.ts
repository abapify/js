/**
 * @file Integration tests
 * Tests cross-namespace dependencies and package exports
 */

import { strict as assert } from "node:assert";
import { test, describe } from "node:test";

describe("Package Exports", () => {
  test("base namespace exports", async () => {
    const base = await import("../src/base/index.ts");

    assert.ok(base.createNamespace);
    assert.ok(base.createAdtSchema);
    assert.equal(typeof base.createNamespace, "function");
    assert.equal(typeof base.createAdtSchema, "function");
  });

  test("adtcore namespace exports", async () => {
    const adtcore = await import("../src/namespaces/adt/core/index.ts");

    assert.ok(adtcore.adtcore);
    assert.ok(adtcore.AdtCoreFields);
    assert.ok(adtcore.AdtCoreObjectFields);
    assert.ok(adtcore.AdtCoreSchema);
  });

  test("atom namespace exports", async () => {
    const atom = await import("../src/namespaces/atom/index.ts");

    assert.ok(atom.atom);
    assert.ok(atom.AtomLinkSchema);
  });

  test("packages namespace exports", async () => {
    const packages = await import("../src/namespaces/adt/packages/index.ts");

    assert.ok(packages.pak);
    assert.ok(packages.PackagesSchema);
    assert.ok(packages.PackageAdtSchema);
  });

  test("classes namespace exports", async () => {
    const classes = await import("../src/namespaces/adt/oo/classes/index.ts");

    assert.ok(classes.classNs);
    assert.ok(classes.abapsource);
    assert.ok(classes.abapoo);
    assert.ok(classes.ClassSchema);
    assert.ok(classes.ClassAdtSchema);
  });

  test("interfaces namespace exports", async () => {
    const interfaces = await import("../src/namespaces/adt/oo/interfaces/index.ts");

    assert.ok(interfaces.intf);
    assert.ok(interfaces.InterfaceSchema);
    assert.ok(interfaces.InterfaceAdtSchema);
  });

  test("ddic namespace exports", async () => {
    const ddic = await import("../src/namespaces/adt/ddic/index.ts");

    assert.ok(ddic.ddic);
    assert.ok(ddic.DdicDomainSchema);
    assert.ok(ddic.DdicDomainAdtSchema);
  });

  test("main index exports all namespaces", async () => {
    const main = await import("../src/index.ts");

    // Should export everything from all namespaces
    assert.ok(main.adtcore);
    assert.ok(main.atom);
    assert.ok(main.pak);
    assert.ok(main.classNs);
    assert.ok(main.intf);
    assert.ok(main.ddic);
  });
});

describe("Cross-Namespace Dependencies", () => {
  test("interfaces import abapsource and abapoo from classes", async () => {
    const interfaces = await import("../src/namespaces/adt/oo/interfaces/index.ts");
    const classes = await import("../src/namespaces/adt/oo/classes/index.ts");

    // These should be the same namespace objects
    assert.equal(interfaces.abapsource, classes.abapsource);
    assert.equal(interfaces.abapoo, classes.abapoo);
  });

  test("all schemas use AdtCoreObjectFields mixin", async () => {
    const { AdtCoreObjectFields } = await import("../src/namespaces/adt/core/index.ts");
    const { PackagesSchema } = await import("../src/namespaces/adt/packages/index.ts");
    const { ClassSchema } = await import("../src/namespaces/adt/oo/classes/index.ts");
    const { InterfaceSchema } = await import("../src/namespaces/adt/oo/interfaces/index.ts");
    const { DdicDomainSchema } = await import("../src/namespaces/adt/ddic/index.ts");

    // @ts-expect-error - accessing internal structure
    const packageFields = PackagesSchema.fields;
    // @ts-expect-error - accessing internal structure
    const classFields = ClassSchema.fields;
    // @ts-expect-error - accessing internal structure
    const interfaceFields = InterfaceSchema.fields;
    // @ts-expect-error - accessing internal structure
    const domainFields = DdicDomainSchema.fields;

    // All should have adtcore attributes from the mixin
    assert.ok(packageFields.name);
    assert.ok(classFields.name);
    assert.ok(interfaceFields.name);
    assert.ok(domainFields.name);
  });

  test("all document schemas use AtomLinkSchema", async () => {
    const { AtomLinkSchema } = await import("../src/namespaces/atom/index.ts");
    const { PackagesSchema } = await import("../src/namespaces/adt/packages/index.ts");
    const { ClassSchema } = await import("../src/namespaces/adt/oo/classes/index.ts");
    const { InterfaceSchema } = await import("../src/namespaces/adt/oo/interfaces/index.ts");
    const { DdicDomainSchema } = await import("../src/namespaces/adt/ddic/index.ts");

    // @ts-expect-error - accessing internal structure
    const packageLinks = PackagesSchema.fields.links;
    // @ts-expect-error - accessing internal structure
    const classLinks = ClassSchema.fields.links;
    // @ts-expect-error - accessing internal structure
    const interfaceLinks = InterfaceSchema.fields.links;
    // @ts-expect-error - accessing internal structure
    const domainLinks = DdicDomainSchema.fields.links;

    // All should reference the same AtomLinkSchema
    assert.equal(packageLinks.schema, AtomLinkSchema);
    assert.equal(classLinks.schema, AtomLinkSchema);
    assert.equal(interfaceLinks.schema, AtomLinkSchema);
    assert.equal(domainLinks.schema, AtomLinkSchema);
  });
});

describe("AdtSchema Consistency", () => {
  test("all AdtSchema exports have same interface", async () => {
    const { PackageAdtSchema } = await import("../src/namespaces/adt/packages/index.ts");
    const { ClassAdtSchema } = await import("../src/namespaces/adt/oo/classes/index.ts");
    const { InterfaceAdtSchema } = await import("../src/namespaces/adt/oo/interfaces/index.ts");
    const { DdicDomainAdtSchema } = await import("../src/namespaces/adt/ddic/index.ts");

    // All should have fromAdtXml and toAdtXml methods
    assert.equal(typeof PackageAdtSchema.fromAdtXml, "function");
    assert.equal(typeof PackageAdtSchema.toAdtXml, "function");

    assert.equal(typeof ClassAdtSchema.fromAdtXml, "function");
    assert.equal(typeof ClassAdtSchema.toAdtXml, "function");

    assert.equal(typeof InterfaceAdtSchema.fromAdtXml, "function");
    assert.equal(typeof InterfaceAdtSchema.toAdtXml, "function");

    assert.equal(typeof DdicDomainAdtSchema.fromAdtXml, "function");
    assert.equal(typeof DdicDomainAdtSchema.toAdtXml, "function");
  });

  test("all AdtSchema exports have exactly two methods", async () => {
    const { PackageAdtSchema } = await import("../src/namespaces/adt/packages/index.ts");
    const { ClassAdtSchema } = await import("../src/namespaces/adt/oo/classes/index.ts");
    const { InterfaceAdtSchema } = await import("../src/namespaces/adt/oo/interfaces/index.ts");
    const { DdicDomainAdtSchema } = await import("../src/namespaces/adt/ddic/index.ts");

    const schemas = [PackageAdtSchema, ClassAdtSchema, InterfaceAdtSchema, DdicDomainAdtSchema];

    for (const schema of schemas) {
      const keys = Object.keys(schema);
      assert.equal(keys.length, 2);
      assert.ok(keys.includes("fromAdtXml"));
      assert.ok(keys.includes("toAdtXml"));
    }
  });
});

describe("Namespace URIs", () => {
  test("all namespace URIs are unique", async () => {
    const { adtcore } = await import("../src/namespaces/adt/core/index.ts");
    const { atom } = await import("../src/namespaces/atom/index.ts");
    const { pak } = await import("../src/namespaces/adt/packages/index.ts");
    const { classNs } = await import("../src/namespaces/adt/oo/classes/index.ts");
    const { intf } = await import("../src/namespaces/adt/oo/interfaces/index.ts");
    const { ddic } = await import("../src/namespaces/adt/ddic/index.ts");
    const { abapsource, abapoo } = await import("../src/namespaces/adt/oo/classes/index.ts");

    const uris = [
      adtcore.uri,
      atom.uri,
      pak.uri,
      classNs.uri,
      intf.uri,
      ddic.uri,
      abapsource.uri,
      abapoo.uri,
    ];

    // All URIs should be unique
    const uniqueUris = new Set(uris);
    assert.equal(uniqueUris.size, uris.length);
  });

  test("all namespace prefixes are unique", async () => {
    const { adtcore } = await import("../src/namespaces/adt/core/index.ts");
    const { atom } = await import("../src/namespaces/atom/index.ts");
    const { pak } = await import("../src/namespaces/adt/packages/index.ts");
    const { classNs } = await import("../src/namespaces/adt/oo/classes/index.ts");
    const { intf } = await import("../src/namespaces/adt/oo/interfaces/index.ts");
    const { ddic } = await import("../src/namespaces/adt/ddic/index.ts");
    const { abapsource, abapoo } = await import("../src/namespaces/adt/oo/classes/index.ts");

    const prefixes = [
      adtcore.prefix,
      atom.prefix,
      pak.prefix,
      classNs.prefix,
      intf.prefix,
      ddic.prefix,
      abapsource.prefix,
      abapoo.prefix,
    ];

    // All prefixes should be unique
    const uniquePrefixes = new Set(prefixes);
    assert.equal(uniquePrefixes.size, prefixes.length);
  });
});
