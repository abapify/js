import type { AdtClient } from '@abapify/adt-client';
import type { Changeset } from './changeset.js';

export interface RequestIdentity {
  principal: string;
  agentId?: string;
}

/** Private lease material is deliberately opaque to MCP and REST handlers. */
export interface DestinationLease {
  destination: string;
  expiresAt: number;
  version: number;
  /**
   * Private broker material. It is deliberately opaque and is only passed to
   * the context factory inside this process; MCP/REST handlers never receive
   * or serialise it.
   */
  material: unknown;
  /** Idempotent broker/secret cleanup. */
  release(): Promise<void>;
}

export interface DestinationLeaseProvider {
  acquire(input: {
    destination: string;
    identity: RequestIdentity;
  }): Promise<DestinationLease>;
}

export interface DestinationContext {
  mcpSessionId: string;
  destination: string;
  lease: DestinationLease;
  client: AdtClient;
  locks: Set<string>;
  changeset?: Changeset;
  createdAt: number;
  lastUsedAt: number;
  /** Serialise mutation work for this context without blocking other keys. */
  runExclusive<T>(operation: () => Promise<T>): Promise<T>;
  close(): Promise<void>;
}

export interface DestinationContextFactory {
  create(input: {
    mcpSessionId: string;
    destination: string;
    lease: DestinationLease;
  }): Promise<{
    client: AdtClient;
    locks?: Set<string>;
    changeset?: Changeset;
    close(): Promise<void>;
  }>;
}

export interface DestinationContextRegistry {
  get(
    mcpSessionId: string,
    destination: string,
  ): DestinationContext | undefined;
  getOrCreate(
    mcpSessionId: string,
    destination: string,
    identity: RequestIdentity,
  ): Promise<DestinationContext>;
  touch(mcpSessionId: string, destination: string): void;
  release(mcpSessionId: string, destination: string): Promise<void>;
  releaseAll(mcpSessionId: string): Promise<void>;
  list(): DestinationContext[];
  shutdown(): Promise<void>;
}

export interface DestinationContextRegistryOptions {
  leaseProvider: DestinationLeaseProvider;
  contextFactory: DestinationContextFactory;
  ttlMs?: number;
  sweepIntervalMs?: number;
  now?: () => number;
}

const DEFAULT_TTL_MS = 30 * 60 * 1000;

function contextKey(mcpSessionId: string, destination: string): string {
  return `${mcpSessionId}\u0000${destination}`;
}

function createSerialiser(): DestinationContext['runExclusive'] {
  let tail: Promise<void> = Promise.resolve();
  return async <T>(operation: () => Promise<T>): Promise<T> => {
    const previous = tail;
    let release: () => void = () => undefined;
    tail = new Promise<void>((resolve) => {
      release = resolve;
    });
    await previous;
    try {
      return await operation();
    } finally {
      release();
    }
  };
}

export function createDestinationContextRegistry(
  options: DestinationContextRegistryOptions,
): DestinationContextRegistry {
  const now = options.now ?? Date.now;
  const ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;
  const contexts = new Map<string, DestinationContext>();
  const pending = new Map<string, Promise<DestinationContext>>();
  let sweepTimer: NodeJS.Timeout | undefined;
  let stopped = false;

  const closeOnce = (close: () => Promise<void>): (() => Promise<void>) => {
    let closed = false;
    return async () => {
      if (closed) return;
      closed = true;
      await close();
    };
  };

  const registry: DestinationContextRegistry = {
    get(mcpSessionId, destination) {
      return contexts.get(contextKey(mcpSessionId, destination));
    },
    async getOrCreate(mcpSessionId, destination, identity) {
      if (stopped) throw new Error('Destination context registry is shut down');
      const key = contextKey(mcpSessionId, destination);
      const existing = contexts.get(key);
      if (existing) {
        if (existing.lease.expiresAt <= now()) {
          await registry.release(mcpSessionId, destination);
          return await registry.getOrCreate(
            mcpSessionId,
            destination,
            identity,
          );
        }
        existing.lastUsedAt = now();
        return existing;
      }
      const inFlight = pending.get(key);
      if (inFlight) return await inFlight;

      const creating = (async () => {
        const lease = await options.leaseProvider.acquire({
          destination,
          identity,
        });
        if (lease.destination !== destination) {
          await lease.release().catch(() => undefined);
          throw new Error(
            'Destination lease did not match the requested destination',
          );
        }
        let created: Awaited<ReturnType<DestinationContextFactory['create']>>;
        try {
          created = await options.contextFactory.create({
            mcpSessionId,
            destination,
            lease,
          });
        } catch (error) {
          await lease.release().catch(() => undefined);
          throw error;
        }
        const timestamp = now();
        const runExclusive = createSerialiser();
        const context: DestinationContext = {
          mcpSessionId,
          destination,
          lease,
          client: created.client,
          locks: created.locks ?? new Set<string>(),
          ...(created.changeset ? { changeset: created.changeset } : {}),
          createdAt: timestamp,
          lastUsedAt: timestamp,
          runExclusive,
          close: closeOnce(async () => {
            await runExclusive(async () => {
              try {
                await created.close();
              } finally {
                await lease.release();
              }
            });
          }),
        };
        if (stopped) {
          await context.close().catch(() => undefined);
          throw new Error('Destination context registry is shut down');
        }
        contexts.set(key, context);
        return context;
      })();
      pending.set(key, creating);
      try {
        return await creating;
      } finally {
        pending.delete(key);
      }
    },
    touch(mcpSessionId, destination) {
      const context = contexts.get(contextKey(mcpSessionId, destination));
      if (context) context.lastUsedAt = now();
    },
    async release(mcpSessionId, destination) {
      const key = contextKey(mcpSessionId, destination);
      const creating = pending.get(key);
      if (creating) {
        await creating.catch(() => undefined);
      }
      const context = contexts.get(key);
      if (!context) return;
      contexts.delete(key);
      try {
        await context.close();
      } catch {
        // Teardown is best-effort; other destination contexts must still close.
      }
    },
    async releaseAll(mcpSessionId) {
      const prefix = `${mcpSessionId}\u0000`;
      const destinations = new Set([
        ...Array.from(contexts.values())
          .filter((context) => context.mcpSessionId === mcpSessionId)
          .map((context) => context.destination),
        ...Array.from(pending.keys())
          .filter((key) => key.startsWith(prefix))
          .map((key) => key.slice(prefix.length)),
      ]);
      await Promise.allSettled(
        Array.from(destinations, (destination) =>
          registry.release(mcpSessionId, destination),
        ),
      );
    },
    list() {
      return Array.from(contexts.values());
    },
    async shutdown() {
      stopped = true;
      if (sweepTimer) {
        clearInterval(sweepTimer);
        sweepTimer = undefined;
      }
      await Promise.allSettled(
        Array.from(
          new Set(registry.list().map((context) => context.mcpSessionId)),
        ).map((sessionId) => registry.releaseAll(sessionId)),
      );
    },
  };

  if (ttlMs > 0) {
    const interval =
      options.sweepIntervalMs ?? Math.min(Math.floor(ttlMs / 4), 60_000);
    sweepTimer = setInterval(
      () => {
        const cutoff = now() - ttlMs;
        for (const context of contexts.values()) {
          if (context.lastUsedAt < cutoff) {
            void registry.release(context.mcpSessionId, context.destination);
          }
        }
      },
      Math.max(1_000, interval),
    );
    sweepTimer.unref?.();
  }

  return registry;
}
