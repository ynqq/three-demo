<template>
  <div></div>
</template>

<script setup lang="ts">
  import Tween from '@tweenjs/tween.js';
  import {
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

  import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
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

  const fbxLoader = new FBXLoader().setPath(import.meta.env.VITE_SOME_IP + '/models/');
  const textLoader = new TextureLoader().setPath(import.meta.env.VITE_SOME_IP + '/textures/');

  fbxLoader.load('/Warehouse.fbx', obj => {
    console.log(obj);
  });

  function animate() {
    requestAnimationFrame(animate);
    control.update();
    renderer.render(scene, camera);
    css3Renderer.render(scene, camera);
  }

  animate();
</script>

<style scoped></style>
