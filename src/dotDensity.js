import * as turf from '@turf/turf';

/**
 * Generate random points within polygons for dot density visualization
 * @param {Object} polygonData - GeoJSON FeatureCollection of polygons
 * @param {Array} categories - Array of category configurations
 * @param {number} dotsPerUnit - Number of dots to generate per unit value
 * @returns {Object} GeoJSON FeatureCollection of points
 */
export function generateDotDensityPoints(polygonData, categories, dotsPerUnit) {
  const allPoints = [];

  polygonData.features.forEach((feature) => {
    const properties = feature.properties;
    const regionName = properties.name || 'Unknown Region';

    categories.forEach((category) => {
      const value = properties[category.id] || 0;
      const numDots = Math.round(value / dotsPerUnit);

      if (numDots > 0) {
        try {
          // Generate random points within the polygon
          const points = generatePointsInPolygon(feature, numDots);
          
          points.forEach((point) => {
            allPoints.push({
              type: 'Feature',
              geometry: point.geometry,
              properties: {
                category: category.id,
                regionName: regionName,
                value: value,
                color: category.color
              }
            });
          });
        } catch (error) {
          console.warn(`Error generating points for ${regionName}:`, error.message);
        }
      }
    });
  });

  // Shuffle points to mix categories visually
  shuffleArray(allPoints);

  return {
    type: 'FeatureCollection',
    features: allPoints
  };
}

/**
 * Generate random points within a polygon using rejection sampling
 * @param {Object} polygon - GeoJSON polygon feature
 * @param {number} numPoints - Number of points to generate
 * @returns {Array} Array of point features
 */
function generatePointsInPolygon(polygon, numPoints) {
  const points = [];
  const bbox = turf.bbox(polygon);
  const maxAttempts = numPoints * 100; // Prevent infinite loops
  let attempts = 0;

  while (points.length < numPoints && attempts < maxAttempts) {
    attempts++;
    
    // Generate random point within bounding box
    const lng = bbox[0] + Math.random() * (bbox[2] - bbox[0]);
    const lat = bbox[1] + Math.random() * (bbox[3] - bbox[1]);
    const point = turf.point([lng, lat]);

    // Check if point is inside polygon
    try {
      if (turf.booleanPointInPolygon(point, polygon)) {
        points.push(point);
      }
    } catch (e) {
      // Skip invalid geometries
      continue;
    }
  }

  return points;
}

/**
 * Fisher-Yates shuffle algorithm
 * @param {Array} array - Array to shuffle in place
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/**
 * Generate clustered points within a polygon
 * Useful for showing concentrated areas
 * @param {Object} polygon - GeoJSON polygon feature
 * @param {number} numPoints - Number of points to generate
 * @param {number} clusterFactor - How clustered points should be (0-1)
 * @returns {Array} Array of point features
 */
export function generateClusteredPoints(polygon, numPoints, clusterFactor = 0.5) {
  const centroid = turf.centroid(polygon);
  const bbox = turf.bbox(polygon);
  const points = [];
  const maxAttempts = numPoints * 100;
  let attempts = 0;

  while (points.length < numPoints && attempts < maxAttempts) {
    attempts++;
    
    // Mix between centroid-biased and uniform distribution
    let lng, lat;
    
    if (Math.random() < clusterFactor) {
      // Gaussian-like distribution around centroid
      const spread = 0.3;
      lng = centroid.geometry.coordinates[0] + gaussianRandom() * spread * (bbox[2] - bbox[0]);
      lat = centroid.geometry.coordinates[1] + gaussianRandom() * spread * (bbox[3] - bbox[1]);
    } else {
      // Uniform distribution
      lng = bbox[0] + Math.random() * (bbox[2] - bbox[0]);
      lat = bbox[1] + Math.random() * (bbox[3] - bbox[1]);
    }
    
    const point = turf.point([lng, lat]);

    try {
      if (turf.booleanPointInPolygon(point, polygon)) {
        points.push(point);
      }
    } catch (e) {
      continue;
    }
  }

  return points;
}

/**
 * Box-Muller transform for Gaussian random numbers
 */
function gaussianRandom() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}
