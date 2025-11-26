/**
 * /sap/bc/adt/cts/transports
 * @source transports.json
 * 
 * NOTE: This endpoint is for POST operations (creating transports), NOT for searching.
 * Discovery shows only POST accepts:
 * - application/vnd.sap.as+xml;charset=utf-8;dataname=com.sap.adt.transport.service.checkData
 * - application/vnd.sap.as+xml; charset=UTF-8; dataname=com.sap.adt.CreateCorrectionRequest
 * 
 * For searching transports, use /sap/bc/adt/cts/transportrequests instead.
 * 
 * TODO: Implement POST method for transport creation when needed.
 */

// import { http } from 'speci/rest';

// Commented out - GET returns empty, endpoint is for POST operations only
// export const transports = {
//   get: (params?: {
//     owner?: string;
//     transportNumber?: string;
//     searchFor?: string;
//     requestType?: string;
//     requestStatus?: string;
//     taskType?: string;
//     taskStatus?: string;
//     fromDate?: string;
//     toDate?: string;
//   }) =>
//     http.get('/sap/bc/adt/cts/transports', {
//       query: params,
//       responses: { 200: undefined as unknown as string },
//       headers: { Accept: '*/*' },
//     }),
// };

export const transports = {};
