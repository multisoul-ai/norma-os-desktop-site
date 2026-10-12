"use client";

// THROWAWAY mascot study: a real 3D character with gaze, blinks, floating, and reactions.
// Logo cues: charcoal silhouette, ivory X, side tuft, three small color blocks.
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { makeMascot, mascotOptions, type MascotKind } from "./mascot-models";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import NormaCloud, { CloudStudio } from "./norma-cloud";
import "./norma-mascot.css";

type Reaction = "idle" | "wave" | "happy" | "turn";
type Controller = { react: (reaction: Reaction) => void };

function MascotScene({ chinese, kind }: { chinese: boolean; kind: MascotKind }) {
  const isSnowie = kind === "snowie";
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
    resetTimerRef.current = setTimeout(() => setReaction("idle"), next === "turn" ? 4200 : 2400);
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
    renderer.toneMappingExposure = isSnowie ? 1.18 : 1.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const scene = new THREE.Scene();
    const camera = isSnowie
      ? new THREE.OrthographicCamera(-2.1, 2.1, 2.1, -2.1, 0.1, 50)
      : new THREE.PerspectiveCamera(33, 1, 0.1, 50);
    camera.position.set(0, isSnowie ? 0.7 : 0.6, isSnowie ? 7 : 6.5);
    camera.lookAt(0, isSnowie ? 0.18 : 0, 0);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const environment = pmrem.fromScene(room, 0.04);
    scene.environment = environment.texture;
    scene.environmentIntensity = isSnowie ? 0.65 : 0.45;
    room.dispose();
    pmrem.dispose();
    scene.add(new THREE.HemisphereLight(0xfffcf0, isSnowie ? 0xc9857c : 0x9daa7c, isSnowie ? 1.4 : 0.8));
    const keyLight = new THREE.DirectionalLight(0xfff5e7, isSnowie ? 3.0 : 3.5);
    keyLight.position.set(-3, 5, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    Object.assign(keyLight.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 0.1, far: 16 });
    keyLight.shadow.normalBias = 0.015;
    keyLight.shadow.bias = -0.0001;
    keyLight.shadow.radius = 4;
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(isSnowie ? 0xfff6d6 : 0xffd785, isSnowie ? 2.8 : 2.0);
    rimLight.position.set(4, 2, -2);
    scene.add(rimLight);
    const fill = new THREE.DirectionalLight(isSnowie ? 0xffe3dc : 0xcddffc, isSnowie ? 1.0 : 0.9);
    fill.position.set(4, 0, 3);
    scene.add(fill);

    const model = makeMascot(kind);
    const { root: mascot, eyes, eyeHomes, leftArm, rightArm, secondary: sideTuft, feet, geometries, materials } = model;
    scene.add(mascot);
    const colors = [0x7fc8ee, 0xf8a4a6, 0xf7ce69];

    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = shadowCanvas.height = 128;
    const ctx = shadowCanvas.getContext("2d")!;
    const gradient = ctx.createRadialGradient(64, 64, 4, 64, 64, 62);
    gradient.addColorStop(0, isSnowie ? "rgba(81,39,32,0.36)" : "rgba(30,44,14,0.30)");
    gradient.addColorStop(0.55, isSnowie ? "rgba(81,39,32,0.12)" : "rgba(30,44,14,0.12)");
    gradient.addColorStop(1, "rgba(81,39,32,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowMaterial = new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false });
    materials.add(shadowMaterial);
    const shadowGeometry = new THREE.PlaneGeometry(3.0, 2.0);
    geometries.add(shadowGeometry);
    const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(0, isSnowie ? -1.43 : -1.20, 0);
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
      if (camera instanceof THREE.OrthographicCamera) {
        const aspect = width / height;
        const halfHeight = Math.max(2.08, 1.75 / aspect);
        camera.left = -halfHeight * aspect;
        camera.right = halfHeight * aspect;
        camera.top = halfHeight;
        camera.bottom = -halfHeight;
      } else camera.aspect = width / height;
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
      const tempo = kind === "cloud" ? 1.25 : kind === "x" ? 2.1 : 1.7;
      const sinceAction = elapsed - actionStart;
      if (sinceAction > (action === "turn" ? 4.2 : 2.4)) action = "idle";
      const wave = action === "wave" ? Math.sin(Math.min(sinceAction / 0.4, 1) * Math.PI / 2) * Math.min((2.4 - sinceAction) / 0.3, 1) : 0;
      const cheer = action === "happy" ? Math.sin(Math.min(sinceAction / 2.4, 1) * Math.PI) : 0;
      const follow = 1 - Math.exp(-delta * 5);
      lookX = motion ? THREE.MathUtils.lerp(lookX, targetX, follow) : 0;
      lookY = motion ? THREE.MathUtils.lerp(lookY, targetY, follow) : 0;
      mascot.position.y = motion ? Math.sin(t * tempo) * (kind === "cloud" ? .08 : isSnowie ? .018 : .06) + cheer * (isSnowie ? .12 : .22) : 0;
      const turn = action === "turn" && motion ? Math.PI * 2 * (.5 - .5 * Math.cos(Math.min(sinceAction / 4.2, 1) * Math.PI)) : 0;
      mascot.rotation.y = (isSnowie ? -.12 : 0) + turn + lookX * (isSnowie ? .14 : .23) + (motion ? Math.sin(t * .7) * .045 + (kind === "x" ? wave * .25 : 0) : 0);
      mascot.rotation.x = lookY * (isSnowie ? .035 : .10);
      const spin = action === "happy" && kind === "x" ? Math.PI * 2 * (.5 - .5 * Math.cos(Math.min(sinceAction / 2.4, 1) * Math.PI)) : 0;
      mascot.rotation.z = motion ? Math.sin(t * (kind === "x" ? .9 : 1.1)) * (kind === "x" ? .14 : .035) + wave * (kind === "x" ? .20 : .075) + (kind === "x" ? spin : cheer * Math.sin(sinceAction * 11) * .10) : 0;
      const squash = motion ? 1 + Math.sin(t * tempo) * (kind === "cloud" ? .036 : isSnowie ? .004 : .015) + cheer * .015 : 1;
      mascot.scale.set(1 / Math.sqrt(squash), squash, 1);
      leftArm.rotation.z = motion ? -0.08 + Math.sin(t * 1.85 + 0.5) * 0.09 - wave * (1.8 + Math.sin(sinceAction * 16) * 0.27) - cheer * 1.7 : 0;
      rightArm.rotation.z = motion ? 0.08 - Math.sin(t * 1.85) * 0.09 + cheer * 1.7 : 0;
      sideTuft.rotation.z = motion ? Math.sin(t * 1.85 - 0.8) * 0.08 + wave * 0.1 : 0;
      feet.forEach((foot, i) => { foot.rotation.x = motion ? Math.sin(t * 1.85 + i * 0.8) * 0.06 : 0; });
      // A short double blink, then a long open interval. Never a constant mechanical loop.
      const blinkPhase = t % 5.8;
      const blink = (blinkPhase > 4.3 && blinkPhase < 4.48) || (blinkPhase > 4.66 && blinkPhase < 4.8) ? 0.10 : 1;
      if (!isSnowie) eyes.forEach((eye) => { eye.scale.y = motion ? THREE.MathUtils.lerp(eye.scale.y, action === "happy" ? 0.55 : blink, 1 - Math.exp(-delta * 34)) : 1; });
      eyes.forEach((eye, index) => { eye.position.x = eyeHomes[index].x + lookX * .025; eye.position.y = eyeHomes[index].y - lookY * .025; });
      if ("update" in model && typeof model.update === "function") model.update(t, motion, motion ? wave : 0, motion ? cheer : 0, lookX, lookY);
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
  }, [kind, isSnowie]);

  const bubble = reaction === "wave" ? (chinese ? "嗨，我是 Norma！" : "Hey, I’m Norma!") : reaction === "happy" ? (chinese ? "好耶，交给我们！" : "We’ve got this!") : reaction === "turn" ? (chinese ? "转一圈，认识一下。" : "A little spin. Nice to meet you.") : (chinese ? "你的想法，我接住啦。" : "Big ideas. Little sidekick.");
  const option = mascotOptions.find(option => option.id === kind)!;
  return <div className="nm-scene" data-kind={kind} data-reaction={reaction} data-status={status}>
    <div className="nm-disc" aria-hidden="true" />
    {isSnowie && <div className="nm-poster-type" aria-hidden="true"><span>HELLO,</span><strong>NORMA.</strong></div>}
    <span className="nm-orbit-dot nm-orbit-dot-blue" aria-hidden="true" />
    <span className="nm-orbit-dot nm-orbit-dot-pink" aria-hidden="true" />
    <span className="nm-orbit-star" aria-hidden="true">✳</span>
    <div className="nm-eyebrow"><span />{option.number} / {option.en.toUpperCase()} / NORMA</div>
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
      {isSnowie && <button onClick={() => react("turn")} aria-pressed={reaction === "turn"}><span aria-hidden="true">⟳</span>{chinese ? "转一圈" : "Take a spin"}</button>}
      <button className="nm-pause" onClick={() => { pausedRef.current = !paused; setPaused(!paused); }} aria-label={paused ? (chinese ? "播放吉祥物动画" : "Play mascot animation") : (chinese ? "暂停吉祥物动画" : "Pause mascot animation")} aria-pressed={paused}>{paused ? "▷" : "Ⅱ"}</button>
    </div>
    <p className="nm-hint">{chinese ? option.traits : option.enTraits}</p>
  </div>;
}


export default function NormaMascot({ chinese, studio = false }: { chinese: boolean; studio?: boolean }) {
  const search = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const value = search.get("mascot");
  const kind: MascotKind = mascotOptions.some(option => option.id === value) ? value as MascotKind : "cloud";
  const selected = mascotOptions.find(option => option.id === kind)!;
  function select(next: MascotKind) {
    const params = new URLSearchParams(search.toString());
    params.set("mascot", next);
    router.replace(`${path}?${params.toString()}`, { scroll: false });
  }
  if (kind === "cloud") return <NormaCloud chinese={chinese} studio={studio} />;
  return <div className={`nm-design ${studio ? "nm-design-studio" : "nm-design-inline"}`} data-character={kind}>
    <div className="nm-model-menu">
      {studio && <div className="nm-model-menu-heading"><span>NORMA · CHARACTER STUDY</span><h2>{chinese ? "一个熟悉的标记，\n一位新的小搭档。" : "A familiar signature.\nA new little friend."}</h2></div>}
      <nav className="nm-model-options" aria-label={chinese ? "选择吉祥物形象" : "Choose a mascot design"}>
        {mascotOptions.map(option => <button key={option.id} aria-pressed={kind === option.id} onClick={() => select(option.id)}>
          <span className={`nm-model-symbol nm-symbol-${option.id}`} aria-hidden="true">{option.icon}</span>
          <span className="nm-model-option-copy"><strong><small>{option.number}</small>{chinese ? option.name : option.en}</strong>{studio && <span>{chinese ? option.brief : option.enBrief}</span>}</span>
          {studio && <i aria-hidden="true">{kind === option.id ? "↗" : "+"}</i>}
        </button>)}
      </nav>
      {studio && <p className="nm-menu-note">{chinese ? "移动鼠标、打个招呼，\n也试试每款角色的庆祝动作。" : "Move your cursor, say hello,\nand try each character’s celebration."}</p>}
    </div>
    <div className="nm-model-preview"><MascotScene key={kind} kind={kind} chinese={chinese} />{studio && <div className="nm-model-caption" aria-live="polite"><span>{selected.number} / 04</span><p>{chinese ? selected.brief : selected.enBrief}</p></div>}</div>
  </div>;
}

export function MascotStudio({ chinese }: { chinese: boolean }) {
  const search = useSearchParams();
  const base = chinese ? "/zh-cn" : "/";
  if (!search.get("mascot") || search.get("mascot") === "cloud") return <CloudStudio chinese={chinese} />;
  return <main className="np nm-studio" data-study="snowie">
    <header className="nm-studio-header"><a href={`${base}?variant=A`}><img src="/brand/app-icon.png" width="29" height="29" alt="" />norma<span>Character studio</span></a><a href={`${base}?variant=A&mascot=${search.get("mascot") ?? "snowie"}`}>{chinese ? "放进官网里看看" : "See it on the homepage"}<span>↗</span></a></header>
    <div className="nm-studio-intro"><p>A LITTLE NORMA. A LITTLE MAGIC.</p><h1>{chinese ? "你好，小小 Norma。" : "Hello, little Norma."}</h1><span>{chinese ? "戴上薄荷软帽，带着熟悉的 X，和你一起创造。" : "A soft mint beret. The familiar X. Ready to make something together."}</span></div>
    <NormaMascot chinese={chinese} studio />
    <footer className="nm-studio-footer"><span>NORMA OS · CHARACTER EXPLORATION</span><a href="https://dribbble.com/shots/21840979-ALLIE-SNOWIES-3D-Character-illustration" target="_blank" rel="noreferrer">{chinese ? "造型参考：ALLIE & SNOWIES / Plainthing Studio ↗" : "Reference: ALLIE & SNOWIES / Plainthing Studio ↗"}</a><span>{chinese ? "设计原型 / 04" : "DESIGN STUDY / 04"}</span></footer>
  </main>;
}
