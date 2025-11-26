/**
 * ADT CTS (Change and Transport System) Contracts
 * 
 * Structure mirrors URL tree:
 * - /sap/bc/adt/cts/transportrequests → cts.transportrequests
 * - /sap/bc/adt/cts/transports → cts.transports
 * - /sap/bc/adt/cts/transportchecks → cts.transportchecks
 * 
 * Based on collections in: e2e/adt-codegen/generated/collections/sap/bc/adt/cts/
 */

import { transportrequests } from './transportrequests';
import { transports } from './transports';
import { transportchecks } from './transportchecks';

export const ctsContract = {
  transportrequests,
  transports,
  transportchecks,
};

export type CtsContract = typeof ctsContract;
