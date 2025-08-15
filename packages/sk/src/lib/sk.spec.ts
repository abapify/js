import { ServiceKeyParser, BTPServiceKey } from './parser';
import { ZodError } from 'zod';

describe('ServiceKeyParser', () => {
  const mockServiceKey: BTPServiceKey = {
    uaa: {
      tenantmode: 'dedicated',
      sburl:
        'https://internal-xsuaa.authentication.mock-region.hana.ondemand.com',
      subaccountid: '12345678-1234-4678-babc-def012345678',
      'credential-type': 'binding-secret',
      clientid: 'sb-mock-client-id-1234-5678!b999999|mock-service-broker!b9999',
      xsappname: 'mock-client-id-1234-5678!b999999|mock-service-broker!b9999',
      clientsecret: 'mock-client-secret-abcd-1234$MockSecretTokenString123=',
      serviceInstanceId: '12345678-1234-4678-babc-def012345679',
      url: 'https://mock-tenant.authentication.mock-region.hana.ondemand.com',
      uaadomain: 'authentication.mock-region.hana.ondemand.com',
      verificationkey:
        '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAMOCKVERIFICATIONKEY\nForTestingPurposesOnlyDoNotUseInProductionSystemsThisIsMockData\n-----END PUBLIC KEY-----',
      apiurl: 'https://api.authentication.mock-region.hana.ondemand.com',
      identityzone: 'mock-identity-zone',
      identityzoneid: '12345678-1234-4678-babc-def012345678',
      tenantid: '12345678-1234-4678-babc-def012345678',
      zoneid: '12345678-1234-4678-babc-def012345678',
    },
    url: 'https://mock-system-uuid.abap.mock-region.hana.ondemand.com',
    'sap.cloud.service': 'com.sap.cloud.abap',
    systemid: 'MCK',
    endpoints: {
      abap: 'https://mock-system-uuid.abap.mock-region.hana.ondemand.com',
    },
    catalogs: {
      abap: {
        path: '/sap/opu/odata/IWFND/CATALOGSERVICE;v=2',
        type: 'sap_abap_catalog_v1',
      },
    },
    binding: {
      env: 'cf',
      version: '1.0.1.1',
      type: 'oauth',
      id: 'mock-binding-id-1234-5678-9abc',
    },
    preserve_host_header: true,
  };

  describe('parse', () => {
    it('should parse valid service key from JSON string', () => {
      const result = ServiceKeyParser.parse(JSON.stringify(mockServiceKey));
      expect(result).toEqual(mockServiceKey);
    });

    it('should parse valid service key from object', () => {
      const result = ServiceKeyParser.parse(mockServiceKey);
      expect(result).toEqual(mockServiceKey);
    });

    it('should throw error for invalid JSON string', () => {
      expect(() => ServiceKeyParser.parse('invalid json')).toThrow(
        'Invalid JSON format in service key'
      );
    });

    it('should throw ZodError for missing UAA credentials', () => {
      const invalid: any = { ...mockServiceKey };
      delete invalid.uaa;
      expect(() => ServiceKeyParser.parse(invalid)).toThrow(ZodError);
    });

    it('should throw ZodError for missing URL', () => {
      const invalid: any = { ...mockServiceKey };
      delete invalid.url;
      expect(() => ServiceKeyParser.parse(invalid)).toThrow(ZodError);
    });

    it('should throw ZodError for missing endpoints', () => {
      const invalid: any = { ...mockServiceKey };
      delete invalid.endpoints;
      expect(() => ServiceKeyParser.parse(invalid)).toThrow(ZodError);
    });

    it('should throw ZodError for invalid URL format', () => {
      const invalid: any = { ...mockServiceKey };
      invalid.url = 'not-a-valid-url';
      expect(() => ServiceKeyParser.parse(invalid)).toThrow(ZodError);
    });
  });

  describe('safeParse', () => {
    it('should return success for valid service key', () => {
      const result = ServiceKeyParser.safeParse(mockServiceKey);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockServiceKey);
      }
    });

    it('should return error for invalid service key', () => {
      const invalid: any = { ...mockServiceKey };
      delete invalid.uaa;
      const result = ServiceKeyParser.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ZodError);
      }
    });

    it('should return error for invalid JSON string', () => {
      const result = ServiceKeyParser.safeParse('invalid json');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Invalid JSON format in service key'
        );
      }
    });
  });

  describe('direct property access', () => {
    it('should allow direct access to parsed properties', () => {
      const serviceKey = ServiceKeyParser.parse(mockServiceKey);

      // Direct property access is cleaner than extract methods
      expect(serviceKey.uaa.clientid).toBe(
        'sb-mock-client-id-1234-5678!b999999|mock-service-broker!b9999'
      );
      expect(serviceKey.systemid).toBe('MCK');
      expect(serviceKey.endpoints['abap']).toBe(
        'https://mock-system-uuid.abap.mock-region.hana.ondemand.com'
      );
      expect(serviceKey.catalogs['abap']?.path).toBe(
        '/sap/opu/odata/IWFND/CATALOGSERVICE;v=2'
      );
    });
  });
});
