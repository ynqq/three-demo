import Tween from '@tweenjs/tween.js';import {
  AmbientLight,
  AxesHelper,
  Box3,
  BoxGeometry,
  BufferAttribute,
  Clock,
  Color,
  Group,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshPhongMaterial,
  MeshStandardMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  PointLightHelper,
  Quaternion,
  RawShaderMaterial,
  Raycaster,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  TextureLoader,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { onMounted, shallowRef } from 'vue';
import { GUI } from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Stats from 'three/addons/libs/stats.module.js';
import { CSS3DObject, CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js';

const width = window.innerWidth,
  height = window.innerHeight;
const renderer = new WebGLRenderer({ alpha: true });
const css3Renderer = new CSS3DRenderer();
renderer.setSize(width, height);
renderer.setPixelRatio(window.devicePixelRatio);
css3Renderer.setSize(width, height);
document.querySelector('.app')!.appendChild(renderer.domElement);
document.querySelector('.cssrender')!.appendChild(css3Renderer.domElement);

const scene = new Scene();
const camera = new PerspectiveCamera(70, width / height, 1, 1000);
camera.position.set(0, 50, 50);
camera.lookAt(0, 0, 0);

{
  const box = new SphereGeometry(1);
  const mesh = new Mesh(box, new MeshBasicMaterial({ color: 'red' }));
  mesh.position.set(0, 50, 50);
  scene.add(mesh);
}

const ax = new AxesHelper(100);
scene.add(ax);

const light = new AmbientLight();
scene.add(light);

const control = new OrbitControls(camera, renderer.domElement);

const gltfLoader = new GLTFLoader().setPath(import.meta.env.VITE_SOME_IP + '/models/');
const textLoader = new TextureLoader().setPath(import.meta.env.VITE_SOME_IP + '/textures/');

let bxScene!: GLTF['scene'];
loadWorrdFloor();
function loadWorrdFloor() {
  const gemotery = new BoxGeometry(200, 200, 1, 20, 20);
  const material = new MeshPhongMaterial({
    map: textLoader.load('floor/WoodFlooringMerbauBrickBondNatural001_COL_1K.jpg'),
  });
  const mesh = new Mesh(gemotery, material);
  mesh.position.y = 0;
  mesh.rotation.x = Math.PI / 2;
  mesh.receiveShadow = true;
  scene.add(mesh);
}

function createTag(name: string, position: Vector3) {
  const element = document.createElement('div');
  element.className = 'tagBox';
  element.innerText = name;

  const objectCss3D = new CSS3DObject(element);
  objectCss3D.position.copy(position);
  objectCss3D.scale.set(0.2, 0.2, 0.2);
  return objectCss3D;
}
loadBox();
function loadBox() {
  gltfLoader.load('box/32.gltf', (gltf: GLTF) => {
    bxScene = gltf.scene;
    console.log(gltf);
    const gui = new GUI();
    const bx = gui.addFolder('冰箱');
    bx.add(bxScene.rotation, 'x', undefined, undefined, 0.01);
    bx.add(bxScene.rotation, 'y', undefined, undefined, 0.01);
    bx.add(bxScene.rotation, 'z', undefined, undefined, 0.01);
    bx.open();

    gltf.scene.scale.set(0.4, 0.4, 0.4);
    gltf.scene.rotation.set(0, 1.6, 0);
    gltf.scene.position.set(0, 30, 0);
    scene.add(gltf.scene);

    bxScene.traverse(item => {
      const o3d = createTag('冰箱', item.position);
      o3d.visible = true;
      scene.add(o3d);
    });

    const box = new Box3().setFromObject(bxScene);
    const center = new Vector3();
    box.getCenter(center);
    console.log(center);
  });
}

function animate() {
  requestAnimationFrame(animate);
  control.update();
  renderer.render(scene, camera);
  css3Renderer.render(scene, camera);
}

animate();
