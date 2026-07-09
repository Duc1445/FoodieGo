CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE food_search_projection (
  food_id UUID PRIMARY KEY,
  restaurant_id UUID NOT NULL,
  category_id UUID,
  name VARCHAR(255) NOT NULL,
  normalized_name VARCHAR(255),
  description TEXT,
  tags TEXT[],
  price_min DECIMAL(10, 2),
  price_max DECIMAL(10, 2),
  rating DECIMAL(3, 2) DEFAULT 0.0,
  review_count INT DEFAULT 0,
  is_available BOOLEAN DEFAULT false,
  location geometry(Point, 4326),
  search_vector tsvector,
  embedding vector(1536),
  aggregate_version INT NOT NULL,
  projection_version INT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for Full-Text Search
CREATE INDEX idx_food_search_vector ON food_search_projection USING GIN (search_vector);

-- Index for Trigram similarity
CREATE INDEX idx_food_name_trgm ON food_search_projection USING GIN (name gin_trgm_ops);

-- Index for Geospatial search
CREATE INDEX idx_food_location ON food_search_projection USING GIST (location);

-- Index for Vector similarity search (HNSW index)
CREATE INDEX idx_food_embedding ON food_search_projection USING hnsw (embedding vector_l2_ops);

-- Cursor pagination index
CREATE INDEX idx_food_updated_at ON food_search_projection (updated_at DESC);
