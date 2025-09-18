// Export parser wrapper functions for flexible XML generation
export {
  $attr, // Convert to fast-xml-parser format: adtcore:name → @_adtcore:name
  $elem, // Element format (passthrough)
  $clean, // Convert from parser format back to clean namespaces
} from './parser-wrappers.js';
