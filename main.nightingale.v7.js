import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

console.log('Nightingale v7 — head/beak/underparts/tail/wings/light refined');

const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(4.5, 2.45, 5.7);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0.85, 0);

// Lighting: slightly warmer key, stronger rim, gentle fill
const hemi = new THREE.HemisphereLight(0x86a4ff, 0x142033, 0.42);
scene.add(hemi);
const key = new THREE.DirectionalLight(0xffecd2, 1.15);
key.position.set(3.5, 6.2, 3.2);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.near = 0.5;
key.shadow.camera.far = 40;
scene.add(key);
const rim = new THREE.DirectionalLight(0x9ab6ff, 0.32);
rim.position.set(-4.5, 2.7, -3.2);
scene.add(rim);
const fill = new THREE.DirectionalLight(0xffd7aa, 0.18);
fill.position.set(0.0, 2.0, -2.0);
scene.add(fill);

// Perch branch: a touch steeper
const branchGeo = new THREE.CylinderGeometry(0.085, 0.12, 6.5, 20);
const branchMat = new THREE.MeshStandardMaterial({ color: 0x6b4a2e, roughness: 1, metalness: 0 });
const branch = new THREE.Mesh(branchGeo, branchMat);
branch.rotation.z = Math.PI / 7.2;
branch.rotation.x = Math.PI / 13;
branch.position.set(0, 0.1, 0);
branch.castShadow = true;
branch.receiveShadow = true;
scene.add(branch);

// Colors (tweaked)
const COLORS = {
  upper: 0x7b5932,
  lower: 0xf0e7d4,      // lighter underparts
  head:  0x6c4e2f,
  super: 0xefe6cf,
  auricular: 0x5a3f26,
  beakUpper: 0x352817,
  beakLower: 0x43321d,
  tail:  0xbb5f2a,      // more saturated rufous
  wing:  0x6e5131,
  wingLight: 0x94734c,  // higher contrast median coverts
  band: 0xbda27a,       // faint pale band
  leg:   0x8a5a30,
  toe:   0x6b431e,
  claw:  0x2a2015,
  eye:   0x0f0f0f,
  eyeRing: 0xf3e6cf,
  nostril: 0x1a1410
};

function material(color, opts={}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0.05, flatShading: false, ...opts });
}

function addVertexGradientWithSpeckle(geometry, yMin, yMax, colorBottom, colorTop, speckle=0) {
  const pos = geometry.attributes.position;
  const count = pos.count;
  const colors = new Float32Array(count * 3);
  const cTop = new THREE.Color(colorTop);
  const cBot = new THREE.Color(colorBottom);
  for (let i = 0; i < count; i++) {
    const y = pos.getY(i);
    const t = Math.max(0, Math.min(1, (y - yMin) / (yMax - yMin)));
    const c = cBot.clone().lerp(cTop, t);
    if (speckle > 0 && y < (yMin + yMax) * 0.25) {
      const n = (Math.sin(i * 12.9898) * 43758.5453) % 1; // pseudo-rand
      const s = 1 + (n - 0.5) * speckle;
      c.multiplyScalar(s);
    }
    colors[i * 3 + 0] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.attributes.color.needsUpdate = true;
}

// Root
const bird = new THREE.Group();
scene.add(bird);

// Body — higher poly, lighter underparts with mild mottling
const bodyGeo = new THREE.SphereGeometry(1.15, 48, 36);
bodyGeo.scale(1.28, 1.02, 2.08);
addVertexGradientWithSpeckle(bodyGeo, -1.0, 1.0, COLORS.lower, COLORS.upper, 0.06);
const body = new THREE.Mesh(bodyGeo, material(COLORS.upper, { vertexColors: true }));
body.castShadow = true; body.receiveShadow = true;
bird.add(body);

// Head — rounder crown, slightly shorter face
const headGeo = new THREE.SphereGeometry(0.73, 44, 32);
headGeo.scale(1.02, 1.06, 1.02); // rounder crown
const head = new THREE.Mesh(headGeo, material(COLORS.head));
head.position.set(0, 1.01, 0.6); // bring face slightly back
head.castShadow = true; bird.add(head);

// Subtle brow mass
const brow = new THREE.Mesh(new THREE.SphereGeometry(0.33, 30, 22), material(COLORS.head));
brow.scale.set(1.2, 0.52, 0.88);
brow.position.set(0, 1.11, 0.56);
brow.castShadow = true; bird.add(brow);

// Auricular (cheek) patch
const aur = new THREE.Mesh(new THREE.SphereGeometry(0.25, 28, 20), material(COLORS.auricular));
aur.scale.set(1.05, 0.7, 0.5);
aur.position.set(0.0, 0.96, 0.7);
aur.castShadow = true; bird.add(aur);
const aurR = aur.clone(); aurR.position.x *= -1; bird.add(aurR);

// Eyes, ring, highlights
const eyeGeo = new THREE.SphereGeometry(0.09, 22, 16);
const eyeMat = material(COLORS.eye, { metalness: 0.45, roughness: 0.18 });
const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
eyeL.position.set(0.205, 1.095, 0.915);
eyeR.position.set(-0.205, 1.095, 0.915);
bird.add(eyeL, eyeR);
const ringGeo = new THREE.TorusGeometry(0.145, 0.016, 10, 24);
const ringMat = material(COLORS.eyeRing);
const ringL = new THREE.Mesh(ringGeo, ringMat); ringL.rotation.y = Math.PI / 2; ringL.position.copy(eyeL.position);
const ringR = ringL.clone(); ringR.position.copy(eyeR.position);
bird.add(ringL, ringR);
const hiliteGeo = new THREE.SphereGeometry(0.023, 10, 8);
const hiliteMat = material(0xffffff, { metalness: 0.9, roughness: 0.1 });
const hlL = new THREE.Mesh(hiliteGeo, hiliteMat); hlL.position.copy(eyeL.position).add(new THREE.Vector3(0.028, 0.02, 0.02));
const hlR = new THREE.Mesh(hiliteGeo, hiliteMat); hlR.position.copy(eyeR.position).add(new THREE.Vector3(-0.028, 0.02, 0.02));
bird.add(hlL, hlR);

// Supercilium (eyebrow)
function addSupercilium(sign = 1) {
  const g = new THREE.Group();
  const segs = 11;
  for (let i = 0; i < segs; i++) {
    const t = i / (segs - 1);
    const x = 0.12 * sign + (t - 0.5) * 0.3 * sign;
    const y = 1.15 + Math.sin((t - 0.5) * Math.PI) * 0.03;
    const z = 0.86 + Math.cos((t - 0.5) * Math.PI) * 0.08;
    const seg = new THREE.Mesh(new THREE.CapsuleGeometry(0.007, 0.02, 2, 4), material(COLORS.super));
    seg.position.set(x, y, z); seg.rotation.y = Math.PI / 2; g.add(seg);
  }
  bird.add(g);
}
addSupercilium(+1); addSupercilium(-1);

// Beak — shorter, narrower profiles
const upperProfile = [
  new THREE.Vector2(0.0, 0.0),
  new THREE.Vector2(0.028, 0.055),
  new THREE.Vector2(0.048, 0.18),
  new THREE.Vector2(0.042, 0.33),
  new THREE.Vector2(0.028, 0.52)
];
const lowerProfile = [
  new THREE.Vector2(0.0, 0.0),
  new THREE.Vector2(0.024, 0.045),
  new THREE.Vector2(0.04, 0.16),
  new THREE.Vector2(0.036, 0.29),
  new THREE.Vector2(0.020, 0.47)
];
const upperGeo = new THREE.LatheGeometry(upperProfile, 64);
const lowerGeo = new THREE.LatheGeometry(lowerProfile, 64);
const beakUpper = new THREE.Mesh(upperGeo, material(COLORS.beakUpper, { roughness: 0.5, metalness: 0.12 }));
const beakLower = new THREE.Mesh(lowerGeo, material(COLORS.beakLower, { roughness: 0.55, metalness: 0.1 }));
beakUpper.rotation.x = Math.PI / 2; beakLower.rotation.x = Math.PI / 2;
beakUpper.position.set(0, 0.94, 1.09);
beakLower.position.set(0, 0.93, 1.075);
beakLower.rotation.z = -0.045;
bird.add(beakUpper, beakLower);
// Tomial edge lines — slightly shorter
function addTomialEdge(sign = 1) {
  const edge = new THREE.Mesh(new THREE.CapsuleGeometry(0.006, 0.5, 2, 4), material(0x2a1d12));
  edge.rotation.x = Math.PI / 2; edge.rotation.y = 0.06 * -sign;
  edge.position.set(0.056 * sign, 0.935, 0.88);
  bird.add(edge);
}
addTomialEdge(+1); addTomialEdge(-1);
// Nares
const nareGeo = new THREE.SphereGeometry(0.028, 14, 12);
const nareMat = material(COLORS.nostril, { metalness: 0.1, roughness: 0.6 });
const nareL = new THREE.Mesh(nareGeo, nareMat); nareL.scale.set(1.2, 0.7, 0.8); nareL.position.set(0.064, 0.982, 0.995);
const nareR = nareL.clone(); nareR.position.x *= -1; bird.add(nareL, nareR);

// Wings — more contrast on median coverts + pale band
function feather(color) { return material(color); }
function makeFeather(w, h, t = 0.028, color = COLORS.wing) {
  const geo = new THREE.BoxGeometry(t, h, w, 1, 1, 1);
  return new THREE.Mesh(geo, feather(color));
}
function makeFoldedWingDetailed(side = 1) {
  const g = new THREE.Group();
  // Greater coverts (top)
  for (let i = 0; i < 7; i++) {
    const f = makeFeather(0.62 - i * 0.04, 0.52 + i * 0.03, 0.028, COLORS.wing);
    f.position.set((0.55 + i * 0.05) * side, 0.36 - i * 0.015, -0.1 - i * 0.03);
    f.rotation.y = (0.28 + i * 0.03) * -side; f.castShadow = true; f.receiveShadow = true; g.add(f);
  }
  // Median coverts (lighter row)
  for (let i = 0; i < 6; i++) {
    const f = makeFeather(0.56 - i * 0.04, 0.49 + i * 0.03, 0.026, COLORS.wingLight);
    f.position.set((0.6 + i * 0.05) * side, 0.33 - i * 0.015, -0.06 - i * 0.03);
    f.rotation.y = (0.25 + i * 0.03) * -side; f.castShadow = true; g.add(f);
  }
  // Pale band accent
  for (let i = 0; i < 5; i++) {
    const b = makeFeather(0.5 - i * 0.04, 0.03, 0.02, COLORS.band);
    b.position.set((0.62 + i * 0.05) * side, 0.31 - i * 0.015, -0.02 - i * 0.03);
    b.rotation.y = (0.24 + i * 0.03) * -side; g.add(b);
  }
  // Secondaries
  for (let i = 0; i < 7; i++) {
    const f = makeFeather(0.84 - i * 0.05, 0.52 + i * 0.03);
    f.position.set((0.68 + i * 0.055) * side, 0.3 - i * 0.012, -0.2 - i * 0.04);
    f.rotation.y = (0.38 + i * 0.03) * -side; f.castShadow = true; f.receiveShadow = true; g.add(f);
  }
  // Primaries
  for (let i = 0; i < 8; i++) {
    const f = makeFeather(1.26 - i * 0.06, 0.55 + i * 0.02);
    f.position.set((0.98 + i * 0.06) * side, 0.22 - i * 0.008, -0.34 - i * 0.055);
    f.rotation.y = (0.5 + i * 0.035) * -side; f.castShadow = true; f.receiveShadow = true; g.add(f);
  }
  return g;
}
const wingL = makeFoldedWingDetailed(+1);
const wingR = makeFoldedWingDetailed(-1);
bird.add(wingL, wingR);

// Scapular/body feather rows
function addScapularRow(side = 1, y = 0.42, zStart = 0.05, count = 9) {
  const g = new THREE.Group();
  for (let i = 0; i < count; i++) {
    const f = makeFeather(0.35 - i * 0.01, 0.08 + (i % 2) * 0.02, 0.026, COLORS.wing);
    const z = zStart - i * 0.05;
    f.position.set(0.45 * side + i * 0.02 * side, y - i * 0.005, z);
    f.rotation.y = (0.2 + i * 0.02) * -side; f.castShadow = true; g.add(f);
  }
  bird.add(g);
}
addScapularRow(+1); addScapularRow(-1);

// Tail — slightly longer and richer
const tailGroup = new THREE.Group();
const tailMat = material(COLORS.tail);
for (let i = 0; i < 9; i++) {
  const len = 1.55 - Math.abs(i - 4) * 0.12;
  const t = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.08, len), tailMat);
  const angle = (i - 4) * 0.06;
  t.position.set((i - 4) * 0.09, -0.1, -0.6 - len / 2);
  t.rotation.y = angle * 0.22;
  t.castShadow = true; t.receiveShadow = true; tailGroup.add(t);
}
tailGroup.position.set(0, -0.12, -0.6);
tailGroup.rotation.x = -Math.PI / 2.52;
bird.add(tailGroup);

// Legs/feet
const tarsusMat = material(COLORS.leg);
const toeMat = material(COLORS.toe);
const clawMat = material(COLORS.claw, { metalness: 0.3, roughness: 0.4 });
function makeLeg(side = 1) {
  const g = new THREE.Group();
  const tarsus = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, 0.86, 16), tarsusMat);
  tarsus.rotation.x = Math.PI / 24; tarsus.position.set(0, -0.65, 0.05);
  tarsus.castShadow = true; tarsus.receiveShadow = true; g.add(tarsus);
  const toeGeo = new THREE.ConeGeometry(0.07, 0.22, 12);
  const toes = [new THREE.Mesh(toeGeo, toeMat), new THREE.Mesh(toeGeo, toeMat), new THREE.Mesh(toeGeo, toeMat)];
  toes.forEach((t, i) => {
    t.rotation.x = Math.PI / 1.9; t.position.set((i - 1) * 0.085, -1.02, 0.12);
    t.castShadow = true; g.add(t);
    const claw = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.06, 10), clawMat);
    claw.rotation.x = Math.PI / 1.7; claw.position.set((i - 1) * 0.085, -1.11, 0.18); g.add(claw);
  });
  const rear = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.2, 12), toeMat);
  rear.rotation.x = -Math.PI / 1.2; rear.position.set(0.02 * -side, -0.98, -0.02); rear.scale.set(0.9, 0.9, 0.9);
  rear.castShadow = true; g.add(rear);
  const rearClaw = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.06, 10), clawMat);
  rearClaw.rotation.x = -Math.PI / 1.4; rearClaw.position.set(0.02 * -side, -1.05, -0.07); g.add(rearClaw);
  g.position.x = 0.22 * side; return g;
}
bird.add(makeLeg(+1), makeLeg(-1));

// Animation
let t = 0;
function animate(now) {
  t = (now ?? 0) / 1000;
  const breathe = Math.sin(t * 1.15) * 0.02;
  bird.position.y = 0.22 + breathe;
  tailGroup.rotation.x = -Math.PI / 2.52 + Math.sin(t * 1.9) * 0.03;
  head.rotation.x = Math.sin(t * 1.0) * 0.026;
  head.rotation.y = Math.sin(t * 0.7) * 0.02;
  beakLower.rotation.z = -0.045 + Math.sin(t * 1.6) * 0.004;
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

// Resize
function onResize() {
  const w = window.innerWidth, h = window.innerHeight;
  camera.aspect = w / h; camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}
window.addEventListener('resize', onResize);

// Initial framing
bird.position.set(0, 0.2, 0);
controls.target.set(0, 0.85, 0);
controls.update();

