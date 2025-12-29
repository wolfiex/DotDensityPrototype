/**
 * Setup interactive controls for the dot density map
 * @param {Object} callbacks - Object containing callback functions
 */
export function setupControls({ onDensityChange, onDotSizeChange, onOpacityChange }) {
  // Density control
  const densitySlider = document.getElementById('density');
  const densityValue = document.getElementById('density-value');
  
  if (densitySlider && densityValue) {
    densitySlider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value, 10);
      densityValue.textContent = value;
      if (onDensityChange) {
        onDensityChange(value);
      }
    });
  }

  // Dot size control
  const dotSizeSlider = document.getElementById('dot-size');
  const dotSizeValue = document.getElementById('dot-size-value');
  
  if (dotSizeSlider && dotSizeValue) {
    dotSizeSlider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      dotSizeValue.textContent = value;
      if (onDotSizeChange) {
        onDotSizeChange(value);
      }
    });
  }

  // Opacity control
  const opacitySlider = document.getElementById('opacity');
  const opacityValue = document.getElementById('opacity-value');
  
  if (opacitySlider && opacityValue) {
    opacitySlider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      opacityValue.textContent = value;
      if (onOpacityChange) {
        onOpacityChange(value);
      }
    });
  }
}

/**
 * Create a category toggle control
 * @param {Array} categories - Array of category configurations
 * @param {Function} onToggle - Callback when category is toggled
 */
export function createCategoryToggles(categories, onToggle) {
  const container = document.getElementById('controls');
  if (!container) return;

  const toggleSection = document.createElement('div');
  toggleSection.className = 'category-toggles';
  toggleSection.innerHTML = '<h4>Categories</h4>';

  categories.forEach((category) => {
    const label = document.createElement('label');
    label.className = 'category-toggle';
    label.innerHTML = `
      <input type="checkbox" checked data-category="${category.id}">
      <span class="toggle-dot" style="background: ${category.color}"></span>
      ${category.label}
    `;
    
    const checkbox = label.querySelector('input');
    checkbox.addEventListener('change', (e) => {
      if (onToggle) {
        onToggle(category.id, e.target.checked);
      }
    });

    toggleSection.appendChild(label);
  });

  container.appendChild(toggleSection);
}
