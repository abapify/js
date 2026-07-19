import http from 'node:http';
import {
  createHttpMcpHandler,
  type DestinationContextRegistry,
  type McpInvocationVerifier,
} from '@abapify/adt-mcp';
import { openApiDocument, openApiYaml } from './openapi.js';

export interface DestinationSummary {
  key: string;
  displayName: string;
  systemSids: string[];
  authConfigured: boolean;
  version: number;
}

/** The runtime supplies this from ADT's private broker; it never exposes a connection lease. */
export interface AdtServerOperations {
  listDestinations(): Promise<DestinationSummary[]>;
  listTransports(destination: string): Promise<unknown>;
  searchPackages(destination: string): Promise<unknown>;
  searchObjects(destination: string): Promise<unknown>;
}

/**
 * The only MCP configuration accepted by the shared ADT Server listener.
 * The sidecar always creates an invocation-authenticated handler; callers
 * cannot select a weaker HTTP authentication mode here.
 */
export interface AdtServerMcpOptions {
  invocationVerifier: McpInvocationVerifier;
  /** Ownership transfers to the running server, which shuts it down on close. */
  destinationRegistry: DestinationContextRegistry;
  allowedHosts?: string[];
}

/**
 * Authenticates trusted service-to-service callers of the broker-backed REST
 * compatibility API. The broker credential must never be accepted inbound.
 */
export interface RestServiceAuthorizer {
  authorize(request: http.IncomingMessage): boolean | Promise<boolean>;
}

export interface AdtServerOptions {
  operations: AdtServerOperations;
  host?: string;
  port?: number;
  mcp?: AdtServerMcpOptions;
  restAuthorizer?: RestServiceAuthorizer;
}

export interface RunningAdtServer {
  url: string;
  close(): Promise<void>;
}

export async function startAdtServer(
  options: AdtServerOptions,
): Promise<RunningAdtServer> {
  const host = options.host ?? '127.0.0.1';
  const mcpHandler = options.mcp
    ? createHttpMcpHandler({
        host,
        allowedHosts: options.mcp.allowedHosts,
        authMode: 'invocation',
        invocationVerifier: options.mcp.invocationVerifier,
        destinationServer: {
          destinationRegistry: options.mcp.destinationRegistry,
          // adt-mcp derives identity and access directly from the verified
          // invocation in this mode. These callbacks only satisfy its shared
          // destination-server interface and cannot become another authority.
          requestIdentity: ({ invocation }) => {
            if (!invocation) {
              throw new Error('ADT Server MCP invocation is missing');
            }
            return {
              principal: invocation.principal,
              agentId: invocation.agentId,
            };
          },
          requestAccess: ({ invocation }) =>
            invocation
              ? {
                  classes: invocation.classes,
                  destinationKeys: invocation.destinationKeys,
                }
              : undefined,
        },
      })
    : undefined;

  const server = http.createServer((request, response) => {
    void (async () => {
      const path = (request.url ?? '/').split('?', 1)[0];
      if (mcpHandler && (path === '/mcp' || path === '/mcp/')) {
        await mcpHandler.handle(request, response);
        return;
      }
      if (request.method === 'GET' && path === '/healthz') {
        response.writeHead(200, { 'content-type': 'application/json' });
        response.end(JSON.stringify({ status: 'ok' }));
        return;
      }
      if (request.method === 'GET' && path === '/readyz') {
        response.writeHead(200, { 'content-type': 'application/json' });
        response.end(JSON.stringify({ status: 'ready' }));
        return;
      }
      if (request.method === 'GET' && path === '/openapi.json') {
        response.writeHead(200, { 'content-type': 'application/json' });
        response.end(JSON.stringify(openApiDocument));
        return;
      }
      if (request.method === 'GET' && path === '/openapi.yaml') {
        response.writeHead(200, { 'content-type': 'application/yaml' });
        response.end(openApiYaml());
        return;
      }
      const isDestinationList =
        request.method === 'GET' && path === '/v1/destinations';
      const match =
        /^\/v1\/destinations\/([a-z][a-z0-9-]{1,62})\/(transports|packages|objects)$/u.exec(
          path,
        );
      if (isDestinationList || (request.method === 'GET' && match)) {
        if (!options.restAuthorizer) {
          response.writeHead(404, {
            'content-type': 'application/problem+json',
          });
          response.end(JSON.stringify({ title: 'Not found', status: 404 }));
          return;
        }

        let authorized = false;
        try {
          authorized = await options.restAuthorizer.authorize(request);
        } catch {
          authorized = false;
        }
        if (!authorized) {
          response.writeHead(401, {
            'content-type': 'application/problem+json',
          });
          response.end(JSON.stringify({ title: 'Unauthorized', status: 401 }));
          return;
        }
      }
      if (isDestinationList) {
        response.writeHead(200, { 'content-type': 'application/json' });
        response.end(
          JSON.stringify({ data: await options.operations.listDestinations() }),
        );
        return;
      }
      if (request.method === 'GET' && match) {
        const [, destination, resource] = match;
        const data =
          resource === 'transports'
            ? await options.operations.listTransports(destination)
            : resource === 'packages'
              ? await options.operations.searchPackages(destination)
              : await options.operations.searchObjects(destination);
        response.writeHead(200, { 'content-type': 'application/json' });
        response.end(JSON.stringify(data));
        return;
      }
      response.writeHead(404, { 'content-type': 'application/problem+json' });
      response.end(JSON.stringify({ title: 'Not found', status: 404 }));
    })().catch(() => {
      if (response.headersSent) {
        response.end();
        return;
      }
      response.writeHead(500, { 'content-type': 'application/problem+json' });
      response.end(
        JSON.stringify({ title: 'Internal server error', status: 500 }),
      );
    });
  });

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(options.port ?? 3002, host, () => resolve());
  });

  const address = server.address() as { port: number };
  let closed = false;
  return {
    url: `http://${host}:${address.port}`,
    close: async () => {
      if (closed) return;
      closed = true;
      const listenerClosed = new Promise<void>((resolve) =>
        server.close(() => resolve()),
      );
      try {
        await mcpHandler?.close();
        await options.mcp?.destinationRegistry.shutdown();
      } finally {
        server.closeAllConnections();
        await listenerClosed;
      }
    },
  };
}
