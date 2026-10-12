"use client";

// The approved local cloud model; all WebGL and audio resources are owned by this viewport.
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { makeCloudWeather } from "./cloud-weather";
import { makeCloudActivities } from "./cloud-activities";
import { cloudActivities, type CloudActivity } from "./cloud-state";

export default function CloudViewport({
  activity,
  chinese,
  onChange,
}: {
  activity: CloudActivity;
  chinese: boolean;
  onChange: (activity: CloudActivity) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const live = useRef({ activity, onChange });
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  useEffect(() => {
    live.current = { activity, onChange };
  }, [activity, onChange]);

  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      // Renderer creation synchronously reports whether this device supports WebGL.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("error");
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);
    renderer.domElement.tabIndex = 0;
    renderer.domElement.setAttribute("role", "button");
    renderer.domElement.setAttribute(
      "aria-label",
      chinese
        ? "点击云朵或按 Enter、空格切换互动；拖动或按左右键旋转；Home 回正；Esc 暂停或继续"
        : "Click the cloud or press Enter or Space to change its activity. Drag or use arrow keys to rotate; Home resets; Escape pauses or resumes.",
    );
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-2.3, 2.3, 2.3, -2.3, 0.1, 40);
    camera.position.set(0.15, 0.45, 7);
    const orbit = new OrbitControls(camera, renderer.domElement);
    orbit.target.set(0, -0.15, 0);
    orbit.enablePan = false;
    orbit.enableZoom = false;
    orbit.enableDamping = true;
    orbit.dampingFactor = 0.09;
    orbit.minPolarAngle = Math.PI * 0.25;
    orbit.maxPolarAngle = Math.PI * 0.72;
    orbit.update();
    orbit.saveState();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const environment = pmrem.fromScene(room, 0.04);
    scene.environment = environment.texture;
    scene.environmentIntensity = 0.45;
    room.dispose();
    pmrem.dispose();
    scene.add(new THREE.HemisphereLight(0xfffcf6, 0xc9c6c0, 0.55));
    const key = new THREE.DirectionalLight(0xfff9ed, 1.7);
    key.position.set(-3, 4, 5);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xe5edf7, 0.65);
    fill.position.set(4, 1, 2);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffffff, 1.5);
    rim.position.set(2, 3, -3);
    scene.add(rim);

    const cloud = new THREE.Group();
    scene.add(cloud);
    const weatherEffect = makeCloudWeather();
    scene.add(weatherEffect.root);
    const activityEffect = makeCloudActivities();
    scene.add(activityEffect.root);
    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = shadowCanvas.height = 128;
    const ctx = shadowCanvas.getContext("2d")!;
    const gradient = ctx.createRadialGradient(64, 64, 2, 64, 64, 62);
    gradient.addColorStop(0, "rgba(45,44,40,.23)");
    gradient.addColorStop(0.5, "rgba(45,44,40,.09)");
    gradient.addColorStop(1, "rgba(45,44,40,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeometry = new THREE.PlaneGeometry(3.2, 1.6);
    const shadowMaterial = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      depthWrite: false,
    });
    const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -1.53;
    scene.add(shadow);

    let disposed = false,
      loaded: THREE.Group | null = null,
      mixer: THREE.AnimationMixer | null = null;
    const disposeModel = (model: THREE.Object3D) => {
      const textures = new Set<THREE.Texture>();
      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      model.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        geometries.add(object.geometry);
        for (const material of Array.isArray(object.material)
          ? object.material
          : [object.material]) {
          materials.add(material);
          for (const value of Object.values(material))
            if (value instanceof THREE.Texture) textures.add(value);
        }
      });
      textures.forEach((texture) => texture.dispose());
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
    };
    new GLTFLoader().load(
      "/brand/models/norma-cloud-black.glb",
      (gltf) => {
        if (disposed) {
          disposeModel(gltf.scene);
          return;
        }
        loaded = gltf.scene;
        const bounds = new THREE.Box3().setFromObject(loaded);
        const size = bounds.getSize(new THREE.Vector3());
        loaded.scale.multiplyScalar(2.75 / Math.max(size.x, 0.01));
        loaded.updateMatrixWorld(true);
        loaded.position.sub(
          new THREE.Box3().setFromObject(loaded).getCenter(new THREE.Vector3()),
        );
        loaded.traverse((object) => {
          if (!(object instanceof THREE.Mesh)) return;
          for (const material of Array.isArray(object.material)
            ? object.material
            : [object.material]) {
            if (material instanceof THREE.MeshStandardMaterial) {
              material.metalness = 0;
              material.roughness = Math.max(material.roughness, 0.72);
            }
          }
        });
        cloud.add(loaded);
        mixer = new THREE.AnimationMixer(loaded);
        const blink = gltf.animations.find((clip) => clip.name === "Blink");
        if (blink) mixer.clipAction(blink).play();
        setStatus("ready");
      },
      undefined,
      () => {
        if (!disposed) setStatus("error");
      },
    );

    let elapsed = 0,
      last = performance.now(),
      frame = 0,
      visible = true,
      greetStart = -20;
    let paused = false,
      activeTime = 0,
      nextActivityAt = 2.4;
    // Show the product story once, then shuffle states without immediate repeats.
    let automaticQueue: CloudActivity[] = [
      "voice",
      "collaboration",
      "focus",
      "done",
    ];
    let audio: AudioContext | null = null;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const changeActivity = (next: CloudActivity) => {
      live.current.activity = next;
      live.current.onChange(next);
      greetStart = elapsed;
      nextActivityAt = activeTime + 4.8 + Math.random() * 1.4;
    };
    const activate = () => {
      if (!loaded) return;
      const next =
        cloudActivities[
          (cloudActivities.indexOf(live.current.activity) + 1) %
            cloudActivities.length
        ];
      paused = false;
      container.dataset.paused = "false";
      changeActivity(next);
      // Sound is a response to an intentional interaction, never to an automatic state change.
      if (next === "storm") {
        try {
          audio ??= new AudioContext();
          void audio
            .resume()
            .then(() => {
              if (!disposed) thunder();
            })
            .catch(() => {});
        } catch {
          /* The visual response works on devices without Web Audio. */
        }
      }
    };
    const raycaster = new THREE.Raycaster(),
      pointer = new THREE.Vector2();
    const hitsCloud = (x: number, y: number) => {
      if (!loaded) return false;
      const bounds = renderer.domElement.getBoundingClientRect();
      pointer.set(
        ((x - bounds.left) / bounds.width) * 2 - 1,
        (-(y - bounds.top) / bounds.height) * 2 + 1,
      );
      raycaster.setFromCamera(pointer, camera);
      return raycaster.intersectObject(cloud, true).length > 0;
    };
    let press: {
      id: number;
      x: number;
      y: number;
      time: number;
      dragged: boolean;
    } | null = null;
    const onDown = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0) {
        press = null;
        return;
      }
      press = hitsCloud(event.clientX, event.clientY)
        ? {
            id: event.pointerId,
            x: event.clientX,
            y: event.clientY,
            time: performance.now(),
            dragged: false,
          }
        : null;
    };
    const onMove = (event: PointerEvent) => {
      if (
        press &&
        event.pointerId === press.id &&
        Math.hypot(event.clientX - press.x, event.clientY - press.y) > 8
      )
        press.dragged = true;
      if (event.pointerType === "mouse")
        renderer.domElement.style.cursor = press?.dragged
          ? "grabbing"
          : hitsCloud(event.clientX, event.clientY)
            ? "pointer"
            : "grab";
    };
    const onUp = (event: PointerEvent) => {
      const clicked =
        press &&
        event.pointerId === press.id &&
        !press.dragged &&
        performance.now() - press.time < 600 &&
        hitsCloud(event.clientX, event.clientY);
      press = null;
      if (clicked) activate();
    };
    const onCancel = () => {
      press = null;
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (!event.repeat) activate();
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        cloud.rotation.y += event.key === "ArrowLeft" ? -0.16 : 0.16;
      }
      if (event.key === "Home") {
        event.preventDefault();
        orbit.reset();
        cloud.rotation.y = 0;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        paused = !paused;
        container.dataset.paused = String(paused);
      }
    };
    renderer.domElement.addEventListener("keydown", onKey);
    renderer.domElement.addEventListener("pointerdown", onDown);
    renderer.domElement.addEventListener("pointermove", onMove);
    renderer.domElement.addEventListener("pointerup", onUp);
    renderer.domElement.addEventListener("pointercancel", onCancel);
    const thunder = () => {
      const context = audio;
      if (!context || context.state !== "running") return;
      const duration = 1.8,
        buffer = context.createBuffer(
          1,
          context.sampleRate * duration,
          context.sampleRate,
        );
      const samples = buffer.getChannelData(0);
      let brown = 0;
      for (let i = 0; i < samples.length; i++) {
        brown = (brown + (Math.random() * 2 - 1) * 0.02) / 1.02;
        samples[i] = brown * 3.5;
      }
      const source = context.createBufferSource(),
        filter = context.createBiquadFilter(),
        gain = context.createGain();
      source.buffer = buffer;
      filter.type = "lowpass";
      filter.frequency.value = 240;
      gain.gain.setValueAtTime(0, context.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, context.currentTime + 0.09);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        context.currentTime + duration,
      );
      source.connect(filter);
      filter.connect(gain);
      gain.connect(context.destination);
      source.onended = () => {
        source.disconnect();
        filter.disconnect();
        gain.disconnect();
      };
      source.start();
    };
    const resize = () => {
      const width = container.clientWidth,
        height = container.clientHeight;
      if (!width || !height) return;
      const aspect = width / height,
        halfHeight = Math.max(1.9, 1.7 / aspect);
      camera.left = -halfHeight * aspect;
      camera.right = halfHeight * aspect;
      camera.top = halfHeight;
      camera.bottom = -halfHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      last = performance.now();
    });
    observer.observe(container);
    const onVisibilityChange = () => {
      last = performance.now();
    };
    const onContextLost = () => setStatus("error");
    const onContextRestored = () => setStatus(loaded ? "ready" : "loading");
    document.addEventListener("visibilitychange", onVisibilityChange);
    renderer.domElement.addEventListener("webglcontextlost", onContextLost);
    renderer.domElement.addEventListener(
      "webglcontextrestored",
      onContextRestored,
    );
    const animate = (now: number) => {
      frame = requestAnimationFrame(animate);
      const wallDelta = (now - last) / 1000;
      const delta = Math.min(wallDelta, 0.05);
      last = now;
      if (!visible || document.hidden) return;
      if (!paused && !reduced.matches && loaded) {
        elapsed += delta;
        activeTime += wallDelta;
        mixer?.update(delta);
      }
      if (
        !paused &&
        !reduced.matches &&
        loaded &&
        activeTime >= nextActivityAt
      ) {
        automaticQueue = automaticQueue.filter(
          (item) => item !== live.current.activity,
        );
        if (!automaticQueue.length) {
          automaticQueue = cloudActivities.filter(
            (item) => item !== live.current.activity,
          );
          for (let i = automaticQueue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [automaticQueue[i], automaticQueue[j]] = [
              automaticQueue[j],
              automaticQueue[i],
            ];
          }
        }
        changeActivity(automaticQueue.shift()!);
      }
      const t = reduced.matches ? 0 : elapsed;
      const greeting = reduced.matches
        ? 0
        : Math.max(0, 1 - (t - greetStart) / 1.5);
      cloud.position.y =
        0.2 +
        Math.sin(t * 1.4) * 0.055 +
        Math.sin((t - greetStart) * 8) * greeting * 0.075;
      cloud.rotation.z = Math.sin(t * 0.8) * 0.024;
      const breath = 1 + Math.sin(t * 1.4) * 0.008;
      cloud.scale.set(1 / Math.sqrt(breath), breath, 1);
      shadow.scale.setScalar(1 - (cloud.position.y - 0.2) * 0.3);
      const activity = live.current.activity;
      const effectTime = reduced.matches ? 0 : activeTime;
      weatherEffect.update(
        effectTime,
        activity === "rain" || activity === "storm" ? activity : "calm",
        !reduced.matches,
      );
      activityEffect.update(effectTime, activity, !reduced.matches);
      if (!paused) orbit.update();
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(animate);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      renderer.domElement.removeEventListener(
        "webglcontextlost",
        onContextLost,
      );
      renderer.domElement.removeEventListener(
        "webglcontextrestored",
        onContextRestored,
      );
      orbit.dispose();
      renderer.domElement.removeEventListener("keydown", onKey);
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.domElement.removeEventListener("pointermove", onMove);
      renderer.domElement.removeEventListener("pointerup", onUp);
      renderer.domElement.removeEventListener("pointercancel", onCancel);
      void audio?.close();
      if (loaded && mixer) {
        mixer.stopAllAction();
        mixer.uncacheRoot(loaded);
      }
      if (loaded) disposeModel(loaded);
      weatherEffect.dispose();
      activityEffect.dispose();
      shadowGeometry.dispose();
      shadowMaterial.dispose();
      shadowTexture.dispose();
      environment.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [chinese]);

  return (
    <div
      className="nc-viewport"
      ref={host}
      data-status={status}
      aria-label={
        chinese
          ? "Norma 云朵 3D 模型，可拖动旋转"
          : "Norma cloud 3D model, drag to rotate"
      }
    >
      {status !== "ready" && (
        <div className="nc-loading" role="status">
          {status === "loading"
            ? chinese
              ? "小云朵马上就来…"
              : "A little cloud is on its way…"
            : chinese
              ? "小云朵在这里陪你。"
              : "A little company, right here."}
        </div>
      )}
    </div>
  );
}
