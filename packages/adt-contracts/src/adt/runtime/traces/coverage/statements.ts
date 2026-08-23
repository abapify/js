/**
 * /sap/bc/adt/runtime/traces/coverage/results/{id}/statements
 *
 * POST returns the cov:statementsBulkResponse with per-method statement
 * / branch / procedure coverage details.
 *
 * Content-Type: application/xml+scov
 */

import { http, contract } from '../../../../base';
import { acoverageStatements } from '../../../../schemas';
import { coverageXmlBody } from './request';

const SCOV_CONTENT_TYPE = 'application/xml+scov';

export const statements = contract({
  /**
   * POST /sap/bc/adt/runtime/traces/coverage/results/{identifier}/statements
   */
  post: (identifier: string) =>
    http.post(
      `/sap/bc/adt/runtime/traces/coverage/results/${identifier}/statements`,
      {
        body: coverageXmlBody,
        responses: { 200: acoverageStatements },
        headers: {
          Accept: SCOV_CONTENT_TYPE,
          'Content-Type': 'application/xml',
        },
      },
    ),
});

export type StatementsContract = typeof statements;
