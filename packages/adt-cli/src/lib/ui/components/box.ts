/**
 * Box Component
 *
 * Vertical stack of components.
 */

import type { Component } from '../types';

export default function Box(...children: Component[]): Component {
  return {
    render: () => children.flatMap((c) => c.render()),
  };
}
