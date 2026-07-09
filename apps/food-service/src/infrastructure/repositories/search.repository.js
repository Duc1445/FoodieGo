export class SearchRepository {
  constructor(pool) {
    this.pool = pool;
  }

  /**
   * Search by keyword using Full-Text Search (pg_trgm or tsvector)
   * @param {string} keyword 
   * @param {number} limit 
   * @param {string} cursor UpdatedAt cursor
   */
  async searchByKeyword(keyword, limit = 20, cursor = null) {
    let query = `
      SELECT * FROM food_search_projection
      WHERE is_available = true
      AND (
        name ILIKE $1 
        OR description ILIKE $1
      )
    `;
    const params = [`%${keyword}%`];

    if (cursor) {
      query += ` AND updated_at < $2`;
      params.push(cursor);
    }

    query += ` ORDER BY updated_at DESC LIMIT $${params.length > 1 ? 3 : 2}`;
    params.push(limit);

    const { rows } = await this.pool.query(query, params);
    return rows;
  }

  /**
   * Geospatial search using PostGIS
   * @param {number} lat 
   * @param {number} lon 
   * @param {number} radiusMeters 
   */
  async searchNearby(lat, lon, radiusMeters = 5000, limit = 20, cursor = null) {
    let query = `
      SELECT *, ST_Distance(location, ST_SetSRID(ST_MakePoint($1, $2), 4326)) as distance
      FROM food_search_projection
      WHERE is_available = true
      AND ST_DWithin(location, ST_SetSRID(ST_MakePoint($1, $2), 4326), $3)
    `;
    const params = [lon, lat, radiusMeters];

    if (cursor) {
      query += ` AND updated_at < $4`;
      params.push(cursor);
    }

    query += ` ORDER BY updated_at DESC LIMIT $${params.length > 1 ? 5 : 4}`;
    params.push(limit);

    const { rows } = await this.pool.query(query, params);
    return rows;
  }

  /**
   * Vector similarity search using pgvector
   * @param {number[]} vector 
   */
  async searchByVector(vector, limit = 10) {
    // Uses pgvector `<->` operator for L2 distance (or `<#>` for inner product)
    const query = `
      SELECT *
      FROM food_search_projection
      WHERE is_available = true
      ORDER BY embedding <-> $1
      LIMIT $2
    `;
    // Format vector as string literal '[1,2,3]' for pgvector
    const { rows } = await this.pool.query(query, [`[${vector.join(',')}]`, limit]);
    return rows;
  }
}
