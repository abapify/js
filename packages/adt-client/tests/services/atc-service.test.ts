import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AtcService } from '../../src/services/atc/atc-service';
import type { ConnectionManager } from '../../src/client/connection-manager';

// Mock ConnectionManager
const mockConnectionManager = {
  request: vi.fn(),
  post: vi.fn(),
  get: vi.fn(),
} as unknown as ConnectionManager;

describe('AtcService', () => {
  let atcService: AtcService;

  beforeEach(() => {
    vi.clearAllMocks();
    atcService = new AtcService(mockConnectionManager);
  });

  describe('run', () => {
    it('should execute ATC check successfully', async () => {
      // Mock the HTTP responses for ATC workflow
      const mockCustomizingResponse = {
        ok: true,
        text: () =>
          Promise.resolve(`<?xml version="1.0" encoding="UTF-8"?>
          <atc:customizing xmlns:atc="http://www.sap.com/adt/atc">
            <atc:checkVariant name="DEFAULT"/>
          </atc:customizing>`),
      };

      const mockWorklistResponse = {
        ok: true,
        text: () =>
          Promise.resolve(`<?xml version="1.0" encoding="UTF-8"?>
          <atc:worklist xmlns:atc="http://www.sap.com/adt/atc">
            <atc:worklistId>WL123</atc:worklistId>
            <atc:worklistTimestamp>2024-01-01T10:00:00Z</atc:worklistTimestamp>
          </atc:worklist>`),
      };

      const mockResultResponse = {
        ok: true,
        text: () =>
          Promise.resolve(`<?xml version="1.0" encoding="UTF-8"?>
          <atc:checkstyle xmlns:atc="http://www.sap.com/adt/atc">
            <file name="ZCL_TEST_CLASS">
              <error line="10" column="5" severity="warning" message="Test warning" source="TEST001"/>
            </file>
          </atc:checkstyle>`),
      };

      (mockConnectionManager.request as any)
        .mockResolvedValueOnce(mockCustomizingResponse)
        .mockResolvedValueOnce(mockWorklistResponse)
        .mockResolvedValueOnce(mockResultResponse);

      const result = await atcService.runAtcCheck({
        objectType: 'CLAS',
        objectName: 'ZCL_TEST_CLASS',
      });

      expect(result).toBeDefined();
      expect(result.findings).toHaveLength(1);
      expect(result.findings[0].severity).toBe('warning');
      expect(result.findings[0].messageText).toBe('Test warning');
      expect(result.summary.total).toBe(1);
      expect(result.summary.warnings).toBe(1);
    });

    it('should handle ATC check with no findings', async () => {
      const mockCustomizingResponse = {
        ok: true,
        text: () =>
          Promise.resolve(`<?xml version="1.0" encoding="UTF-8"?>
          <atc:customizing xmlns:atc="http://www.sap.com/adt/atc">
            <atc:checkVariant name="DEFAULT"/>
          </atc:customizing>`),
      };

      const mockWorklistResponse = {
        ok: true,
        text: () =>
          Promise.resolve(`<?xml version="1.0" encoding="UTF-8"?>
          <atc:worklist xmlns:atc="http://www.sap.com/adt/atc">
            <atc:worklistId>WL123</atc:worklistId>
            <atc:worklistTimestamp>2024-01-01T10:00:00Z</atc:worklistTimestamp>
          </atc:worklist>`),
      };

      const mockResultResponse = {
        ok: true,
        text: () =>
          Promise.resolve(`<?xml version="1.0" encoding="UTF-8"?>
          <atc:checkstyle xmlns:atc="http://www.sap.com/adt/atc">
          </atc:checkstyle>`),
      };

      (mockConnectionManager.request as any)
        .mockResolvedValueOnce(mockCustomizingResponse)
        .mockResolvedValueOnce(mockWorklistResponse)
        .mockResolvedValueOnce(mockResultResponse);

      const result = await atcService.runAtcCheck({
        objectType: 'CLAS',
        objectName: 'ZCL_CLEAN_CLASS',
      });

      expect(result.findings).toHaveLength(0);
      expect(result.summary.total).toBe(0);
      expect(result.summary.errors).toBe(0);
      expect(result.summary.warnings).toBe(0);
    });

    it('should handle HTTP errors gracefully', async () => {
      const mockErrorResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      };

      (mockConnectionManager.request as any).mockResolvedValue(
        mockErrorResponse
      );

      await expect(
        atcService.runAtcCheck({
          objectType: 'CLAS',
          objectName: 'ZCL_TEST_CLASS',
        })
      ).rejects.toThrow();
    });

    it('should use custom check variant when provided', async () => {
      const mockCustomizingResponse = {
        ok: true,
        text: () =>
          Promise.resolve(`<?xml version="1.0" encoding="UTF-8"?>
          <atc:customizing xmlns:atc="http://www.sap.com/adt/atc">
            <atc:checkVariant name="CUSTOM_VARIANT"/>
          </atc:customizing>`),
      };

      const mockWorklistResponse = {
        ok: true,
        text: () =>
          Promise.resolve(`<?xml version="1.0" encoding="UTF-8"?>
          <atc:worklist xmlns:atc="http://www.sap.com/adt/atc">
            <atc:worklistId>WL123</atc:worklistId>
          </atc:worklist>`),
      };

      const mockResultResponse = {
        ok: true,
        text: () =>
          Promise.resolve(`<?xml version="1.0" encoding="UTF-8"?>
          <atc:checkstyle xmlns:atc="http://www.sap.com/adt/atc">
          </atc:checkstyle>`),
      };

      (mockConnectionManager.request as any)
        .mockResolvedValueOnce(mockCustomizingResponse)
        .mockResolvedValueOnce(mockWorklistResponse)
        .mockResolvedValueOnce(mockResultResponse);

      await atcService.runAtcCheck({
        objectType: 'CLAS',
        objectName: 'ZCL_TEST_CLASS',
        checkVariant: 'CUSTOM_VARIANT',
      });

      // Verify that the custom variant was used in the request
      const calls = (mockConnectionManager.request as any).mock.calls;
      expect(
        calls.some((call: any) =>
          call[0].includes('checkVariant=CUSTOM_VARIANT')
        )
      ).toBe(true);
    });
  });
});
