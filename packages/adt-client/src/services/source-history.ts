import type { AdtClientType } from '@abapify/adt-contracts';
import { AdtResponseTooLargeError } from '../adapter';

export type SourceHistoryProtocolErrorCode =
  | 'SOURCE_HISTORY_URI_UNSAFE'
  | 'SOURCE_VERSION_FEED_INVALID'
  | 'SOURCE_VERSION_ID_MISSING'
  | 'SOURCE_VERSION_CONTENT_LINK_MISSING';

export class SourceHistoryProtocolError extends Error {
  constructor(
    readonly code: SourceHistoryProtocolErrorCode,
    message: string,
    readonly ordinal?: number,
  ) {
    super(message);
    this.name = 'SourceHistoryProtocolError';
  }
}

export interface SourceVersionRef {
  id: string;
  ordinal: number;
  title?: string;
  sourceUri: string;
  contentType?: string;
  etag?: string;
  updatedAt?: string;
  author?: string;
  transports: string[];
}

export type SourceVersionReference = SourceVersionRef;

export type BoundedSourceReader = (
  sourceUri: string,
  maxBytes: number,
) => Promise<string>;

/**
 * An immutable source body crossed its configured byte limit.
 * This error intentionally does not retain the source URI or any source text.
 */
export class SourceVersionTooLargeError extends Error {
  readonly code = 'SOURCE_VERSION_TOO_LARGE' as const;

  constructor(
    readonly maxBytes: number,
    readonly receivedBytes?: number,
  ) {
    super(`Source version exceeds the ${maxBytes}-byte limit.`);
    this.name = 'SourceVersionTooLargeError';
  }
}

interface AtomLink {
  href?: unknown;
  rel?: unknown;
  type?: unknown;
  title?: unknown;
  etag?: unknown;
}

interface AtomEntry {
  id?: unknown;
  title?: unknown;
  updated?: unknown;
  author?: unknown;
  link?: unknown;
  content?: unknown;
}

const ADT_PATH_PREFIX = '/sap/bc/adt/';
const TRAVERSAL_SEGMENT = /(?:^|\/)(?:\.{1,2}|%2e(?:%2e)?)(?:\/|$)/i;
const TRANSPORT_NUMBER = /^[A-Z0-9]{10}$/;

function asOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

/**
 * Validate a server-relative ADT URI before it reaches the authenticated
 * adapter. This deliberately rejects absolute and protocol-relative URLs so a
 * source-history link cannot redirect credentials to another origin.
 */
export function assertAdtUri(uri: string): string {
  if (
    uri !== uri.trim() ||
    !uri.startsWith(ADT_PATH_PREFIX) ||
    uri.startsWith('//') ||
    uri.includes('#') ||
    uri.includes('\\') ||
    TRAVERSAL_SEGMENT.test(uri)
  ) {
    throw new SourceHistoryProtocolError(
      'SOURCE_HISTORY_URI_UNSAFE',
      'Source-history URI must be a server-relative SAP ADT path.',
    );
  }

  return uri;
}

function resolveAdtUri(href: string, versionsUri: string): string {
  if (href.startsWith('/')) return assertAdtUri(href);

  if (
    href.startsWith('//') ||
    href.includes('\\') ||
    href.includes(':') ||
    TRAVERSAL_SEGMENT.test(href)
  ) {
    throw new SourceHistoryProtocolError(
      'SOURCE_HISTORY_URI_UNSAFE',
      'Source-history link must stay within the SAP ADT origin.',
    );
  }

  const validatedBase = assertAdtUri(versionsUri);
  const collectionBase = validatedBase.endsWith('/')
    ? validatedBase
    : `${validatedBase}/`;
  const resolved = new URL(href, `https://adt.invalid${collectionBase}`);

  return assertAdtUri(`${resolved.pathname}${resolved.search}${resolved.hash}`);
}

function normalizeLinks(value: unknown): AtomLink[] {
  return asArray(value as AtomLink | AtomLink[] | undefined).filter(
    (link): link is AtomLink => Boolean(link) && typeof link === 'object',
  );
}

function isContentLink(link: AtomLink): boolean {
  const rel = asOptionalString(link.rel)?.toLowerCase();
  const contentType = asOptionalString(link.type)?.toLowerCase();

  return Boolean(
    rel?.endsWith('/content') ||
    rel === 'content' ||
    contentType?.startsWith('text/plain'),
  );
}

/**
 * Some SAP source-version feeds represent the immutable source body with the
 * standard Atom `content` element rather than an Atom link. Treat it exactly
 * like a content link, but only when it is explicitly plain text.
 */
function contentElementAsLink(entry: AtomEntry): AtomLink | undefined {
  const content = entry.content;
  if (!content || typeof content !== 'object' || Array.isArray(content)) {
    return undefined;
  }

  const src = asOptionalString((content as Record<string, unknown>).src);
  const type = asOptionalString((content as Record<string, unknown>).type);
  if (!src || !type?.toLowerCase().startsWith('text/plain')) {
    return undefined;
  }

  return { href: src, type };
}

function transportFromLink(link: AtomLink): string | undefined {
  const rel = asOptionalString(link.rel)?.toLowerCase();
  if (!rel?.endsWith('/transport') && !rel?.endsWith('/transport/request')) {
    return undefined;
  }

  const title = asOptionalString(link.title)?.toUpperCase();
  if (title && TRANSPORT_NUMBER.test(title)) return title;

  const href = asOptionalString(link.href);
  if (!href) return undefined;

  const path = href.split(/[?#]/, 1)[0];
  const lastSegment = path?.split('/').findLast((segment) => segment !== '');
  if (!lastSegment) return undefined;

  try {
    const candidate = decodeURIComponent(lastSegment).toUpperCase();
    return TRANSPORT_NUMBER.test(candidate) ? candidate : undefined;
  } catch {
    return undefined;
  }
}

function authorName(value: unknown): string | undefined {
  const author = asArray(
    value as Record<string, unknown> | Record<string, unknown>[] | undefined,
  ).find((candidate) => Boolean(candidate) && typeof candidate === 'object');

  return asOptionalString(author?.name);
}

/**
 * Normalize the parsed Atom versions feed while preserving SAP's feed order.
 * The result contains references and provenance only; source bodies are fetched
 * separately and are never retained by this function.
 */
export function normalizeSourceVersionFeed(
  payload: unknown,
  versionsUri: string,
): SourceVersionRef[] {
  assertAdtUri(versionsUri);

  if (!payload || typeof payload !== 'object' || !('feed' in payload)) {
    throw new SourceHistoryProtocolError(
      'SOURCE_VERSION_FEED_INVALID',
      'SAP ADT source-history response is not an Atom feed.',
    );
  }

  const feed = (payload as { feed?: unknown }).feed;
  if (!feed || typeof feed !== 'object' || Array.isArray(feed)) {
    throw new SourceHistoryProtocolError(
      'SOURCE_VERSION_FEED_INVALID',
      'SAP ADT source-history feed has an invalid root.',
    );
  }

  const rawEntries = (feed as { entry?: unknown }).entry;
  if (rawEntries === undefined) return [];

  const entries = asArray(rawEntries as AtomEntry | AtomEntry[]);
  if (entries.some((entry) => !entry || typeof entry !== 'object')) {
    throw new SourceHistoryProtocolError(
      'SOURCE_VERSION_FEED_INVALID',
      'SAP ADT source-history feed contains an invalid entry.',
    );
  }

  return entries.map((entry, ordinal) => {
    const id = asOptionalString(entry.id);
    if (!id) {
      throw new SourceHistoryProtocolError(
        'SOURCE_VERSION_ID_MISSING',
        `Source-history entry ${ordinal} has no stable version id.`,
        ordinal,
      );
    }

    const links = normalizeLinks(entry.link);
    const contentLink =
      links.find(isContentLink) ?? contentElementAsLink(entry);
    const href = contentLink && asOptionalString(contentLink.href);

    if (!contentLink || !href) {
      throw new SourceHistoryProtocolError(
        'SOURCE_VERSION_CONTENT_LINK_MISSING',
        `Source-history entry ${ordinal} has no immutable content link.`,
        ordinal,
      );
    }

    const transports = [
      ...new Set(
        links
          .map(transportFromLink)
          .filter((transport): transport is string => Boolean(transport)),
      ),
    ];

    return {
      id,
      ordinal,
      title: asOptionalString(entry.title),
      sourceUri: resolveAdtUri(href, versionsUri),
      contentType: asOptionalString(contentLink.type),
      etag: asOptionalString(contentLink.etag),
      updatedAt: asOptionalString(entry.updated),
      author: authorName(entry.author),
      transports,
    };
  });
}

export class SourceHistoryService {
  constructor(
    private readonly adt: AdtClientType,
    private readonly boundedSourceReader?: BoundedSourceReader,
  ) {}

  async listVersions(versionsUri: string): Promise<SourceVersionRef[]> {
    assertAdtUri(versionsUri);
    const feed = await this.adt.repository.sourceversions.list({ versionsUri });
    return normalizeSourceVersionFeed(feed, versionsUri);
  }

  async readVersionSource(sourceUri: string): Promise<string> {
    assertAdtUri(sourceUri);
    return this.adt.repository.sourceversions.get({ sourceUri });
  }

  async readVersionSourceBounded(
    sourceUri: string,
    maxBytes: number,
  ): Promise<string> {
    assertAdtUri(sourceUri);
    if (!this.boundedSourceReader) {
      throw new Error('Bounded source reads are not configured.');
    }
    try {
      return await this.boundedSourceReader(sourceUri, maxBytes);
    } catch (error) {
      if (error instanceof AdtResponseTooLargeError) {
        throw new SourceVersionTooLargeError(
          error.maxBytes,
          error.receivedBytes,
        );
      }
      throw error;
    }
  }
}

export function createSourceHistoryService(
  adt: AdtClientType,
  boundedSourceReader?: BoundedSourceReader,
): SourceHistoryService {
  return new SourceHistoryService(adt, boundedSourceReader);
}
