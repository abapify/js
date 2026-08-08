/**
 * Tool: get_source – fetch ABAP source code for an object
 *
 * CLI equivalent: `adt source get <objectName>`
 *
 * Returns the raw ABAP source code for programs, classes, interfaces, etc.
 * Enhanced for arc-1 SAPRead parity:
 *   - `version` (active/inactive)
 *   - `include` for class includes and source sections
 *   - `method` for method-level reads on classes
 *   - `grep` for token-efficient regex search within source
 */

import { Buffer } from 'node:buffer';
import { AdtResponseTooLargeError } from '@abapify/adt-client';
import { detectMethodBoundary, normalizeMethodBody } from '@abapify/adt-lint';
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ToolContext } from '../types';
import { sessionOrConnectionShape } from './shared-schemas';
import { resolveClient } from './session-helpers';
import { resolveObjectUri } from './utils';

const DEFAULT_MAX_SOURCE_BYTES = 1024 * 1024;
const HARD_MAX_SOURCE_BYTES = 2 * 1024 * 1024;
const GREP_CONTEXT_LINES = 3;

const VALID_CLASS_INCLUDES = new Set([
  'main',
  'definitions',
  'implementations',
  'testclasses',
  'macros',
  'text_symbols',
]);

function sourceTooLargeResult(maxBytes: number) {
  return {
    isError: true,
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify({
          error: {
            code: 'SOURCE_TOO_LARGE',
            message: 'The source exceeds the requested MCP response limit.',
            maxBytes,
          },
        }),
      },
    ],
  };
}

function stripInlineComment(line: string): string {
  const idx = line.indexOf('"');
  return idx >= 0 ? line.slice(0, idx) : line;
}

function extractMethodNameFromHeader(line: string): string | undefined {
  const trimmed = stripInlineComment(line).trim();
  const upper = trimmed.toUpperCase();
  if (!upper.startsWith('METHOD ') || !upper.endsWith('.')) {
    return undefined;
  }
  const withoutKeyword = trimmed.slice('METHOD '.length, -1).trim();
  if (!withoutKeyword) {
    return undefined;
  }
  return withoutKeyword.split(/\s+/)[0]?.toUpperCase();
}

function listMethods(source: string): string[] {
  const methods: string[] = [];
  const seen = new Set<string>();
  for (const line of source.split(/\r?\n/)) {
    const name = extractMethodNameFromHeader(line);
    if (name && !seen.has(name)) {
      seen.add(name);
      methods.push(name);
    }
  }
  return methods;
}

function extractMethodBlock(
  source: string,
  methodName: string,
): { source: string; startLine: number; endLine: number } | undefined {
  const boundary = detectMethodBoundary(source, methodName);
  if (!boundary) {
    return undefined;
  }

  const lines = source.split(/\r?\n/);
  const start = boundary.startLine - 1;
  const end = boundary.endLine;
  const methodSource = lines.slice(start, end).join('\n');
  const body = normalizeMethodBody(methodSource, methodName);

  const methodBlock = [
    `METHOD ${methodName.toUpperCase()}.`,
    body,
    'ENDMETHOD.',
  ].join('\n');

  return {
    source: methodBlock,
    startLine: boundary.startLine,
    endLine: boundary.endLine,
  };
}

function grepSource(
  source: string,
  pattern: string,
): { matches: string[]; matchCount: number; invalidPattern?: string } {
  let regex: RegExp;
  try {
    regex = new RegExp(pattern, 'i');
  } catch {
    return {
      matches: [],
      matchCount: 0,
      invalidPattern: `Invalid regex pattern: "${pattern}"`,
    };
  }

  const lines = source.split(/\r?\n/);
  const matched = new Set<number>();
  for (let i = 0; i < lines.length; i += 1) {
    if (regex.test(lines[i] ?? '')) {
      matched.add(i);
    }
  }

  if (matched.size === 0) {
    return { matches: [], matchCount: 0 };
  }

  const context = new Set<number>();
  for (const idx of matched) {
    for (
      let i = Math.max(0, idx - GREP_CONTEXT_LINES);
      i <= Math.min(lines.length - 1, idx + GREP_CONTEXT_LINES);
      i += 1
    ) {
      context.add(i);
    }
  }

  const sorted = Array.from(context).sort((a, b) => a - b);
  const result: string[] = [];
  let prev = -2;
  for (const idx of sorted) {
    if (idx - prev > 1) {
      result.push('---');
    }
    const lineNumber = (idx + 1).toString().padStart(5, ' ');
    result.push(`${lineNumber}: ${lines[idx] ?? ''}`);
    prev = idx;
  }

  return { matches: result, matchCount: matched.size };
}

function buildClassIncludeUrl(
  objectUri: string,
  include: string,
  version: string | undefined,
): string {
  const normalized = include.toLowerCase();
  const base =
    normalized === 'main'
      ? `${objectUri}/source/main`
      : `${objectUri}/includes/${encodeURIComponent(normalized)}`;
  return appendVersion(base, version);
}

function buildSourceUrl(
  objectUri: string,
  objectType: string | undefined,
  include: string | undefined,
  version: string | undefined,
): { url: string; note?: string } {
  const upperType = objectType?.toUpperCase();
  const normalizedInclude = include?.toLowerCase();

  if (normalizedInclude) {
    if (upperType === 'CLAS') {
      const includes = normalizedInclude
        .split(',')
        .map((s) => s.trim())
        .filter((s): s is string => Boolean(s));
      const firstInclude = includes[0];
      if (!firstInclude) {
        return { url: appendVersion(`${objectUri}/source/main`, version) };
      }
      if (!VALID_CLASS_INCLUDES.has(firstInclude)) {
        return {
          url: appendVersion(`${objectUri}/source/main`, version),
          note: `Unknown class include "${firstInclude}". Valid: ${Array.from(VALID_CLASS_INCLUDES).join(', ')}. Returning main source.`,
        };
      }
      if (includes.length === 1) {
        return {
          url: buildClassIncludeUrl(objectUri, firstInclude, version),
        };
      }
      // Multiple class includes: fetch each and join with `=== inc ===` wrappers.
      return {
        url: buildClassIncludeUrl(objectUri, firstInclude, version),
        note: `Multiple includes requested (${include}); current implementation returns the first include "${firstInclude}". Use separate calls or a single include for precise reads.`,
      };
    }
    if (upperType === 'DDLS' && normalizedInclude === 'elements') {
      return {
        url: appendVersion(`${objectUri}/source/main`, version),
        note: 'include="elements" is not yet supported for DDLS; returning main source.',
      };
    }
    if (upperType === 'FUNC' && normalizedInclude === 'signature') {
      return {
        url: appendVersion(`${objectUri}/source/main`, version),
        note: 'include="signature" is not yet supported for FUNC; returning main source.',
      };
    }
    return {
      url: appendVersion(`${objectUri}/source/main`, version),
      note: `include="${include}" is only supported for CLAS; returning main source.`,
    };
  }

  return { url: appendVersion(`${objectUri}/source/main`, version) };
}

function appendVersion(url: string, version: string | undefined): string {
  if (!version) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}version=${encodeURIComponent(version)}`;
}

export function registerGetSourceTool(
  server: McpServer,
  ctx: ToolContext,
): void {
  server.tool(
    'get_source',
    'Fetch ABAP source code for an object (program, class, interface, etc.) with optional version, include, method-level, or grep filtering.',
    {
      ...sessionOrConnectionShape,
      objectName: z.string().describe('ABAP object name'),
      objectType: z
        .string()
        .optional()
        .describe(
          'Object type (e.g. PROG, CLAS, INTF). Speeds up URI resolution when known.',
        ),
      version: z
        .enum(['active', 'inactive'])
        .optional()
        .default('active')
        .describe(
          'Source version: active (default, last activated) or inactive (unactivated draft).',
        ),
      include: z
        .string()
        .optional()
        .describe(
          'For CLAS: source include such as definitions, implementations, testclasses, macros, or main.',
        ),
      method: z
        .string()
        .optional()
        .describe('For CLAS: method name to read, or "*" to list all methods.'),
      grep: z
        .string()
        .optional()
        .describe(
          'Regex pattern; returns only matching source lines with context instead of full source.',
        ),
      maxBytes: z
        .number()
        .int()
        .positive()
        .max(HARD_MAX_SOURCE_BYTES)
        .optional()
        .describe(
          `Maximum UTF-8 response size in bytes (default ${DEFAULT_MAX_SOURCE_BYTES}, hard cap ${HARD_MAX_SOURCE_BYTES}). Oversized source is rejected, never truncated.`,
        ),
    },
    async (args, extra) => {
      try {
        if (args.grep && args.method) {
          return {
            isError: true,
            content: [
              {
                type: 'text' as const,
                text: 'Do not combine grep with method. Use grep to find code, then method="<name>" to read the full method.',
              },
            ],
          };
        }

        const { client } = await resolveClient(ctx, args, extra ?? {});

        const objectUri = await resolveObjectUri(
          client,
          args.objectName,
          args.objectType,
        );
        if (!objectUri) {
          return {
            isError: true,
            content: [
              {
                type: 'text' as const,
                text: `Object '${args.objectName}' not found`,
              },
            ],
          };
        }

        const { url, note } = buildSourceUrl(
          objectUri,
          args.objectType,
          args.include,
          args.version,
        );

        const maxBytes = args.maxBytes ?? DEFAULT_MAX_SOURCE_BYTES;
        let source: string;
        try {
          source = await client.readTextBounded(url, maxBytes, {
            headers: { Accept: 'text/plain' },
          });
        } catch (error) {
          if (error instanceof AdtResponseTooLargeError) {
            return sourceTooLargeResult(maxBytes);
          }
          throw error;
        }

        if (args.method) {
          const upperType = args.objectType?.toUpperCase();
          if (upperType && upperType !== 'CLAS' && upperType !== 'INTF') {
            return {
              isError: true,
              content: [
                {
                  type: 'text' as const,
                  text: `method is only supported for CLAS/INTF, but objectType was "${args.objectType}"`,
                },
              ],
            };
          }

          if (args.method === '*') {
            const methods = listMethods(source);
            return {
              content: [
                {
                  type: 'text' as const,
                  text: JSON.stringify(
                    {
                      object: args.objectName,
                      methodCount: methods.length,
                      methods,
                      note,
                    },
                    null,
                    2,
                  ),
                },
              ],
            };
          }

          const extracted = extractMethodBlock(source, args.method);
          if (!extracted) {
            return {
              isError: true,
              content: [
                {
                  type: 'text' as const,
                  text: `Method ${args.method} not found in ${args.objectName}`,
                },
              ],
            };
          }

          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify(
                  {
                    object: args.objectName,
                    method: args.method.toUpperCase(),
                    startLine: extracted.startLine,
                    endLine: extracted.endLine,
                    bytes: Buffer.byteLength(extracted.source, 'utf8'),
                    source: extracted.source,
                    note,
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }

        if (args.grep) {
          const grepResult = grepSource(source, args.grep);
          if (grepResult.invalidPattern) {
            return {
              isError: true,
              content: [
                {
                  type: 'text' as const,
                  text: grepResult.invalidPattern,
                },
              ],
            };
          }

          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify(
                  {
                    object: args.objectName,
                    pattern: args.grep,
                    matchCount: grepResult.matchCount,
                    matches: grepResult.matches,
                    note,
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  bytes: Buffer.byteLength(source, 'utf8'),
                  source,
                  version: args.version,
                  include: args.include,
                  note,
                },
                null,
                2,
              ),
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: 'text' as const,
              text: `Get source failed: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    },
  );
}
