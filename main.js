// Three.js Bird Sculpture — minimal, low-poly, animated
// Uses CDN ESM modules for GitHub Pages friendliness

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(5.2, 2.8, 6.5);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1.2, 0);

// Lights
const hemi = new THREE.HemisphereLight(0x7fa4ff, 0x203050, 0.45);
scene.add(hemi);

const dirLight = new THREE.DirectionalLight(0xffefcf, 1.0);
dirLight.position.set(4, 6, 4);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(1024, 1024);
dirLight.shadow.camera.near = 1;
dirLight.shadow.camera.far = 30;
scene.add(dirLight);

// Perch branch (instead of a ground plane)
const branchGeo = new THREE.CylinderGeometry(0.08, 0.11, 6.5, 8);
const branchMat = new THREE.MeshStandardMaterial({ color: 0x6b4a2e, roughness: 1, metalness: 0, flatShading: true });
const branch = new THREE.Mesh(branchGeo, branchMat);
branch.rotation.z = Math.PI / 8;
branch.rotation.x = Math.PI / 14;
branch.position.set(0, 0.1, 0);
branch.castShadow = true;
branch.receiveShadow = true;
scene.add(branch);

// Bird group
const bird = new THREE.Group();
scene.add(bird);

function lowPoly(matColor) {
  return new THREE.MeshStandardMaterial({ color: matColor, roughness: 0.95, metalness: 0.05, flatShading: true });
}

// Nightingale-like palette
const COLORS = {
  upper: 0x7d5b34,      // warm brown upperparts
  lower: 0xeadfca,      // pale buff underparts
  head:  0x6f5030,      // slightly darker head
  beak:  0x3a2c1a,      // dark slender beak
  tail:  0xa85624,      // rufous tail
  wing:  0x6e5131,      // folded wing shade
  leg:   0x7a4e25,      // brownish legs
  toe:   0x6b431e,      // darker toes
  eye:   0x111111,      // dark eye
  eyeRing: 0xf3e6cf     // pale eye-ring
};

// Body (slender, slightly elongated)
const bodyGeo = new THREE.SphereGeometry(1.15, 12, 10);
const bodyMat = lowPoly(COLORS.upper);
const body = new THREE.Mesh(bodyGeo, bodyMat);
body.scale.set(1.25, 1.0, 2.0);
body.castShadow = true;
body.receiveShadow = true;
bird.add(body);

// Belly/underparts (lighter tone)
const bellyGeo = new THREE.SphereGeometry(1.0, 10, 8);
const bellyMat = lowPoly(COLORS.lower);
const belly = new THREE.Mesh(bellyGeo, bellyMat);
belly.position.set(0, -0.18, 0.15);
belly.scale.set(1.0, 0.8, 1.5);
belly.castShadow = true;
bird.add(belly);

// Head (slightly larger relative to body)
const headGeo = new THREE.SphereGeometry(0.65, 12, 10);
const headMat = lowPoly(COLORS.head);
const head = new THREE.Mesh(headGeo, headMat);
head.position.set(0.0, 0.95, 0.6);
head.castShadow = true;
bird.add(head);

// Eyes
const eyeGeo = new THREE.SphereGeometry(0.075, 10, 6);
const eyeMat = new THREE.MeshStandardMaterial({ color: COLORS.eye, roughness: 0.4, metalness: 0.2 });
const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
eyeL.position.set(0.2, 1.06, 0.88);
eyeR.position.set(-0.2, 1.06, 0.88);
eyeL.castShadow = true; eyeR.castShadow = true;
bird.add(eyeL, eyeR);

// Eye ring (thin torus)
const ringGeo = new THREE.TorusGeometry(0.12, 0.015, 6, 18);
const ringMat = lowPoly(COLORS.eyeRing);
const ringL = new THREE.Mesh(ringGeo, ringMat);
const ringR = new THREE.Mesh(ringGeo, ringMat);
ringL.rotation.y = Math.PI / 2;
ringR.rotation.y = Math.PI / 2;
ringL.position.copy(eyeL.position);
ringR.position.copy(eyeR.position);
ringL.castShadow = ringR.castShadow = true;
bird.add(ringL, ringR);

// Beak (slender, dark)
const beakGeo = new THREE.ConeGeometry(0.09, 0.55, 8);
const beakMat = lowPoly(COLORS.beak);
const beak = new THREE.Mesh(beakGeo, beakMat);
beak.rotation.x = Math.PI / 2;
beak.position.set(0, 0.92, 1.08);
beak.castShadow = true;
bird.add(beak);

// Wings (folded along sides)
function makeFoldedWing(side = 1) {
  const wingGroup = new THREE.Group();
  const wingMat = lowPoly(COLORS.wing);
  const panel1 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.6, 1.2), wingMat);
  panel1.position.set(0.65 * side, 0.25, -0.2);
  panel1.rotation.y = 0.35 * -side;
  panel1.castShadow = true;
  const panel2 = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.5, 0.9), wingMat);
  panel2.position.set(0.95 * side, 0.2, -0.3);
  panel2.rotation.y = 0.45 * -side;
  panel2.castShadow = true;
  wingGroup.add(panel1, panel2);
  return wingGroup;
}
const wingL = makeFoldedWing(+1);
const wingR = makeFoldedWing(-1);
bird.add(wingL, wingR);

// Tail (rufous, longer)
const tailGeo = new THREE.ConeGeometry(0.45, 1.4, 4);
const tailMat = lowPoly(COLORS.tail);
const tail = new THREE.Mesh(tailGeo, tailMat);
tail.rotation.x = -Math.PI / 2.6;
tail.position.set(0, -0.1, -1.2);
tail.castShadow = true;
bird.add(tail);

// Legs (perched)
const legMat = lowPoly(COLORS.leg);
const legGeo = new THREE.CylinderGeometry(0.05, 0.07, 0.85, 6);
const legL = new THREE.Mesh(legGeo, legMat);
const legR = new THREE.Mesh(legGeo, legMat);
legL.position.set(0.22, -0.65, 0.05);
legR.position.set(-0.22, -0.65, 0.05);
legL.rotation.x = Math.PI / 24;
legR.rotation.x = Math.PI / 24;
legL.castShadow = true; legR.castShadow = true;
bird.add(legL, legR);

// Feet (wrap around branch)
const toeGeo = new THREE.ConeGeometry(0.07, 0.22, 6);
const toeMat = lowPoly(COLORS.toe);
function foot(x, z, side = 1) {
  const g = new THREE.Group();
  const toes = [new THREE.Mesh(toeGeo, toeMat), new THREE.Mesh(toeGeo, toeMat), new THREE.Mesh(toeGeo, toeMat)];
  toes.forEach((t, i) => {
    t.rotation.x = Math.PI / 1.9;
    t.position.set((i - 1) * 0.085, -1.02, 0.12);
    t.castShadow = true;
    g.add(t);
  });
  // Rear toe
  const rear = new THREE.Mesh(toeGeo, toeMat);
  rear.rotation.x = -Math.PI / 1.2;
  rear.position.set(0.02 * -side, -0.98, -0.02);
  rear.scale.set(0.9, 0.9, 0.9);
  rear.castShadow = true;
  g.add(rear);
  g.position.set(x, 0, z);
  return g;
}
bird.add(foot(0.22, 0.05, +1), foot(-0.22, 0.05, -1));

// Subtle idle animation (perched: breathing + tail flick + head tilt)
let t = 0;
function animate(now) {
  const dt = (now ?? 0) / 1000;
  t = dt;
  const breathe = Math.sin(t * 1.6) * 0.025;
  bird.position.y = 0.22 + breathe;
  tail.rotation.x = -Math.PI / 2.6 + Math.sin(t * 2.2) * 0.05;
  head.rotation.x = Math.sin(t * 1.2) * 0.03;
  head.rotation.y = Math.sin(t * 0.8) * 0.02;
  beak.rotation.z = Math.sin(t * 2.0) * 0.01;

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

// Resize handling
function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}
window.addEventListener('resize', onResize);

// Focus the bird nicely at start
bird.position.set(0, 0.2, 0);
controls.target.set(0, 0.8, 0.0);
controls.update();
