import { describe, test as it } from "node:test";
import { strict as assert } from "node:assert";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { DOMParser, XMLSerializer } from "@xmldom/xmldom";
import { build, parse } from "../src/index.ts";
import { SapPackageSchema } from "./schemas/index.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));

describe("SAP ADT Package - Fixture-based", () => {
  // Load fixture XML
  const fixtureXml = readFileSync(
    join(__dirname, "fixtures/abapgit_examples.devc.xml"),
    "utf-8"
  );

  it("should parse fixture XML to JSON", () => {
    const result = parse(SapPackageSchema, fixtureXml);

    // Write output to tests/output
    const outputPath = join(__dirname, "output/abapgit_examples.devc.parsed.json");
    writeFileSync(outputPath, JSON.stringify(result, null, 2));

    // Verify key fields are present
    assert.equal(result.name, "$ABAPGIT_EXAMPLES");
    assert.equal(result.description, "Abapgit examples");
    assert.equal(result.responsible, "PPLENKOV");
  });

  it("should build JSON to XML matching fixture", () => {
    // Parse XML to get JSON
    const json = parse(SapPackageSchema, fixtureXml);

    // Build back to XML
    const result = build(SapPackageSchema, json, { xmlDecl: true });

    // Write output to tests/output
    const outputPath = join(__dirname, "output/abapgit_examples.devc.built.xml");
    writeFileSync(outputPath, result);

    // Verify round-trip by parsing the generated XML back to JSON
    const roundTripJson = parse(SapPackageSchema, result);

    // Compare the JSON objects (semantic equivalence, not string format)
    assert.deepEqual(roundTripJson, json);

    // Also verify key structural elements are present in the XML
    assert.ok(result.includes('xmlns:pak="http://www.sap.com/adt/packages"'));
    assert.ok(result.includes('xmlns:adtcore="http://www.sap.com/adt/core"'));
    assert.ok(result.includes('xmlns:atom="http://www.w3.org/2005/Atom"'));
    assert.ok(result.includes('adtcore:name="$ABAPGIT_EXAMPLES"'));
    assert.ok(result.includes('<pak:attributes'));
    assert.ok(result.includes('<pak:subPackages>'));
  });
});
