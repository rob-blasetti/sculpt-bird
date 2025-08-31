import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

console.log('Nightingale v6 — supercilium, auricular patch, beak edge, more feathers');

const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(4.6, 2.4, 5.8);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0.85, 0);

// Lights: warm key + cool rim for definition
const hemi = new THREE.HemisphereLight(0x7f9bff, 0x162238, 0.45);
scene.add(hemi);
const key = new THREE.DirectionalLight(0xfff0d8, 1.05);
key.position.set(3.8, 6.0, 3.4);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.near = 0.5;
key.shadow.camera.far = 40;
scene.add(key);
const rim = new THREE.DirectionalLight(0x90b0ff, 0.25);
rim.position.set(-4, 2.5, -3);
scene.add(rim);

// Perch branch
const branchGeo = new THREE.CylinderGeometry(0.085, 0.12, 6.5, 20);
const branchMat = new THREE.MeshStandardMaterial({ color: 0x6b4a2e, roughness: 1, metalness: 0 });
const branch = new THREE.Mesh(branchGeo, branchMat);
branch.rotation.z = Math.PI / 8;
branch.rotation.x = Math.PI / 14;
branch.position.set(0, 0.1, 0);
branch.castShadow = true;
branch.receiveShadow = true;
scene.add(branch);

// Colors
const COLORS = {
  upper: 0x7d5b34,
  lower: 0xeadfca,
  head:  0x6f5030,
  super: 0xe9e0c8,   // supercilium (eyebrow)
  auricular: 0x5b4027, // cheek/auriculars
  beakUpper: 0x3a2c1a,
  beakLower: 0x4a3822,
  tail:  0xa85624,
  wing:  0x6e5131,
  wingLight: 0x7a6040,
  leg:   0x8a5a30,
  toe:   0x6b431e,
  claw:  0x2a2015,
  eye:   0x111111,
  eyeRing: 0xf3e6cf,
  nostril: 0x1a1410
};

function material(color, opts={}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0.05, flatShading: false, ...opts });
}

function addVertexGradient(geometry, yMin, yMax, colorBottom, colorTop) {
  const pos = geometry.attributes.position;
  const count = pos.count;
  const colors = new Float32Array(count * 3);
  const cTop = new THREE.Color(colorTop);
  const cBot = new THREE.Color(colorBottom);
  for (let i = 0; i < count; i++) {
    const y = pos.getY(i);
    const t = Math.max(0, Math.min(1, (y - yMin) / (yMax - yMin)));
    const c = cBot.clone().lerp(cTop, t);
    colors[i * 3 + 0] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.attributes.color.needsUpdate = true;
}

// Root group
const bird = new THREE.Group();
scene.add(bird);

// Body
const bodyGeo = new THREE.SphereGeometry(1.15, 44, 34);
bodyGeo.scale(1.28, 1.0, 2.05);
addVertexGradient(bodyGeo, -1.0, 1.0, COLORS.lower, COLORS.upper);
const body = new THREE.Mesh(bodyGeo, material(COLORS.upper, { vertexColors: true }));
body.castShadow = true; body.receiveShadow = true;
bird.add(body);

// Head core
const headGeo = new THREE.SphereGeometry(0.72, 40, 30);
headGeo.scale(1.03, 0.96, 1.06);
const head = new THREE.Mesh(headGeo, material(COLORS.head));
head.position.set(0, 1.0, 0.63);
head.castShadow = true; bird.add(head);

// Brow mass
const brow = new THREE.Mesh(new THREE.SphereGeometry(0.36, 28, 20), material(COLORS.head));
brow.scale.set(1.3, 0.58, 0.9);
brow.position.set(0, 1.1, 0.58);
brow.castShadow = true; bird.add(brow);

// Auricular (cheek) patch — darker oval
const aur = new THREE.Mesh(new THREE.SphereGeometry(0.26, 24, 18), material(COLORS.auricular));
aur.scale.set(1.1, 0.7, 0.5);
aur.position.set(0.0, 0.96, 0.72);
aur.castShadow = true; bird.add(aur);
const aurR = aur.clone(); aurR.position.x *= -1; bird.add(aurR);

// Eyes + ring
const eyeGeo = new THREE.SphereGeometry(0.09, 20, 16);
const eyeMat = material(COLORS.eye, { metalness: 0.45, roughness: 0.2 });
const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
eyeL.position.set(0.21, 1.09, 0.93);
eyeR.position.set(-0.21, 1.09, 0.93);
bird.add(eyeL, eyeR);
const ringGeo = new THREE.TorusGeometry(0.145, 0.016, 10, 24);
const ring = new THREE.Mesh(ringGeo, material(COLORS.eyeRing));
ring.rotation.y = Math.PI / 2; ring.position.copy(eyeL.position); bird.add(ring);
const ring2 = ring.clone(); ring2.position.copy(eyeR.position); bird.add(ring2);
// Highlights
const hilite = new THREE.Mesh(new THREE.SphereGeometry(0.023, 10, 8), material(0xffffff, { metalness: 0.9, roughness: 0.1 }));
hilite.position.copy(eyeL.position).add(new THREE.Vector3(0.03, 0.02, 0.02)); bird.add(hilite);
const hilite2 = hilite.clone(); hilite2.position.copy(eyeR.position).add(new THREE.Vector3(-0.03, 0.02, 0.02)); bird.add(hilite2);

// Supercilium (pale eyebrow) — thin curve above eye
function addSupercilium(sign = 1) {
  const g = new THREE.Group();
  const segs = 10;
  for (let i = 0; i < segs; i++) {
    const t = i / (segs - 1);
    const x = 0.12 * sign + (t - 0.5) * 0.28 * sign;
    const y = 1.14 + Math.sin((t - 0.5) * Math.PI) * 0.03;
    const z = 0.86 + Math.cos((t - 0.5) * Math.PI) * 0.08;
    const seg = new THREE.Mesh(new THREE.CapsuleGeometry(0.008, 0.02, 2, 4), material(COLORS.super));
    seg.position.set(x, y, z);
    seg.rotation.y = Math.PI / 2;
    g.add(seg);
  }
  bird.add(g);
}
addSupercilium(+1);
addSupercilium(-1);

// Beak upper/lower with nares
const upperProfile = [
  new THREE.Vector2(0.0, 0.0), new THREE.Vector2(0.03, 0.06), new THREE.Vector2(0.055, 0.2),
  new THREE.Vector2(0.048, 0.38), new THREE.Vector2(0.03, 0.6)
];
const lowerProfile = [
  new THREE.Vector2(0.0, 0.0), new THREE.Vector2(0.028, 0.05), new THREE.Vector2(0.045, 0.18),
  new THREE.Vector2(0.04, 0.34), new THREE.Vector2(0.022, 0.55)
];
const upperGeo = new THREE.LatheGeometry(upperProfile, 64);
const lowerGeo = new THREE.LatheGeometry(lowerProfile, 64);
const beakUpper = new THREE.Mesh(upperGeo, material(COLORS.beakUpper, { roughness: 0.55, metalness: 0.12 }));
const beakLower = new THREE.Mesh(lowerGeo, material(COLORS.beakLower, { roughness: 0.6, metalness: 0.1 }));
beakUpper.rotation.x = Math.PI / 2; beakLower.rotation.x = Math.PI / 2;
beakUpper.position.set(0, 0.94, 1.12);
beakLower.position.set(0, 0.93, 1.105);
beakLower.rotation.z = -0.05;
bird.add(beakUpper, beakLower);
// Tomial edge (beak cutting edge) — thin dark lines along sides
function addTomialEdge(sign = 1) {
  const edge = new THREE.Mesh(new THREE.CapsuleGeometry(0.006, 0.55, 2, 4), material(0x2a1d12));
  edge.rotation.x = Math.PI / 2; edge.rotation.y = 0.06 * -sign;
  edge.position.set(0.06 * sign, 0.935, 0.87);
  bird.add(edge);
}
addTomialEdge(+1); addTomialEdge(-1);
// Nares
const nareGeo = new THREE.SphereGeometry(0.03, 14, 12);
const nareMat = material(COLORS.nostril, { metalness: 0.1, roughness: 0.6 });
const nareL = new THREE.Mesh(nareGeo, nareMat); nareL.scale.set(1.2, 0.7, 0.8); nareL.position.set(0.07, 0.98, 1.01);
const nareR = nareL.clone(); nareR.position.x *= -1; bird.add(nareL, nareR);

// Wings — layered feathers with lighter median coverts
function featherMat(color) { return material(color); }
function makeFeather(w, h, t = 0.03, color = COLORS.wing) {
  const geo = new THREE.BoxGeometry(t, h, w, 1, 1, 1);
  return new THREE.Mesh(geo, featherMat(color));
}
function makeFoldedWingDetailed(side = 1) {
  const g = new THREE.Group();
  // Greater coverts (top layer)
  for (let i = 0; i < 7; i++) {
    const f = makeFeather(0.62 - i * 0.04, 0.52 + i * 0.03);
    f.position.set((0.55 + i * 0.05) * side, 0.36 - i * 0.015, -0.1 - i * 0.03);
    f.rotation.y = (0.28 + i * 0.03) * -side;
    f.castShadow = true; f.receiveShadow = true; g.add(f);
  }
  // Median coverts (slightly lighter band)
  for (let i = 0; i < 6; i++) {
    const f = makeFeather(0.54 - i * 0.04, 0.48 + i * 0.03, 0.028, COLORS.wingLight);
    f.position.set((0.58 + i * 0.05) * side, 0.33 - i * 0.015, -0.06 - i * 0.03);
    f.rotation.y = (0.25 + i * 0.03) * -side;
    f.castShadow = true; g.add(f);
  }
  // Secondaries
  for (let i = 0; i < 7; i++) {
    const f = makeFeather(0.82 - i * 0.05, 0.52 + i * 0.03);
    f.position.set((0.68 + i * 0.055) * side, 0.3 - i * 0.012, -0.2 - i * 0.04);
    f.rotation.y = (0.38 + i * 0.03) * -side;
    f.castShadow = true; f.receiveShadow = true; g.add(f);
  }
  // Primaries
  for (let i = 0; i < 8; i++) {
    const f = makeFeather(1.24 - i * 0.06, 0.55 + i * 0.02);
    f.position.set((0.98 + i * 0.06) * side, 0.22 - i * 0.008, -0.34 - i * 0.055);
    f.rotation.y = (0.5 + i * 0.035) * -side;
    f.castShadow = true; f.receiveShadow = true; g.add(f);
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
    const f = makeFeather(0.35 - i * 0.01, 0.08 + (i % 2) * 0.02, 0.028);
    const z = zStart - i * 0.05;
    f.position.set(0.45 * side + i * 0.02 * side, y - i * 0.005, z);
    f.rotation.y = (0.2 + i * 0.02) * -side; f.castShadow = true; g.add(f);
  }
  bird.add(g);
}
addScapularRow(+1); addScapularRow(-1);

// Tail
const tailGroup = new THREE.Group();
const tailMat = material(COLORS.tail);
for (let i = 0; i < 8; i++) {
  const len = 1.45 - Math.abs(i - 3.5) * 0.12;
  const t = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.08, len), tailMat);
  const angle = (i - 3.5) * 0.06;
  t.position.set((i - 3.5) * 0.09, -0.1, -0.6 - len / 2);
  t.rotation.y = angle * 0.2;
  t.castShadow = true; t.receiveShadow = true; tailGroup.add(t);
}
tailGroup.position.set(0, -0.12, -0.6);
tailGroup.rotation.x = -Math.PI / 2.55;
bird.add(tailGroup);

// Legs/feet
const tarsusMat = material(COLORS.leg);
const toeMat = material(COLORS.toe);
const clawMat = material(COLORS.claw, { metalness: 0.3, roughness: 0.4 });
function makeLeg(side = 1) {
  const g = new THREE.Group();
  const tarsus = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, 0.86, 16), tarsusMat);
  tarsus.rotation.x = Math.PI / 24;
  tarsus.position.set(0, -0.65, 0.05);
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
  tailGroup.rotation.x = -Math.PI / 2.55 + Math.sin(t * 2.0) * 0.03;
  head.rotation.x = Math.sin(t * 1.05) * 0.028;
  head.rotation.y = Math.sin(t * 0.7) * 0.02;
  beakLower.rotation.z = -0.05 + Math.sin(t * 1.7) * 0.004;
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

