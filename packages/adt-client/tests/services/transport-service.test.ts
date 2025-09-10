import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TransportService } from '../../src/services/cts/transport-service';
import type { ConnectionManager } from '../../src/client/connection-manager';

// Mock ConnectionManager
const mockConnectionManager = {
  request: vi.fn(),
  post: vi.fn(),
  get: vi.fn(),
} as unknown as ConnectionManager;

describe('TransportService', () => {
  let transportService: TransportService;

  beforeEach(() => {
    vi.clearAllMocks();
    transportService = new TransportService(mockConnectionManager);
  });

  describe('basic functionality', () => {
    it('should create TransportService instance', () => {
      expect(transportService).toBeDefined();
      expect(transportService).toBeInstanceOf(TransportService);
    });

    it('should handle creation errors', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      };

      (mockConnectionManager.request as any).mockResolvedValue(mockResponse);

      await expect(
        transportService.createTransport({
          description: 'New transport',
          target: 'PRD',
        })
      ).rejects.toThrow();
    });

    it('should add object to transport successfully', async () => {
      const mockResponse = {
        ok: true,
        text: () =>
          Promise.resolve(`<?xml version="1.0" encoding="UTF-8"?>
          <tm:root xmlns:tm="http://www.sap.com/adt/tm">
            <tm:result tm:success="true"/>
          </tm:root>`),
      };

      (mockConnectionManager.request as any).mockResolvedValue(mockResponse);

      const result = await transportService.assignToTransport(
        'CLAS:ZCL_TEST_CLASS',
        'T123456'
      );

      expect(result.success).toBe(true);
    });
  });

  describe('releaseTransport', () => {
    it('should release transport successfully', async () => {
      const mockResponse = {
        ok: true,
        text: () =>
          Promise.resolve(`<?xml version="1.0" encoding="UTF-8"?>
          <tm:root xmlns:tm="http://www.sap.com/adt/tm">
            <tm:transport tm:number="T123456" tm:status="released"/>
          </tm:root>`),
      };

      (mockConnectionManager.request as any).mockResolvedValue(mockResponse);

      const result = await transportService.releaseTransport('T123456');

      expect(result.success).toBe(true);
    });
  });

  describe('addObjectToTransport', () => {
    it('should add object to transport successfully', async () => {
      const mockResponse = {
        ok: true,
        text: () =>
          Promise.resolve(`<?xml version="1.0" encoding="UTF-8"?>
          <tm:root xmlns:tm="http://www.sap.com/adt/tm">
            <tm:result tm:success="true"/>
          </tm:root>`),
      };

      (mockConnectionManager.request as any).mockResolvedValue(mockResponse);

      const result = await transportService.assignToTransport(
        'CLAS:ZCL_TEST_CLASS',
        'T123456'
      );

      expect(result.success).toBe(true);
    });
  });
});
