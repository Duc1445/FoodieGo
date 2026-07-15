import fs from 'fs';
import path from 'path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const ajv = new Ajv({ allErrors: true, strict: false, loadSchema: loadSchemaFile });
addFormats(ajv);

async function loadSchemaFile(uri) {
  // Handle both absolute URLs and relative paths
  let filePath;
  if (uri.startsWith('https://foodiego.com/schemas/')) {
    // Convert foodiego schema URLs to local file paths
    const schemaPath = uri.replace('https://foodiego.com/schemas/common/', '');
    filePath = path.join(rootDir, 'packages', 'contracts', 'events', 'common', schemaPath);
  } else if (uri.startsWith('./')) {
    // Relative path from current schema file - resolve against contracts/events/common
    filePath = path.join(rootDir, 'packages', 'contracts', 'events', 'common', uri.substring(2));
  } else {
    filePath = path.resolve(rootDir, uri);
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    throw new Error(`Failed to load schema from ${filePath}: ${err.message}`);
  }
}

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
    // Compile with async to handle schema loading
    ajv.compileAsync(content).then(validate => {
      console.log(`[PASS] Compiled ${path.relative(rootDir, schemaPath)}`);
    }).catch(error => {
      console.error(`[FAIL] ${path.relative(rootDir, schemaPath)}: ${error.message}`);
      hasError = true;
      process.exit(1);
    });
  } catch (error) {
    console.error(`[FAIL] ${path.relative(rootDir, schemaPath)}: ${error.message}`);
    hasError = true;
  }
}

// Wait a bit for async operations
setTimeout(() => {
  if (hasError) {
    console.error('\nSome contract schemas failed validation.');
    process.exit(1);
  } else {
    console.log('\nAll contract schemas are valid.');
  }
}, 1000);
