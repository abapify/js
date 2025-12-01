/**
 * ADT TUI - Terminal UI Framework
 *
 * Page-based navigation with Ink for ADT APIs.
 * Pages return PageResult, framework handles rendering.
 */

// Main entry point
export { run, type RunOptions } from './run';
export { App, type AppProps } from './App';

// Main component
export { Navigator } from './Navigator';

// Framework renderer
export { PageRenderer } from './lib/PageRenderer';

// Context
export { NavigationProvider, useNavigation } from './lib/context';

// Parser
export { parseResponse, getActionName, categorizeLinks } from './lib/parser';

// Pages
export { genericPage } from './pages';

// Types
export type {
  HypermediaLink,
  ParsedResponse,
  NavigationEntry,
  FetchFn,
  PageProps,
  PageResult,
  MenuItem,
  PageComponent,
  Route,
} from './lib/types';
