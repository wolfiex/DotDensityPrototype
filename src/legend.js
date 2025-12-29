/**
 * Create a legend for the dot density map
 * @param {Array} categories - Array of category configurations
 */
export function createLegend(categories) {
  const container = document.getElementById('legend');
  if (!container) return;

  container.innerHTML = '<h4>Legend</h4>';

  categories.forEach((category) => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `
      <span class="legend-dot" style="background: ${category.color}"></span>
      <span>${category.label}</span>
    `;
    container.appendChild(item);
  });
}

/**
 * Update legend with counts
 * @param {Array} categories - Category configurations
 * @param {Object} counts - Object with category counts
 */
export function updateLegendCounts(categories, counts) {
  const container = document.getElementById('legend');
  if (!container) return;

  const items = container.querySelectorAll('.legend-item');
  items.forEach((item, index) => {
    if (categories[index]) {
      const category = categories[index];
      const count = counts[category.id] || 0;
      item.innerHTML = `
        <span class="legend-dot" style="background: ${category.color}"></span>
        <span>${category.label} (${count.toLocaleString()})</span>
      `;
    }
  });
}
