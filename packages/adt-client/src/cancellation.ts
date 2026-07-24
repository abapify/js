import { AsyncLocalStorage } from 'node:async_hooks';

const adtAbortSignal = new AsyncLocalStorage<AbortSignal>();

/**
 * Runs an ADT operation with an execution-scoped abort signal. Async local
 * storage keeps concurrent clients and invocations isolated without mutating
 * shared client state.
 */
export async function runWithAdtAbortSignal<T>(
  signal: AbortSignal,
  operation: () => Promise<T>,
): Promise<T> {
  signal.throwIfAborted();
  return await adtAbortSignal.run(signal, operation);
}

export function activeAdtAbortSignal(): AbortSignal | undefined {
  return adtAbortSignal.getStore();
}
