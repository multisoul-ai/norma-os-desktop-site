// small product cues that travel with Norma's cloud mascot.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

import type { CloudActivity } from "./cloud-state";

export function makeCloudActivities() {
  const root = new THREE.Group();
  const groups = new Map<CloudActivity, THREE.Group>();
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const material = (color: number, roughness = 0.65) => {
    const result = new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness: 0,
    });
    materials.push(result);
    return result;
  };
  const paper = material(0xf8f9ee),
    ink = material(0x35412c),
    lime = material(0xc6e575),
    muted = material(0xadb99a);
  const group = (mode: CloudActivity) => {
    const result = new THREE.Group();
    result.visible = false;
    root.add(result);
    groups.set(mode, result);
    return result;
  };
  const box = (
    width: number,
    height: number,
    depth: number,
    surface: THREE.Material,
  ) => {
    const geometry = new RoundedBoxGeometry(
      width,
      height,
      depth,
      3,
      Math.min(width, height, depth) * 0.28,
    );
    geometries.push(geometry);
    return new THREE.Mesh(geometry, surface);
  };
  const sphere = (radius: number, surface: THREE.Material) => {
    const geometry = new THREE.SphereGeometry(radius, 16, 12);
    geometries.push(geometry);
    return new THREE.Mesh(geometry, surface);
  };
  const line = (
    points: THREE.Vector3[],
    surface: THREE.Material,
    radius = 0.012,
  ) => {
    const geometry = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(points),
      24,
      radius,
      6,
      false,
    );
    geometries.push(geometry);
    return new THREE.Mesh(geometry, surface);
  };
  const miniWindow = (scale = 1) => {
    const panel = new THREE.Group();
    panel.add(box(0.56, 0.39, 0.07, paper));
    const lamp = sphere(0.026, lime);
    lamp.position.set(-0.2, 0.12, 0.048);
    panel.add(lamp);
    for (let row = 0; row < 3; row++) {
      const bar = box(
        row === 1 ? 0.31 : 0.2,
        0.018,
        0.015,
        row === 0 ? ink : muted,
      );
      bar.position.set(row === 1 ? -0.01 : -0.065, 0.045 - row * 0.065, 0.045);
      panel.add(bar);
    }
    panel.scale.setScalar(scale);
    return panel;
  };

  const voice = group("voice");
  const voiceTray = box(1.28, 0.51, 0.09, paper);
  voiceTray.position.set(0, -0.99, 0.65);
  voice.add(voiceTray);
  const bars = Array.from({ length: 9 }, (_, i) => {
    const bar = box(0.049, 0.28, 0.049, i === 4 ? ink : lime);
    bar.position.set((i - 4) * 0.1, -0.99, 0.73);
    voice.add(bar);
    return bar;
  });

  const collaboration = group("collaboration");
  const nodeHomes = [
    new THREE.Vector3(-1.28, -0.41, 0.45),
    new THREE.Vector3(1.25, -0.46, 0.4),
    new THREE.Vector3(0, -1.1, 0.65),
  ];
  const nodes = nodeHomes.map((position, i) => {
    const panel = miniWindow(i === 2 ? 0.9 : 1);
    panel.position.copy(position);
    panel.rotation.z = (i - 1) * -0.1;
    collaboration.add(panel);
    return panel;
  });
  const paths = nodeHomes.map(
    (position) =>
      new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0, -0.25, -0.1),
        new THREE.Vector3(position.x * 0.8, -0.93, 0.1),
        position,
      ),
  );
  paths.forEach((path) =>
    collaboration.add(line(path.getPoints(12), muted, 0.009)),
  );
  const signals = paths.map(() => {
    const dot = sphere(0.037, lime);
    collaboration.add(dot);
    return dot;
  });

  const focus = group("focus");
  const workspace = box(1.38, 0.59, 0.08, paper);
  workspace.position.set(0, -1.0, 0.5);
  focus.add(workspace);
  const tiles = Array.from({ length: 6 }, (_, i) => {
    const tile = box(0.34, 0.19, 0.04, muted);
    tile.position.set(
      ((i % 3) - 1) * 0.41,
      -0.86 - Math.floor(i / 3) * 0.26,
      0.58,
    );
    focus.add(tile);
    return tile;
  });
  const selectedTile = box(0.36, 0.21, 0.055, lime);
  focus.add(selectedTile);

  const done = group("done");
  const badge = new THREE.Group();
  badge.position.set(1.01, -0.42, 0.65);
  badge.rotation.z = -0.09;
  badge.add(box(0.55, 0.55, 0.11, lime));
  badge.add(
    line(
      [
        new THREE.Vector3(-0.15, 0, 0.085),
        new THREE.Vector3(-0.035, -0.1, 0.085),
        new THREE.Vector3(0.16, 0.13, 0.085),
      ],
      ink,
      0.026,
    ),
  );
  done.add(badge);
  const confetti = Array.from({ length: 10 }, (_, i) => {
    const piece = box(0.027, 0.09, 0.024, i % 3 === 0 ? paper : lime);
    done.add(piece);
    return piece;
  });

  // Each activity owns its materials so outgoing and incoming props can overlap.
  const transitions = new Map(
    [...groups].map(([mode, item]) => {
      const copies = new Map<THREE.Material, THREE.Material>();
      item.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        const source = object.material as THREE.Material;
        if (!copies.has(source)) {
          const copy = source.clone();
          copy.transparent = true;
          copy.opacity = 0;
          materials.push(copy);
          copies.set(source, copy);
        }
        object.material = copies.get(source)!;
      });
      return [
        mode,
        {
          item,
          materials: [...copies.values()],
          opacity: 0,
          from: 0,
          target: 0,
          started: 0,
          activeSince: 0,
        },
      ];
    }),
  );
  const smooth = (value: number) => value * value * (3 - 2 * value);
  let previous: CloudActivity = "calm";
  return {
    root,
    update(time: number, activity: CloudActivity, motion: boolean) {
      if (previous !== activity) {
        previous = activity;
        transitions.forEach((state, mode) => {
          state.from = state.opacity;
          state.target = mode === activity ? 1 : 0;
          state.started = time;
          if (state.target) state.activeSince = time;
        });
      }
      transitions.forEach((state) => {
        const progress = motion
          ? smooth(THREE.MathUtils.clamp((time - state.started) / 0.72, 0, 1))
          : 1;
        state.opacity = THREE.MathUtils.lerp(
          state.from,
          state.target,
          progress,
        );
        state.item.visible = state.opacity > 0.001;
        state.item.scale.setScalar(0.93 + state.opacity * 0.07);
        state.item.position.y = -(1 - state.opacity) * 0.08;
        state.materials.forEach((surface) => {
          surface.opacity = state.opacity;
          surface.depthWrite = state.opacity > 0.995;
        });
      });
      const age = (mode: CloudActivity) =>
        motion ? time - transitions.get(mode)!.activeSince : 2;
      bars.forEach((bar, i) => {
        bar.scale.y = motion
          ? 0.3 + Math.abs(Math.sin(age("voice") * 5 + i * 0.72)) * 0.85
          : 0.4 + Math.sin(i * 0.8) ** 2 * 0.65;
      });
      nodes.forEach((node, i) => {
        node.position.y =
          nodeHomes[i].y +
          (motion ? Math.sin(age("collaboration") * 1.9 + i * 2) * 0.035 : 0);
      });
      signals.forEach((dot, i) => {
        dot.position.copy(
          paths[i].getPoint((age("collaboration") * 0.36 + i * 0.3) % 1),
        );
      });
      const focusAge = age("focus"),
        step = Math.floor(focusAge / 2.1);
      const selected = motion ? step % 6 : 1;
      const from = motion && step > 0 ? (step - 1) % 6 : selected;
      const glide = motion ? smooth(Math.min(1, (focusAge % 2.1) / 0.5)) : 1;
      selectedTile.position.lerpVectors(
        tiles[from].position,
        tiles[selected].position,
        glide,
      );
      selectedTile.position.z += 0.028;
      const doneAge = age("done");
      badge.position.y = -0.42 + (motion ? Math.sin(doneAge * 2) * 0.035 : 0);
      confetti.forEach((piece, i) => {
        piece.visible = doneAge < 2.7;
        const angle = (i / confetti.length) * Math.PI * 2,
          distance = 0.35 + doneAge * 0.36;
        piece.position.set(
          1.0 + Math.cos(angle) * distance * 0.65,
          -0.34 + Math.sin(angle) * distance - doneAge * doneAge * 0.1,
          0.6,
        );
        piece.rotation.z = angle + doneAge * 1.2;
        piece.scale.setScalar(Math.max(0, 1 - doneAge / 2.7));
      });
    },
    dispose() {
      geometries.forEach((item) => item.dispose());
      materials.forEach((item) => item.dispose());
    },
  };
}
