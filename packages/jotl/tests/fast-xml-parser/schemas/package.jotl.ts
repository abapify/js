
import { type ADTPackage } from './types/adt/package';

export default (input: JotlSchema<ABAPPackage>)=> ({
    'pak:package': {
      '@_xmlns:pak': NAMESPACES.pak,
      '@_xmlns:adtcore': NAMESPACES.adtcore,
      '@_adtcore:responsible': { $ref: 'responsible' },
      '@_adtcore:masterLanguage': { $ref: 'masterLanguage' },
      '@_adtcore:name': { $ref: 'name' },
      '@_adtcore:type': { $ref: 'type' },
      '@_adtcore:changedAt': { $ref: 'changedAt' },
      '@_adtcore:version': { $ref: 'version' },
      '@_adtcore:createdAt': { $ref: 'createdAt' },
      '@_adtcore:changedBy': { $ref: 'changedBy' },
      '@_adtcore:createdBy': { $ref: 'createdBy' },
      '@_adtcore:description': { $ref: 'description' },
      '@_adtcore:descriptionTextLimit': { $ref: 'descriptionTextLimit' },
      '@_adtcore:language': { $ref: 'language' },
      'atom:link': {
        $ref: 'link',
        $schema: {
          '@_xmlns:atom': NAMESPACES.atom,
          '@_href': { $ref: 'href' },
          '@_rel': { $ref: 'rel' },
          '@_type': { $ref: 'type' },
          '@_title': { $ref: 'title' },
        },
      },
      'pak:attributes': {
        $ref: 'attributes',
        $schema: {
          '@_pak:packageType': { $ref: 'packageType' },
          '@_pak:isPackageTypeEditable': { $ref: 'isPackageTypeEditable' },
          '@_pak:isAddingObjectsAllowed': { $ref: 'isAddingObjectsAllowed' },
          '@_pak:isAddingObjectsAllowedEditable': {
            $ref: 'isAddingObjectsAllowedEditable',
          },
          '@_pak:isEncapsulated': { $ref: 'isEncapsulated' },
          '@_pak:isEncapsulationEditable': {
            $ref: 'isEncapsulationEditable',
          },
          '@_pak:isEncapsulationVisible': {
            $ref: 'isEncapsulationVisible',
          },
          '@_pak:recordChanges': { $ref: 'recordChanges' },
          '@_pak:isRecordChangesEditable': {
            $ref: 'isRecordChangesEditable',
          },
          '@_pak:isSwitchVisible': { $ref: 'isSwitchVisible' },
          '@_pak:languageVersion': { $ref: 'languageVersion' },
          '@_pak:isLanguageVersionVisible': {
            $ref: 'isLanguageVersionVisible',
          },
          '@_pak:isLanguageVersionEditable': {
            $ref: 'isLanguageVersionEditable',
          },
        },
      },
      'pak:superPackage': {
        $ref: 'superPackage',
        $schema: {
          '@_adtcore:uri': { $ref: 'uri' },
          '@_adtcore:type': { $ref: 'type' },
          '@_adtcore:name': { $ref: 'name' },
          '@_adtcore:description': { $ref: 'description' },
        },
      },
      'pak:applicationComponent': {
        $ref: 'applicationComponent',
        $schema: {
          '@_pak:name': { $ref: 'name' },
          '@_pak:description': { $ref: 'description' },
          '@_pak:isVisible': { $ref: 'isVisible' },
          '@_pak:isEditable': { $ref: 'isEditable' },
        },
      },
      'pak:transport': {
        'pak:softwareComponent': {
          $ref: 'transport.softwareComponent',
          $schema: {
            '@_pak:name': { $ref: 'name' },
            '@_pak:description': { $ref: 'description' },
            '@_pak:isVisible': { $ref: 'isVisible' },
            '@_pak:isEditable': { $ref: 'isEditable' },
          },
        },
        'pak:transportLayer': {
          $ref: 'transport.transportLayer',
          $schema: {
            '@_pak:name': { $ref: 'name' },
            '@_pak:description': { $ref: 'description' },
            '@_pak:isVisible': { $ref: 'isVisible' },
            '@_pak:isEditable': { $ref: 'isEditable' },
          },
        },
      },
      'pak:useAccesses': {
        $ref: 'useAccesses',
        $schema: {
          '@_pak:isVisible': { $ref: 'isVisible' },
        },
      },
      'pak:packageInterfaces': {
        $ref: 'packageInterfaces',
        $schema: {
          '@_pak:isVisible': { $ref: 'isVisible' },
        },
      },
      'pak:subPackages': {
        'pak:packageRef': {
          $ref: 'subPackages.packageRef',
          $schema: {
            '@_adtcore:uri': { $ref: 'uri' },
            '@_adtcore:type': { $ref: 'type' },
            '@_adtcore:name': { $ref: 'name' },
            '@_adtcore:description': { $ref: 'description' },
          },
        },
      },
    },
  })
