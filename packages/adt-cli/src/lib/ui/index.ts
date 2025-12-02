/**
 * UI Module
 *
 * Chalk-based component system for CLI output.
 */

// Types
export type { Component, Page, MenuItem } from './types';

// Renderer
export { default as render } from './render';

// Components
export { Field, Section, Box, Text } from './components';

// Pages
export { AdtCorePage, GenericPage } from './pages';
export type { AdtCoreObject, AdtCorePageOptions, Package } from './pages';

// Router
export { router, type Route, type AdtClient } from './router';
export { createGenericPage, type SearchResult } from './routes';
