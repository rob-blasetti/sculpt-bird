# Bird Sculpture (Three.js)

A small, stylized low‑poly bird “sculpture” rendered with Three.js and hosted with GitHub Pages. No build step required — modules load via CDN.

Live demo
- https://liquidgoldcrypto.com.au/sculpt-bird/
- Fallback: https://rob-blasetti.github.io/sculpt-bird/

## Features
- Low‑poly bird with subtle idle animation
- Orbit controls for explore/zoom
- Soft shadows and simple ground plane
- Responsive full‑screen canvas
- ESM modules from CDN (unpkg) — great for GitHub Pages

## Project layout
- `index.html` — page shell that loads the scene
- `main.js` — scene setup, geometry, lighting, animation
- `styles.css` — gradient background and full‑screen canvas

## Local preview
For the cleanest experience, serve the folder with a static server (modules are loaded from HTTPS).

Python

```bash
python3 -m http.server 5173
# then open http://localhost:5173
```

Node (if you have a server tool):

```bash
npx serve .
# or any other static server you prefer
```

## Deploying to GitHub Pages
1. Settings → Pages → Build and deployment: “Deploy from a branch”.
2. Branch: `main` • Folder: `/root`.
3. Wait for the “pages build and deployment” workflow to finish, then visit the live URL above.

Tip: If you want the site at `/bird/` exactly, rename the repo to `bird`. GitHub Pages will then serve it at `https://<your-domain>/bird/`.

## Customization
- Colors: tweak material colors in `main.js` (hex values near geometry definitions).
- Animation: adjust `flap`/`bob` math near the end of `main.js`.
- Camera: change initial `camera.position` and `controls.target`.

## Attribution
Built with [Three.js](https://threejs.org/).

---

Trigger Pages deploy.
