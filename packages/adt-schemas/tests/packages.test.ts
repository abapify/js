/**
 * @file SAP Package schema tests
 * Tests PackageAdtSchema with real fixture data
 */

import { strict as assert } from "node:assert";
import { test, describe } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { PackageAdtSchema, pak } from "../src/namespaces/adt/packages/index.ts";
import { testRoundtrip } from "./helpers.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const fixture = readFileSync(join(__dirname, "fixtures/adt/packages/abapgit_examples.devc.xml"), "utf-8");

describe("Package Schema", () => {
  test("namespace has correct uri and prefix", () => {
    assert.equal(pak.uri, "http://www.sap.com/adt/packages");
    assert.equal(pak.prefix, "pak");
  });

  test("roundtrip: XML → JSON → XML preserves data", () => {
    testRoundtrip(PackageAdtSchema, fixture, (pkg) => {
      // Core attributes
      assert.equal(pkg.name, "$ABAPGIT_EXAMPLES");
      assert.equal(pkg.type, "DEVC/K");
      assert.equal(pkg.description, "Abapgit examples");
      
      // Package attributes
      assert.ok(pkg.attributes);
      assert.equal(pkg.attributes.packageType, "development");
      
      // Super package
      assert.ok(pkg.superPackage);
      assert.equal(pkg.superPackage.name, "$TMP");
      
      // Transport info
      assert.ok(pkg.transport);
      assert.ok(pkg.transport.softwareComponent);
      assert.equal(pkg.transport.softwareComponent.name, "LOCAL");
      
      // Sub-packages
      assert.ok(pkg.subPackages);
      assert.ok(pkg.subPackages.packageRefs);
      assert.equal(pkg.subPackages.packageRefs.length, 2);
      
      // Links
      assert.ok(pkg.links);
      assert.ok(pkg.links.length > 0);
    });
  });
});
