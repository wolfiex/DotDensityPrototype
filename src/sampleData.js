/**
 * Sample polygon data representing US regions with demographic categories
 * In a real application, this would come from an API or file
 */
export const samplePolygonData = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        name: 'California',
        category_a: 5000,
        category_b: 3500,
        category_c: 2000
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-124.4, 42.0],
          [-124.4, 32.5],
          [-114.1, 32.5],
          [-114.1, 35.0],
          [-120.0, 39.0],
          [-120.0, 42.0],
          [-124.4, 42.0]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        name: 'Texas',
        category_a: 4000,
        category_b: 4500,
        category_c: 3000
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-106.6, 36.5],
          [-103.0, 36.5],
          [-103.0, 32.0],
          [-94.0, 29.5],
          [-94.0, 26.0],
          [-97.5, 26.0],
          [-99.5, 27.5],
          [-104.0, 29.5],
          [-106.6, 32.0],
          [-106.6, 36.5]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        name: 'Florida',
        category_a: 2800,
        category_b: 3200,
        category_c: 2500
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-87.6, 31.0],
          [-80.0, 31.0],
          [-80.0, 28.5],
          [-80.5, 25.0],
          [-81.8, 24.5],
          [-82.5, 27.5],
          [-84.0, 30.0],
          [-87.6, 31.0]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        name: 'New York',
        category_a: 3200,
        category_b: 2800,
        category_c: 1800
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-79.8, 45.0],
          [-73.3, 45.0],
          [-73.3, 40.5],
          [-74.3, 40.5],
          [-79.8, 42.0],
          [-79.8, 45.0]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        name: 'Illinois',
        category_a: 2200,
        category_b: 2500,
        category_c: 1500
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-91.5, 42.5],
          [-87.0, 42.5],
          [-87.0, 37.0],
          [-89.0, 36.5],
          [-91.5, 37.0],
          [-91.5, 42.5]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        name: 'Pennsylvania',
        category_a: 2000,
        category_b: 2200,
        category_c: 1400
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-80.5, 42.3],
          [-74.7, 42.3],
          [-74.7, 39.7],
          [-80.5, 39.7],
          [-80.5, 42.3]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        name: 'Ohio',
        category_a: 1800,
        category_b: 2000,
        category_c: 1300
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-84.8, 42.0],
          [-80.5, 42.0],
          [-80.5, 38.4],
          [-84.8, 38.4],
          [-84.8, 42.0]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        name: 'Georgia',
        category_a: 1700,
        category_b: 1900,
        category_c: 1600
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-85.6, 35.0],
          [-80.8, 35.0],
          [-80.8, 30.4],
          [-85.0, 30.4],
          [-85.6, 32.0],
          [-85.6, 35.0]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        name: 'North Carolina',
        category_a: 1600,
        category_b: 1800,
        category_c: 1400
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-84.3, 36.6],
          [-75.5, 36.6],
          [-75.5, 34.0],
          [-84.3, 35.0],
          [-84.3, 36.6]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        name: 'Michigan',
        category_a: 1500,
        category_b: 1700,
        category_c: 1200
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-90.4, 48.2],
          [-82.4, 46.0],
          [-82.4, 41.7],
          [-86.8, 41.7],
          [-90.4, 45.0],
          [-90.4, 48.2]
        ]]
      }
    }
  ]
};

/**
 * Load GeoJSON data from a URL
 * @param {string} url - URL to fetch GeoJSON from
 * @returns {Promise<Object>} GeoJSON FeatureCollection
 */
export async function loadGeoJSON(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading GeoJSON:', error);
    throw error;
  }
}
