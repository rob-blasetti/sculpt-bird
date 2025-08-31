import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

// High-detail Nightingale sculpture
console.log('Nightingale v4 — high detail');

const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(5.0, 2.6, 6.2);
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

// Colors
const COLORS = {
  upper: 0x7d5b34,
  lower: 0xeadfca,
  head:  0x6f5030,
  beak:  0x3a2c1a,
  tail:  0xa85624,
  wing:  0x6e5131,
  leg:   0x8a5a30,
  toe:   0x6b431e,
  claw:  0x2a2015,
  eye:   0x111111,
  eyeRing: 0xf3e6cf
};

function material(color, opts={}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0.05, ...opts });
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

// Bird root
const bird = new THREE.Group();
scene.add(bird);

// Body — higher poly with gradient upper/lower
const bodyGeo = new THREE.SphereGeometry(1.15, 32, 24);
bodyGeo.scale(1.28, 1.0, 2.05);
addVertexGradient(bodyGeo, -1.0, 1.0, COLORS.lower, COLORS.upper);
const bodyMat = material(COLORS.upper, { vertexColors: true });
const body = new THREE.Mesh(bodyGeo, bodyMat);
body.castShadow = true;
body.receiveShadow = true;
bird.add(body);

// Head — slightly larger and smoother
const headGeo = new THREE.SphereGeometry(0.67, 28, 20);
headGeo.translate(0, 0.0, 0.0);
const headMat = material(COLORS.head);
const head = new THREE.Mesh(headGeo, headMat);
head.position.set(0, 0.97, 0.62);
head.castShadow = true;
bird.add(head);

// Eyes and ring
const eyeGeo = new THREE.SphereGeometry(0.075, 14, 10);
const eyeMat = material(COLORS.eye, { metalness: 0.3, roughness: 0.35 });
const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
eyeL.position.set(0.2, 1.08, 0.9);
eyeR.position.set(-0.2, 1.08, 0.9);
eyeL.castShadow = eyeR.castShadow = true;
bird.add(eyeL, eyeR);
// Tiny highlight
const hiliteGeo = new THREE.SphereGeometry(0.02, 8, 6);
const hiliteMat = material(0xffffff, { metalness: 0.9, roughness: 0.1 });
const hlL = new THREE.Mesh(hiliteGeo, hiliteMat); hlL.position.copy(eyeL.position).add(new THREE.Vector3(0.02, 0.02, 0.02));
const hlR = new THREE.Mesh(hiliteGeo, hiliteMat); hlR.position.copy(eyeR.position).add(new THREE.Vector3(-0.02, 0.02, 0.02));
bird.add(hlL, hlR);
// Eye ring
const ringGeo = new THREE.TorusGeometry(0.12, 0.013, 8, 20);
const ringMat = material(COLORS.eyeRing);
const ringL = new THREE.Mesh(ringGeo, ringMat);
const ringR = new THREE.Mesh(ringGeo, ringMat);
ringL.rotation.y = Math.PI / 2; ringR.rotation.y = Math.PI / 2;
ringL.position.copy(eyeL.position); ringR.position.copy(eyeR.position);
ringL.castShadow = ringR.castShadow = true;
bird.add(ringL, ringR);

// Beak — slender lathe profile
const profile = [];
profile.push(new THREE.Vector2(0.0, 0.0));
profile.push(new THREE.Vector2(0.035, 0.05));
profile.push(new THREE.Vector2(0.06, 0.18));
profile.push(new THREE.Vector2(0.05, 0.35));
profile.push(new THREE.Vector2(0.03, 0.52));
const beakGeo = new THREE.LatheGeometry(profile, 32);
const beakMat = material(COLORS.beak, { roughness: 0.6, metalness: 0.1 });
const beak = new THREE.Mesh(beakGeo, beakMat);
beak.rotation.x = Math.PI / 2;
beak.position.set(0, 0.92, 1.11);
beak.castShadow = true;
bird.add(beak);

// Folded wings — layered feathers
function featherMat() { return material(COLORS.wing); }
function makeFeather(w, h, t = 0.04, round = 0.08) {
  // simple thin box acts as feather; slight tip taper via scale
  const geo = new THREE.BoxGeometry(t, h, w, 1, 1, 1);
  return new THREE.Mesh(geo, featherMat());
}
function makeFoldedWingDetailed(side = 1) {
  const g = new THREE.Group();
  // Secondaries (shorter, near body)
  const secCount = 6;
  for (let i = 0; i < secCount; i++) {
    const w = 0.8 - i * 0.05;
    const h = 0.08 + i * 0.01;
    const f = makeFeather(w, 0.5 + i * 0.04);
    f.position.set((0.62 + i * 0.05) * side, 0.32 - i * 0.015, -0.15 - i * 0.04);
    f.rotation.y = (0.35 + i * 0.03) * -side;
    f.castShadow = true; f.receiveShadow = true;
    g.add(f);
  }
  // Primaries (longer, outer)
  const priCount = 7;
  for (let i = 0; i < priCount; i++) {
    const w = 1.2 - i * 0.06;
    const f = makeFeather(w, 0.55 + i * 0.02);
    f.position.set((0.95 + i * 0.06) * side, 0.22 - i * 0.008, -0.32 - i * 0.06);
    f.rotation.y = (0.5 + i * 0.04) * -side;
    f.castShadow = true; f.receiveShadow = true;
    g.add(f);
  }
  return g;
}
const wingL = makeFoldedWingDetailed(+1);
const wingR = makeFoldedWingDetailed(-1);
bird.add(wingL, wingR);

// Tail — fan of feathers
const tailGroup = new THREE.Group();
const tailFeatherMat = material(COLORS.tail);
for (let i = 0; i < 6; i++) {
  const len = 1.4 - Math.abs(i - 2.5) * 0.12;
  const t = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.08, len), tailFeatherMat);
  const angle = (i - 2.5) * 0.06;
  t.position.set((i - 2.5) * 0.09, -0.1, -0.6 - len / 2);
  t.rotation.y = angle * 0.2;
  t.castShadow = true; t.receiveShadow = true;
  tailGroup.add(t);
}
tailGroup.position.set(0, -0.12, -0.6);
tailGroup.rotation.x = -Math.PI / 2.55;
bird.add(tailGroup);

// Legs and feet with small claws
const tarsusMat = material(COLORS.leg);
const toeMat = material(COLORS.toe);
const clawMat = material(COLORS.claw, { metalness: 0.3, roughness: 0.4 });

function makeLeg(side = 1) {
  const g = new THREE.Group();
  const tarsus = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, 0.86, 12), tarsusMat);
  tarsus.rotation.x = Math.PI / 24;
  tarsus.position.set(0, -0.65, 0.05);
  tarsus.castShadow = true; tarsus.receiveShadow = true;
  g.add(tarsus);
  // Toes wrapping branch
  const toeGeo = new THREE.ConeGeometry(0.07, 0.22, 10);
  const toes = [new THREE.Mesh(toeGeo, toeMat), new THREE.Mesh(toeGeo, toeMat), new THREE.Mesh(toeGeo, toeMat)];
  toes.forEach((t, i) => {
    t.rotation.x = Math.PI / 1.9;
    t.position.set((i - 1) * 0.085, -1.02, 0.12);
    t.castShadow = true; g.add(t);
    // Claw at tip
    const claw = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.06, 8), clawMat);
    claw.rotation.x = Math.PI / 1.7;
    claw.position.set((i - 1) * 0.085, -1.11, 0.18);
    g.add(claw);
  });
  const rear = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.2, 10), toeMat);
  rear.rotation.x = -Math.PI / 1.2;
  rear.position.set(0.02 * -side, -0.98, -0.02);
  rear.scale.set(0.9, 0.9, 0.9);
  rear.castShadow = true;
  g.add(rear);
  const rearClaw = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.06, 8), clawMat);
  rearClaw.rotation.x = -Math.PI / 1.4;
  rearClaw.position.set(0.02 * -side, -1.05, -0.07);
  g.add(rearClaw);

  g.position.x = 0.22 * side;
  return g;
}
bird.add(makeLeg(+1), makeLeg(-1));

// Subtle animation
let t = 0;
function animate(now) {
  t = (now ?? 0) / 1000;
  const breathe = Math.sin(t * 1.3) * 0.02;
  bird.position.y = 0.22 + breathe;
  tailGroup.rotation.x = -Math.PI / 2.55 + Math.sin(t * 2.1) * 0.04;
  head.rotation.x = Math.sin(t * 1.1) * 0.03;
  head.rotation.y = Math.sin(t * 0.7) * 0.02;
  beak.rotation.z = Math.sin(t * 1.8) * 0.01;

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

