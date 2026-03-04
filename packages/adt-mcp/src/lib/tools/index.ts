/**
 * Tool registry – wires every MCP tool into the server.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ToolContext } from '../types.js';
import { registerDiscoveryTool } from './discovery.js';
import { registerSystemInfoTool } from './system-info.js';
import { registerSearchObjectsTool } from './search-objects.js';
import { registerGetObjectTool } from './get-object.js';
import { registerCtsListTransportsTool } from './cts-list-transports.js';
import { registerCtsGetTransportTool } from './cts-get-transport.js';
import { registerCtsCreateTransportTool } from './cts-create-transport.js';
import { registerCtsReleaseTransportTool } from './cts-release-transport.js';
import { registerCtsDeleteTransportTool } from './cts-delete-transport.js';
import { registerAtcRunTool } from './atc-run.js';

export function registerTools(server: McpServer, ctx: ToolContext): void {
  registerDiscoveryTool(server, ctx);
  registerSystemInfoTool(server, ctx);
  registerSearchObjectsTool(server, ctx);
  registerGetObjectTool(server, ctx);
  registerCtsListTransportsTool(server, ctx);
  registerCtsGetTransportTool(server, ctx);
  registerCtsCreateTransportTool(server, ctx);
  registerCtsReleaseTransportTool(server, ctx);
  registerCtsDeleteTransportTool(server, ctx);
  registerAtcRunTool(server, ctx);
}
