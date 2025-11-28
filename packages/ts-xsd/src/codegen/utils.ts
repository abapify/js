/**
 * XML DOM utilities for codegen
 */

import type { XmlElement } from './types';

/**
 * Find first child element by local name
 */
export function findChild(parent: XmlElement, localName: string): XmlElement | null {
  const children = parent.childNodes;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.nodeType === 1) {
      const childLocalName = child.localName || child.tagName.split(':').pop();
      if (childLocalName === localName) {
        return child;
      }
    }
  }
  return null;
}

/**
 * Find all child elements by local name
 */
export function findChildren(parent: XmlElement, localName: string): XmlElement[] {
  const result: XmlElement[] = [];
  const children = parent.childNodes;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.nodeType === 1) {
      const childLocalName = child.localName || child.tagName.split(':').pop();
      if (childLocalName === localName) {
        result.push(child);
      }
    }
  }
  return result;
}

/**
 * Extract prefix from namespace URL
 */
export function extractPrefix(namespace: string | undefined): string {
  if (!namespace) return 'ns';

  const parts = namespace.split('/');
  const last = parts[parts.length - 1];

  if (last.length <= 10 && /^[a-z]+$/i.test(last)) {
    return last.toLowerCase();
  }

  return 'ns';
}
