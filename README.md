# Abstract

An experiment in digital matter. Four scroll-driven chapters transform a procedural sculpture from a folded ring into waves, a particle field, and a quiet halo.

## Run

```sh
yarn install
yarn start
```

Open the local URL printed by Parcel (normally `http://localhost:1234`).

```sh
yarn build
```

The production site is written to `rel/`.

## How it works

- `src/index.html` — the four chapters, navigation, and motion control.
- `src/styles/` — responsive editorial layout and subtle scroll reveals.
- `src/scripts/scroll.js` — one native-scroll timeline shared by the DOM and the artwork. Section anchors and text bounds are remeasured on resize and font loading.
- `src/scripts/sketch.js` — scroll-driven camera, composition, and lighting choreography.
- `src/scripts/sculpture.js` — the procedural surface, deterministic particles, and atmospheric dust.
- `src/scripts/shaders/form.glsl` — the common shape function used by both the surface and particle vertex shaders. All four states are reversible.
- `src/scripts/app.js` — a single render pipeline with restrained bloom, grain, color grading, and capped pixel density.

No models, videos, scroll hijacking, or animation framework. Each chapter is exactly one scrollport tall, with one native snap position and its complete text composition visible at rest. The `<main>` scroller remains the source of truth; elapsed time only adds ambient motion. Google Fonts supplies the typography, with local font fallbacks.

The mesh shaders guard normal normalization and fractional powers, and reject non-finite output before bloom. A single NaN in an HDR texel can otherwise spread through bloom's mip levels as flashing black rectangles. The annotation panel uses live backdrop blur.

The motion control pauses ambient animation and switches to discrete chapter compositions. The same mode is enabled by default for `prefers-reduced-motion`. Rendering pauses while the page is hidden; mobile uses fewer particles and lower pixel density. A CSS artwork keeps the page usable if WebGL is unavailable or its context is lost.

MIT — original project by nmd.
