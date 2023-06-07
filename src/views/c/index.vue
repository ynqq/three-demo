<template>
  <div></div>
</template>

<script setup lang="ts">
  import {
    AmbientLight,
    Color,
    DirectionalLight,
    DoubleSide,
    Mesh,
    MeshLambertMaterial,
    MeshPhongMaterial,
    PerspectiveCamera,
    PlaneGeometry,
    Scene,
    SphereGeometry,
    WebGLRenderer,
  } from 'three';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

  const render = new WebGLRenderer();
  render.setSize(window.innerWidth, window.innerHeight);
  render.shadowMap.enabled = true;
  document.querySelector('.app')!.appendChild(render.domElement);

  const scene = new Scene();

  const camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.set(2, 6, -10);
  camera.lookAt(0, 0, 0);

  const dirLight = new DirectionalLight(0xffffff);
  dirLight.position.set(100, 100, 100);
  dirLight.castShadow = true;

  scene.add(dirLight);

  const mesh = new Mesh(new PlaneGeometry(200, 200), new MeshLambertMaterial({ color: 0x999999, side: DoubleSide }));
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  scene.add(mesh);

  const geo = new SphereGeometry(1);
  const material = new MeshPhongMaterial({ color: new Color('#00baff') });
  const mesh2 = new Mesh(geo, material);
  mesh2.castShadow = true;
  mesh2.position.set(0, 0, 2);
  scene.add(mesh2);

  new OrbitControls(camera, render.domElement);

  ani();
  function ani() {
    requestAnimationFrame(ani);
    render.render(scene, camera);
  }
</script>

<style scoped></style>
