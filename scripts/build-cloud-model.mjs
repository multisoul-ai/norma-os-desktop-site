// Local, reference-derived 3D sculpt. No generation service, tokens, or external assets.
// Run: pnpm prototype:cloud-model. Uses the image decoder already installed with Next.js.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve('next/package.json'))('sharp');

// GLTFExporter only needs this browser API for assembling binary buffers.
globalThis.FileReader = class {
  readAsArrayBuffer(blob) { blob.arrayBuffer().then(result => { this.result = result; this.onloadend?.(); }); }
  readAsDataURL(blob) { blob.arrayBuffer().then(result => { this.result = `data:${blob.type};base64,${Buffer.from(result).toString('base64')}`; this.onloadend?.(); }); }
};

const rootDir = process.cwd();
const source = 'output/imagegen/norma-minimal-v1/d-cloud.png';
const { data, info } = await sharp(path.join(rootDir, source)).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
const dark = new Uint8Array(width * height);
let left = width, top = height, right = 0, bottom = 0;
for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
  const i = (y * width + x) * channels;
  if (Math.max(data[i], data[i + 1], data[i + 2]) < 100) {
    dark[y * width + x] = 1;
    left = Math.min(left, x); right = Math.max(right, x);
    top = Math.min(top, y); bottom = Math.max(bottom, y);
  }
}
const center = [(left + right) / 2, (top + bottom) / 2];
const scale = 2.75 / (right - left);

function radialProfile(mask, origin, samples, maxRadius, smoothing = 2.2) {
  const radii = [];
  for (let i = 0; i < samples; i++) {
    const angle = i / samples * Math.PI * 2;
    let last = 0;
    for (let r = 0; r < maxRadius; r += 0.5) {
      const x = Math.round(origin[0] + Math.cos(angle) * r);
      const y = Math.round(origin[1] - Math.sin(angle) * r);
      if (x >= 0 && x < width && y >= 0 && y < height && mask[y * width + x]) last = r;
    }
    radii.push(last);
  }
  return radii.map((_, i) => {
    let sum = 0, weights = 0;
    for (let d = -7; d <= 7; d++) {
      const weight = Math.exp(-0.5 * (d / smoothing) ** 2);
      sum += radii[(i + d + samples) % samples] * weight; weights += weight;
    }
    return sum / weights;
  });
}
const silhouette = radialProfile(dark, center, 384, width * 0.65);
function radiusAt(profile, angle) {
  const t = ((angle / (Math.PI * 2) + 1) % 1) * profile.length;
  return THREE.MathUtils.lerp(profile[Math.floor(t) % profile.length], profile[(Math.floor(t) + 1) % profile.length], t % 1);
}
const bodyDepth = 0.58;
// A relaxed membrane gives the cloud a smooth sculptural volume. Its boundary is the
// measured silhouette; solving the interior avoids radial creases between cloud lobes.
const gridWidth = 256, gridHeight = 176, cell = 2.9 / (gridWidth - 1);
const inside = new Uint8Array(gridWidth * gridHeight);
const pressure = new Float64Array(inside.length);
const gridX = x => (x - (gridWidth - 1) / 2) * cell;
const gridY = y => (y - (gridHeight - 1) / 2) * cell;
for (let y = 1; y < gridHeight - 1; y++) for (let x = 1; x < gridWidth - 1; x++) {
  const px = gridX(x), py = gridY(y);
  if (Math.hypot(px, py) < radiusAt(silhouette, Math.atan2(py, px)) * scale) inside[y * gridWidth + x] = 1;
}
for (let iteration = 0; iteration < 850; iteration++) {
  for (let y = 1; y < gridHeight - 1; y++) for (let x = 1; x < gridWidth - 1; x++) {
    const i = y * gridWidth + x;
    if (inside[i]) {
      const average = (pressure[i - 1] + pressure[i + 1] + pressure[i - gridWidth] + pressure[i + gridWidth] + cell * cell) * 0.25;
      pressure[i] += (average - pressure[i]) * 1.88;
    }
  }
}
let maxPressure = 0;
for (const value of pressure) maxPressure = Math.max(maxPressure, value);
function bodyFront(x, y) {
  const gx = x / cell + (gridWidth - 1) / 2, gy = y / cell + (gridHeight - 1) / 2;
  const ix = Math.floor(gx), iy = Math.floor(gy), fx = gx - ix, fy = gy - iy;
  if (ix < 0 || iy < 0 || ix >= gridWidth - 1 || iy >= gridHeight - 1) return 0;
  const i = iy * gridWidth + ix;
  const value = THREE.MathUtils.lerp(THREE.MathUtils.lerp(pressure[i], pressure[i + 1], fx), THREE.MathUtils.lerp(pressure[i + gridWidth], pressure[i + gridWidth + 1], fx), fy);
  return bodyDepth * Math.sqrt(Math.max(0, value / maxPressure));
}

// Find the three light islands inside the cloud: two eyes and its X badge.
const light = new Uint8Array(width * height);
for (let y = top; y <= bottom; y++) for (let x = left; x <= right; x++) {
  const dx = x - center[0], dy = center[1] - y;
  if (Math.hypot(dx, dy) > radiusAt(silhouette, Math.atan2(dy, dx)) - 12) continue;
  const p = (y * width + x) * channels;
  if (Math.min(data[p], data[p + 1], data[p + 2]) > 170) light[y * width + x] = 1;
}
const visited = new Uint8Array(width * height), features = [];
for (let index = 0; index < light.length; index++) {
  if (!light[index] || visited[index]) continue;
  const pixels = [index]; visited[index] = 1;
  let minX = width, maxX = 0, minY = height, maxY = 0;
  for (let cursor = 0; cursor < pixels.length; cursor++) {
    const pixel = pixels[cursor], x = pixel % width, y = Math.floor(pixel / width);
    minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    for (const next of [pixel - 1, pixel + 1, pixel - width, pixel + width]) {
      if (next >= 0 && next < light.length && light[next] && !visited[next]) { visited[next] = 1; pixels.push(next); }
    }
  }
  if (pixels.length < 500) continue;
  const mask = new Uint8Array(width * height); for (const pixel of pixels) mask[pixel] = 1;
  const origin = [(minX + maxX) / 2, (minY + maxY) / 2];
  features.push({ origin, bbox: [minX, minY, maxX, maxY], profile: radialProfile(mask, origin, 128, 140, 1.6) });
}
features.sort((a, b) => a.origin[0] - b.origin[0]);
if (features.length !== 3) throw new Error(`Expected two eyes and an X, measured ${features.length} features.`);

function puffGeometry(profile, depth, origin = [0, 0], feature = false) {
  const segments = profile.length, rings = feature ? 24 : 64;
  const positions = [], indices = [];
  const surface = (x, y) => feature ? bodyFront(origin[0] + x, origin[1] + y) - bodyFront(...origin) : 0;
  positions.push(0, 0, feature ? depth : bodyFront(0, 0));
  for (let v = 1; v < rings; v++) {
    const polar = v / rings * Math.PI;
    const radial = Math.sin(polar);
    for (let u = 0; u < segments; u++) {
      const angle = u / segments * Math.PI * 2;
      const x = Math.cos(angle) * profile[u] * scale * radial;
      const y = Math.sin(angle) * profile[u] * scale * radial;
      const z = feature ? depth * Math.cos(polar) : (v === rings / 2 ? 0 : Math.sign(Math.cos(polar)) * bodyFront(x, y));
      positions.push(x, y, z + surface(x, y));
    }
  }
  const back = positions.length / 3; positions.push(0, 0, feature ? -depth : -bodyFront(0, 0));
  for (let u = 0; u < segments; u++) indices.push(0, 1 + u, 1 + (u + 1) % segments);
  for (let v = 0; v < rings - 2; v++) for (let u = 0; u < segments; u++) {
    const a = 1 + v * segments + u, b = a + segments;
    const nextA = 1 + v * segments + (u + 1) % segments, nextB = nextA + segments;
    indices.push(a, b, nextA, b, nextB, nextA);
  }
  for (let u = 0; u < segments; u++) indices.push(back, 1 + (rings - 2) * segments + (u + 1) % segments, 1 + (rings - 2) * segments + u);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices); geometry.computeVertexNormals();
  return geometry;
}

const targetDir = path.join(rootDir, 'public/brand/models');
await fs.mkdir(targetDir, { recursive: true });
const models = [];
for (const tone of ['black', 'white']) {
  const character = new THREE.Group(); character.name = 'NormaCloud';
  const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x161719, roughness: 0.88, metalness: 0 });
  const lightMaterial = new THREE.MeshStandardMaterial({ color: 0xfbf5e9, roughness: 0.79, metalness: 0 });
  darkMaterial.name = 'Soft charcoal'; lightMaterial.name = 'Warm porcelain';
  const body = new THREE.Mesh(puffGeometry(silhouette, bodyDepth), tone === 'black' ? darkMaterial : lightMaterial);
  body.name = 'CloudBody'; character.add(body);
  const blinkTracks = [];
  for (const [i, feature] of features.entries()) {
    const xy = [(feature.origin[0] - center[0]) * scale, (center[1] - feature.origin[1]) * scale];
    const mesh = new THREE.Mesh(puffGeometry(feature.profile, i === 2 ? 0.028 : 0.032, xy, true), tone === 'black' ? lightMaterial : darkMaterial);
    mesh.position.set(xy[0], xy[1], bodyFront(...xy) + 0.007);
    mesh.name = ['EyeLeft', 'EyeRight', 'SignatureX'][i]; character.add(mesh);
    if (i < 2) blinkTracks.push(new THREE.VectorKeyframeTrack(`${mesh.name}.scale`, [0, 3.9, 4.04, 4.18, 5.5], [1, 1, 1, 1, 1, 1, 1, 0.09, 1, 1, 1, 1, 1, 1, 1]));
  }
  character.userData = { reference: source, method: 'Measured reference silhouette inflated into a closed smooth surface', variant: tone };
  const idleTimes = Array.from({ length: 25 }, (_, i) => i * 0.2);
  const idleValues = idleTimes.flatMap(t => [0, Math.sin(t / 4.8 * Math.PI * 2) * 0.05, 0]);
  const clips = [new THREE.AnimationClip('Blink', 5.5, blinkTracks), new THREE.AnimationClip('Float', 4.8, [new THREE.VectorKeyframeTrack('NormaCloud.position', idleTimes, idleValues)])];
  const binary = await new GLTFExporter().parseAsync(character, { binary: true, animations: clips, onlyVisible: true });
  const filename = `norma-cloud-${tone}.glb`;
  await fs.writeFile(path.join(targetDir, filename), Buffer.from(binary));
  let triangles = 0; character.traverse(object => { if (object.isMesh) triangles += object.geometry.index.count / 3; });
  models.push({ tone, file: `public/brand/models/${filename}`, bytes: binary.byteLength, triangles, animations: clips.map(c => c.name) });
}
const manifest = {
  status: 'models_built_locally', reference: source, reference_size: [width, height],
  body_bbox: [left, top, right, bottom], reference_body_aspect_ratio: (right - left) / (bottom - top),
  feature_bounds: features.map(f => f.bbox),
  construction: 'Reference silhouette and feature contours measured directly; closed inflated meshes with shared poles and smooth normals. Depth is interpreted from a single image.',
  external_services: [], model_files_present: true, models,
  weather_states: ['calm', 'rain', 'storm'], runtime_integrated: false,
};
await fs.writeFile(path.join(rootDir, 'output/3d/norma-cloud-v1/manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify(manifest, null, 2));
