"use client";

// THROWAWAY mascot study: a real 3D character with gaze, blinks, floating, and reactions.
// Logo cues: charcoal silhouette, ivory X, side tuft, three small color blocks.
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import "./norma-mascot.css";

type Reaction = "idle" | "wave" | "happy";
type Controller = { react: (reaction: Reaction) => void };

export default function NormaMascot({ chinese }: { chinese: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<Controller | null>(null);
  const pausedRef = useRef(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [reaction, setReaction] = useState<Reaction>("idle");
  const [paused, setPaused] = useState(false);
  const [status, setStatus] = useState("loading");

  function react(next: Reaction) {
    controlsRef.current?.react(next);
    setReaction(next);
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => setReaction("idle"), 2400);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = stageRef.current;
    if (!canvas || !container) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch {
      setStatus("unavailable");
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 50);
    camera.position.set(0, 0.6, 6.5);
    camera.lookAt(0, 0.05, 0);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const environment = pmrem.fromScene(room, 0.04);
    scene.environment = environment.texture;
    scene.environmentIntensity = 0.45;
    room.dispose();
    pmrem.dispose();
    scene.add(new THREE.HemisphereLight(0xfffcf0, 0x9daa7c, 0.8));
    const keyLight = new THREE.DirectionalLight(0xfff5e7, 3.5);
    keyLight.position.set(-3, 5, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    Object.assign(keyLight.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 0.1, far: 16 });
    keyLight.shadow.normalBias = 0.015;
    keyLight.shadow.bias = -0.0001;
    keyLight.shadow.radius = 4;
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0xffd785, 2.0);
    rimLight.position.set(4, 2, -2);
    scene.add(rimLight);
    const fill = new THREE.DirectionalLight(0xcddffc, 0.9);
    fill.position.set(-4, 0, 2);
    scene.add(fill);

    const charcoal = new THREE.MeshPhysicalMaterial({
      color: 0x111518, roughness: 0.78, metalness: 0,
      clearcoat: 0.03, clearcoatRoughness: 0.8,
      sheen: 0.07, sheenColor: new THREE.Color(0x74808e), sheenRoughness: 0.9,
    });
    const ivory = new THREE.MeshStandardMaterial({ color: 0xfff9e8, roughness: 0.38 });
    const cheekMaterial = new THREE.MeshStandardMaterial({ color: 0xc48070, roughness: 0.8 });
    const goldMaterial = new THREE.MeshStandardMaterial({ color: 0xf6c662, roughness: 0.45 });
    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>([charcoal, ivory, cheekMaterial, goldMaterial]);
    const sphere = new THREE.SphereGeometry(1, 64, 48);
    geometries.add(sphere);
    const mascot = new THREE.Group();
    scene.add(mascot);

    function ellipsoid(parent: THREE.Object3D, material: THREE.Material, position: number[], scale: number[]) {
      const mesh = new THREE.Mesh(sphere, material);
      mesh.position.set(position[0], position[1], position[2]);
      mesh.scale.set(scale[0], scale[1], scale[2]);
      parent.add(mesh);
      return mesh;
    }
    function capsule(parent: THREE.Object3D, material: THREE.Material, radius: number, length: number) {
      const geometry = new THREE.CapsuleGeometry(radius, length, 8, 20);
      geometries.add(geometry);
      const mesh = new THREE.Mesh(geometry, material);
      parent.add(mesh);
      return mesh;
    }
    // A slightly pear-shaped continuous body rather than a humanoid doll.
    const bodyGeometry = new THREE.SphereGeometry(1, 72, 56);
    const positions = bodyGeometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i), y = positions.getY(i), z = positions.getZ(i);
      const widen = 1 - y * 0.13;
      positions.setXYZ(i, x * 0.89 * widen, y * 0.88, z * 0.71 * widen);
    }
    bodyGeometry.computeVertexNormals();
    geometries.add(bodyGeometry);
    const body = new THREE.Mesh(bodyGeometry, charcoal);
    body.position.y = 0.14;
    mascot.add(body);

    const tuft = ellipsoid(mascot, charcoal, [-0.38, 0.94, -0.06], [0.18, 0.34, 0.18]);
    tuft.rotation.z = -0.45;
    const smallTuft = ellipsoid(mascot, charcoal, [-0.11, 1.02, -0.12], [0.12, 0.23, 0.14]);
    smallTuft.rotation.z = -0.2;
    const sideTuft = new THREE.Group();
    sideTuft.position.set(0.73, 0.49, -0.18);
    mascot.add(sideTuft);
    const tail = ellipsoid(sideTuft, charcoal, [0.03, -0.2, -0.06], [0.25, 0.41, 0.22]);
    tail.rotation.z = 0.45;
    const bowA = ellipsoid(sideTuft, charcoal, [-0.03, 0.17, 0.04], [0.13, 0.23, 0.12]);
    bowA.rotation.z = 0.78;
    const bowB = ellipsoid(sideTuft, charcoal, [0.15, 0.18, 0.04], [0.13, 0.21, 0.12]);
    bowB.rotation.z = -0.78;
    ellipsoid(sideTuft, goldMaterial, [0.06, 0.04, 0.11], [0.065, 0.075, 0.04]);

    const patch = new THREE.Group();
    patch.position.set(0.43, 0.66, 0.51);
    patch.rotation.set(-0.35, 0.32, -0.04);
    mascot.add(patch);
    for (const rotation of [-Math.PI / 4, Math.PI / 4]) {
      const bar = capsule(patch, ivory, 0.052, 0.29);
      bar.rotation.z = rotation;
    }
    const face = new THREE.Group();
    mascot.add(face);
    const eyes: THREE.Group[] = [];
    for (const x of [-0.26, 0.26]) {
      const eye = new THREE.Group();
      eye.position.set(x, 0.16, 0.68);
      eye.rotation.y = x * 0.37;
      face.add(eye);
      ellipsoid(eye, ivory, [0, 0, 0], [0.095, 0.145, 0.034]);
      eyes.push(eye);
      const cheek = ellipsoid(face, cheekMaterial, [x * 1.75, -0.08, 0.635], [0.085, 0.030, 0.015]);
      cheek.rotation.y = x * 0.9;
      cheek.rotation.z = x * -0.2;
    }
    const smileCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.075, -0.085, 0.729),
      new THREE.Vector3(0, -0.18, 0.746),
      new THREE.Vector3(0.075, -0.085, 0.729),
    );
    const smileGeometry = new THREE.TubeGeometry(smileCurve, 24, 0.011, 8, false);
    geometries.add(smileGeometry);
    face.add(new THREE.Mesh(smileGeometry, ivory));
    const leftArm = new THREE.Group();
    leftArm.position.set(-0.76, -0.05, 0.02);
    mascot.add(leftArm);
    const leftHand = ellipsoid(leftArm, charcoal, [-0.09, -0.15, 0.02], [0.18, 0.30, 0.18]);
    leftHand.rotation.z = -0.3;
    const rightArm = new THREE.Group();
    rightArm.position.set(0.77, -0.06, 0.02);
    mascot.add(rightArm);
    const rightHand = ellipsoid(rightArm, charcoal, [0.09, -0.15, 0.02], [0.18, 0.30, 0.18]);
    rightHand.rotation.z = 0.3;
    const feet = [-0.34, 0.34].map(x => ellipsoid(mascot, charcoal, [x, -0.72, 0.13], [0.22, 0.17, 0.30]));
    const colors = [0x7fc8ee, 0xf8a4a6, 0xf7ce69];
    colors.forEach((color, index) => {
      const material = new THREE.MeshStandardMaterial({ color, roughness: 0.5 });
      materials.add(material);
      const geometry = new RoundedBoxGeometry(0.074, 0.074, 0.027, 3, 0.019);
      geometries.add(geometry);
      const square = new THREE.Mesh(geometry, material);
      square.position.set(-0.11 + index * 0.11, -0.47, 0.572);
      square.rotation.x = 0.5;
      square.rotation.z = -0.12;
      mascot.add(square);
    });

    mascot.traverse(object => { if (object instanceof THREE.Mesh) { object.castShadow = true; object.receiveShadow = true; } });

    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = shadowCanvas.height = 128;
    const ctx = shadowCanvas.getContext("2d")!;
    const gradient = ctx.createRadialGradient(64, 64, 4, 64, 64, 62);
    gradient.addColorStop(0, "rgba(30,44,14,0.30)");
    gradient.addColorStop(0.55, "rgba(30,44,14,0.12)");
    gradient.addColorStop(1, "rgba(30,44,14,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowMaterial = new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false });
    materials.add(shadowMaterial);
    const shadowGeometry = new THREE.PlaneGeometry(3.0, 2.0);
    geometries.add(shadowGeometry);
    const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(0, -1.20, 0);
    scene.add(shadow);

    const confetti = Array.from({ length: 18 }, (_, i) => {
      const geometry = new RoundedBoxGeometry(0.07, 0.11, 0.04, 2, 0.015);
      geometries.add(geometry);
      const material = new THREE.MeshStandardMaterial({ color: colors[i % colors.length], roughness: 0.45 });
      materials.add(material);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.visible = false;
      scene.add(mesh);
      return mesh;
    });
    let elapsed = 0;
    const startedAt = performance.now();
    let last = startedAt;
    let action: Reaction = "idle";
    let actionStart = 0;
    let visible = true;
    let frame = 0;
    let targetX = 0, targetY = 0, lookX = 0, lookY = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    controlsRef.current = { react(next) { action = next; actionStart = elapsed; } };
    function resize() {
      const { width, height } = container!.getBoundingClientRect();
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    intersection.observe(container);
    const onPointer = (event: PointerEvent) => {
      const rect = container!.getBoundingClientRect();
      targetX = THREE.MathUtils.clamp((event.clientX - rect.left - rect.width / 2) / (rect.width / 2), -1, 1);
      targetY = THREE.MathUtils.clamp((event.clientY - rect.top - rect.height / 2) / (rect.height / 2), -1, 1);
    };
    const onLeave = () => { targetX = 0; targetY = 0; };
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    function animate(now: number) {
      frame = requestAnimationFrame(animate);
      const delta = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!visible || document.hidden) return;
      elapsed = (now - startedAt) / 1000;
      const motion = !reduced.matches && !pausedRef.current;
      const t = motion ? elapsed : 0;
      const sinceAction = elapsed - actionStart;
      if (sinceAction > 2.4) action = "idle";
      const wave = action === "wave" ? Math.sin(Math.min(sinceAction / 0.4, 1) * Math.PI / 2) * Math.min((2.4 - sinceAction) / 0.3, 1) : 0;
      const cheer = action === "happy" ? Math.sin(Math.min(sinceAction / 2.4, 1) * Math.PI) : 0;
      const follow = 1 - Math.exp(-delta * 5);
      lookX = motion ? THREE.MathUtils.lerp(lookX, targetX, follow) : 0;
      lookY = motion ? THREE.MathUtils.lerp(lookY, targetY, follow) : 0;
      mascot.position.y = motion ? Math.sin(t * 1.85) * 0.07 + cheer * 0.24 : 0;
      mascot.rotation.y = lookX * 0.23 + (motion ? Math.sin(t * 0.7) * 0.045 : 0);
      mascot.rotation.x = lookY * 0.10;
      mascot.rotation.z = motion ? Math.sin(t * 1.1) * 0.035 + wave * 0.075 + cheer * Math.sin(sinceAction * 11) * 0.10 : 0;
      const squash = motion ? 1 + Math.sin(t * 1.85) * 0.018 + cheer * 0.035 : 1;
      mascot.scale.set(1 / Math.sqrt(squash), squash, 1);
      leftArm.rotation.z = motion ? -0.08 + Math.sin(t * 1.85 + 0.5) * 0.09 - wave * (1.8 + Math.sin(sinceAction * 16) * 0.27) - cheer * 1.7 : 0;
      rightArm.rotation.z = motion ? 0.08 - Math.sin(t * 1.85) * 0.09 + cheer * 1.7 : 0;
      sideTuft.rotation.z = motion ? Math.sin(t * 1.85 - 0.8) * 0.08 + wave * 0.1 : 0;
      feet.forEach((foot, i) => { foot.rotation.x = motion ? Math.sin(t * 1.85 + i * 0.8) * 0.06 : 0; });
      // A short double blink, then a long open interval. Never a constant mechanical loop.
      const blinkPhase = t % 5.8;
      const blink = (blinkPhase > 4.3 && blinkPhase < 4.48) || (blinkPhase > 4.66 && blinkPhase < 4.8) ? 0.10 : 1;
      eyes.forEach((eye) => { eye.scale.y = motion ? THREE.MathUtils.lerp(eye.scale.y, action === "happy" ? 0.55 : blink, 1 - Math.exp(-delta * 34)) : 1; });
      eyes.forEach((eye, index) => { eye.position.x = (index === 0 ? -0.26 : 0.26) + lookX * 0.035; eye.position.y = 0.16 - lookY * 0.035; });
      shadow.scale.setScalar(1 - (mascot.position.y + 0.07) * 0.25);
      shadowMaterial.opacity = 0.80 - mascot.position.y * 0.55;
      confetti.forEach((piece, i) => {
        piece.visible = action === "happy" && motion && sinceAction < 2.15;
        if (!piece.visible) return;
        const angle = i / confetti.length * Math.PI * 2;
        const radius = 0.8 + sinceAction * 0.65;
        piece.position.set(Math.cos(angle) * radius, 0.3 + Math.sin(angle) * 0.55 + sinceAction * 1.25 - sinceAction * sinceAction * 0.8, Math.sin(angle * 3) * 0.65);
        piece.rotation.set(sinceAction * (3 + i * .15), angle + sinceAction * 4, angle + sinceAction * 3);
        piece.scale.setScalar(Math.min(1, (2.15 - sinceAction) * 3));
      });
      renderer.render(scene, camera);
    }
    frame = requestAnimationFrame(animate);
    setStatus("ready");
    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersection.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      controlsRef.current = null;
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      geometries.forEach(geometry => geometry.dispose());
      materials.forEach(material => material.dispose());
      environment.dispose();
      shadowTexture.dispose();
      renderer.dispose();
    };
  }, []);

  const bubble = reaction === "wave" ? (chinese ? "嗨，我是 Norma！" : "Hey, I’m Norma!") : reaction === "happy" ? (chinese ? "好耶，交给我们！" : "We’ve got this!") : (chinese ? "你的想法，我接住啦。" : "Big ideas. Little sidekick.");
  return <div className="nm-scene" data-reaction={reaction} data-status={status}>
    <div className="nm-disc" aria-hidden="true" />
    <span className="nm-orbit-dot nm-orbit-dot-blue" aria-hidden="true" />
    <span className="nm-orbit-dot nm-orbit-dot-pink" aria-hidden="true" />
    <span className="nm-orbit-star" aria-hidden="true">✳</span>
    <div className="nm-eyebrow"><span />NORMA / YOUR LITTLE SIDEKICK</div>
    <div className="nm-speech" aria-live="polite">{bubble}<span aria-hidden="true">✧</span></div>
    <div className="nm-canvas-wrap" ref={stageRef}>
      <canvas ref={canvasRef} tabIndex={0} role="button" aria-label={chinese ? "和 Norma 打招呼，点击或按回车让它挥手" : "Say hello to Norma: click or press Enter to make it wave"} onClick={() => react("wave")} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); react("wave"); } }} />
      {status === "loading" && <span className="nm-loading">{chinese ? "Norma 马上就来…" : "Here comes Norma…"}</span>}
      {status === "unavailable" && <span className="nm-loading">{chinese ? "当前浏览器无法显示 3D，请使用支持 WebGL 的浏览器。" : "Open in a WebGL-enabled browser to meet Norma."}</span>}
    </div>
    <div className="nm-task nm-task-claude"><span className="nm-task-icon">✳</span><div><strong>Claude Code</strong><small>{chinese ? "正在把想法变成现实" : "Bringing the idea to life"}</small></div><i /></div>
    <div className="nm-task nm-task-codex"><span className="nm-task-icon">⌘</span><div><strong>Codex</strong><small>{chinese ? "测试通过，等你看看" : "All green. Ready for you."}</small></div><span className="nm-task-check">✓</span></div>
    <div className="nm-controls">
      <button onClick={() => react("wave")} aria-pressed={reaction === "wave"}><span aria-hidden="true">↗</span>{chinese ? "打个招呼" : "Say hello"}</button>
      <button onClick={() => react("happy")} aria-pressed={reaction === "happy"}><span aria-hidden="true">✧</span>{chinese ? "一起开工" : "Let’s do this"}</button>
      <button className="nm-pause" onClick={() => { pausedRef.current = !paused; setPaused(!paused); }} aria-label={paused ? (chinese ? "播放吉祥物动画" : "Play mascot animation") : (chinese ? "暂停吉祥物动画" : "Pause mascot animation")} aria-pressed={paused}>{paused ? "▷" : "Ⅱ"}</button>
    </div>
    <p className="nm-hint">{chinese ? "鼠标移近一点，它会看向你。" : "Move a little closer. You have its attention."}</p>
  </div>;
}
