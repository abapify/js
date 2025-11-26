/**
 * Register the XSD loader hooks
 * 
 * Usage:
 *   node --import ts-xsd/register ./app.ts
 */

import { register } from 'node:module';

register('./loader.js', import.meta.url);
