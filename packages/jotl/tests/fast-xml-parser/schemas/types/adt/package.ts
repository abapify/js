//extract type from github/abapify/packages/jotl/tests/fast-xml-parser/fixtures/abapgit_examples.devc.json
export interface AdtCoreAttrs {
    uri?: string;
    name: string;
    type: string;
    version?: string;
    description?: string;
    descriptionTextLimit?: string;
    language?: string;
    masterLanguage?: string;
    masterSystem?: string;
    abapLanguageVersion?: string;
    responsible?: string;
    changedBy?: string;
    createdBy?: string;
    changedAt?: string; // ISO string in XML
    createdAt?: string; // ISO string in XML
}

export interface AtomLink {
    href: string;
    rel: string;
    title: string;
}

export interface ADTPackage {
    package: {
        core: AdtCoreAttrs;
        link?: Array<AtomLink>;
        /** Package attributes */
        attributes?: PackageAttributes;
        /** Super package */
        superPackage?: PackageRef;
        /** Application component */
        applicationComponent?: ApplicationComponent;
        /** Transport information */
        transport?: Transport;
        /** Subpackages */
        subPackages?: PackageRef[];
    }
}

/**
 * ADT Package attributes (pak:attributes)
 */
export interface PackageAttributes {
    packageType?: string;
    isPackageTypeEditable?: string;
    isAddingObjectsAllowed?: string;
    isAddingObjectsAllowedEditable?: string;
    isEncapsulated?: string;
    isEncapsulationEditable?: string;
    isEncapsulationVisible?: string;
    recordChanges?: string;
    isRecordChangesEditable?: string;
    isSwitchVisible?: string;
    languageVersion?: string;
    isLanguageVersionVisible?: string;
    isLanguageVersionEditable?: string;
}

/**
 * Package reference (used in subpackages and superpackage)
 */
export interface PackageRef {
    uri?: string;
    type?: string;
    name?: string;
    description?: string;
}

/**
 * Application component
 */
export interface ApplicationComponent {
    name?: string;
    description?: string;
    isVisible?: string;
    isEditable?: string;
}

/**
 * Software component
 */
export interface SoftwareComponent {
    name?: string;
    description?: string;
    isVisible?: string;
    isEditable?: string;
}

/**
 * Transport layer
 */
export interface TransportLayer {
    name?: string;
    description?: string;
    isVisible?: string;
    isEditable?: string;
}

/**
 * Transport information
 */
export interface Transport {
    softwareComponent?: SoftwareComponent;
    transportLayer?: TransportLayer;
}





