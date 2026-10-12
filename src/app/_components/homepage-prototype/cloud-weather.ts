// THROWAWAY: weather effects surrounding the approved cloud model.
import * as THREE from "three";

export type CloudWeather = "calm" | "rain" | "storm";

export function makeCloudWeather() {
  const root = new THREE.Group();
  const dropGeometry = new THREE.SphereGeometry(1, 8, 6);
  const dropMaterial = new THREE.MeshStandardMaterial({
    color: 0x78a7bc, roughness: 0.3, metalness: 0,
    transparent: true, opacity: 0.8,
  });
  const drops = new THREE.InstancedMesh(dropGeometry, dropMaterial, 36);
  drops.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  drops.frustumCulled = false;
  root.add(drops);

  const boltShape = new THREE.Shape();
  boltShape.moveTo(0.04, 0.12);
  boltShape.lineTo(-0.19, -0.30);
  boltShape.lineTo(-0.035, -0.27);
  boltShape.lineTo(-0.13, -0.65);
  boltShape.lineTo(0.22, -0.16);
  boltShape.lineTo(0.055, -0.19);
  boltShape.lineTo(0.20, 0.12);
  boltShape.closePath();
  const boltGeometry = new THREE.ExtrudeGeometry(boltShape, {
    depth: 0.055, bevelEnabled: true, bevelSize: 0.017,
    bevelThickness: 0.016, bevelSegments: 3, steps: 1,
  });
  const boltMaterial = new THREE.MeshStandardMaterial({
    color: 0xffd174, emissive: 0xffbd45, emissiveIntensity: 0.9,
    roughness: 0.48, transparent: true, opacity: 0,
  });
  const bolt = new THREE.Mesh(boltGeometry, boltMaterial);
  bolt.position.set(0.2, -0.43, 0.15);
  root.add(bolt);
  const lightning = new THREE.PointLight(0xffdf9a, 0, 3.5, 2);
  lightning.position.set(0.2, -0.48, 0.5);
  root.add(lightning);

  const dummy = new THREE.Object3D();
  let lastStrike = -1;
  let weatherStart = 0;
  let previousMode: CloudWeather = "calm";
  let activeMode: CloudWeather = "rain";
  let started = 0, rainOpacity = 0, stormOpacity = 0, fromRain = 0, fromStorm = 0;
  return {
    root,
    update(time: number, mode: CloudWeather, motion: boolean) {
      if (mode !== previousMode) {
        fromRain = rainOpacity; fromStorm = stormOpacity; started = time;
        if (mode !== "calm") { activeMode = mode; lastStrike = -1; weatherStart = time; }
        previousMode = mode;
      }
      const fraction = motion ? THREE.MathUtils.clamp((time - started) / 0.72, 0, 1) : 1;
      const ease = fraction * fraction * (3 - 2 * fraction);
      rainOpacity = THREE.MathUtils.lerp(fromRain, mode === "calm" ? 0 : 1, ease);
      stormOpacity = THREE.MathUtils.lerp(fromStorm, mode === "storm" ? 1 : 0, ease);
      dropMaterial.opacity = rainOpacity * 0.8;
      root.visible = rainOpacity > 0.001 || stormOpacity > 0.001;
      if (!root.visible) return false;
      const t = motion ? time - weatherStart : 1.1;
      for (let i = 0; i < drops.count; i++) {
        const phase = (t * (activeMode === "storm" ? 1.16 : 0.73) + i * 0.618034) % 1;
        const lane = ((i * 13) % 37) / 36;
        dummy.position.set((lane - 0.5) * 1.9 - phase * 0.10,
          -0.43 - phase * 1.05, ((i * 7) % 11) / 24 - 0.23);
        const endFade = Math.min(1, phase * 7, (1 - phase) * 7);
        dummy.scale.set(0.014 * endFade, (0.045 + (i % 3) * 0.012) * endFade, 0.014 * endFade);
        dummy.rotation.z = -0.12;
        dummy.updateMatrix();
        drops.setMatrixAt(i, dummy.matrix);
      }
      drops.instanceMatrix.needsUpdate = true;
      const cycle = Math.floor(t / 4.8);
      const phase = t % 4.8;
      // One soft local glow per cycle. Reduced motion keeps a still lightning symbol.
      const pulse = motion ? Math.pow(Math.max(0, 1 - phase / 0.65), 2) : 0;
      bolt.visible = stormOpacity > 0.001;
      boltMaterial.opacity = stormOpacity * (0.40 + pulse * 0.60);
      boltMaterial.emissiveIntensity = 0.3 + pulse * 1.3;
      bolt.scale.setScalar(0.86 + pulse * 0.14);
      lightning.intensity = stormOpacity * pulse * 0.36;
      const strike = mode === "storm" && motion && cycle !== lastStrike && phase < 0.4;
      if (strike) lastStrike = cycle;
      return strike;
    },
    dispose() {
      dropGeometry.dispose(); dropMaterial.dispose();
      boltGeometry.dispose(); boltMaterial.dispose();
    },
  };
}
