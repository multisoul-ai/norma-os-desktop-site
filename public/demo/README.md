# Product demo sources

Keep original screen recordings in this folder. `.mov` files are local source
assets and are excluded from Git and production deployments.

Create a web-ready 1080p MP4 and matching WebP poster with:

```sh
pnpm demo:media -- "public/demo/example.mov" example 0 12 2
```

Arguments after the slug are optional: start time, duration, and poster offset,
all in seconds. Add the generated `/media/demo-example.mp4` and `.webp` paths,
along with localized copy, to `src/app/product-demos.ts`.
