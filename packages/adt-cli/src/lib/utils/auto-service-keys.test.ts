import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  clearConfigCache,
  getDestination,
  listDestinations,
} from './destinations';
import { resolveDefaultSid } from './auth';
import { resetCliContext } from '../shared/adt-client';

const SERVICE_KEY_FIXTURE = {
  uaa: {
    tenantmode: 'dedicated',
    sburl: 'https://example.authentication.us10.hana.ondemand.com',
    subaccountid: 'subaccount-id',
    'credential-type': 'binding-secret',
    clientid: 'client-id',
    xsappname: 'xsappname',
    clientsecret: 'client-secret',
    serviceInstanceId: 'service-instance-id',
    url: 'https://example.authentication.us10.hana.ondemand.com',
    uaadomain: 'authentication.us10.hana.ondemand.com',
    verificationkey:
      '-----BEGIN PUBLIC KEY-----\nMIIB\n-----END PUBLIC KEY-----',
    apiurl: 'https://api.authentication.us10.hana.ondemand.com',
    identityzone: 'example',
    identityzoneid: 'identity-zone-id',
    tenantid: 'tenant-id',
    zoneid: 'zone-id',
  },
  url: 'https://example.abap.us10.hana.ondemand.com',
  'sap.cloud.service': 'com.sap.cloud.abap',
  systemid: 'TRL',
  endpoints: {
    abap: 'https://example.abap.us10.hana.ondemand.com',
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
    id: 'binding-id',
  },
  preserve_host_header: true,
};

const tempDirs: string[] = [];
const originalCwd = process.cwd();

afterEach(() => {
  clearConfigCache();
  resetCliContext();
  delete process.env['ADT_SERVICE_KEY_DIR'];
  process.chdir(originalCwd);

  while (tempDirs.length > 0) {
    const dirPath = tempDirs.pop();
    if (dirPath) {
      rmSync(dirPath, { recursive: true, force: true });
    }
  }
});

function createWorkspaceWithDiscoveredDestination(): string {
  const workspaceDir = mkdtempSync(join(tmpdir(), 'adt-cli-auto-key-'));
  tempDirs.push(workspaceDir);

  const destinationsDir = join(workspaceDir, '.adt', 'destinations');
  mkdirSync(destinationsDir, { recursive: true });
  writeFileSync(
    join(destinationsDir, 'TRL.json'),
    JSON.stringify(SERVICE_KEY_FIXTURE, null, 2),
    'utf8',
  );

  process.chdir(workspaceDir);
  return workspaceDir;
}

describe('auto service key discovery', () => {
  it('discovers service-key destinations from .adt/destinations', async () => {
    createWorkspaceWithDiscoveredDestination();

    await expect(listDestinations()).resolves.toContain('TRL');

    const destination = await getDestination('trl');
    expect(destination).toBeDefined();
    expect(destination?.type).toBe('@abapify/adt-auth/plugins/service-key');
    expect(destination?.options).toMatchObject({
      url: SERVICE_KEY_FIXTURE.url,
      serviceKey: {
        systemid: 'TRL',
      },
    });
  });

  it('uses a single discovered destination as the default SID fallback', () => {
    expect(resolveDefaultSid(null, ['TRL'])).toBe('TRL');
    expect(resolveDefaultSid('BHF', ['TRL'])).toBe('BHF');
    expect(resolveDefaultSid(null, ['TRL', 'QAS'])).toBeUndefined();
  });
});
