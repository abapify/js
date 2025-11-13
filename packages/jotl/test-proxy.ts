import { makeSchemaProxy } from './src/proxy.js';

interface User {
  firstName: string;
  lastName: string;
}

const src = makeSchemaProxy<User>('user');
const schema = {
  first: src.firstName,
  last: src.lastName,
};

console.log('Schema:', JSON.stringify(schema, null, 2));
console.log('Type of first:', typeof schema.first);
console.log('Is function?', typeof schema.first === 'function');
