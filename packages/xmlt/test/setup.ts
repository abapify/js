import { rmSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Clean test output directory before running tests
const outputDir = join(__dirname, 'output');
rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });
