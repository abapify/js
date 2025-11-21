// Content-type registry
export {
  registerSchema,
  getSchemaByContentType,
  getAllContentTypes,
  hasSchema,
  type SchemaAdapter,
} from './registry';

// Content-type constants
export { ADT_CONTENT_TYPES, type AdtContentType } from './content-types';
