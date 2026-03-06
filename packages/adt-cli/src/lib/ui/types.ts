/**
 * UI Types
 *
 * Core types for the chalk-based component system.
 */

/**
 * Base building block - anything that renders to lines
 */
export interface Component {
  render(): string[];
}

/**
 * Page is a Component with metadata and print capability
 */
export interface Page extends Component {
  title: string;
  /** Clickable title link (OSC 8 hyperlink) */
  titleLink?: string;
  icon?: string;
  menu?: MenuItem[];
  footer?: string;
  /** Print the full page to console */
  print(): void;
}

/**
 * Menu item for navigation/actions
 */
export interface MenuItem {
  key: string;
  label: string;
  icon?: string;
  href?: string;
  info?: string;
}
