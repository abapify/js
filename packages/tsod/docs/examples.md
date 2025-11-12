# Examples

## Table of Contents

- [Basic Transformations](#basic-transformations)
- [API Integration](#api-integration)
- [Database Mapping](#database-mapping)
- [XML/JSON Conversion](#xmljson-conversion)
- [Data Normalization](#data-normalization)
- [Advanced Patterns](#advanced-patterns)

## Basic Transformations

### Rename Fields

```typescript
import { Transformer } from 'tsod';

const schema = {
  rules: [
    { from: 'firstName', to: 'given_name' },
    { from: 'lastName', to: 'family_name' }
  ]
};

const transformer = new Transformer(schema);

const person = { firstName: 'John', lastName: 'Doe' };
const result = transformer.forward(person);
// { given_name: 'John', family_name: 'Doe' }

const original = transformer.reverse(result);
// { firstName: 'John', lastName: 'Doe' }
```

### Flatten/Unflatten

```typescript
// Flatten nested structure
const flattenSchema = {
  rules: [
    { from: 'user.name', to: 'user_name' },
    { from: 'user.email', to: 'user_email' },
    { from: 'address.city', to: 'city' },
    { from: 'address.zip', to: 'zip' }
  ]
};

const nested = {
  user: { name: 'John', email: 'john@example.com' },
  address: { city: 'NYC', zip: '10001' }
};

const flat = transformer.forward(nested);
// { user_name: 'John', user_email: 'john@example.com', city: 'NYC', zip: '10001' }
```

## API Integration

### GitHub API → Internal Format

```typescript
const githubTransform = {
  rules: [
    // User fields
    { from: 'login', to: 'username' },
    { from: 'avatar_url', to: 'avatarUrl' },
    { from: 'html_url', to: 'profileUrl' },
    { from: 'type', to: 'accountType' },
    { from: 'site_admin', to: 'isAdmin' },

    // Repositories (array)
    {
      from: 'repositories[]',
      to: 'repos[]',
      rules: [
        { from: 'name', to: 'title' },
        { from: 'full_name', to: 'id' },
        { from: 'stargazers_count', to: 'stars' },
        { from: 'forks_count', to: 'forks' },
        { from: 'html_url', to: 'url' },
        { from: 'description', to: 'summary' }
      ]
    }
  ]
};

const githubData = {
  login: 'octocat',
  avatar_url: 'https://github.com/images/error/octocat_happy.gif',
  html_url: 'https://github.com/octocat',
  type: 'User',
  site_admin: false,
  repositories: [
    {
      name: 'Hello-World',
      full_name: 'octocat/Hello-World',
      stargazers_count: 1234,
      forks_count: 567,
      html_url: 'https://github.com/octocat/Hello-World',
      description: 'My first repository'
    }
  ]
};

const transformer = new Transformer(githubTransform);
const internal = transformer.forward(githubData);
```

### REST API → GraphQL

```typescript
const restToGraphQL = {
  rules: [
    { from: 'user_id', to: 'user.id' },
    { from: 'user_name', to: 'user.name' },
    { from: 'user_email', to: 'user.email' },
    {
      from: 'posts[]',
      to: 'user.posts.edges[]',
      rules: [
        { from: 'post_id', to: 'node.id' },
        { from: 'title', to: 'node.title' },
        { from: 'content', to: 'node.body' },
        { from: 'created_at', to: 'node.createdAt' }
      ]
    }
  ]
};
```

## Database Mapping

### ORM → Domain Model

```typescript
const ormToDomain = {
  rules: [
    // User entity
    { from: 'id', to: 'userId' },
    { from: 'email_address', to: 'email' },
    { from: 'first_name', to: 'profile.firstName' },
    { from: 'last_name', to: 'profile.lastName' },
    { from: 'created_at', to: 'metadata.createdAt' },
    { from: 'updated_at', to: 'metadata.updatedAt' },

    // Orders (one-to-many)
    {
      from: 'orders[]',
      to: 'orderHistory[]',
      rules: [
        { from: 'order_id', to: 'id' },
        { from: 'order_date', to: 'date' },
        { from: 'total_amount', to: 'total' },
        { from: 'status_code', to: 'status' }
      ]
    }
  ]
};
```

### SQL Result → JSON API

```typescript
const sqlToJson = {
  rules: [
    { from: 'customer_id', to: 'id' },
    { from: 'customer_name', to: 'name' },
    { from: 'customer_email', to: 'email' },
    { from: 'customer_phone', to: 'phone' },
    { from: 'order_count', to: 'statistics.totalOrders',
      transform: (v: string) => parseInt(v, 10)
    },
    { from: 'last_order_date', to: 'statistics.lastOrderDate',
      transform: (v: string) => new Date(v).toISOString()
    }
  ]
};
```

## XML/JSON Conversion

### Domain Model → fast-xml-parser Format

```typescript
const xmlSchema = {
  init: (direction) => {
    if (direction === 'forward') {
      return {
        'pak:package': {
          '@_xmlns:pak': 'http://www.sap.com/adt/packages',
          '@_xmlns:adtcore': 'http://www.sap.com/adt/core',
          '@_xmlns:atom': 'http://www.w3.org/2005/Atom'
        }
      };
    }
    return {};
  },
  rules: [
    // Attributes (root level)
    { from: 'name', to: 'pak:package.@_adtcore:name' },
    { from: 'description', to: 'pak:package.@_adtcore:description' },
    { from: 'responsible', to: 'pak:package.@_adtcore:responsible' },
    { from: 'language', to: 'pak:package.@_adtcore:language' },

    // Nested attributes group
    { from: 'attributes.packageType', to: 'pak:package.@_pak:packageType' },
    { from: 'attributes.isEncapsulated', to: 'pak:package.@_pak:isEncapsulated',
      transform: (v: boolean) => String(v),
      reverse: (v: string) => v === 'true'
    },

    // Array of links
    {
      from: 'links[]',
      to: 'pak:package.atom:link[]',
      rules: [
        { from: 'rel', to: '@_rel' },
        { from: 'href', to: '@_href' },
        { from: 'title', to: '@_title' },
        { from: 'type', to: '@_type' }
      ]
    },

    // Nested element with sub-structure
    {
      from: 'superPackage',
      to: 'pak:package.pak:superPackage',
      rules: [
        { from: 'uri', to: '@_adtcore:uri' },
        { from: 'name', to: '@_adtcore:name' },
        { from: 'type', to: '@_adtcore:type' }
      ]
    }
  ]
};

const domainModel = {
  name: '$ABAPGIT_EXAMPLES',
  description: 'Example package',
  responsible: 'DEVELOPER',
  language: 'EN',
  attributes: {
    packageType: 'development',
    isEncapsulated: false
  },
  links: [
    { rel: 'self', href: '/sap/bc/adt/packages/$abapgit_examples' },
    { rel: 'versions', href: 'versions', title: 'Historic versions' }
  ],
  superPackage: {
    uri: '/sap/bc/adt/packages/%24tmp',
    name: '$TMP',
    type: 'DEVC/K'
  }
};

const transformer = new Transformer(xmlSchema);
const fxmlObject = transformer.forward(domainModel);

// Use with fast-xml-parser
import { XMLBuilder } from 'fast-xml-parser';
const builder = new XMLBuilder({ format: true });
const xmlString = builder.build(fxmlObject);
```

## Data Normalization

### Multiple Sources → Unified Format

```typescript
// Normalize data from Stripe, PayPal, Square
const paymentNormalization = {
  rules: [
    // Common fields
    { from: 'id', to: 'transactionId' },
    { from: 'amount', to: 'amount.value',
      transform: (v: number) => v / 100  // Convert cents to dollars
    },
    { from: 'currency', to: 'amount.currency' },
    { from: 'status', to: 'status',
      transform: (v: string) => v.toUpperCase()
    },
    { from: 'created', to: 'timestamp',
      transform: (v: number) => new Date(v * 1000).toISOString()
    },

    // Customer info
    { from: 'customer.name', to: 'customer.fullName' },
    { from: 'customer.email', to: 'customer.email' },

    // Metadata
    { from: 'description', to: 'metadata.description' },
    { from: 'receipt_url', to: 'metadata.receiptUrl' }
  ]
};
```

### Legacy System → Modern API

```typescript
const legacyModernization = {
  rules: [
    // Rename cryptic fields
    { from: 'cst_id', to: 'customerId' },
    { from: 'cst_nm', to: 'customerName' },
    { from: 'addr_ln1', to: 'address.street' },
    { from: 'addr_cty', to: 'address.city' },
    { from: 'addr_st', to: 'address.state' },
    { from: 'addr_zip', to: 'address.postalCode' },

    // Convert legacy date format (YYYYMMDD)
    { from: 'ord_dt', to: 'orderDate',
      transform: (v: string) => {
        const year = v.substring(0, 4);
        const month = v.substring(4, 6);
        const day = v.substring(6, 8);
        return `${year}-${month}-${day}`;
      },
      reverse: (v: string) => v.replace(/-/g, '')
    },

    // Convert status codes
    { from: 'sts_cd', to: 'status',
      transform: (v: string) => {
        const statusMap: Record<string, string> = {
          'A': 'active',
          'P': 'pending',
          'C': 'cancelled',
          'X': 'expired'
        };
        return statusMap[v] || 'unknown';
      }
    }
  ]
};
```

## Advanced Patterns

### Conditional Transformations

```typescript
const conditionalSchema = {
  rules: [
    { from: 'value', to: 'result',
      transform: (value, context) => {
        // Access parent or root for conditional logic
        const parent = context.parent as any;

        if (parent.type === 'currency') {
          return `$${value.toFixed(2)}`;
        } else if (parent.type === 'percentage') {
          return `${(value * 100).toFixed(1)}%`;
        }
        return value;
      }
    }
  ]
};
```

### Deep Merging

```typescript
const deepMerge = {
  init: (direction) => ({
    metadata: {
      version: '1.0',
      transformed: new Date().toISOString()
    }
  }),
  rules: [
    { from: 'data', to: 'data' },
    { from: 'user', to: 'user' }
  ]
};
```

### Array Item Filtering

```typescript
const filterTransform = {
  rules: [
    {
      from: 'items[]',
      to: 'activeItems[]',
      transform: (items: any[]) => {
        return items.filter(item => item.active);
      }
    }
  ]
};
```

### Computed Fields

```typescript
const computedSchema = {
  rules: [
    { from: 'firstName', to: 'firstName' },
    { from: 'lastName', to: 'lastName' },
    {
      from: 'firstName',  // Reuse same source
      to: 'fullName',
      transform: (value, context) => {
        const parent = context.parent as any;
        return `${value} ${parent.lastName}`;
      }
    }
  ]
};
```

### Polymorphic Arrays

```typescript
const polymorphicSchema = {
  rules: [
    {
      from: 'items[]',
      to: 'data[]',
      transform: (item: any) => {
        // Transform based on item type
        if (item.type === 'user') {
          return {
            kind: 'person',
            name: item.name,
            email: item.contact
          };
        } else if (item.type === 'product') {
          return {
            kind: 'item',
            title: item.name,
            price: item.cost
          };
        }
        return item;
      }
    }
  ]
};
```
