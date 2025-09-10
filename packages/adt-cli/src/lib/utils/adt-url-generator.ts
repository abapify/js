export class AdtUrlGenerator {
  /**
   * Generate ADT IDE URL for opening objects directly in Eclipse
   * Format: adt://SYSTEM_ID/sap/bc/adt/object_type/object_name?version=active
   */
  static generateAdtUrl(
    systemId: string,
    objectType: string,
    objectName: string
  ): string {
    const baseUrl = `adt://${systemId.toUpperCase()}/sap/bc/adt`;

    switch (objectType.toUpperCase()) {
      case 'CLAS':
        return `${baseUrl}/oo/classes/${objectName.toLowerCase()}?version=active`;
      case 'INTF':
        return `${baseUrl}/oo/interfaces/${objectName.toLowerCase()}?version=active`;
      case 'PROG':
        return `${baseUrl}/programs/programs/${objectName.toLowerCase()}?version=active`;
      case 'FUGR':
        return `${baseUrl}/functions/groups/${objectName.toLowerCase()}?version=active`;
      case 'DDLS':
        return `${baseUrl}/ddic/ddl/sources/${objectName.toLowerCase()}?version=active`;
      case 'BDEF':
        return `${baseUrl}/bo/behaviordefinitions/${objectName.toLowerCase()}?version=active`;
      case 'SRVD':
        return `${baseUrl}/ddic/srvd/sources/${objectName.toLowerCase()}?version=active`;
      case 'DEVC':
        return `${baseUrl}/packages/${objectName.toLowerCase()}?version=active`;
      case 'TABL':
        return `${baseUrl}/ddic/tables/${objectName.toLowerCase()}?version=active`;
      case 'DTEL':
        return `${baseUrl}/ddic/dataelements/${objectName.toLowerCase()}?version=active`;
      case 'DOMA':
        return `${baseUrl}/ddic/domains/${objectName.toLowerCase()}?version=active`;
      default:
        // Fallback - try to guess based on the object name pattern
        return `${baseUrl}/repository/object/${objectName.toLowerCase()}?version=active`;
    }
  }

  /**
   * Generate HTTP ADT URL for web browser (abap-web endpoint)
   * Format: https://...abap-web.../sap/bc/adt/object_type/object_name/source/main?version=active&sap-client=100
   */
  static generateWebAdtUrl(
    baseUrl: string,
    objectType: string,
    objectName: string,
    client = '100'
  ): string {
    // Convert abap endpoint to abap-web endpoint for web ADT
    const webBaseUrl = baseUrl
      .replace(/^https?:\/\//, '')
      .replace('.abap.', '.abap-web.');

    switch (objectType.toUpperCase()) {
      case 'CLAS':
        return `https://${webBaseUrl}/sap/bc/adt/oo/classes/${objectName.toLowerCase()}/source/main?version=active&sap-client=${client}`;
      case 'INTF':
        return `https://${webBaseUrl}/sap/bc/adt/oo/interfaces/${objectName.toLowerCase()}/source/main?version=active&sap-client=${client}`;
      case 'PROG':
        return `https://${webBaseUrl}/sap/bc/adt/programs/programs/${objectName.toLowerCase()}/source/main?version=active&sap-client=${client}`;
      case 'DEVC':
        return `https://${webBaseUrl}/sap/bc/adt/packages/${objectName.toLowerCase()}?version=active&sap-client=${client}`;
      case 'DDLS':
        return `https://${webBaseUrl}/sap/bc/adt/ddic/ddl/sources/${objectName.toLowerCase()}/source/main?version=active&sap-client=${client}`;
      case 'BDEF':
        return `https://${webBaseUrl}/sap/bc/adt/bo/behaviordefinitions/${objectName.toLowerCase()}/source/main?version=active&sap-client=${client}`;
      case 'SRVD':
        return `https://${webBaseUrl}/sap/bc/adt/ddic/srvd/sources/${objectName.toLowerCase()}/source/main?version=active&sap-client=${client}`;
      default:
        return `https://${webBaseUrl}/sap/bc/adt/repository/search?query=${objectName}&version=active&sap-client=${client}`;
    }
  }
}
