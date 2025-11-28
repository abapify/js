/**
 * Built-in generators for ts-xsd
 */

// Export factory functions (preferred)
export { raw, type RawOptions } from './raw';
export { factory, type FactoryOptions } from './factory';

// Export default instances for backward compatibility
export { default as rawGenerator } from './raw';
export { default as factoryGenerator } from './factory';

// Re-export types
export type { Generator, GeneratorContext, SchemaData, SchemaImport } from '../codegen/generator';
