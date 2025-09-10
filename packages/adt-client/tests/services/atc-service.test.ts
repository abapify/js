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

  describe('basic functionality', () => {
    it('should create AtcService instance', () => {
      expect(atcService).toBeDefined();
      expect(atcService).toBeInstanceOf(AtcService);
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
          target: 'package',
          targetName: 'ZCL_TEST_CLASS',
        })
      ).rejects.toThrow();
    });
  });
});
