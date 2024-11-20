export type uuid = string;
export type timestamp = Date;

type Many<T> = Record<string, T>;

export interface relationship {
  guid: string;
}

export type relationships = Many<relationship>;

export interface to_one_relationship {
  data: relationship;
}

export type labels = Many<string>;
export type annotations = Many<string>;
export type links = Many<string>;

export interface metadata {
  labels: labels;
  annotations: annotations;
}

export type PaginatedResponse<T> = {
  pagination: {
    total_results: number;
    total_pages: number;
    first: {
      href: string;
    };
    last: {
      href: string;
    };
    next: {
      href: string;
    };
    previous?: {
      href: string;
    };
  };
  resources: T[];
};

type ArrayToUnion<T extends readonly string[]> = T[number];
export type AllowedFields<T extends Record<string, ReadonlyArray<string>>> = {
  [K in keyof T]?: Array<ArrayToUnion<T[K]>>;
};
