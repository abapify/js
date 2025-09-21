/**
 * Core decorator implementations for xmld
 * Following the minimalistic API: @xmld, @root, @element, @attribute, @unwrap, @namespace
 *
 * This file now serves as a re-export facade for the individual decorator files
 * located in the ./decorators/ directory for better separation of concerns.
 */

// Re-export all decorators from individual files
export { xmld, xml } from './decorators/xml'; // xmld is our signature! 🎯
export { root } from './decorators/root';
export { element } from './decorators/element';
export { attribute } from './decorators/attribute';
export { attributes } from './decorators/attributes'; // Convenience shortcut for @unwrap @attribute
export { unwrap } from './decorators/unwrap';
export { namespace } from './decorators/namespace';
