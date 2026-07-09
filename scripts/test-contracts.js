import fs from 'fs';
import path from 'path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

function findSchemaFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!fullPath.includes('node_modules')) {
        findSchemaFiles(fullPath, fileList);
      }
    } else if (fullPath.endsWith('.schema.json')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const schemasDir = path.join(rootDir, 'packages', 'contracts');
if (!fs.existsSync(schemasDir)) {
  console.log('No schemas directory found.');
  process.exit(0);
}

const schemas = findSchemaFiles(schemasDir);
let hasError = false;

for (const schemaPath of schemas) {
  try {
    const content = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    const validate = ajv.compile(content);
    console.log(`[PASS] Compiled ${path.relative(rootDir, schemaPath)}`);
  } catch (error) {
    console.error(`[FAIL] ${path.relative(rootDir, schemaPath)}: ${error.message}`);
    hasError = true;
  }
}

if (hasError) {
  console.error('\nSome contract schemas failed validation.');
  process.exit(1);
} else {
  console.log('\nAll contract schemas are valid.');
}
