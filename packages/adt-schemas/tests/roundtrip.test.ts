/**
 * @file Roundtrip tests
 * Automatically tests all fixtures with roundtrip transformation
 */

import { test, describe } from "node:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { testRoundtrip } from "./helpers.ts";

// Import all schemas
import { PackageAdtSchema } from "../src/namespaces/adt/packages/index.ts";
import { ClassAdtSchema } from "../src/namespaces/adt/oo/classes/index.ts";
import { InterfaceAdtSchema } from "../src/namespaces/adt/oo/interfaces/index.ts";
import { DdicDomainAdtSchema } from "../src/namespaces/adt/ddic/index.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const fixturesDir = join(__dirname, "fixtures/adt");

/**
 * Map of file patterns to schemas
 */
const schemaMap = {
  "packages/*.devc.xml": PackageAdtSchema,
  "oo/classes/*.clas.xml": ClassAdtSchema,
  "oo/interfaces/*.intf.xml": InterfaceAdtSchema,
  "ddic/*.doma.xml": DdicDomainAdtSchema,
};

/**
 * Recursively find all XML files in a directory
 */
function findXmlFiles(dir: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...findXmlFiles(fullPath));
    } else if (entry.endsWith(".xml")) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Get schema for a fixture file
 */
function getSchemaForFile(filePath: string): typeof PackageAdtSchema | null {
  const relativePath = relative(fixturesDir, filePath);

  for (const [pattern, schema] of Object.entries(schemaMap)) {
    // Split on last "/" to separate directory from file pattern
    const lastSlashIndex = pattern.lastIndexOf("/");
    const dir = pattern.substring(0, lastSlashIndex);
    const filePattern = pattern.substring(lastSlashIndex + 1);
    const fileRegex = new RegExp("^" + filePattern.replace("*", ".*") + "$");

    if (relativePath.startsWith(dir) && fileRegex.test(basename(filePath))) {
      return schema;
    }
  }

  return null;
}

describe("Roundtrip Tests (All Fixtures)", () => {
  const xmlFiles = findXmlFiles(fixturesDir);

  if (xmlFiles.length === 0) {
    test("no fixtures found", () => {
      throw new Error(`No XML fixtures found in ${fixturesDir}`);
    });
  }

  for (const filePath of xmlFiles) {
    const relativePath = relative(fixturesDir, filePath);
    const schema = getSchemaForFile(filePath);

    if (!schema) {
      test(`${relativePath}: SKIP (no schema found)`, () => {
        // Skip - not an error, just no schema registered
      });
      continue;
    }

    test(`${relativePath}: roundtrip`, () => {
      const xml = readFileSync(filePath, "utf-8");
      testRoundtrip(schema, xml);
    });
  }
});

describe("Roundtrip Statistics", () => {
  test("fixture coverage", () => {
    const xmlFiles = findXmlFiles(fixturesDir);
    const withSchema = xmlFiles.filter((f) => getSchemaForFile(f) !== null);
    const withoutSchema = xmlFiles.filter((f) => getSchemaForFile(f) === null);

    console.log(`\n📊 Fixture Statistics:`);
    console.log(`   Total fixtures: ${xmlFiles.length}`);
    console.log(`   With schema: ${withSchema.length}`);
    console.log(`   Without schema: ${withoutSchema.length}`);

    if (withoutSchema.length > 0) {
      console.log(`\n⚠️  Fixtures without schema:`);
      for (const file of withoutSchema) {
        console.log(`   - ${relative(fixturesDir, file)}`);
      }
    }
  });
});
