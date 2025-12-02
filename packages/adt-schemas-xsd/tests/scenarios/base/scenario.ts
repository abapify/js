import type { FixtureHandle } from 'adt-fixtures';
import type { InferSchema, Serializable } from 'speci/rest';

/** Schema with parse/build methods and type inference */
export type TestableSchema<T = unknown> = Serializable<T>;

/** Extract the inferred type from a schema */
export type SchemaType<S> = InferSchema<S>;

/**
 * Base class for schema-specific test scenarios.
 * Generic parameter S is the schema type for full type inference.
 */
export abstract class Scenario<S extends TestableSchema = TestableSchema> {
  abstract readonly schema: S;
  /** Fixture handles from adt-fixtures */
  abstract readonly fixtures: FixtureHandle[];
  
  /** Validate parsed object - fully typed */
  abstract validateParsed(parsed: SchemaType<S>): void;
  
  /** Optional: Validate built XML */
  validateBuilt?(xml: string): void;
}