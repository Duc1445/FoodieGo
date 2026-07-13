import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { SchemaValidationError } from '../errors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EventValidator {
  constructor() {
    this.ajv = new Ajv({
      strict: true,
      allErrors: true,
      removeAdditional: false,
      useDefaults: false
    });
    addFormats(this.ajv);

    this.validators = new Map();
    this.initialized = false;
  }

  // Called once at application startup
  init() {
    if (this.initialized) return;

    // Load common schemas
    const commonPath = path.join(__dirname, '../../events/common');
    const uuidSchema = JSON.parse(fs.readFileSync(path.join(commonPath, 'uuid.schema.json'), 'utf8'));
    const timestampSchema = JSON.parse(fs.readFileSync(path.join(commonPath, 'timestamp.schema.json'), 'utf8'));
    const moneySchema = JSON.parse(fs.readFileSync(path.join(commonPath, 'money.schema.json'), 'utf8'));
    const metadataSchema = JSON.parse(fs.readFileSync(path.join(commonPath, 'event-metadata.schema.json'), 'utf8'));

    this.ajv.addSchema(uuidSchema);
    this.ajv.addSchema(timestampSchema);
    this.ajv.addSchema(moneySchema);
    this.ajv.addSchema(metadataSchema);

    // Load v1 schemas
    const v1Path = path.join(__dirname, '../../events/v1');
    const files = fs.readdirSync(v1Path).filter(f => f.endsWith('.schema.json'));

    for (const file of files) {
      const schema = JSON.parse(fs.readFileSync(path.join(v1Path, file), 'utf8'));
      const eventType = schema.properties.eventType.const; // e.g. "OrderPendingReservation"
      const version = schema.properties.schemaVersion.const; // e.g. "v1"
      
      const validateFn = this.ajv.compile(schema);
      this.validators.set(`${eventType}:${version}`, validateFn);
    }

    this.initialized = true;
  }

  validate(event) {
    if (!this.initialized) {
      throw new Error("EventValidator not initialized. Call init() at startup.");
    }

    const key = `${event.eventType}:${event.schemaVersion}`;
    const validateFn = this.validators.get(key);

    if (!validateFn) {
      throw new SchemaValidationError(`No schema registered for ${key}`, []);
    }

    const isValid = validateFn(event);
    if (!isValid) {
      console.error('Validation errors:', JSON.stringify(validateFn.errors, null, 2));
      throw new SchemaValidationError(`Event ${key} failed schema validation`, validateFn.errors);
    }

    return true;
  }
}

// Export a singleton instance
export const eventValidator = new EventValidator();
