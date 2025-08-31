import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

console.log('Nightingale v5 — refined head, beak, eyes, feathers');

const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(4.8, 2.5, 6.0);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0.85, 0);

// Lights
const hemi = new THREE.HemisphereLight(0x87a8ff, 0x1a283f, 0.5);
scene.add(hemi);
const dirLight = new THREE.DirectionalLight(0xffefcf, 1.05);
dirLight.position.set(4, 6, 4);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(2048, 2048);
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 40;
scene.add(dirLight);

// Perch branch
const branchGeo = new THREE.CylinderGeometry(0.085, 0.12, 6.5, 16);
const branchMat = new THREE.MeshStandardMaterial({ color: 0x6b4a2e, roughness: 1, metalness: 0 });
const branch = new THREE.Mesh(branchGeo, branchMat);
branch.rotation.z = Math.PI / 8;
branch.rotation.x = Math.PI / 14;
branch.position.set(0, 0.1, 0);
branch.castShadow = true;
branch.receiveShadow = true;
scene.add(branch);

// Palette
const COLORS = {
  upper: 0x7d5b34,
  lower: 0xeadfca,
  head:  0x6f5030,
  beakUpper: 0x3a2c1a,
  beakLower: 0x4a3822,
  tail:  0xa85624,
  wing:  0x6e5131,
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

// Root group
const bird = new THREE.Group();
scene.add(bird);

// Body — smoother with subtle speckle on lower breast
const bodyGeo = new THREE.SphereGeometry(1.15, 40, 30);
bodyGeo.scale(1.28, 1.0, 2.05);
addVertexGradientWithSpeckle(bodyGeo, -1.0, 1.0, COLORS.lower, COLORS.upper, 0.08);
const bodyMat = material(COLORS.upper, { vertexColors: true });
const body = new THREE.Mesh(bodyGeo, bodyMat);
body.castShadow = true; body.receiveShadow = true;
bird.add(body);

// Head — refined shape with slight brow
const headGeo = new THREE.SphereGeometry(0.72, 36, 28);
headGeo.scale(1.02, 0.98, 1.05);
const head = new THREE.Mesh(headGeo, material(COLORS.head));
head.position.set(0, 1.0, 0.63);
head.castShadow = true; bird.add(head);

// Brow (subtle mass above eyes)
const browGeo = new THREE.SphereGeometry(0.38, 24, 18);
const brow = new THREE.Mesh(browGeo, material(COLORS.head));
brow.scale.set(1.2, 0.6, 0.9);
brow.position.set(0, 1.1, 0.58);
brow.castShadow = true; bird.add(brow);

// Eyes
const eyeGeo = new THREE.SphereGeometry(0.085, 18, 14);
const eyeMat = material(COLORS.eye, { metalness: 0.4, roughness: 0.2 });
const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
eyeL.position.set(0.21, 1.09, 0.92);
eyeR.position.set(-0.21, 1.09, 0.92);
eyeL.castShadow = eyeR.castShadow = true;
bird.add(eyeL, eyeR);

// Eye highlights
const hiliteGeo = new THREE.SphereGeometry(0.024, 10, 8);
const hiliteMat = material(0xffffff, { metalness: 0.9, roughness: 0.1 });
const hlL = new THREE.Mesh(hiliteGeo, hiliteMat); hlL.position.copy(eyeL.position).add(new THREE.Vector3(0.028, 0.02, 0.02));
const hlR = new THREE.Mesh(hiliteGeo, hiliteMat); hlR.position.copy(eyeR.position).add(new THREE.Vector3(-0.028, 0.02, 0.02));
bird.add(hlL, hlR);

// Eye ring
const ringGeo = new THREE.TorusGeometry(0.14, 0.016, 10, 24);
const ringMat = material(COLORS.eyeRing);
const ringL = new THREE.Mesh(ringGeo, ringMat);
const ringR = new THREE.Mesh(ringGeo, ringMat);
ringL.rotation.y = Math.PI / 2; ringR.rotation.y = Math.PI / 2;
ringL.position.copy(eyeL.position); ringR.position.copy(eyeR.position);
ringL.castShadow = ringR.castShadow = true;
bird.add(ringL, ringR);

// Eyelids (partial arcs)
const lidArc = Math.PI * 0.9;
const upperLidGeo = new THREE.TorusGeometry(0.14, 0.018, 8, 24, lidArc);
const lidMat = material(COLORS.head);
function addLids(eyePos, side) {
  const upper = new THREE.Mesh(upperLidGeo, lidMat);
  upper.rotation.y = Math.PI / 2;
  upper.rotation.z = 0.6 * side;
  upper.position.copy(eyePos).add(new THREE.Vector3(0.0, 0.0, 0.0));
  bird.add(upper);
}
addLids(eyeL.position, +1);
addLids(eyeR.position, -1);

// Beak — upper/lower mandibles with slight gape and nares
// Profile for lathe (y along length)
const upperProfile = [
  new THREE.Vector2(0.0, 0.0),
  new THREE.Vector2(0.03, 0.06),
  new THREE.Vector2(0.055, 0.2),
  new THREE.Vector2(0.048, 0.38),
  new THREE.Vector2(0.03, 0.6)
];
const lowerProfile = [
  new THREE.Vector2(0.0, 0.0),
  new THREE.Vector2(0.028, 0.05),
  new THREE.Vector2(0.045, 0.18),
  new THREE.Vector2(0.04, 0.34),
  new THREE.Vector2(0.022, 0.55)
];
const upperGeo = new THREE.LatheGeometry(upperProfile, 48);
const lowerGeo = new THREE.LatheGeometry(lowerProfile, 48);
const beakUpper = new THREE.Mesh(upperGeo, material(COLORS.beakUpper, { roughness: 0.55, metalness: 0.12 }));
const beakLower = new THREE.Mesh(lowerGeo, material(COLORS.beakLower, { roughness: 0.6, metalness: 0.1 }));
beakUpper.rotation.x = Math.PI / 2; beakLower.rotation.x = Math.PI / 2;
beakUpper.position.set(0, 0.94, 1.11);
beakLower.position.set(0, 0.93, 1.095);
beakLower.rotation.z = -0.05; // slight gape
beakUpper.castShadow = beakLower.castShadow = true;
bird.add(beakUpper, beakLower);

// Nares (nostrils) — small ovals near base of upper mandible
const nareGeo = new THREE.SphereGeometry(0.03, 12, 10);
const nareMat = material(COLORS.nostril, { metalness: 0.1, roughness: 0.6 });
const nareL = new THREE.Mesh(nareGeo, nareMat);
const nareR = new THREE.Mesh(nareGeo, nareMat);
nareL.scale.set(1.2, 0.7, 0.8); nareR.scale.set(1.2, 0.7, 0.8);
nareL.position.set(0.07, 0.98, 1.0);
nareR.position.set(-0.07, 0.98, 1.0);
bird.add(nareL, nareR);

// Folded wings — more feather layers
function featherMat() { return material(COLORS.wing); }
function makeFeather(w, h, t = 0.035) {
  const geo = new THREE.BoxGeometry(t, h, w, 1, 1, 1);
  return new THREE.Mesh(geo, featherMat());
}
function makeFoldedWingDetailed(side = 1) {
  const g = new THREE.Group();
  // Coverts (top layer)
  for (let i = 0; i < 7; i++) {
    const f = makeFeather(0.6 - i * 0.04, 0.5 + i * 0.03);
    f.position.set((0.55 + i * 0.05) * side, 0.36 - i * 0.015, -0.1 - i * 0.03);
    f.rotation.y = (0.28 + i * 0.03) * -side;
    f.castShadow = true; f.receiveShadow = true;
    g.add(f);
  }
  // Secondaries
  for (let i = 0; i < 7; i++) {
    const f = makeFeather(0.8 - i * 0.05, 0.52 + i * 0.03);
    f.position.set((0.68 + i * 0.055) * side, 0.3 - i * 0.012, -0.2 - i * 0.04);
    f.rotation.y = (0.38 + i * 0.03) * -side;
    f.castShadow = true; f.receiveShadow = true;
    g.add(f);
  }
  // Primaries
  for (let i = 0; i < 8; i++) {
    const f = makeFeather(1.22 - i * 0.06, 0.55 + i * 0.02);
    f.position.set((0.98 + i * 0.06) * side, 0.22 - i * 0.008, -0.34 - i * 0.055);
    f.rotation.y = (0.5 + i * 0.035) * -side;
    f.castShadow = true; f.receiveShadow = true;
    g.add(f);
  }
  return g;
}
const wingL = makeFoldedWingDetailed(+1);
const wingR = makeFoldedWingDetailed(-1);
bird.add(wingL, wingR);

// Scapular/body feather rows for texture
function addScapularRow(side = 1, y = 0.35, zStart = 0.0, count = 8) {
  const g = new THREE.Group();
  for (let i = 0; i < count; i++) {
    const w = 0.35;
    const f = makeFeather(w - i * 0.01, 0.08 + (i % 2) * 0.02, 0.03);
    const z = zStart - i * 0.05;
    f.position.set(0.45 * side + i * 0.02 * side, y - i * 0.005, z);
    f.rotation.y = (0.2 + i * 0.02) * -side;
    f.castShadow = true; g.add(f);
  }
  bird.add(g);
}
addScapularRow(+1, 0.42, 0.05, 9);
addScapularRow(-1, 0.42, 0.05, 9);

// Tail — fan of feathers
const tailGroup = new THREE.Group();
const tailFeatherMat = material(COLORS.tail);
for (let i = 0; i < 8; i++) {
  const len = 1.45 - Math.abs(i - 3.5) * 0.12;
  const t = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.08, len), tailFeatherMat);
  const angle = (i - 3.5) * 0.06;
  t.position.set((i - 3.5) * 0.09, -0.1, -0.6 - len / 2);
  t.rotation.y = angle * 0.2;
  t.castShadow = true; t.receiveShadow = true;
  tailGroup.add(t);
}
tailGroup.position.set(0, -0.12, -0.6);
tailGroup.rotation.x = -Math.PI / 2.55;
bird.add(tailGroup);

// Legs/feet with claws
const tarsusMat = material(COLORS.leg);
const toeMat = material(COLORS.toe);
const clawMat = material(COLORS.claw, { metalness: 0.3, roughness: 0.4 });
function makeLeg(side = 1) {
  const g = new THREE.Group();
  const tarsus = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, 0.86, 16), tarsusMat);
  tarsus.rotation.x = Math.PI / 24;
  tarsus.position.set(0, -0.65, 0.05);
  tarsus.castShadow = true; tarsus.receiveShadow = true;
  g.add(tarsus);
  const toeGeo = new THREE.ConeGeometry(0.07, 0.22, 12);
  const toes = [new THREE.Mesh(toeGeo, toeMat), new THREE.Mesh(toeGeo, toeMat), new THREE.Mesh(toeGeo, toeMat)];
  toes.forEach((t, i) => {
    t.rotation.x = Math.PI / 1.9;
    t.position.set((i - 1) * 0.085, -1.02, 0.12);
    t.castShadow = true; g.add(t);
    const claw = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.06, 10), clawMat);
    claw.rotation.x = Math.PI / 1.7;
    claw.position.set((i - 1) * 0.085, -1.11, 0.18);
    g.add(claw);
  });
  const rear = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.2, 12), toeMat);
  rear.rotation.x = -Math.PI / 1.2;
  rear.position.set(0.02 * -side, -0.98, -0.02);
  rear.scale.set(0.9, 0.9, 0.9);
  rear.castShadow = true; g.add(rear);
  const rearClaw = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.06, 10), clawMat);
  rearClaw.rotation.x = -Math.PI / 1.4;
  rearClaw.position.set(0.02 * -side, -1.05, -0.07);
  g.add(rearClaw);
  g.position.x = 0.22 * side;
  return g;
}
bird.add(makeLeg(+1), makeLeg(-1));

// Animation — subtle
let t = 0;
function animate(now) {
  t = (now ?? 0) / 1000;
  const breathe = Math.sin(t * 1.2) * 0.02;
  bird.position.y = 0.22 + breathe;
  tailGroup.rotation.x = -Math.PI / 2.55 + Math.sin(t * 2.0) * 0.035;
  head.rotation.x = Math.sin(t * 1.1) * 0.03;
  head.rotation.y = Math.sin(t * 0.7) * 0.02;
  beakLower.rotation.z = -0.05 + Math.sin(t * 1.8) * 0.005;

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

