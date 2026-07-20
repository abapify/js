/**
 * Registration-time schema guard for the shared ADT Server mode.
 *
 * Tool implementations stay reusable with the legacy CLI/stdio transport:
 * this wrapper changes only their public input contract. The common resolver
 * then turns `destination` into the matching isolated context.
 */

import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import type {
  McpServer,
  RegisteredTool,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import { ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import {
  actionClassesForMcpTool,
  assertMcpToolIsClassified,
  isMcpDestinationAllowed,
  isMcpToolAllowed,
  isMcpToolResourceAllowed,
  isMcpToolListed,
  type McpOperationClass,
  type McpRequestAccess,
} from './scope-catalogue.js';

const destination = z
  .string()
  .regex(/^[a-z][a-z0-9-]{1,62}$/u)
  .describe('ADT-managed destination key');

const forbiddenConnectionFields = {
  baseUrl: z.never().optional(),
  client: z.never().optional(),
  username: z.never().optional(),
  password: z.never().optional(),
  systemId: z.never().optional(),
};

function destinationSchema(raw: unknown): Record<string, unknown> {
  const input = raw && typeof raw === 'object' ? raw : {};
  const schema = { ...(input as Record<string, unknown>) };
  // Explicit `never` fields reject rather than silently strip unsafe input.
  for (const field of Object.keys(forbiddenConnectionFields))
    delete schema[field];
  return { ...schema, ...forbiddenConnectionFields, destination };
}

/**
 * `McpServer.tool` accepts only a raw shape and therefore creates a
 * strip-unknown Zod object. ATC has a retired `objectUri` field that must be
 * both absent from the public schema and rejected if supplied, so it is
 * registered through the strict-schema API below.
 */
function strictAtcDestinationSchema(raw: unknown) {
  const schema = destinationSchema(raw);
  delete schema.objectUri;
  return z.object(schema as z.ZodRawShape).strict();
}

type Handler = (...handlerArgs: unknown[]) => unknown;

export interface DestinationModeOptions {
  /**
   * Resolves trusted access for each dispatch. It receives MCP transport
   * context only; tool arguments cannot select or expand a class.
   */
  requestAccess?: (extra: {
    sessionId?: string;
  }) => McpRequestAccess | undefined;
}

type DestinationToolListEntry = {
  name: string;
  description?: string;
  inputSchema: Record<string, unknown>;
};

const destinationToolInventories = new WeakMap<
  McpServer,
  Map<string, DestinationToolListEntry>
>();

function scopeDeniedResult() {
  return {
    isError: true as const,
    content: [{ type: 'text' as const, text: 'mcp_scope_denied' }],
  };
}

function toolListEntry(
  name: string,
  tool: RegisteredTool,
): DestinationToolListEntry {
  if (!tool.inputSchema) {
    throw new Error(`MCP tool ${name} must declare an input schema`);
  }
  return {
    name,
    ...(tool.description ? { description: tool.description } : {}),
    inputSchema: zodToJsonSchema(tool.inputSchema, {
      strictUnions: true,
      pipeStrategy: 'input',
    }) as Record<string, unknown>,
  };
}

type ActionSchemaProjection = {
  actionClasses: Readonly<Record<string, McpOperationClass>>;
  actionSchema: Record<string, unknown>;
  properties: Record<string, unknown>;
};

/**
 * Validates that a mixed-action tool's public action enum exactly matches the
 * catalogue. This makes an unclassified new action fail closed at startup.
 */
function actionSchemaProjection(
  name: string,
  inputSchema: Record<string, unknown>,
): ActionSchemaProjection | undefined {
  const actionClasses = actionClassesForMcpTool(name);
  if (!actionClasses) return undefined;

  const properties = inputSchema.properties;
  const actionSchema =
    properties && typeof properties === 'object' && !Array.isArray(properties)
      ? (properties as Record<string, unknown>).action
      : undefined;
  const actionEnum =
    actionSchema &&
    typeof actionSchema === 'object' &&
    !Array.isArray(actionSchema)
      ? (actionSchema as Record<string, unknown>).enum
      : undefined;
  const catalogueActions = Object.keys(actionClasses);

  if (
    !Array.isArray(actionEnum) ||
    actionEnum.length !== catalogueActions.length ||
    new Set(actionEnum).size !== actionEnum.length ||
    !actionEnum.every(
      (action) =>
        typeof action === 'string' &&
        Object.prototype.hasOwnProperty.call(actionClasses, action),
    )
  ) {
    throw new Error(
      `MCP tool ${name} action schema does not match its scope catalogue`,
    );
  }

  return {
    actionClasses,
    actionSchema: actionSchema as Record<string, unknown>,
    properties: properties as Record<string, unknown>,
  };
}

function toolListEntryForAccess(
  tool: DestinationToolListEntry,
  access: McpRequestAccess | undefined,
): DestinationToolListEntry {
  const projection = actionSchemaProjection(tool.name, tool.inputSchema);
  if (!projection) return tool;

  const visibleActions = Object.entries(projection.actionClasses)
    .filter(([, operationClass]) => access?.classes.includes(operationClass))
    .map(([action]) => action);

  return {
    ...tool,
    inputSchema: {
      ...tool.inputSchema,
      properties: {
        ...projection.properties,
        action: { ...projection.actionSchema, enum: visibleActions },
      },
    },
  };
}

/**
 * View of an MCP server that rewrites every registered ADT tool schema to the
 * safe destination contract. All current registered tools are SAP-facing;
 * infrastructure-only tools must be registered directly on the original
 * server when introduced.
 */
export function destinationModeServer(
  server: McpServer,
  options: DestinationModeOptions = {},
): McpServer {
  const inventory = new Map<string, DestinationToolListEntry>();
  destinationToolInventories.set(server, inventory);
  return new Proxy(server, {
    get(target, property, receiver) {
      if (property !== 'tool') return Reflect.get(target, property, receiver);
      return (...args: unknown[]) => {
        const name = args[0];
        if (typeof name !== 'string') {
          throw new Error('MCP tools must declare a string name');
        }
        assertMcpToolIsClassified(name);
        const supportsStrictAtcSchema =
          typeof (target as unknown as { registerTool?: unknown })
            .registerTool === 'function';
        let atcInputSchema:
          | ReturnType<typeof strictAtcDestinationSchema>
          | undefined;
        // Existing registrations consistently use
        // tool(name, description, inputSchema, handler).
        if (typeof args[1] === 'string' && args.length >= 4) {
          if (name === 'atc_run') {
            atcInputSchema = strictAtcDestinationSchema(args[2]);
          } else {
            args[2] = destinationSchema(args[2]);
          }
        } else if (args.length >= 3) {
          if (name === 'atc_run') {
            atcInputSchema = strictAtcDestinationSchema(args[1]);
          } else {
            args[1] = destinationSchema(args[1]);
          }
        }
        if (name === 'atc_run' && !supportsStrictAtcSchema) {
          if (typeof args[1] === 'string' && args.length >= 4) {
            args[2] = destinationSchema(args[2]);
          } else if (args.length >= 3) {
            args[1] = destinationSchema(args[1]);
          }
        }

        const handlerIndex = args.length - 1;
        const handler = args[handlerIndex];
        if (typeof handler !== 'function') {
          throw new Error(`MCP tool ${name} must declare a handler`);
        }
        args[handlerIndex] = async (...handlerArgs: unknown[]) => {
          const toolArguments =
            handlerArgs[0] && typeof handlerArgs[0] === 'object'
              ? (handlerArgs[0] as Record<string, unknown>)
              : {};
          const extra =
            handlerArgs[1] && typeof handlerArgs[1] === 'object'
              ? (handlerArgs[1] as { sessionId?: string })
              : {};
          let access: McpRequestAccess | undefined;
          try {
            access = options.requestAccess?.(extra);
          } catch {
            return scopeDeniedResult();
          }
          if (
            !isMcpToolAllowed(access, name, toolArguments) ||
            !isMcpToolResourceAllowed(access, name, toolArguments) ||
            !isMcpDestinationAllowed(access, toolArguments.destination)
          ) {
            return scopeDeniedResult();
          }
          return await (handler as Handler)(...handlerArgs);
        };
        const registeredTool =
          name === 'atc_run' && supportsStrictAtcSchema
            ? target.registerTool(
                name,
                {
                  ...(typeof args[1] === 'string'
                    ? { description: args[1] }
                    : {}),
                  inputSchema: atcInputSchema!,
                },
                args[handlerIndex] as never,
              )
            : Reflect.apply(target.tool, target, args);
        if (!registeredTool) return registeredTool;
        const entry = toolListEntry(name, registeredTool);
        actionSchemaProjection(name, entry.inputSchema);
        inventory.set(name, entry);
        return registeredTool;
      };
    },
  }) as McpServer;
}

/**
 * Replaces the SDK's all-tools handler after registration with a session-aware
 * view. The authoritative SDK registry is left intact so hidden tools retain
 * their normal handler and can return `mcp_scope_denied` on direct calls.
 */
export function installDestinationModeToolListProjection(
  server: McpServer,
  options: DestinationModeOptions = {},
): void {
  const inventory = destinationToolInventories.get(server);
  if (!inventory) {
    throw new Error('Destination MCP tool inventory is not initialized');
  }
  server.server.setRequestHandler(ListToolsRequestSchema, (_request, extra) => {
    let access: McpRequestAccess | undefined;
    try {
      access = options.requestAccess?.({ sessionId: extra.sessionId });
    } catch {
      access = undefined;
    }
    return {
      tools: Array.from(inventory.values())
        .filter((tool) => isMcpToolListed(access, tool.name))
        .map((tool) => toolListEntryForAccess(tool, access)),
    };
  });
}
