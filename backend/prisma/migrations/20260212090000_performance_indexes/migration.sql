-- Extension for faster ILIKE on restaurant name
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Query path: WHERE name ILIKE '%keyword%'
CREATE INDEX IF NOT EXISTS idx_restaurants_name_trgm
ON restaurants USING gin (name gin_trgm_ops);

-- Query path: cuisine @> ARRAY[...] and ORDER BY createdAt
CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine_gin
ON restaurants USING gin (cuisine);

CREATE INDEX IF NOT EXISTS idx_restaurants_created_at
ON restaurants ("createdAt" DESC);

-- Query path: priceRange exact match
CREATE INDEX IF NOT EXISTS idx_restaurants_price_range
ON restaurants ("priceRange");

-- Query path: ST_DWithin on (longitude, latitude)
CREATE INDEX IF NOT EXISTS idx_restaurants_geo
ON restaurants USING gist ((ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography));

-- Query path: watchlist by user ordered by addedAt
CREATE INDEX IF NOT EXISTS idx_user_restaurants_user_added_at
ON user_restaurants ("userId", "addedAt" DESC);

-- Query path: delete/remove by restaurant lookup
CREATE INDEX IF NOT EXISTS idx_user_restaurants_restaurant_id
ON user_restaurants ("restaurantId");
