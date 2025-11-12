import { describe, it, expect } from 'vitest';
import { AdtPackageSpec } from './package';

describe('AdtPackageSpec', () => {
  it('should parse ADT package XML', () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<pak:package adtcore:responsible="PPLENKOV" adtcore:masterLanguage="EN" adtcore:name="$ABAPGIT_EXAMPLES" adtcore:type="DEVC/K" adtcore:changedAt="2025-11-09T00:00:00Z" adtcore:version="active" adtcore:createdAt="2025-11-09T00:00:00Z" adtcore:changedBy="PPLENKOV" adtcore:createdBy="PPLENKOV" adtcore:description="Abapgit examples" adtcore:descriptionTextLimit="60" adtcore:language="EN" xmlns:pak="http://www.sap.com/adt/packages" xmlns:adtcore="http://www.sap.com/adt/core">
  <pak:attributes pak:packageType="development" pak:isPackageTypeEditable="false" pak:isAddingObjectsAllowed="false" pak:isAddingObjectsAllowedEditable="true" pak:isEncapsulated="false" pak:isEncapsulationEditable="false" pak:isEncapsulationVisible="false" pak:recordChanges="false" pak:isRecordChangesEditable="false" pak:isSwitchVisible="false" pak:languageVersion="" pak:isLanguageVersionVisible="true" pak:isLanguageVersionEditable="true"/>
  <pak:superPackage adtcore:uri="/sap/bc/adt/packages/%24tmp" adtcore:type="DEVC/K" adtcore:name="$TMP" adtcore:description="Temporary Objects (never transported!)"/>
  <pak:applicationComponent pak:name="" pak:description="No application component assigned" pak:isVisible="true" pak:isEditable="false"/>
  <pak:transport>
    <pak:softwareComponent pak:name="LOCAL" pak:description="Local Developments (No Automatic Transport)" pak:isVisible="true" pak:isEditable="false"/>
    <pak:transportLayer pak:name="" pak:description="" pak:isVisible="false" pak:isEditable="false"/>
  </pak:transport>
  <pak:subPackages>
    <pak:packageRef adtcore:uri="/sap/bc/adt/packages/%24abapgit_examples_clas" adtcore:type="DEVC/K" adtcore:name="$ABAPGIT_EXAMPLES_CLAS" adtcore:description="Classes"/>
    <pak:packageRef adtcore:uri="/sap/bc/adt/packages/%24abapgit_examples_ddic" adtcore:type="DEVC/K" adtcore:name="$ABAPGIT_EXAMPLES_DDIC" adtcore:description="DDIC components"/>
  </pak:subPackages>
</pak:package>`;

    const spec = AdtPackageSpec.fromXMLString(xml);

    // Test core attributes
    expect(spec.core?.name).toBe('$ABAPGIT_EXAMPLES');
    expect(spec.core?.description).toBe('Abapgit examples');
    expect(spec.core?.type).toBe('DEVC/K');
    expect(spec.core?.responsible).toBe('PPLENKOV');
    expect(spec.core?.masterLanguage).toBe('EN');
    expect(spec.core?.createdBy).toBe('PPLENKOV');
    expect(spec.core?.changedBy).toBe('PPLENKOV');

    // Test package attributes
    expect(spec.pak.attributes?.packageType).toBe('development');
    expect(spec.pak.attributes?.isPackageTypeEditable).toBe('false');
    expect(spec.pak.attributes?.isEncapsulated).toBe('false');

    // Test super package
    expect(spec.pak.superPackage?.name).toBe('$TMP');
    expect(spec.pak.superPackage?.description).toBe('Temporary Objects (never transported!)');
    expect(spec.pak.superPackage?.uri).toBe('/sap/bc/adt/packages/%24tmp');

    // Test application component
    expect(spec.pak.applicationComponent?.name).toBe('');
    expect(spec.pak.applicationComponent?.description).toBe('No application component assigned');
    expect(spec.pak.applicationComponent?.isVisible).toBe('true');

    // Test transport
    expect(spec.pak.transport?.softwareComponent?.name).toBe('LOCAL');
    expect(spec.pak.transport?.softwareComponent?.description).toBe('Local Developments (No Automatic Transport)');
    expect(spec.pak.transport?.transportLayer?.name).toBe('');

    // Test subpackages
    expect(spec.pak.subPackages).toHaveLength(2);
    expect(spec.pak.subPackages?.[0].name).toBe('$ABAPGIT_EXAMPLES_CLAS');
    expect(spec.pak.subPackages?.[0].description).toBe('Classes');
    expect(spec.pak.subPackages?.[1].name).toBe('$ABAPGIT_EXAMPLES_DDIC');
    expect(spec.pak.subPackages?.[1].description).toBe('DDIC components');
  });

  it('should convert to PackageData', () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<pak:package adtcore:responsible="PPLENKOV" adtcore:masterLanguage="EN" adtcore:name="$ABAPGIT_EXAMPLES" adtcore:type="DEVC/K" adtcore:description="Abapgit examples" xmlns:pak="http://www.sap.com/adt/packages" xmlns:adtcore="http://www.sap.com/adt/core">
  <pak:attributes pak:packageType="development"/>
  <pak:superPackage adtcore:name="$TMP"/>
  <pak:subPackages>
    <pak:packageRef adtcore:name="$ABAPGIT_EXAMPLES_CLAS" adtcore:description="Classes"/>
  </pak:subPackages>
</pak:package>`;

    const spec = AdtPackageSpec.fromXMLString(xml);
    const data = spec.toData();

    expect(data.name).toBe('$ABAPGIT_EXAMPLES');
    expect(data.description).toBe('Abapgit examples');
    expect(data.attributes?.packageType).toBe('development');
    expect(data.superPackage?.name).toBe('$TMP');
    expect(data.subPackages).toHaveLength(1);
    expect(data.subPackages?.[0].name).toBe('$ABAPGIT_EXAMPLES_CLAS');
    expect(data.subPackages?.[0].description).toBe('Classes');
  });
});
