import fs from 'fs';
import path from 'path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const schemaPath = path.join(process.cwd(), 'packages', 'contracts', 'payment', 'v1', 'schema.json');
const examplesDir = path.join(process.cwd(), 'packages', 'contracts', 'payment', 'v1', 'examples', 'golden');

function run() {
  console.log('Contract Testing: Verifying V1 Payment Schemas...');
  
  if (!fs.existsSync(schemaPath)) {
    console.error('Schema not found:', schemaPath);
    process.exit(1);
  }

  const schemaContent = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
  const validate = ajv.compile(schemaContent);

  if (!fs.existsSync(examplesDir)) {
    console.error('Examples directory not found:', examplesDir);
    process.exit(1);
  }

  const exampleFiles = fs.readdirSync(examplesDir).filter(f => f.endsWith('.json'));
  let hasErrors = false;

  for (const file of exampleFiles) {
    const filePath = path.join(examplesDir, file);
    const exampleContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    const valid = validate(exampleContent);
    if (!valid) {
      console.error(`❌ Validation failed for ${file}:`);
      console.error(ajv.errorsText(validate.errors));
      hasErrors = true;
    } else {
      console.log(`✅ ${file} passed schema validation.`);
    }
  }

  if (hasErrors) {
    process.exit(1);
  } else {
    console.log('All contracts verified successfully!');
  }
}

run();
