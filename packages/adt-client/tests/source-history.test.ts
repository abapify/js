import type { AdtClientType } from '@abapify/adt-contracts';
import { describe, expect, it, vi } from 'vitest';
import {
  SourceHistoryProtocolError,
  assertAdtUri,
  createSourceHistoryService,
  normalizeSourceVersionFeed,
} from '../src/services/source-history';
import { AdtResponseTooLargeError } from '../src/adapter';
import {
  SourceHistoryService as PublicSourceHistoryService,
  createAdtClient,
  createSourceHistoryService as publicCreateSourceHistoryService,
} from '../src';

const versionsUri =
  '/sap/bc/adt/oo/classes/zcl_example/includes/implementations/versions';

describe('normalizeSourceVersionFeed', () => {
  it('preserves feed order, immutable content metadata, and transport provenance', () => {
    const result = normalizeSourceVersionFeed(
      {
        feed: {
          entry: [
            {
              id: '00000',
              title: 'Current',
              updated: '2026-07-17T10:00:00Z',
              author: { name: 'DEVELOPER' },
              link: [
                {
                  href: '/sap/bc/adt/oo/classes/zcl_example/includes/implementations/versions/00000/content',
                  rel: 'http://www.sap.com/adt/relations/content',
                  type: 'text/plain',
                  etag: 'head-etag',
                },
                {
                  href: '/sap/bc/adt/cts/transportrequests/TRLK900236',
                  rel: 'http://www.sap.com/adt/relations/transport',
                  title: 'TRLK900236',
                },
                {
                  href: '/sap/bc/adt/cts/transportrequests/TRLK900237',
                  rel: 'http://www.sap.com/adt/relations/transport',
                },
              ],
            },
            {
              id: '00001',
              title: 'Previous',
              updated: '2026-07-16T09:00:00Z',
              link: [
                {
                  href: '/sap/bc/adt/oo/classes/zcl_example/includes/implementations/versions/00001/content',
                  type: 'text/plain; charset=utf-8',
                },
                {
                  href: '/sap/bc/adt/cts/transportrequests/TRLK900101',
                  rel: 'http://www.sap.com/adt/relations/transport',
                },
              ],
            },
          ],
        },
      },
      versionsUri,
    );

    expect(result).toEqual([
      {
        id: '00000',
        ordinal: 0,
        title: 'Current',
        sourceUri:
          '/sap/bc/adt/oo/classes/zcl_example/includes/implementations/versions/00000/content',
        contentType: 'text/plain',
        etag: 'head-etag',
        updatedAt: '2026-07-17T10:00:00Z',
        author: 'DEVELOPER',
        transports: ['TRLK900236', 'TRLK900237'],
      },
      {
        id: '00001',
        ordinal: 1,
        title: 'Previous',
        sourceUri:
          '/sap/bc/adt/oo/classes/zcl_example/includes/implementations/versions/00001/content',
        contentType: 'text/plain; charset=utf-8',
        updatedAt: '2026-07-16T09:00:00Z',
        transports: ['TRLK900101'],
      },
    ]);
  });

  it('accepts a single parsed Atom entry and de-duplicates transport links', () => {
    const result = normalizeSourceVersionFeed(
      {
        feed: {
          entry: {
            id: '00000',
            link: [
              {
                href: '00000/content',
                rel: 'http://www.sap.com/adt/relations/content',
                type: 'text/plain',
              },
              {
                href: '/sap/bc/adt/cts/transportrequests/TRLK900236',
                rel: 'http://www.sap.com/adt/relations/transport',
              },
              {
                href: '/sap/bc/adt/cts/transportrequests/TRLK900236',
                rel: 'http://www.sap.com/adt/relations/transport',
              },
            ],
          },
        },
      },
      `${versionsUri}/`,
    );

    expect(result).toHaveLength(1);
    expect(result[0]?.sourceUri).toBe(`${versionsUri}/00000/content`);
    expect(result[0]?.transports).toEqual(['TRLK900236']);
  });

  it('uses Atom content src when SAP puts immutable source versions there', () => {
    const result = normalizeSourceVersionFeed(
      {
        feed: {
          entry: {
            id: '00042',
            content: {
              src: '/sap/bc/adt/programs/programs/ztest_gcts_program/source/main/versions/00042',
              type: 'text/plain',
            },
            link: [
              {
                href: '/sap/bc/adt/cts/transportrequests/TRLK900236',
                rel: 'http://www.sap.com/adt/relations/transport/request',
              },
            ],
          },
        },
      },
      '/sap/bc/adt/programs/programs/ztest_gcts_program/source/main/versions',
    );

    expect(result).toMatchObject([
      {
        id: '00042',
        ordinal: 0,
        sourceUri:
          '/sap/bc/adt/programs/programs/ztest_gcts_program/source/main/versions/00042',
        contentType: 'text/plain',
        transports: ['TRLK900236'],
      },
    ]);
  });

  it('returns an empty list for an empty Atom feed', () => {
    expect(normalizeSourceVersionFeed({ feed: {} }, versionsUri)).toEqual([]);
  });

  it('fails closed when an entry has no immutable content link', () => {
    expect(() =>
      normalizeSourceVersionFeed(
        {
          feed: {
            entry: [
              {
                id: '00000',
                link: [
                  {
                    href: '/sap/bc/adt/cts/transportrequests/TRLK900236',
                    rel: 'http://www.sap.com/adt/relations/transport',
                  },
                ],
              },
            ],
          },
        },
        versionsUri,
      ),
    ).toThrowError(
      expect.objectContaining<Partial<SourceHistoryProtocolError>>({
        code: 'SOURCE_VERSION_CONTENT_LINK_MISSING',
      }),
    );
  });

  it('fails closed when an immutable version has no stable id', () => {
    expect(() =>
      normalizeSourceVersionFeed(
        {
          feed: {
            entry: {
              link: {
                href: '00000/content',
                rel: 'http://www.sap.com/adt/relations/content',
                type: 'text/plain',
              },
            },
          },
        },
        `${versionsUri}/`,
      ),
    ).toThrowError(
      expect.objectContaining<Partial<SourceHistoryProtocolError>>({
        code: 'SOURCE_VERSION_ID_MISSING',
      }),
    );
  });

  it('fails closed for a non-feed payload', () => {
    expect(() =>
      normalizeSourceVersionFeed({ entry: {} }, versionsUri),
    ).toThrowError(
      expect.objectContaining<Partial<SourceHistoryProtocolError>>({
        code: 'SOURCE_VERSION_FEED_INVALID',
      }),
    );
  });

  it('fails closed for a malformed feed entry', () => {
    expect(() =>
      normalizeSourceVersionFeed({ feed: { entry: [null] } }, versionsUri),
    ).toThrowError(
      expect.objectContaining<Partial<SourceHistoryProtocolError>>({
        code: 'SOURCE_VERSION_FEED_INVALID',
      }),
    );
  });
});

describe('assertAdtUri', () => {
  it.each([
    'https://attacker.example/sap/bc/adt/source',
    '//attacker.example/sap/bc/adt/source',
    '/sap/opu/odata/source',
    '../source',
    '/sap/bc/adt/source#fragment',
    ' /sap/bc/adt/source',
  ])('rejects unsafe or non-ADT URI %s', (uri) => {
    expect(() => assertAdtUri(uri)).toThrowError(
      expect.objectContaining<Partial<SourceHistoryProtocolError>>({
        code: 'SOURCE_HISTORY_URI_UNSAFE',
      }),
    );
  });

  it('accepts an ADT-relative absolute path', () => {
    expect(assertAdtUri(versionsUri)).toBe(versionsUri);
  });
});

describe('SourceHistoryService', () => {
  it('is exported and registered on the public client services surface', () => {
    expect(publicCreateSourceHistoryService).toBe(createSourceHistoryService);

    const client = createAdtClient({
      baseUrl: 'https://sap.example.test',
      username: 'test',
      password: 'test',
      client: '100',
    });

    expect(client.services.sourceHistory).toBeInstanceOf(
      PublicSourceHistoryService,
    );
  });

  it('exposes a bounded immutable source read on the public service', () => {
    const client = createAdtClient({
      baseUrl: 'https://sap.example.test',
      username: 'test',
      password: 'test',
      client: '100',
    });

    expect('readVersionSourceBounded' in client.services.sourceHistory).toBe(
      true,
    );
  });

  it('reads bounded immutable source through the public client adapter', async () => {
    const fetch = vi.fn().mockResolvedValue(
      new Response('REPORT z_example.', {
        headers: { 'content-type': 'text/plain' },
      }),
    );
    vi.stubGlobal('fetch', fetch);

    try {
      const client = createAdtClient({
        baseUrl: 'https://sap.example.test',
        username: 'test',
        password: 'test',
        client: '100',
      });
      const sourceUri = `${versionsUri}/00000/content`;

      await expect(
        client.services.sourceHistory.readVersionSourceBounded(sourceUri, 256),
      ).resolves.toBe('REPORT z_example.');

      expect(fetch).toHaveBeenCalledOnce();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('lists versions through the repository contract and normalizes them', async () => {
    const list = vi.fn().mockResolvedValue({ feed: {} });
    const get = vi.fn();
    const service = createSourceHistoryService({
      repository: { sourceversions: { list, get } },
    } as unknown as AdtClientType);

    await expect(service.listVersions(versionsUri)).resolves.toEqual([]);
    expect(list).toHaveBeenCalledWith({ versionsUri });
  });

  it('parses SAP Atom content src through the contract schema', async () => {
    const fetch = vi.fn().mockResolvedValue(
      new Response(
        `<?xml version="1.0" encoding="UTF-8"?>
        <atom:feed xmlns:atom="http://www.w3.org/2005/Atom">
          <atom:title>Source versions</atom:title>
          <atom:updated>2026-07-17T10:00:00Z</atom:updated>
          <atom:entry>
            <atom:author><atom:name>DEVELOPER</atom:name></atom:author>
            <atom:content type="text/plain" src="/sap/bc/adt/programs/programs/ztest_gcts_program/source/main/versions/00042"/>
            <atom:id>00042</atom:id>
            <atom:link href="/sap/bc/adt/cts/transportrequests/TRLK900236" rel="http://www.sap.com/adt/relations/transport/request"/>
            <atom:title>Version 42</atom:title>
            <atom:updated>2026-07-17T10:00:00Z</atom:updated>
          </atom:entry>
        </atom:feed>`,
        { headers: { 'content-type': 'application/atom+xml;type=feed' } },
      ),
    );
    vi.stubGlobal('fetch', fetch);

    try {
      const client = createAdtClient({
        baseUrl: 'https://sap.example.test',
        username: 'test',
        password: 'test',
        client: '100',
      });

      await expect(
        client.services.sourceHistory.listVersions(
          '/sap/bc/adt/programs/programs/ztest_gcts_program/source/main/versions',
        ),
      ).resolves.toMatchObject([
        {
          id: '00042',
          sourceUri:
            '/sap/bc/adt/programs/programs/ztest_gcts_program/source/main/versions/00042',
          transports: ['TRLK900236'],
        },
      ]);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('reads one explicitly requested immutable source through the contract', async () => {
    const sourceUri = `${versionsUri}/00000/content`;
    const list = vi.fn();
    const get = vi.fn().mockResolvedValue('REPORT z_example.');
    const service = createSourceHistoryService({
      repository: { sourceversions: { list, get } },
    } as unknown as AdtClientType);

    await expect(service.readVersionSource(sourceUri)).resolves.toBe(
      'REPORT z_example.',
    );
    expect(get).toHaveBeenCalledWith({ sourceUri });
  });

  it('surfaces a source-free typed error when a bounded read is too large', async () => {
    const sourceUri = `${versionsUri}/00000/content`;
    const readBounded = vi
      .fn()
      .mockRejectedValue(new AdtResponseTooLargeError(10, 11));
    const service = createSourceHistoryService(
      {
        repository: { sourceversions: { list: vi.fn(), get: vi.fn() } },
      } as unknown as AdtClientType,
      readBounded,
    );

    await expect(
      service.readVersionSourceBounded(sourceUri, 10),
    ).rejects.toMatchObject({
      code: 'SOURCE_VERSION_TOO_LARGE',
      maxBytes: 10,
      receivedBytes: 11,
    });
  });

  it('rejects an unsafe URI before invoking a contract', async () => {
    const list = vi.fn();
    const get = vi.fn();
    const service = createSourceHistoryService({
      repository: { sourceversions: { list, get } },
    } as unknown as AdtClientType);

    await expect(
      service.readVersionSource('https://attacker.example/source'),
    ).rejects.toMatchObject({ code: 'SOURCE_HISTORY_URI_UNSAFE' });
    expect(get).not.toHaveBeenCalled();
  });
});
