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

  describe('getTransports', () => {
    it('should fetch transport list successfully', async () => {
      const mockResponse = {
        ok: true,
        text: () =>
          Promise.resolve(`<?xml version="1.0" encoding="UTF-8"?>
          <tm:root xmlns:tm="http://www.sap.com/adt/tm">
            <tm:transports>
              <tm:transport @_number="T123456" @_description="Test transport" @_owner="TESTUSER" @_status="modifiable"/>
              <tm:transport @_number="T123457" @_description="Another transport" @_owner="TESTUSER" @_status="released"/>
            </tm:transports>
          </tm:root>`),
      };

      (mockConnectionManager.request as any).mockResolvedValue(mockResponse);

      const result = await transportService.listTransports();

      expect(result).toBeDefined();
      expect(result.transports).toHaveLength(2);
      expect(result.transports[0].transportNumber).toBe('T123456');
      expect(result.transports[0].description).toBe('Test transport');
      expect(result.transports[1].status).toBe('released');
    });

    it('should apply filters correctly', async () => {
      const mockResponse = {
        ok: true,
        text: () =>
          Promise.resolve(`<?xml version="1.0" encoding="UTF-8"?>
          <tm:root xmlns:tm="http://www.sap.com/adt/tm">
            <tm:transports>
              <tm:transport tm:number="T123456" tm:description="Test transport" tm:owner="TESTUSER" tm:status="modifiable"/>
            </tm:transports>
          </tm:root>`),
      };

      (mockConnectionManager.request as any).mockResolvedValue(mockResponse);

      await transportService.listTransports({
        owner: 'TESTUSER',
        status: 'modifiable',
      });

      const calls = (mockConnectionManager.request as any).mock.calls;
      expect(calls[0][0]).toContain('owner=TESTUSER');
      expect(calls[0][0]).toContain('status=modifiable');
    });
  });

  describe('createTransport', () => {
    it('should create transport successfully', async () => {
      const mockResponse = {
        ok: true,
        text: () =>
          Promise.resolve(`<?xml version="1.0" encoding="UTF-8"?>
          <tm:root xmlns:tm="http://www.sap.com/adt/tm">
            <tm:transport tm:number="T123456" tm:description="New transport" tm:owner="TESTUSER"/>
          </tm:root>`),
      };

      (mockConnectionManager.request as any).mockResolvedValue(mockResponse);

      const result = await transportService.createTransport({
        description: 'New transport',
        targetSystem: 'PRD',
      });

      expect(result.success).toBe(true);
      expect(result.transportNumber).toBe('T123456');
    });

    it('should handle creation errors', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      };

      (mockConnectionManager.request as any).mockResolvedValue(mockResponse);

      const result = await transportService.createTransport({
        description: 'New transport',
        targetSystem: 'PRD',
      });

      expect(result.success).toBe(false);
      expect(result.messages).toBeDefined();
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

      const result = await transportService.addObjectToTransport('T123456', {
        objectType: 'CLAS',
        objectName: 'ZCL_TEST_CLASS',
        packageName: 'ZTEST',
      });

      expect(result.success).toBe(true);
    });
  });
});
