import { Prisma } from '@prisma/client';

export function parseQueryParams(query) {
    const {
        cuisine,
        priceRange,
        search,
        lat,
        lon,
        radiusKm
    } = query;

    const params = {};

  if (cuisine) {
    params.cuisine = Array.isArray(cuisine) ? cuisine : cuisine.split(',').map(s => s.trim());
  }
  if (priceRange) {
    params.priceRange = priceRange;
  }
  if (search) {
    params.search = search;
  }
  if (lat && lon) {
    params.userLat = parseFloat(lat);
    params.userLon = parseFloat(lon);
    if (isNaN(params.userLat) || isNaN(params.userLon)) {
      throw new Error('Invalid geographic coordinates.');
    }
    if (radiusKm) {
      params.radiusMeters = parseFloat(radiusKm) * 1000;
      if (isNaN(params.radiusMeters) || params.radiusMeters <= 0) {
        throw new Error('Invalid radius.');
      }
    }
  }
  return params;
}

// 輔助函數：用於構建 WHERE 語句的 Prisma SQL 片段
export function buildWhereClause(params) {
  let whereConditions = [];

  if (params.search) {
    whereConditions.push(
      Prisma.sql`"name" ILIKE ${'%' + params.search + '%'}`
    );
  }
  if (params.cuisine && params.cuisine.length > 0) {
    whereConditions.push(
      Prisma.sql`"cuisine" @> ARRAY[${Prisma.join(params.cuisine.map(c => Prisma.sql`${c}`))}]::text[]`
    );
  }
  if (params.priceRange) {
    whereConditions.push(
      Prisma.sql`"priceRange" = ${params.priceRange}`
    );
  }
  if (params.userLat && params.userLon && params.radiusMeters) {
    whereConditions.push(
      Prisma.sql`ST_DWithin(
        ST_MakePoint("longitude", "latitude")::geography,
        ST_SetSRID(ST_MakePoint(${params.userLon}, ${params.userLat}), 4326)::geography,
        ${params.radiusMeters}
      )`
    );
  }

  return whereConditions.length > 0 ? Prisma.sql`WHERE ${Prisma.join(whereConditions, ' AND ')}` : Prisma.empty;
}