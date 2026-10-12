// THROWAWAY character study — sculptural toy proportions inspired by ALLIE & SNOWIES.
import * as THREE from "three";

export function makeNormaSnowie() {
  const root = new THREE.Group();
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const sphere = new THREE.SphereGeometry(1, 48, 36);
  geometries.add(sphere);
  const mat = (color: number, roughness = .62, coat = .08) => {
    const material = new THREE.MeshPhysicalMaterial({ color, roughness, metalness: 0,
      clearcoat: coat, clearcoatRoughness: .6, sheen: .08, sheenRoughness: .8 });
    materials.add(material); return material;
  };
  const skin = mat(0xf8b592, .75);
  const nosePink = mat(0xf2a58c, .66);
  const cheek = mat(0xf4a290, .78);
  const ink = mat(0x222630, .55, .15);
  const hairSheen = mat(0x333943, .54, .12);
  const eyelash = mat(0x343139, .77);
  const mouthInk = mat(0x693f3f, .83);
  const lip = mat(0xe89b85, .72);
  const ivory = mat(0xfff5e5, .60);
  const mint = mat(0x69cba3, .71);
  const mintLight = mat(0xb4e9cd, .67);
  const forest = mat(0x34554a, .69);
  const mintShadow = mat(0x579f80, .70);
  const coral = mat(0xe9796d, .68);
  const coralDark = mat(0xd56561, .67);
  const gold = mat(0xf2c278, .60);
  const goldLight = mat(0xffd799, .65);
  const powderBlue = mat(0x90c8e6, .60);

  function mesh(g: THREE.BufferGeometry, m: THREE.Material, parent: THREE.Object3D = root) {
    geometries.add(g); const object = new THREE.Mesh(g, m); parent.add(object); return object;
  }
  function oval(parent: THREE.Object3D, m: THREE.Material, pos: number[], scale: number[]) {
    const object = new THREE.Mesh(sphere, m); object.position.set(pos[0], pos[1], pos[2]);
    object.scale.set(scale[0], scale[1], scale[2]); parent.add(object); return object;
  }
  function extrusion(parent: THREE.Object3D, shape: THREE.Shape, material: THREE.Material, depth: number, bevel: number) {
    const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSegments: 5,
      bevelSize: bevel, bevelThickness: bevel, curveSegments: 32, steps: 1 });
    return mesh(g, material, parent);
  }
  function tube(parent: THREE.Object3D, points: number[][], radius: number, material: THREE.Material, segments = 40) {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p as [number,number,number])));
    return mesh(new THREE.TubeGeometry(curve, segments, radius, 12, false), material, parent);
  }
  const spow = (value: number, exponent: number) => Math.sign(value) * Math.pow(Math.abs(value), exponent);
  function softVolume(parent: THREE.Object3D, material: THREE.Material, position: number[], scale: number[], exponent = .72) {
    const uSegments = 72, vSegments = 48;
    const positions: number[] = [], uv: number[] = [], indices: number[] = [];
    for (let j = 0; j <= vSegments; j++) {
      const phi = j / vSegments * Math.PI;
      const yy = spow(Math.cos(phi), exponent), radial = Math.pow(Math.sin(phi), exponent);
      for (let i = 0; i <= uSegments; i++) {
        const angle = i / uSegments * Math.PI * 2;
        // Narrower chin, generous high cheeks, and a soft flat face plane.
        const jaw = 1 - Math.max(0, -yy) * .105;
        positions.push(radial * spow(Math.cos(angle), exponent) * scale[0] * jaw,
          yy * scale[1], radial * spow(Math.sin(angle), exponent) * scale[2]);
        uv.push(i / uSegments, j / vSegments);
      }
    }
    for (let j = 0; j < vSegments; j++) for (let i = 0; i < uSegments; i++) {
      const a = j * (uSegments + 1) + i, b = a + uSegments + 1;
      indices.push(a, a + 1, b, b, a + 1, b + 1);
    }
    const g = new THREE.BufferGeometry();g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));g.setIndex(indices);g.computeVertexNormals();
    const object = mesh(g, material, parent); object.position.set(position[0],position[1],position[2]); return object;
  }
  // A sculpted solid lock. A lens cross section gives broad soft highlights and a pointed tip.
  function lock(parent: THREE.Object3D, points: number[][], widths: number[], depths: number[], material = ink) {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p as [number,number,number])));
    const positions: number[] = [], indices: number[] = [];
    const samples = 42, rings = 16;
    const reference = new THREE.Vector3(0,0,1);
    for(let i=0;i<=samples;i++) {
      const t=i/samples, center=curve.getPoint(t), tangent=curve.getTangent(t).normalize();
      const side = new THREE.Vector3().crossVectors(tangent,reference).normalize();
      if(side.lengthSq()<.1)side.set(1,0,0);
      const normal=new THREE.Vector3().crossVectors(side,tangent).normalize();
      const k=t*(widths.length-1), lo=Math.floor(k), hi=Math.min(widths.length-1,lo+1), f=k-lo;
      const w=THREE.MathUtils.lerp(widths[lo],widths[hi],f), d=THREE.MathUtils.lerp(depths[lo],depths[hi],f);
      for(let r=0;r<=rings;r++) {
        const angle=r/rings*Math.PI*2;
        const p=center.clone().addScaledVector(side,Math.cos(angle)*Math.max(w,.001)).addScaledVector(normal,Math.sin(angle)*Math.max(d,.001));
        positions.push(p.x,p.y,p.z);
      }
    }
    for(let i=0;i<samples;i++)for(let r=0;r<rings;r++){const a=i*(rings+1)+r,b=a+rings+1;indices.push(a,b,a+1,b,b+1,a+1);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();
    return mesh(g,material,parent);
  }
  function patch(parent: THREE.Object3D, m: THREE.Material, x: number, y: number, z: number, w: number, h: number, angle = 0) {
    const shape = new THREE.Shape();
    shape.moveTo(-w*.45,-h*.38);shape.bezierCurveTo(-w*.64,-h*.03,-w*.48,h*.30,-w*.12,h*.43);
    shape.bezierCurveTo(w*.22,h*.61,w*.49,h*.26,w*.48,-h*.07);
    shape.bezierCurveTo(w*.49,-h*.38,w*.12,-h*.53,-w*.45,-h*.38);
    const object=extrusion(parent,shape,m,.012,.018);object.position.set(x,y,z);object.rotation.z=angle;return object;
  }
  function roundedRect(width: number, height: number, radius: number) {
    const shape = new THREE.Shape(), x=-width/2,y=-height/2,w=width,h=height,r=radius;
    shape.moveTo(x+r,y);shape.lineTo(x+w-r,y);shape.quadraticCurveTo(x+w,y,x+w,y+r);shape.lineTo(x+w,y+h-r);
    shape.quadraticCurveTo(x+w,y+h,x+w-r,y+h);shape.lineTo(x+r,y+h);shape.quadraticCurveTo(x,y+h,x,y+h-r);
    shape.lineTo(x,y+r);shape.quadraticCurveTo(x,y,x+r,y);return shape;
  }

  const head = new THREE.Group();head.position.set(0,.37,0);root.add(head);
  // Bob understructure stays behind the face; the visible locks form its scalloped outline.
  softVolume(head,ink,[0,.070,-.135],[.646,.58,.435],.76);
  softVolume(head,skin,[0,.015,.065],[.573,.514,.437],.76);
  for(const side of [-1,1]) {
    const ear=oval(head,skin,[side*.577,-.087,.015],[.112,.168,.087]);ear.rotation.z=-side*.09;
    const inner=oval(head,nosePink,[side*.615,-.07,.082],[.040,.091,.018]);inner.rotation.y=side*.24;
  }
  // Back hair is composed of individually sculpted tapered locks, with continuous silhouette.
  for(let i=0;i<9;i++) {
    const angle=Math.PI*.10+i/8*Math.PI*.80;
    const x=Math.cos(angle)*.526,z=-Math.sin(angle)*.397-.07;
    lock(head,[[x*.85,.55,z*.80],[x,.22,z],[x*1.03,-.21,z*.98],[x*.93,-.53+(i%3)*.025,z+.07]],
      [.105,.142,.137,.006],[.06,.115,.10,.003]);
  }
  // Two broad S-curved cheek locks, with smaller sweeping tips underneath.
  const hairTips: THREE.Object3D[]=[];
  for(const side of [-1,1]) {
    const tip=new THREE.Group();head.add(tip);hairTips.push(tip);
    lock(tip,[[side*.48,.54,.22],[side*.565,.20,.30],[side*.552,-.145,.36],[side*.33,-.285,.463]],
      [.095,.117,.134,.002],[.071,.107,.09,.002]);
    lock(head,[[side*.571,.39,.063],[side*.635,.01,.09],[side*.54,-.37,.145],[side*.397,-.476,.239]],
      [.08,.102,.126,.002],[.067,.09,.071,.002]);
    // Deliberately subtle sculpted seam, not a painted white line.
    lock(tip,[[side*.535,.45,.309],[side*.603,.13,.363],[side*.544,-.135,.442],[side*.355,-.27,.48]],
      [.010,.012,.012,.001],[.006,.008,.007,.001],hairSheen);
  }
  // Swept fringe: an asymmetric curl over the forehead, distinct from a bowl cut.
  lock(head,[[.14,.615,.36],[.14,.405,.445],[.035,.254,.499],[-.134,.335,.503]],
    [.195,.189,.140,.001],[.090,.107,.078,.001]);
  lock(head,[[.075,.609,.367],[-.052,.408,.462],[-.176,.352,.494],[-.249,.421,.45]],
    [.123,.132,.089,.001],[.088,.075,.046,.001]);
  lock(head,[[.12,.56,.468],[.108,.39,.53],[.006,.279,.568],[-.118,.331,.526]],
    [.008,.009,.011,.001],[.004,.005,.004,.001],hairSheen);

  // Characterful closed eyes and lashes use a single sculpted silhouette each.
  const eyes: THREE.Group[]=[];
  const eyeHomes: THREE.Vector3[]=[];
  for(const side of [-1,1]) {
    const eye = new THREE.Group();eye.position.set(side*.273,-.055,.477);head.add(eye);
    const shape=new THREE.Shape();
    shape.moveTo(-.126,-.027);shape.bezierCurveTo(-.083,.028,.047,.044,.125,-.024);
    shape.quadraticCurveTo(.134,-.035,.126,-.001);shape.lineTo(.124,.038);
    shape.quadraticCurveTo(.119,.047,.105,.035);shape.quadraticCurveTo(.080,.023,.055,.045);
    shape.lineTo(.035,.075);shape.quadraticCurveTo(.026,.085,.016,.067);shape.lineTo(-.001,.046);
    shape.quadraticCurveTo(-.055,.042,-.079,.024);shape.lineTo(-.112,.044);
    shape.quadraticCurveTo(-.125,.052,-.121,.022);shape.lineTo(-.126,-.027);
    const lash=extrusion(eye,shape,eyelash,.009,.004);lash.scale.x=side;
    eye.rotation.y=side*.19;eye.rotation.z=side*.015;
    // Eyes intentionally stay happily closed; the caller need not synthesize a blink.
    eyeHomes.push(eye.position.clone());
  }
  for(const side of [-1,1]) {
    const blush=oval(head,cheek,[side*.343,-.171,.469],[.092,.036,.009]);blush.rotation.y=side*.18;
    const brow=patch(head,ink,side*.29,.20,.435,.13,.061,side*.10);brow.rotation.y=side*.18;
  }
  const noseShape=new THREE.Shape();noseShape.moveTo(0,.064);noseShape.quadraticCurveTo(.012,.067,.031,.036);
  noseShape.lineTo(.067,-.020);noseShape.quadraticCurveTo(.076,-.042,.043,-.049);
  noseShape.quadraticCurveTo(0,-.064,-.047,-.048);noseShape.quadraticCurveTo(-.076,-.038,-.060,-.017);
  noseShape.lineTo(-.019,.051);noseShape.quadraticCurveTo(-.008,.066,0,.064);
  const nose=extrusion(head,noseShape,nosePink,.051,.014);nose.position.set(0,-.171,.476);nose.rotation.x=-.11;
  // Tiny dimples and a little opening with two small porcelain front teeth.
  const mouthShape=new THREE.Shape();mouthShape.moveTo(-.105,.011);mouthShape.bezierCurveTo(-.069,.002,.065,.002,.105,.017);
  mouthShape.bezierCurveTo(.096,-.05,.057,-.073,0,-.073);mouthShape.bezierCurveTo(-.055,-.073,-.100,-.039,-.105,.011);
  const mouth=extrusion(head,mouthShape,mouthInk,.006,.007);mouth.position.set(0,-.302,.46);mouth.scale.set(.85,.85,1);
  tube(head,[[-.090,-.298,.474],[-.073,-.342,.479],[0,-.363,.474],[.068,-.340,.479],[.092,-.293,.474]],.006,lip,32);
  for(const x of [-.03,.03]) {
    const tooth=extrusion(head,roundedRect(.043,.020,.006),ivory,.007,.002);tooth.position.set(x*.8,-.312,.487);
  }
  oval(head,skin,[-.106,-.300,.452],[.025,.025,.012]);oval(head,skin,[.106,-.300,.452],[.025,.025,.012]);

  // Norma's white X barrette lives clearly on the black fringe.
  const barrette=new THREE.Group();barrette.position.set(-.463,.265,.407);barrette.rotation.set(-.02,-.36,.21);head.add(barrette);
  for(const angle of [-Math.PI/4,Math.PI/4]) {
    const bar=extrusion(barrette,roundedRect(.046,.195,.020),ivory,.028,.008);bar.rotation.z=angle;
  }
  const bow=new THREE.Group();bow.position.set(.628,.226,.04);bow.rotation.z=-.17;head.add(bow);
  for(const side of [-1,1]) {
    const shape=new THREE.Shape();shape.moveTo(0,0);shape.bezierCurveTo(side*.115,.140,side*.223,.103,side*.197,.031);
    shape.bezierCurveTo(side*.228,-.093,side*.127,-.122,0,0);
    const loop=extrusion(bow,shape,ink,.067,.027);loop.rotation.y=side*.21;
  }
  oval(bow,ink,[0,0,.065],[.048,.058,.05]);

  const cap = new THREE.Group();cap.position.set(0,.605,-.04);head.add(cap);cap.rotation.z=-.045;
  // Hand-profiled lathe has the overflowing, softly folded mushroom/beret silhouette.
  const capProfile=[new THREE.Vector2(0,.435),new THREE.Vector2(.16,.432),new THREE.Vector2(.35,.41),
    new THREE.Vector2(.57,.33),new THREE.Vector2(.75,.218),new THREE.Vector2(.857,.075),
    new THREE.Vector2(.876,-.044),new THREE.Vector2(.844,-.105),new THREE.Vector2(.73,-.12),new THREE.Vector2(0,-.105)];
  const smoothCapProfile = new THREE.SplineCurve(capProfile.slice().reverse()).getPoints(72);
  const capGeometry=new THREE.LatheGeometry(smoothCapProfile,96);capGeometry.computeVertexNormals();
  const dome=mesh(capGeometry,mint,cap);dome.scale.z=.84;
  // Dark knitted-looking broad band, softened at both edges.
  const bandProfile=[new THREE.Vector2(.72,-.085),new THREE.Vector2(.748,-.10),new THREE.Vector2(.73,-.165),
    new THREE.Vector2(.750,-.221),new THREE.Vector2(.724,-.235),new THREE.Vector2(.693,-.219),new THREE.Vector2(.688,-.10),new THREE.Vector2(.72,-.085)];
  const band=mesh(new THREE.LatheGeometry(new THREE.SplineCurve(bandProfile.slice().reverse()).getPoints(64),96),forest,cap);band.scale.z=.86;
  // Raised irregular soft appliqués drape over the cap's rounded front.
  const spots=[[-.59,.106,.492,.206,.215,-.50],[-.67,.239,.327,.103,.083,-.25],
    [.56,.13,.526,.210,.218,.31],[.635,.274,.331,.121,.072,.45],
    [.21,.337,.274,.154,.110,.20],[-.43,.333,-.352,.18,.17,.05],[.60,.189,-.42,.20,.15,-.4]];
  // Every patch vertex hugs the actual cap profile, keeping appliqués soft and flush.
  const capRadiusAt=(y:number)=>{
    let radius=0;
    for(let i=0;i<smoothCapProfile.length-1;i++) {
      const a=smoothCapProfile[i],b=smoothCapProfile[i+1];
      if(y>=Math.min(a.y,b.y)&&y<=Math.max(a.y,b.y)&&Math.abs(a.y-b.y)>.0001)
        radius=Math.max(radius,THREE.MathUtils.lerp(a.x,b.x,(y-a.y)/(b.y-a.y)));
    }
    return radius;
  };
  spots.forEach(([cx,cy,cz,w,h,rotation])=>{
    const positions:number[]=[],indices:number[]=[];const rings=9,sides=48;
    for(let j=0;j<=rings;j++)for(let i=0;i<=sides;i++){
      const r=j/rings,a=i/sides*Math.PI*2;
      const irregular=1+.10*Math.sin(a*3+.7)+.05*Math.cos(a*5);
      const dx=Math.cos(a)*w*.5*r*irregular,dy=Math.sin(a)*h*.5*r*irregular;
      const x=cx+dx*Math.cos(rotation)-dy*Math.sin(rotation),y=cy+dx*Math.sin(rotation)+dy*Math.cos(rotation);
      const radius=capRadiusAt(y),z=Math.sqrt(Math.max(.0001,radius*radius-x*x))*.84;
      positions.push(x,y,Math.sign(cz)*(z+.004+.014*Math.sqrt(Math.max(0,1-r*r))));
    }
    for(let j=0;j<rings;j++)for(let i=0;i<sides;i++){
      const a=j*(sides+1)+i,b=a+sides+1;
      if(cz>0)indices.push(a,b,a+1,b,b+1,a+1);else indices.push(a,a+1,b,b,a+1,b+1);
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();mesh(geometry,ink,cap);
  });
  // Curved candy stem, with geometry-based winding stripes (no texture dependencies).
  const secondary = new THREE.Group();secondary.position.set(.026,.404,-.12);cap.add(secondary);
  const socket=oval(secondary,forest,[0,0,0],[.146,.067,.131]);socket.rotation.x=.1;
  const stemCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0,.029,0),new THREE.Vector3(-.025,.217,-.004),new THREE.Vector3(-.037,.366,.008),
    new THREE.Vector3(.043,.46,.016),new THREE.Vector3(.163,.418,.025),new THREE.Vector3(.195,.308,.036)]);
  const stemGeometry=new THREE.TubeGeometry(stemCurve,72,.086,32,false);const attrs=stemGeometry.getAttribute('uv');
  const colors:number[]=[];const c1=new THREE.Color(0xef8b7d),c2=new THREE.Color(0xffcd91);
  for(let i=0;i<attrs.count;i++) {
    const u=attrs.getX(i),v=attrs.getY(i);const s=(v+u*3.3)%1;
    const mix=THREE.MathUtils.smoothstep(s,.44,.50)-THREE.MathUtils.smoothstep(s,.94,1);
    const c=c1.clone().lerp(c2,mix);colors.push(c.r,c.g,c.b);
  }
  stemGeometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  const stripeMaterial=mat(0xffffff,.60);stripeMaterial.vertexColors=true;mesh(stemGeometry,stripeMaterial,secondary);
  const end=oval(secondary,coralDark,[.195,.308,.036],[.084,.036,.084]);end.rotation.z=.25;

  // A little black blouse beneath a coral pinafore, proportioned as a vinyl collectible.
  softVolume(root,ink,[0,-.315,-.015],[.219,.209,.171],.79);
  const neck=mesh(new THREE.CylinderGeometry(.085,.092,.13,32),skin);neck.position.set(0,-.173,.024);
  // Pleated skirt is a continuous surface with actual folds and a thick finished hem.
  const skirtPositions:number[]=[],skirtIndices:number[]=[];const skirtSegments=96,skirtRings=24;
  for(let j=0;j<=skirtRings;j++) {
    const t=j/skirtRings, y=-.318-t*.454;
    for(let i=0;i<=skirtSegments;i++) {
      const a=i/skirtSegments*Math.PI*2;
      const pleat=Math.cos(a*10+.2)*.015*Math.pow(t,.8)+Math.cos(a*20+.4)*.005*t;
      const radius=.187+Math.pow(t,1.6)*.145+pleat;
      skirtPositions.push(Math.cos(a)*radius,y+Math.cos(a*10+.2)*.008*t,Math.sin(a)*radius*.77);
    }
  }
  for(let j=0;j<skirtRings;j++)for(let i=0;i<skirtSegments;i++){const a=j*(skirtSegments+1)+i,b=a+skirtSegments+1;skirtIndices.push(a,a+1,b,b,a+1,b+1);}
  const skirtGeometry=new THREE.BufferGeometry();skirtGeometry.setAttribute('position',new THREE.Float32BufferAttribute(skirtPositions,3));skirtGeometry.setIndex(skirtIndices);skirtGeometry.computeVertexNormals();
  coral.side=THREE.DoubleSide;mesh(skirtGeometry,coral);
  const hemPoints:number[][]=[];for(let i=0;i<=100;i++){const a=i/100*Math.PI*2,r=.332+Math.cos(a*10+.2)*.015+Math.cos(a*20+.4)*.005;hemPoints.push([Math.cos(a)*r,-.770+Math.cos(a*10+.2)*.008,Math.sin(a)*r*.77]);}
  tube(root,hemPoints,.009,coralDark,120);
  const bibShape=new THREE.Shape();bibShape.moveTo(-.137,-.125);bibShape.lineTo(.137,-.125);bibShape.lineTo(.138,.119);
  bibShape.quadraticCurveTo(.108,.156,.083,.133);bibShape.lineTo(.068,.068);bibShape.lineTo(-.068,.068);bibShape.lineTo(-.086,.133);
  bibShape.quadraticCurveTo(-.125,.16,-.138,.11);bibShape.lineTo(-.137,-.125);
  const bib=extrusion(root,bibShape,coral,.032,.011);bib.position.set(0,-.315,.16);
  for(const side of [-1,1]) {
    tube(root,[[side*.099,-.426,.173],[side*.107,-.30,.173],[side*.102,-.173,.069],[side*.10,-.255,-.14]],.024,coral,36);
    oval(root,gold,[side*.105,-.3,.204],[.016,.016,.007]);
  }
  const pocketShape=new THREE.Shape();pocketShape.moveTo(-.071,-.04);pocketShape.lineTo(.071,-.04);pocketShape.lineTo(.071,.016);
  pocketShape.bezierCurveTo(.068,.077,-.068,.077,-.071,.016);pocketShape.lineTo(-.071,-.04);
  const pocket=extrusion(root,pocketShape,coralDark,.013,.01);pocket.position.set(0,-.435,.192);
  // A tiny ivory maker's label, with Norma's three-color accent stitches.
  const tag=extrusion(root,roundedRect(.070,.034,.005),ivory,.008,.003);tag.position.set(.223,-.67,.155);tag.rotation.y=.43;
  [powderBlue,coralDark,gold].forEach((m,i)=>oval(root,m,[.201+i*.018,-.667,.173-i*.007],[.005,.008,.003]));

  const leftArm=new THREE.Group(),rightArm=new THREE.Group();
  root.add(leftArm,rightArm);leftArm.position.set(-.21,-.284,0);rightArm.position.set(.21,-.284,0);
  for(const [arm,side] of [[leftArm,-1],[rightArm,1]] as const) {
    lock(arm,[[0,0,0],[side*.082,-.126,.001],[side*.11,-.24,.019],[side*.144,-.278,.032]],
      [.087,.075,.07,.086],[.09,.07,.065,.076]);
    const cuff=oval(arm,ink,[side*.134,-.268,.03],[.103,.069,.084]);cuff.rotation.z=side*.34;
    const hand=new THREE.Group();hand.position.set(side*.163,-.352,.044);hand.rotation.z=side*.27;arm.add(hand);
    softVolume(hand,skin,[0,-.014,0],[.086,.106,.052],.83);
    // Four gently separated round fingers, integrated into the broad mitten palm.
    for(let i=0;i<4;i++) {
      const xx=(i-1.5)*.038, length=[.098,.124,.129,.10][i];
      lock(hand,[[xx,-.056,.002],[xx*1.12,-.093,.008],[xx*1.26,-.064-length,.018]],
        [.026,.025,.008],[.028,.027,.009],skin);
      oval(hand,skin,[xx*1.26,-.064-length,.018],[.022,.024,.025]);
    }
    const thumb=oval(hand,skin,[-side*.081,.006,.03],[.040,.080,.039]);thumb.rotation.z=-side*.65;
  }
  const feet:THREE.Object3D[]=[];
  for(const side of [-1,1]) {
    const leg=new THREE.Group();leg.position.set(side*.145,-.782,0);root.add(leg);
    const legPoints=[[0,.04,0],[side*.009,-.12,.003],[side*.016,-.28,.002],[side*.018,-.37,.024]];
    lock(leg,legPoints,[.074,.069,.062,.065],[.070,.060,.055,.061],mint);
    for(let i=0;i<5;i++) {
      const a=(i/5)*Math.PI*2+.3, x=Math.sin(a),z=Math.cos(a);
      tube(leg,[[x*.073,.035,z*.069],[side*.009+x*.069,-.12,z*.060],[side*.016+x*.061,-.28,z*.055],[side*.018+x*.065,-.361,.024+z*.058]],.006,forest,32);
    }
    const shoe=new THREE.Group();shoe.position.set(side*.017,-.361,.055);shoe.rotation.y=side*.085;leg.add(shoe);feet.push(shoe);
    softVolume(shoe,ink,[0,-.087,.048],[.118,.055,.204],.64);
    softVolume(shoe,coralDark,[0,-.035,.033],[.113,.085,.184],.77);
    softVolume(shoe,coral,[0,-.04,.126],[.112,.073,.116],.76);
    // Arched ivory strap is continuous around the shoe, with an oversized tongue.
    tube(shoe,[[-.112,-.059,.093],[-.102,.002,.091],[-.06,.046,.085],[0,.058,.076],[.065,.034,.079],[.105,-.004,.082],[.117,-.056,.085]],.021,ivory,44);
    const tongue=softVolume(shoe,ivory,[0,.037,-.004],[.044,.073,.046],.82);tongue.rotation.x=.48;
    oval(shoe,gold,[side*.114,-.003,.072],[.012,.018,.026]);
  }
  // Two small snow spirits establish the same playful relationship as the reference.
  const companions:THREE.Group[]=[];const companionHomes:THREE.Vector3[]=[];
  for(const [index,side] of [[0,-1],[1,1]] as const) {
    const bunny=new THREE.Group();bunny.position.set(side*(index?1.19:1.15),index?.58:.14,index?-.14:.08);
    bunny.rotation.z=-side*.21;bunny.scale.setScalar(index?.90:.76);root.add(bunny);companions.push(bunny);companionHomes.push(bunny.position.clone());
    softVolume(bunny,ivory,[0,0,0],[.221,.192,.152],.76);
    for(const s of [-1,1]) {
      const ear=oval(bunny,ivory,[s*.13,.178,-.006],[.063,.100,.057]);ear.rotation.z=-s*.40;
      oval(bunny,eyelash,[s*.081,.028,.147],[.021,.031,.014]);oval(bunny,ivory,[s*.081-.006,.04,.16],[.006,.008,.003]);
      oval(bunny,cheek,[s*.122,-.034,.141],[.029,.016,.009]);
    }
    tube(bunny,[[-.024,-.042,.155],[0,-.055,.16],[.024,-.042,.155]],.006,eyelash,18);
  }
  root.traverse(object=>{if(object instanceof THREE.Mesh){object.castShadow=true;object.receiveShadow=true;}});
  const update=(t:number,motion:boolean,wave:number,cheer:number,lookX:number,lookY:number)=> {
    head.rotation.z=motion?Math.sin(t*.85)*.019+wave*.035:0;
    head.rotation.y=motion?lookX*.075:0;head.rotation.x=motion?lookY*.035:0;
    secondary.rotation.z=motion?Math.sin(t*1.9-.7)*.045+cheer*.08:0;
    hairTips.forEach((tip,index)=>{tip.rotation.z=motion?Math.sin(t*1.7+index*.8)*.012:0;});
    companions.forEach((bunny,index)=>{
      const home=companionHomes[index];bunny.position.copy(home);
      if(motion){bunny.position.y+=Math.sin(t*1.6+index*2.2)*.060+cheer*.08;bunny.position.x+=Math.cos(t*.9+index*2)*.025;bunny.rotation.z=Math.sin(t*1.15+index)*.12+(index?-.13:.13);bunny.rotation.y=lookX*.10;}
      else {bunny.rotation.z=index?-.21:.21;bunny.rotation.y=0;}
    });
  };
  return {root,eyes,eyeHomes,leftArm,rightArm,secondary,feet,geometries,materials,update};
}
