import { logger } from '../src/context.js';
import { FoodProjectionBuilder } from '../src/application/projections/food-projection.builder.js';
import pool from '../src/config/database.js'; // Assuming it's there or will be

async function rebuild() {
  logger.info('Starting Food Projection Rebuild');
  
  // Setup repository
  const projectionRepository = {
    findById: async (id) => {
      const { rows } = await pool.query('SELECT * FROM food_search_projection WHERE food_id = $1', [id]);
      return rows[0];
    },
    save: async (projection) => {
      await pool.query(`
        INSERT INTO food_search_projection (
          food_id, restaurant_id, category_id, name, normalized_name, description, tags, 
          price_min, price_max, rating, review_count, is_available, location, search_vector, embedding, 
          aggregate_version, projection_version, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
        ) ON CONFLICT (food_id) DO UPDATE SET
          restaurant_id = EXCLUDED.restaurant_id,
          category_id = EXCLUDED.category_id,
          name = EXCLUDED.name,
          normalized_name = EXCLUDED.normalized_name,
          description = EXCLUDED.description,
          tags = EXCLUDED.tags,
          price_min = EXCLUDED.price_min,
          price_max = EXCLUDED.price_max,
          rating = EXCLUDED.rating,
          review_count = EXCLUDED.review_count,
          is_available = EXCLUDED.is_available,
          location = EXCLUDED.location,
          search_vector = EXCLUDED.search_vector,
          embedding = EXCLUDED.embedding,
          aggregate_version = EXCLUDED.aggregate_version,
          projection_version = EXCLUDED.projection_version,
          updated_at = EXCLUDED.updated_at
      `, [
        projection.food_id, projection.restaurant_id, projection.category_id, projection.name, 
        projection.normalized_name, projection.description, projection.tags, projection.price_min, 
        projection.price_max, projection.rating, projection.review_count, projection.is_available, 
        projection.location, projection.search_vector, projection.embedding, projection.aggregate_version, 
        projection.projection_version, projection.updated_at
      ]);
    }
  };

  const builder = new FoodProjectionBuilder(projectionRepository);

  // Note: in a real app, this would stream from an Event Store.
  // For outbox pattern without event sourcing, it would stream from the outbox table.
  const query = `
    SELECT event_type, event_version, aggregate_id, payload, aggregate_version
    FROM outbox
    WHERE aggregate_type = 'FoodAggregate'
    ORDER BY occurred_at ASC
  `;

  try {
    const { rows } = await pool.query(query);
    logger.info({ count: rows.length }, 'Found events to replay');

    for (const row of rows) {
      await builder.build({
        eventType: row.event_type,
        eventVersion: row.event_version,
        aggregateId: row.aggregate_id,
        payload: row.payload,
        aggregateVersion: row.aggregate_version
      });
    }

    logger.info('Food Projection Rebuild Complete');
  } catch (err) {
    logger.error({ err: err.message }, 'Food Projection Rebuild Failed');
  } finally {
    await pool.end();
  }
}

rebuild();
