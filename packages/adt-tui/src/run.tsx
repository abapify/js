/**
 * Run TUI Application
 *
 * Helper to render the TUI and wait for exit.
 */

import React from 'react';
import { render } from 'ink';
import { App } from './App';
import type { FetchFn } from './lib/types';
import type { Router } from './lib/router';

export interface RunOptions {
  /** Optional starting URL - if not provided, shows prompt */
  startUrl?: string;
  /** Fetch function for making HTTP requests */
  fetch: FetchFn;
  /** Optional custom router */
  router?: Router;
  /** SAP system name for ADT links (e.g., 'S0D', 'NPL') */
  systemName?: string;
  /** Called when app exits */
  onExit?: () => void;
}

/**
 * Run the TUI application
 *
 * @returns Promise that resolves when the app exits
 */
export async function run(options: RunOptions): Promise<void> {
  const { onExit, ...appProps } = options;

  // Clear terminal on start
  console.clear();

  const { waitUntilExit, clear } = render(<App {...appProps} />);

  await waitUntilExit();

  // Cleanup
  clear();
  onExit?.();
}
