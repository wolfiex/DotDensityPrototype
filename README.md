# Dot Density Map Prototype

A dot density visualization using MapLibre GL JS with Turf.js for spatial operations.

## Features

- Interactive dot density map visualization
- Adjustable density, dot size, and opacity controls
- Multiple category support with distinct colors
- Click-to-inspect individual dots
- Responsive design

## Prerequisites

- Node.js 18+ 
- npm 9+

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Opens the development server at http://localhost:3000

## Build

```bash
npm run build
```

Creates production build in `dist/` folder.

## Preview Production Build

```bash
npm run preview
```

## Dependencies (Explicit Versions)

- **maplibre-gl@4.7.1** - Map rendering
- **@turf/turf@7.1.0** - Spatial operations
- **d3-scale@4.0.2** - Scales for data visualization
- **d3-scale-chromatic@3.1.0** - Color schemes
- **vite@5.4.11** - Build tool

## Troubleshooting

### Render Loop Issues

If you see repeated `_render` or `triggerRepaint` errors:

1. Ensure debounced updates are used when modifying sources
2. Check that `setData()` is not called during render cycle
3. Verify GeoJSON is valid before passing to sources

### Performance

For large datasets:
- Reduce dots per unit
- Use clustering for dense areas
- Consider WebGL point layers

## Project Structure

```
DotDensityPrototype/
├── index.html          # Main HTML file
├── package.json        # Dependencies and scripts
├── vite.config.js      # Vite configuration
└── src/
    ├── main.js         # Entry point and map initialization
    ├── dotDensity.js   # Dot generation algorithms
    ├── controls.js     # UI controls
    ├── legend.js       # Legend generation
    ├── sampleData.js   # Sample polygon data
    └── styles.css      # Styling
```

## License

MIT
