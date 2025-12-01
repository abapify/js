/**
 * URL Router
 *
 * Matches URLs to page components.
 */

import type { Route, PageProps } from './types';
import type { ComponentType } from 'react';

/**
 * Router class for URL pattern matching
 */
export class Router {
  private routes: Route[] = [];
  private fallback: ComponentType<PageProps> | null = null;

  /**
   * Register a route
   */
  register(route: Route): this {
    this.routes.push(route);
    return this;
  }

  /**
   * Set fallback component for unmatched routes
   */
  setFallback(component: ComponentType<PageProps>): this {
    this.fallback = component;
    return this;
  }

  /**
   * Match URL to a route
   */
  match(url: string): { component: ComponentType<PageProps>; name?: string } | null {
    for (const route of this.routes) {
      if (typeof route.pattern === 'string') {
        if (url === route.pattern || url.startsWith(route.pattern)) {
          return { component: route.component, name: route.name };
        }
      } else if (route.pattern.test(url)) {
        return { component: route.component, name: route.name };
      }
    }

    if (this.fallback) {
      return { component: this.fallback, name: 'fallback' };
    }

    return null;
  }

  /**
   * List all registered routes
   */
  listRoutes(): Array<{ pattern: string; name?: string }> {
    return this.routes.map((r) => ({
      pattern: r.pattern instanceof RegExp ? r.pattern.source : r.pattern,
      name: r.name,
    }));
  }
}

/**
 * Create a new router instance
 */
export function createRouter(): Router {
  return new Router();
}
