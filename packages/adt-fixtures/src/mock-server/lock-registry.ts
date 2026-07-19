/**
 * In-memory lock registry for the mock ADT server.
 *
 * Tracks active locks per objectUri so that ADT integration tests observe
 * the same non-reentrant behavior as SAP: a second LOCK is rejected until
 * the holder releases its original handle.
 */

import { randomBytes } from 'node:crypto';

export interface LockEntry {
  handle: string;
  objectUri: string;
  createdAt: number;
}

export class LockRegistry {
  private readonly locks = new Map<string, LockEntry>();

  /** Acquire a lock for an objectUri; reject a concurrent/reentrant lock. */
  lock(objectUri: string): LockEntry {
    if (this.locks.has(objectUri)) {
      throw new Error(`Object ${objectUri} is already locked in request`);
    }
    const handle = `MOCK_LOCK_${randomBytes(8).toString('hex').toUpperCase()}`;
    const entry: LockEntry = {
      handle,
      objectUri,
      createdAt: Date.now(),
    };
    this.locks.set(objectUri, entry);
    return entry;
  }

  /**
   * Release a lock. This remains idempotent so cleanup code can safely
   * release an already-expired lock; the lock acquisition path is strict.
   */
  unlock(objectUri: string, _handle: string | undefined): boolean {
    this.locks.delete(objectUri);
    return true;
  }

  /** Get the active lock for an objectUri, if any. */
  get(objectUri: string): LockEntry | undefined {
    return this.locks.get(objectUri);
  }

  /** Clear all locks (for test teardown). */
  clear(): void {
    this.locks.clear();
  }
}
