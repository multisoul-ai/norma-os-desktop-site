"use client";

// THROWAWAY: the approved cloud, sculpted locally from the measured reference contours.
import { useEffect, useRef, useState, type RefObject } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { makeCloudWeather, type CloudWeather } from "./cloud-weather";
import "./norma-cloud.css";

type CloudTone = "black" | "white";
type CloudController = { greet: () => void; reset: () => void };

function CloudViewport({ tone, weather, paused, chinese, controller, audio }: {
  tone: CloudTone; weather: CloudWeather; paused: boolean; chinese: boolean;
  controller: RefObject<CloudController | null>; audio: RefObject<AudioContext | null>;
}) {
  const host = useRef<HTMLDivElement>(null);
  const live = useRef({ weather, paused });
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  useEffect(() => { live.current = { weather, paused }; }, [weather, paused]);

  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); }
    catch { setStatus("error"); return; }
    setStatus("loading");
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);
    renderer.domElement.tabIndex = 0;
    renderer.domElement.setAttribute("aria-label", chinese ? "拖动或按左右方向键旋转云朵" : "Drag or use the arrow keys to rotate the cloud");
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-2.3, 2.3, 2.3, -2.3, 0.1, 40);
    camera.position.set(0.15, 0.45, 7);
    const orbit = new OrbitControls(camera, renderer.domElement);
    orbit.target.set(0, -0.15, 0);
    orbit.enablePan = false; orbit.enableZoom = false;
    orbit.enableDamping = true; orbit.dampingFactor = 0.09;
    orbit.minPolarAngle = Math.PI * 0.25; orbit.maxPolarAngle = Math.PI * 0.72;
    orbit.update(); orbit.saveState();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const environment = pmrem.fromScene(room, 0.04);
    scene.environment = environment.texture;
    scene.environmentIntensity = 0.45;
    room.dispose(); pmrem.dispose();
    scene.add(new THREE.HemisphereLight(0xfffcf6, 0xc9c6c0, 0.55));
    const key = new THREE.DirectionalLight(0xfff9ed, 1.7);
    key.position.set(-3, 4, 5); scene.add(key);
    const fill = new THREE.DirectionalLight(0xe5edf7, 0.65);
    fill.position.set(4, 1, 2); scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffffff, 1.5);
    rim.position.set(2, 3, -3); scene.add(rim);

    const cloud = new THREE.Group(); scene.add(cloud);
    const weatherEffect = makeCloudWeather(); scene.add(weatherEffect.root);
    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = shadowCanvas.height = 128;
    const ctx = shadowCanvas.getContext("2d")!;
    const gradient = ctx.createRadialGradient(64, 64, 2, 64, 64, 62);
    gradient.addColorStop(0, "rgba(45,44,40,.23)");
    gradient.addColorStop(0.5, "rgba(45,44,40,.09)");
    gradient.addColorStop(1, "rgba(45,44,40,0)");
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 128, 128);
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeometry = new THREE.PlaneGeometry(3.2, 1.6);
    const shadowMaterial = new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false });
    const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = -1.53; scene.add(shadow);

    let disposed = false, loaded: THREE.Group | null = null, mixer: THREE.AnimationMixer | null = null;
    const disposeModel = (model: THREE.Object3D) => {
      const textures = new Set<THREE.Texture>();
      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      model.traverse(object => {
        if (!(object instanceof THREE.Mesh)) return;
        geometries.add(object.geometry);
        for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
          materials.add(material);
          for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value);
        }
      });
      textures.forEach(texture => texture.dispose());
      geometries.forEach(geometry => geometry.dispose());
      materials.forEach(material => material.dispose());
    };
    new GLTFLoader().load(`/brand/models/norma-cloud-${tone}.glb`, gltf => {
      if (disposed) { disposeModel(gltf.scene); return; }
      loaded = gltf.scene;
      const bounds = new THREE.Box3().setFromObject(loaded);
      const size = bounds.getSize(new THREE.Vector3());
      loaded.scale.multiplyScalar(2.75 / Math.max(size.x, 0.01));
      loaded.updateMatrixWorld(true);
      loaded.position.sub(new THREE.Box3().setFromObject(loaded).getCenter(new THREE.Vector3()));
      loaded.traverse(object => {
        if (!(object instanceof THREE.Mesh)) return;
        for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
          if (material instanceof THREE.MeshStandardMaterial) {
            material.metalness = 0; material.roughness = Math.max(material.roughness, 0.72);
          }
        }
      });
      cloud.add(loaded);
      mixer = new THREE.AnimationMixer(loaded);
      const blink = gltf.animations.find(clip => clip.name === "Blink");
      if (blink) mixer.clipAction(blink).play();
      setStatus("ready");
    }, undefined, () => { if (!disposed) setStatus("error"); });

    let elapsed = 0, last = performance.now(), frame = 0, visible = true, greetStart = -20;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    controller.current = { greet() { greetStart = elapsed; }, reset() { orbit.reset(); cloud.rotation.y = 0; } };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault(); cloud.rotation.y += event.key === "ArrowLeft" ? -0.16 : 0.16;
      }
    };
    renderer.domElement.addEventListener("keydown", onKey);
    const thunder = () => {
      const context = audio.current;
      if (!context || context.state !== "running") return;
      const duration = 1.8, buffer = context.createBuffer(1, context.sampleRate * duration, context.sampleRate);
      const samples = buffer.getChannelData(0); let brown = 0;
      for (let i = 0; i < samples.length; i++) { brown = (brown + (Math.random() * 2 - 1) * 0.02) / 1.02; samples[i] = brown * 3.5; }
      const source = context.createBufferSource(), filter = context.createBiquadFilter(), gain = context.createGain();
      source.buffer = buffer; filter.type = "lowpass"; filter.frequency.value = 240;
      gain.gain.setValueAtTime(0, context.currentTime);
      gain.gain.linearRampToValueAtTime(0.35, context.currentTime + 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
      source.connect(filter); filter.connect(gain); gain.connect(context.destination);
      source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
      source.start();
    };
    const resize = () => {
      const width = container.clientWidth, height = container.clientHeight;
      if (!width || !height) return;
      const aspect = width / height, halfHeight = Math.max(1.9, 1.70 / aspect);
      camera.left = -halfHeight * aspect; camera.right = halfHeight * aspect;
      camera.top = halfHeight; camera.bottom = -halfHeight;
      camera.updateProjectionMatrix(); renderer.setSize(width, height, false);
    };
    const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(container); resize();
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    observer.observe(container);
    const animate = (now: number) => {
      frame = requestAnimationFrame(animate);
      const delta = Math.min((now - last) / 1000, 0.05); last = now;
      if (!visible || document.hidden) return;
      if (!live.current.paused && !reduced.matches) { elapsed += delta; mixer?.update(delta); }
      const t = reduced.matches ? 0 : elapsed;
      const greeting = Math.max(0, 1 - (t - greetStart) / 1.5);
      cloud.position.y = 0.20 + Math.sin(t * 1.4) * 0.055 + Math.sin((t - greetStart) * 8) * greeting * 0.075;
      cloud.rotation.z = Math.sin(t * 0.8) * 0.024;
      const breath = 1 + Math.sin(t * 1.4) * 0.008;
      cloud.scale.set(1 / Math.sqrt(breath), breath, 1);
      shadow.scale.setScalar(1 - (cloud.position.y - 0.2) * 0.3);
      if (weatherEffect.update(t, live.current.weather, !reduced.matches) && !live.current.paused) thunder();
      orbit.update(); renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(animate);
    return () => {
      disposed = true; cancelAnimationFrame(frame);
      resizeObserver.disconnect(); observer.disconnect(); orbit.dispose();
      controller.current = null;
      renderer.domElement.removeEventListener("keydown", onKey);
      if (loaded && mixer) { mixer.stopAllAction(); mixer.uncacheRoot(loaded); }
      if (loaded) disposeModel(loaded);
      weatherEffect.dispose(); shadowGeometry.dispose(); shadowMaterial.dispose(); shadowTexture.dispose();
      environment.dispose(); renderer.dispose(); renderer.domElement.remove();
    };
  }, [tone, controller, audio, chinese]);

  return <div className="nc-viewport" ref={host} data-status={status} aria-label={chinese ? "Norma 云朵 3D 模型，可拖动旋转" : "Norma cloud 3D model, drag to rotate"}>
    {status !== "ready" && <div className="nc-loading" role="status">{status === "loading" ? (chinese ? "小云朵马上就来…" : "A little cloud is on its way…") : (chinese ? "3D 模型暂时无法加载。" : "The 3D model could not be loaded.")}</div>}
  </div>;
}

export default function NormaCloud({ chinese, studio = false }: { chinese: boolean; studio?: boolean }) {
  const search = useSearchParams(), router = useRouter(), path = usePathname();
  const tone: CloudTone = search.get("tone") === "white" ? "white" : "black";
  const value = search.get("weather");
  const weather: CloudWeather = value === "rain" || value === "storm" ? value : "calm";
  const [paused, setPaused] = useState(false);
  const [sound, setSound] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  useEffect(() => () => { void audio.current?.close(); }, []);
  const toggleSound = async () => {
    if (sound) { await audio.current?.suspend(); setSound(false); }
    else { audio.current ??= new AudioContext(); await audio.current.resume(); setSound(true); }
  };
  const controller = useRef<CloudController | null>(null);
  const update = (key: string, next: string) => {
    const params = new URLSearchParams(search.toString());
    params.set("mascot", "cloud"); params.set(key, next);
    router.replace(`${path}?${params.toString()}`, { scroll: false });
  };
  const base = chinese ? "/zh-cn" : "/";
  return <section className={`nc ${studio ? "nc-studio" : "nc-inline"}`} data-tone={tone} data-weather={weather}>
    <div className="nc-topline"><span>NORMA / LITTLE CLOUD</span><span className="nc-live-dot" />{chinese ? "陪你，晴天或雨天" : "Here, rain or shine"}</div>
    <div className="nc-stage">
      <p className="nc-stage-word" aria-hidden="true">{weather === "storm" ? "a little spark." : weather === "rain" ? "let it rain." : "on cloud nine."}</p>
      <CloudViewport tone={tone} weather={weather} paused={paused} chinese={chinese} controller={controller} audio={audio} />
      <div className="nc-stage-tools">
        <button onClick={toggleSound} aria-pressed={sound} aria-label={chinese ? (sound ? "关闭雷声" : "开启雷声") : (sound ? "Mute thunder" : "Enable thunder sound")} title={chinese ? "雷声" : "Thunder sound"}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />{sound ? <path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /> : <path d="m16 9 5 6m0-6-5 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />}</svg></button>
        <button onClick={() => setPaused(!paused)} aria-pressed={paused} aria-label={chinese ? (paused ? "播放云朵动画" : "暂停云朵动画") : (paused ? "Play cloud animation" : "Pause cloud animation")}>{paused ? "▷" : "Ⅱ"}</button>
        <button onClick={() => controller.current?.reset()} aria-label={chinese ? "回到正面" : "Reset view"}>↺</button>
      </div>
    </div>
    <div className="nc-controls">
      <div className="nc-tone-switch" role="group" aria-label={chinese ? "云朵配色" : "Cloud color"}>
        {(["black", "white"] as const).map(color => <button key={color} aria-pressed={tone === color} onClick={() => update("tone", color)}><i data-swatch={color} />{chinese ? (color === "black" ? "墨黑" : "奶白") : (color === "black" ? "Ink" : "Milk")}</button>)}
      </div>
      <div className="nc-weather-switch" role="group" aria-label={chinese ? "天气效果" : "Weather effects"}>
        {(["calm", "rain", "storm"] as const).map(mode => <button key={mode} aria-pressed={weather === mode} onClick={() => update("weather", mode)}><span aria-hidden="true">{mode === "calm" ? "☁" : mode === "rain" ? "☂" : "ϟ"}</span>{chinese ? ({ calm: "悠闲", rain: "下雨", storm: "雷雨" }[mode]) : ({ calm: "Calm", rain: "Rain", storm: "Thunder" }[mode])}</button>)}
      </div>
    </div>
    <div className="nc-bottomline"><span>{chinese ? "拖动转一转，换个天气。" : "Give it a spin. Change the weather."}</span>{!studio && <a href={`${base}?variant=A&view=mascots&mascot=cloud&tone=${tone}&weather=${weather}`}>{chinese ? "仔细看看" : "Meet the cloud"} ↗</a>}</div>
  </section>;
}

export function CloudStudio({ chinese }: { chinese: boolean }) {
  const search = useSearchParams(), base = chinese ? "/zh-cn" : "/";
  const params = new URLSearchParams(search.toString()); params.delete("view");
  return <main className="np nc-page">
    <header className="nc-page-header"><a href={`${base}?variant=A&mascot=cloud`}><img src="/brand/app-icon.png" width="30" height="30" alt="" />norma<span>Character study</span></a><a href={`${base}?${params.toString()}`}>{chinese ? "放进官网看看" : "See it on the homepage"} ↗</a></header>
    <div className="nc-page-intro"><p>A LITTLE CLOUD. A LITTLE COMPANY.</p><h1>{chinese ? "今天，也有好心情。" : "A little lighter, every day."}</h1><span>{chinese ? "一朵小云，两种颜色。晴天、雨天，都陪着你。" : "One little cloud. Two colors. Here for you, rain or shine."}</span></div>
    <NormaCloud chinese={chinese} studio />
    <div className="nc-downloads"><a href="/brand/models/norma-cloud-black.glb" download>{chinese ? "下载墨黑模型" : "Download ink model"} ↓</a><span>·</span><a href="/brand/models/norma-cloud-white.glb" download>{chinese ? "下载奶白模型" : "Download milk model"} ↓</a><small>GLB · {chinese ? "含漂浮与眨眼动画" : "Float + blink animations"}</small></div>
    <footer className="nc-page-footer"><span>NORMA OS · CLOUD STUDY</span><span>{chinese ? "墨黑 / 奶白 · 悠闲 / 下雨 / 雷雨" : "INK / MILK · CALM / RAIN / THUNDER"}</span></footer>
  </main>;
}
