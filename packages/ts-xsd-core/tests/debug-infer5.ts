// Step-by-step debug

// Copy the relevant types inline to trace
type SimpleTypeLike = {
  readonly name?: string;
  readonly id?: string;
  readonly annotation?: unknown;
  readonly restriction?: {
    readonly base?: string;
    readonly enumeration?: readonly { value: string }[];
    readonly pattern?: readonly unknown[];
    readonly minLength?: readonly unknown[];
    readonly maxLength?: readonly unknown[];
    readonly minInclusive?: readonly unknown[];
    readonly maxInclusive?: readonly unknown[];
    readonly minExclusive?: readonly unknown[];
    readonly maxExclusive?: readonly unknown[];
    readonly whiteSpace?: readonly unknown[];
    readonly simpleType?: SimpleTypeLike;
  };
  readonly list?: unknown;
  readonly union?: unknown;
};

type FindInArray<Arr, Match> =
  Arr extends readonly [infer First, ...infer Rest]
    ? First extends Match
      ? First
      : FindInArray<Rest, Match>
    : never;

type InferSimpleType<ST extends SimpleTypeLike> =
  ST extends { restriction: { enumeration: readonly { value: infer V }[] } }
    ? V extends string
      ? V
      : string
    : ST extends { restriction: { base: infer Base } }
      ? Base extends string
        ? Base
        : string
      : string;

// Test data
const simpleTypes = [
  {
    name: "OrderStatusType",
    restriction: {
      base: "xs:string",
      enumeration: [
        { value: "pending" },
        { value: "confirmed" },
        { value: "shipped" },
      ],
    },
  },
] as const;

// Step 1: Find the type
type Found = FindInArray<typeof simpleTypes, { name: "OrderStatusType" }>;

// Step 2: Check if it extends SimpleTypeLike
type ExtendsCheck = Found extends SimpleTypeLike ? "yes" : "no";

// Step 3: Infer from it
type Inferred = InferSimpleType<Found>;

// Test
const myTest: Inferred = "pending";
