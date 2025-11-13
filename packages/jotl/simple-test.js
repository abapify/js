import { makeSchemaProxy, transform, isSchemaProxy } from './src/index.ts';

const src = makeSchemaProxy('user');
const proxy = src.firstName;

console.log('isSchemaProxy:', isSchemaProxy(proxy));
console.log('typeof proxy:', typeof proxy);

const schema = {
  first: proxy
};

console.log('Schema:', schema);

const source = { firstName: 'John', lastName: 'Doe' };
const result = transform(source, schema);

console.log('Result:', result);
