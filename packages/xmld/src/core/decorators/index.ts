/**
 * Core decorators for xmld - Re-exports from individual decorator files
 * This provides a clean separation of concerns while maintaining the same public API
 */

export { xmld, xml } from './xml'; // xmld is our signature decorator! 🎯
export { root } from './root';
export { element, type ElementOptions } from './element';
export { attribute } from './attribute';
export { unwrap } from './unwrap';
export { namespace } from './namespace';
