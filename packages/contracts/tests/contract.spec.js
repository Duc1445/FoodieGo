import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize AJV in strict mode
const ajv = new Ajv({
  strict: true,
  allErrors: true,
  removeAdditional: false,
  useDefaults: false
});
addFormats(ajv);

// Load Schemas
const uuidSchema = JSON.parse(fs.readFileSync(path.join(__dirname, '../events/common/uuid.schema.json'), 'utf8'));
const timestampSchema = JSON.parse(fs.readFileSync(path.join(__dirname, '../events/common/timestamp.schema.json'), 'utf8'));
const moneySchema = JSON.parse(fs.readFileSync(path.join(__dirname, '../events/common/money.schema.json'), 'utf8'));
const metadataSchema = JSON.parse(fs.readFileSync(path.join(__dirname, '../events/common/event-metadata.schema.json'), 'utf8'));
const orderPendingSchema = JSON.parse(fs.readFileSync(path.join(__dirname, '../events/v1/order-pending-reservation.schema.json'), 'utf8'));

ajv.addSchema(uuidSchema);
ajv.addSchema(timestampSchema);
ajv.addSchema(moneySchema);
ajv.addSchema(metadataSchema);

const validateOrderPending = ajv.compile(orderPendingSchema);

describe('Schema Contract Tests: OrderPendingReservation', () => {
  
  const validPayload = {
    eventId: "123e4567-e89b-12d3-a456-426614174000",
    correlationId: "123e4567-e89b-12d3-a456-426614174000",
    occurredAt: "2026-07-13T12:00:00Z",
    schemaVersion: "v1",
    eventType: "OrderPendingReservation",
    aggregateType: "Order",
    aggregateId: "order_123",
    payload: {
      restaurantId: "rest_456",
      items: [
        { menuItemId: "item_789", quantity: 2 }
      ]
    }
  };

  test('1. Happy Path: Valid payload passes', () => {
    const valid = validateOrderPending(validPayload);
    if (!valid) console.error(validateOrderPending.errors);
    expect(valid).toBe(true);
  });

  test('2. Missing Required: Missing items fails', () => {
    const invalidPayload = { ...validPayload, payload: { restaurantId: "rest_456" } };
    const valid = validateOrderPending(invalidPayload);
    expect(valid).toBe(false);
    expect(validateOrderPending.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ keyword: 'required', params: { missingProperty: 'items' } })
      ])
    );
  });

  test('3. Wrong Type: Quantity as string fails', () => {
    const invalidPayload = JSON.parse(JSON.stringify(validPayload));
    invalidPayload.payload.items[0].quantity = "2";
    const valid = validateOrderPending(invalidPayload);
    expect(valid).toBe(false);
    expect(validateOrderPending.errors[0].message).toMatch(/must be integer/);
  });

  test('4. Unknown Event: Invalid eventType const fails', () => {
    const invalidPayload = { ...validPayload, eventType: "OrderCreatedABC" };
    const valid = validateOrderPending(invalidPayload);
    expect(valid).toBe(false);
    expect(validateOrderPending.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ keyword: 'const' })
      ])
    );
  });

  test('5. Compatibility Test: Validates V1 against current schema', () => {
    // This snapshot represents what consumers are currently expecting.
    // If we make a breaking change to the schema, this test will fail!
    const snapshotStr = fs.readFileSync(path.join(__dirname, '../snapshots/order-pending-reservation.v1.json'), 'utf8');
    const snapshot = JSON.parse(snapshotStr);
    
    const valid = validateOrderPending(snapshot);
    if (!valid) {
      console.error("COMPATIBILITY BROKEN:", validateOrderPending.errors);
    }
    expect(valid).toBe(true);
  });
});
