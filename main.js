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
camera.position.set(6, 3.8, 8);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1.2, 0);

// Lights
const hemi = new THREE.HemisphereLight(0xbfd9ff, 0x667799, 0.6);
scene.add(hemi);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
dirLight.position.set(6, 8, 5);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(1024, 1024);
dirLight.shadow.camera.near = 1;
dirLight.shadow.camera.far = 30;
scene.add(dirLight);

// Ground
const groundGeo = new THREE.CircleGeometry(20, 64);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x89a86e, roughness: 1, metalness: 0 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Bird group
const bird = new THREE.Group();
scene.add(bird);

function lowPoly(matColor) {
  return new THREE.MeshStandardMaterial({ color: matColor, roughness: 0.9, metalness: 0.05, flatShading: true });
}

// Body
const bodyGeo = new THREE.SphereGeometry(1.2, 12, 10);
const bodyMat = lowPoly(0x3b4b7e);
const body = new THREE.Mesh(bodyGeo, bodyMat);
body.scale.set(1.3, 1.0, 1.8);
body.castShadow = true;
body.receiveShadow = true;
bird.add(body);

// Belly (lighter tone)
const bellyGeo = new THREE.SphereGeometry(1.05, 10, 8);
const bellyMat = lowPoly(0x6b7fb8);
const belly = new THREE.Mesh(bellyGeo, bellyMat);
belly.position.set(0, -0.15, 0.2);
belly.scale.set(1.0, 0.85, 1.4);
belly.castShadow = true;
bird.add(belly);

// Head
const headGeo = new THREE.SphereGeometry(0.55, 10, 8);
const headMat = lowPoly(0x2f3d67);
const head = new THREE.Mesh(headGeo, headMat);
head.position.set(0.0, 0.95, 0.55);
head.castShadow = true;
bird.add(head);

// Eyes
const eyeGeo = new THREE.SphereGeometry(0.08, 8, 6);
const eyeMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4, metalness: 0.2 });
const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
eyeL.position.set(0.18, 1.03, 0.85);
eyeR.position.set(-0.18, 1.03, 0.85);
eyeL.castShadow = true; eyeR.castShadow = true;
bird.add(eyeL, eyeR);

// Beak (cone)
const beakGeo = new THREE.ConeGeometry(0.15, 0.5, 6);
const beakMat = lowPoly(0xffb13b);
const beak = new THREE.Mesh(beakGeo, beakMat);
beak.rotation.x = Math.PI / 2;
beak.position.set(0, 0.9, 1.0);
beak.castShadow = true;
bird.add(beak);

// Wings (flattened boxes with slight taper using scaled groups)
function makeWing(side = 1) {
  const wingGroup = new THREE.Group();
  const wingMat = lowPoly(0x30406f);
  const segment = (w, h, d, x, y, z, rZ = 0, rY = 0) => {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, wingMat);
    mesh.position.set(x, y, z);
    mesh.rotation.z = rZ;
    mesh.rotation.y = rY;
    mesh.castShadow = true;
    return mesh;
  };
  wingGroup.add(segment(0.9, 0.12, 1.2, 0.7 * side, 0.45, 0.1, 0.25 * side, 0.15 * -side));
  wingGroup.add(segment(0.75, 0.1, 1.0, 1.25 * side, 0.4, 0.12, 0.45 * side, 0.2 * -side));
  wingGroup.add(segment(0.55, 0.09, 0.9, 1.7 * side, 0.35, 0.15, 0.55 * side, 0.25 * -side));
  return wingGroup;
}
const wingL = makeWing(+1);
const wingR = makeWing(-1);
bird.add(wingL, wingR);

// Tail (triangular prism using a cone with 3 segments)
const tailGeo = new THREE.ConeGeometry(0.5, 0.9, 3);
const tailMat = lowPoly(0x223056);
const tail = new THREE.Mesh(tailGeo, tailMat);
tail.rotation.x = -Math.PI / 2.8;
tail.position.set(0, -0.15, -1.0);
tail.castShadow = true;
bird.add(tail);

// Legs
const legMat = lowPoly(0xcc8a3b);
const legGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.9, 6);
const legL = new THREE.Mesh(legGeo, legMat);
const legR = new THREE.Mesh(legGeo, legMat);
legL.position.set(0.28, -0.7, 0.25);
legR.position.set(-0.28, -0.7, 0.25);
legL.castShadow = true; legR.castShadow = true;
bird.add(legL, legR);

// Feet (simple flattened cones)
const toeGeo = new THREE.ConeGeometry(0.08, 0.25, 6);
const toeMat = lowPoly(0xb8792f);
function foot(x, z) {
  const g = new THREE.Group();
  const t1 = new THREE.Mesh(toeGeo, toeMat);
  const t2 = new THREE.Mesh(toeGeo, toeMat);
  const t3 = new THREE.Mesh(toeGeo, toeMat);
  [t1, t2, t3].forEach((t, i) => {
    t.rotation.x = Math.PI / 2.1;
    t.position.set((i - 1) * 0.09, -1.05, 0.35);
    t.castShadow = true;
    g.add(t);
  });
  g.position.set(x, 0, z);
  return g;
}
bird.add(foot(0.28, 0.2), foot(-0.28, 0.2));

// Subtle idle animation
let t = 0;
function animate(now) {
  const dt = (now ?? 0) / 1000;
  t = dt;
  const bob = Math.sin(t * 2.0) * 0.05;
  bird.position.y = 0.2 + bob;
  const flap = Math.sin(t * 6.0) * 0.35 + 0.2;
  wingL.rotation.z = flap;
  wingR.rotation.z = -flap;
  head.rotation.x = Math.sin(t * 1.5) * 0.05;
  beak.rotation.z = Math.sin(t * 2.7) * 0.02;

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
controls.target.set(0, 0.8, 0.2);
controls.update();

