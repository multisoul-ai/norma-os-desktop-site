// THROWAWAY: three different silhouettes, materials, and motion personalities.
import * as THREE from "three";
import { MarchingCubes } from "three/addons/objects/MarchingCubes.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { makeNormaSnowie } from "./norma-snowie-model";

export type MascotKind = "snowie" | "x" | "cloud" | "pod";
export const mascotOptions = [
  { id: "snowie", number: "04", name: "小小 Norma", en: "Little Norma", brief: "薄荷软帽、黑色短发、白色 X。带着两位小伙伴，准备好一起创造。", enBrief: "A mint beret, sculpted black hair, and her signature X. A little company for your big ideas.", traits: "轻轻呼吸 · 挥手回应 · 小伙伴环绕", enTraits: "A gentle breath · A little wave · Good company", icon: "✿" },
  { id: "x", number: "01", name: "X 精灵", en: "Little X", brief: "把 logo 的白色 X，变成会眨眼的小精灵。", enBrief: "The signature X, with a life of its own.", traits: "标志感 · 轻盈 · 爱转圈", enTraits: "Iconic · Airy · A little spin", icon: "✕" },
  { id: "cloud", number: "02", name: "Norma 云朵", en: "Little Cloud", brief: "一朵小云，两种颜色。晴天、雨天，都陪着你。", enBrief: "One little cloud. Two colors. Here, rain or shine.", traits: "墨黑 / 奶白 · 下雨 · 雷雨", enTraits: "Ink / Milk · Rain · Thunder", icon: "☁" },
  { id: "pod", number: "03", name: "胶囊搭档", en: "Pip", brief: "珊瑚色小头盔，一双亮眼睛，随时准备开工。", enBrief: "A coral helmet, bright eyes, and a ready-for-anything attitude.", traits: "机灵 · 复古科技 · 有回应", enTraits: "Curious · Retro-tech · Responsive", icon: "▣" },
] as const;

export function makeMascot(kind: MascotKind) {
  if (kind === "snowie") return makeNormaSnowie();
  const root = new THREE.Group();
  const design = new THREE.Group();
  root.add(design);
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const sphere = new THREE.SphereGeometry(1, 40, 32);
  geometries.add(sphere);
  function material(color: number, roughness = .5, metalness = 0) {
    const m = new THREE.MeshPhysicalMaterial({ color, roughness, metalness, clearcoat: .1, clearcoatRoughness: .45 });
    materials.add(m); return m;
  }
  const cream = material(0xfff4dc, .48);
  const ink = material(0x182027, .64);
  const pink = material(0xf0b0a7, .7);
  const coral = material(0xf5a795, .44);
  const sky = material(0xa5c9e4, .5);
  const yellow = material(0xf3cf7c, .5);
  function oval(parent: THREE.Object3D, mat: THREE.Material, p: number[], s: number[]) {
    const m = new THREE.Mesh(sphere, mat);m.position.set(p[0],p[1],p[2]);m.scale.set(s[0],s[1],s[2]);parent.add(m);return m;
  }
  function box(parent: THREE.Object3D, mat: THREE.Material, p: number[], size: number[], radius: number) {
    const g = new RoundedBoxGeometry(size[0],size[1],size[2],6,radius);geometries.add(g);
    const m = new THREE.Mesh(g,mat);m.position.set(p[0],p[1],p[2]);parent.add(m);return m;
  }
  function tube(parent: THREE.Object3D, mat: THREE.Material, points: THREE.Vector3[], radius: number) {
    const curve = new THREE.CatmullRomCurve3(points);const g = new THREE.TubeGeometry(curve,32,radius,8,false);geometries.add(g);const mesh=new THREE.Mesh(g,mat);parent.add(mesh);return mesh;
  }
  function cross(parent: THREE.Object3D, mat: THREE.Material, p: number[], size: number) {
    const group=new THREE.Group();group.position.set(p[0],p[1],p[2]);parent.add(group);
    for(const angle of [-Math.PI/4,Math.PI/4]){const bar=box(group,mat,[0,0,0],[size*.24,size,size*.16],size*.1);bar.rotation.z=angle;}return group;
  }
  const eyes: THREE.Group[]=[];
  const eyeHomes: THREE.Vector3[]=[];
  function eye(x:number,y:number,z:number,mat:THREE.Material,w:number,h:number) {
    const group=new THREE.Group();group.position.set(x,y,z);design.add(group);oval(group,mat,[0,0,0],[w,h,.024]);eyes.push(group);eyeHomes.push(group.position.clone());return group;
  }
  function smile(y:number,z:number,mat:THREE.Material,width=.075) {
    tube(design,mat,[new THREE.Vector3(-width,y,z),new THREE.Vector3(0,y-.045,z+.006),new THREE.Vector3(width,y,z)],.012);
  }
  const leftArm=new THREE.Group(),rightArm=new THREE.Group(),secondary=new THREE.Group();
  design.add(leftArm,rightArm,secondary);
  const feet: THREE.Object3D[]=[];
  function hands(mat:THREE.Material,x:number,y:number) {
    leftArm.position.set(-x,y,0);rightArm.position.set(x,y,0);
    const left=oval(leftArm,mat,[-.06,-.08,.03],[.13,.22,.15]);left.rotation.z=-.35;
    const right=oval(rightArm,mat,[.06,-.08,.03],[.13,.22,.15]);right.rotation.z=.35;
  }
  const smin=(a:number,b:number,k:number)=>{const h=Math.max(k-Math.abs(a-b),0)/k;return Math.min(a,b)-h*h*k*.25;};
  const sphereDistance=(x:number,y:number,z:number,cx:number,cy:number,cz:number,r:number)=>Math.hypot(x-cx,y-cy,z-cz)-r;
  function sculpt(sdf:(x:number,y:number,z:number)=>number,mat:THREE.Material) {
    const resolution=64;const field=new MarchingCubes(resolution,mat,false,false,40000);field.isolation=0;
    for(let z=0;z<resolution;z++)for(let y=0;y<resolution;y++)for(let x=0;x<resolution;x++){
      field.setCell(x,y,z,-sdf((x/resolution*2-1)*1.3,(y/resolution*2-1)*1.3,(z/resolution*2-1)*1.3));
    }
    field.update();field.scale.setScalar(1.3);design.add(field);geometries.add(field.geometry);
    return (x:number,y:number)=>{let lo=0,hi=1.2;for(let i=0;i<24;i++){const mid=(lo+hi)/2;if(sdf(x,y,mid)<0)lo=mid;else hi=mid;}return (lo+hi)/2;};
  }

  if(kind === "x") {
    // Soft union of two rounded diagonal capsules: one continuous inflated X.
    const capsule=(x:number,y:number,z:number,sign:number)=>{
      const ax=-.43,ay=-.43*sign,bx=.43,by=.43*sign;
      const t=THREE.MathUtils.clamp(((x-ax)*(bx-ax)+(y-ay)*(by-ay))/((bx-ax)**2+(by-ay)**2),0,1);
      return Math.hypot(x-(ax+(bx-ax)*t),y-(ay+(by-ay)*t),z/.85)-.265;
    };
    const sdf=(x:number,y:number,z:number)=>smin(capsule(x,y,z,1),capsule(x,y,z,-1),.14);
    const surface=sculpt(sdf,cream);
    design.scale.setScalar(1.35);
    eye(-.135,.07,surface(-.135,.07)+.009,ink,.041,.067);
    eye(.135,.07,surface(.135,.07)+.009,ink,.041,.067);
    smile(-.085,surface(0,-.085)+.013,ink,.05);
    oval(design,pink,[-.255,-.073,surface(-.255,-.073)+.004],[.048,.019,.012]);
    oval(design,pink,[.255,-.073,surface(.255,-.073)+.004],[.048,.019,.012]);
    // A tiny three-color maker's mark echoes the colored blocks in the logo.
    [sky,pink,yellow].forEach((mat,i)=>{const x=-.33+i*.061,y=-.40;box(design,mat,[x,y,surface(x,y)+.009],[.041,.041,.018],.010);});
    secondary.position.set(0,0,0);
  } else if(kind === "cloud") {
    const sdf=(x:number,y:number,z:number)=>{
      const zz=z*1.22;
      let d=sphereDistance(x,y*1.65,zz,0,-.10,0,.58);
      d=smin(d,sphereDistance(x,y,zz,-.53,-.015,0,.34),.10);
      d=smin(d,sphereDistance(x,y,zz,-.24,.20,0,.36),.10);
      d=smin(d,sphereDistance(x,y,zz,.14,.26,0,.42),.10);
      d=smin(d,sphereDistance(x,y,zz,.53,-.01,0,.34),.10);
      return d;
    };
    const mallow=material(0xfff5e9,.83);
    const surface=sculpt(sdf,mallow);
    design.scale.setScalar(1.20);
    eye(-.20,-.035,surface(-.20,-.035)+.008,ink,.048,.071);
    eye(.20,-.035,surface(.20,-.035)+.008,ink,.048,.071);
    smile(-.17,surface(0,-.17)+.008,ink,.057);
    for(const x of [-.36,.36])oval(design,pink,[x,-.16,surface(x,-.16)+.012],[.07,.027,.012]);
    const patch=cross(design,ink,[-.43,.38,surface(-.43,.38)+.01],.20);patch.rotation.z=-.12;patch.rotation.y=-.25;
    hands(mallow,.77,-.12);
    for(const x of [-.30,.30])feet.push(oval(design,sky,[x,-.43,.02],[.16,.12,.22]));
    // A small soft yellow tag gives the cloud a tactile, sewn-toy cue.
    const tag=box(design,yellow,[.67,-.22,.18],[.16,.075,.035],.025);tag.rotation.z=.40;
  } else {
    // Coral helmet + dark visor + a tiny cream body: a companion with a distinct silhouette.
    design.scale.setScalar(1.05);
    const shell=box(design,coral,[0,.30,0],[1.47,1.21,1.04],.40);
    shell.rotation.z=-.025;
    const visor=material(0x202e33,.24);
    const screenShape = new THREE.Shape();
    const w=.60,h=.34,r=.22;
    screenShape.moveTo(-w+r,-h);screenShape.lineTo(w-r,-h);screenShape.quadraticCurveTo(w,-h,w,-h+r);
    screenShape.lineTo(w,h-r);screenShape.quadraticCurveTo(w,h,w-r,h);screenShape.lineTo(-w+r,h);
    screenShape.quadraticCurveTo(-w,h,-w,h-r);screenShape.lineTo(-w,-h+r);screenShape.quadraticCurveTo(-w,-h,-w+r,-h);
    const screenGeometry = new THREE.ExtrudeGeometry(screenShape,{depth:.027,bevelEnabled:true,bevelSize:.015,bevelThickness:.015,bevelSegments:5,curveSegments:16});
    geometries.add(screenGeometry);
    const screen = new THREE.Mesh(screenGeometry,visor);screen.position.set(0,.27,.526);design.add(screen);
    const eyeLight=material(0xe2f3ce,.4);eyeLight.emissive=new THREE.Color(0xb7d69a);eyeLight.emissiveIntensity=.18;
    eye(-.245,.29,.579,eyeLight,.060,.110);
    eye(.245,.29,.579,eyeLight,.060,.110);
    smile(.07,.582,eyeLight,.056);
    const body=oval(design,cream,[0,-.40,-.02],[.44,.37,.34]);
    body.rotation.x=.12;
    const patch=cross(design,cream,[.51,.74,.39],.18);patch.rotation.set(-.3,.22,-.15);
    hands(cream,.53,-.37);
    for(const x of [-.24,.24])feet.push(oval(design,coral,[x,-.76,.06],[.19,.13,.24]));
    for(const x of [-.74,.74])oval(design,cream,[x,.26,0],[.077,.17,.20]);
    secondary.position.set(0,.88,-.06);
    tube(secondary,ink,[new THREE.Vector3(0,0,0),new THREE.Vector3(0,.12,0),new THREE.Vector3(.08,.20,0)],.025);
    oval(secondary,sky,[.08,.22,0],[.09,.09,.09]);
    [sky,pink,yellow].forEach((mat,i)=>box(design,mat,[-.09+i*.09,-.42,.30],[.05,.05,.02],.014));
  }
  root.traverse(object=>{if(object instanceof THREE.Mesh){object.castShadow=true;object.receiveShadow=true;}});
  return {root,eyes,eyeHomes,leftArm,rightArm,secondary,feet,geometries,materials};
}
