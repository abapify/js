import type { Serializable } from '@abapify/speci/rest';

const COVERAGE_NAMESPACE = 'http://www.sap.com/adt/cov';
const ADT_CORE_NAMESPACE = 'http://www.sap.com/adt/core';
const STATEMENTS_RELATION =
  'http://www.sap.com/adt/relations/runtime/traces/coverage/results/statements';

export const coverageXmlBody = {
  parse: (value: unknown) => String(value),
  build: (value: string) => value,
  _infer: undefined as unknown as string,
} satisfies Serializable<string>;

function escapeXmlAttribute(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

export function buildCoverageQuery(objectUris: string[]): string {
  const objectReferences = objectUris
    .map(
      (uri) =>
        `<adtcore:objectReference adtcore:uri="${escapeXmlAttribute(uri)}"/>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<cov:query xmlns:cov="${COVERAGE_NAMESPACE}">
<adtcore:objectSets xmlns:adtcore="${ADT_CORE_NAMESPACE}">
<objectSet kind="inclusive">
<adtcore:objectReferences>
${objectReferences}
</adtcore:objectReferences>
</objectSet>
</adtcore:objectSets>
</cov:query>`;
}

export function extractCoverageStatementUris(value: unknown): string[] {
  const statementUris: string[] = [];
  const seenUris = new Set<string>();
  const seenValues = new Set<unknown>();
  const queue: unknown[] = [value];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || typeof current !== 'object' || seenValues.has(current)) {
      continue;
    }
    seenValues.add(current);

    const record = current as Record<string, unknown>;
    if (
      record.rel === STATEMENTS_RELATION &&
      typeof record.href === 'string' &&
      !seenUris.has(record.href)
    ) {
      seenUris.add(record.href);
      statementUris.push(record.href);
    }

    for (const child of Object.values(record)) {
      if (Array.isArray(child)) queue.push(...child);
      else if (child && typeof child === 'object') queue.push(child);
    }
  }

  return statementUris;
}

export function buildStatementsBulkRequest(statementUris: string[]): string {
  const requests = statementUris
    .map((uri) => `<statementsRequest get="${escapeXmlAttribute(uri)}"/>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<cov:statementsBulkRequest xmlns:cov="${COVERAGE_NAMESPACE}">
${requests}
</cov:statementsBulkRequest>`;
}
