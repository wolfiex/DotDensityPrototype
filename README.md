# Dot Density Prototype

Interactive dot density map of England + Wales based on the 2021 Census, built with SvelteKit and MapLibre GL.

Each dot represents a number of people (variable with zoom level), coloured by category. Click any output area to see its breakdown, draw a custom polygon to aggregate across multiple areas, or toggle the page-average mode to recompute ratios from what's currently on screen.

## Datasets

Configured in `static/config.json`:

- Ethnicity
- Religion
- Disability
- Hours Worked
- Household Size
- Partnership Status
- Family Composition
- Passports

## Requirements

- Node.js 18+
- npm 9+

## Development

```bash
npm install
npm run dev
```

Runs at <http://localhost:3000>.

## Build

```bash
npm run build
npm run preview
```

Output goes to `build/`. The site is static and can be served from any host.

## Project structure

```
src/
├── app.html                              # SvelteKit document shell
├── routes/
│   ├── +layout.js                        # prerender = true
│   ├── +page.svelte                      # UI: menu, settings, legend, freedraw
│   ├── MapComponent.svelte               # MapLibre setup + tile sources
│   └── Categories.svelte                 # Legend bars
└── lib/
    └── components/
        ├── AtomicLoader.svelte           # Splash screen
        └── circledata.js                 # Splash ring config
static/
├── config.json                           # Dataset definitions
├── style-dark.json                       # MapLibre style
└── tiles/                                # Vector tile pyramids per dataset
```

## Data source

Office for National Statistics — Census 2021.
