# BIR Industries website

Static site for **www.birindustries.in**, served by GitHub Pages (no build step).

- `index.html` – the page (sections: hero, about, products with 3D/AR viewer, manufacturing, quality, industries, supply, RFQ form, contact)
- `style.css`, `main.js` – styles and behaviour
- `3d/` – GLB models used by the 3D viewer (plus original photos/videos)
- `assets/img`, `assets/media` – optimised photos, logo, social image and compressed videos
- `robots.txt`, `sitemap.xml`, `site.webmanifest`, `404.html` – SEO and housekeeping

To preview locally: `python3 -m http.server` in this folder, then open http://localhost:8000.
