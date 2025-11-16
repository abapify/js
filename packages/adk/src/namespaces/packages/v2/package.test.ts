import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parsePackageXml, buildPackageXml } from "./package.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

describe("ADT Package V2 - ts-xml implementation", () => {
  // Load fixture from ts-xml package tests
  const fixtureXmlPath = join(
    __dirname,
    "../../../../../../../../ts-xml-claude/tests/fixtures/abapgit_examples.devc.xml"
  );

  const fixtureXml = readFileSync(fixtureXmlPath, "utf-8");

  it("should parse XML to typed JSON", () => {
    const pkg = parsePackageXml(fixtureXml);

    expect(pkg.name).toBe("$ABAPGIT_EXAMPLES");
    expect(pkg.description).toBe("Abapgit examples");
    expect(pkg.responsible).toBe("PPLENKOV");
    expect(pkg.type).toBe("DEVC/K");
    expect(pkg.masterLanguage).toBe("EN");
  });

  it("should access nested elements", () => {
    const pkg = parsePackageXml(fixtureXml);

    // Attributes
    expect(pkg.attributes?.packageType).toBe("development");
    expect(pkg.attributes?.isPackageTypeEditable).toBe("false");

    // Super package
    expect(pkg.superPackage?.name).toBe("$TMP");
    expect(pkg.superPackage?.description).toBe("Temporary Objects (never transported!)");

    // Transport
    expect(pkg.transport?.softwareComponent?.name).toBe("LOCAL");
    expect(pkg.transport?.transportLayer?.name).toBe("");

    // Subpackages
    expect(pkg.subPackages?.packageRefs).toHaveLength(2);
    expect(pkg.subPackages?.packageRefs?.[0]?.name).toBe("$ABAPGIT_EXAMPLES_CLAS");
    expect(pkg.subPackages?.packageRefs?.[1]?.name).toBe("$ABAPGIT_EXAMPLES_DDIC");
  });

  it("should access atom links", () => {
    const pkg = parsePackageXml(fixtureXml);

    expect(pkg.links?.length).toBeGreaterThan(0);
    expect(pkg.links?.[0]?.href).toBe("versions");
    expect(pkg.links?.[0]?.rel).toBe("http://www.sap.com/adt/relations/versions");
  });

  it("should round-trip XML → JSON → XML", () => {
    const pkg1 = parsePackageXml(fixtureXml);
    const xml = buildPackageXml(pkg1, { xmlDecl: true });
    const pkg2 = parsePackageXml(xml);

    // Compare JSON representations
    expect(pkg2).toEqual(pkg1);
  });

  it("should build XML from JSON", () => {
    const pkg = parsePackageXml(fixtureXml);
    const xml1 = buildPackageXml(pkg);
    const xml2 = buildPackageXml(pkg);

    // Same JSON should produce same XML
    expect(xml1).toBe(xml2);
  });
});
