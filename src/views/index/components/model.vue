<template>
  <div class="model" @mousemove.stop="() => {}" @click.stop="() => {}">
    <div class="controlBox">
      <button @click="rotate(180)">旋转180deg</button>
      <button @click="rotate(0)">还原</button>
    </div>
    <div class="main2"></div>
  </div>
</template>

<script setup lang="ts">
  import Renderer from '@/components/Three/Renderer';
  import { Tween, update } from '@tweenjs/tween.js';
  import { AmbientLight, Group, PerspectiveCamera, Scene } from 'three';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
  import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
  import { onMounted } from 'vue';

  let model: Group;
  function rotate(deg: number) {
    new Tween(model.rotation)
      .to({ x: 0, y: (deg * Math.PI) / 180, z: 0 })
      .duration(200)
      .start();
  }

  const init = () => {
    const renderIns = Renderer.getInstance({ alpha: true, parentEl: document.querySelector<HTMLDivElement>('.main2')! });
    const render = renderIns.getRender();
    const { width, height } = renderIns.getSize();

    const camera = new PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.set(0, 0, 60);
    camera.lookAt(0, 0, 0);

    const scene = new Scene();

    const control = new OrbitControls(camera, render.domElement);

    const light = new AmbientLight(0xffffff);
    scene.add(light);

    const fbxLoader = new FBXLoader().setPath(import.meta.env.VITE_SOME_IP);
    fbxLoader.load('./models/d1.fbx', obj => {
      obj.scale.set(0.3, 0.3, 0.3);
      obj.position.setY(-10);
      scene.add(obj);
      model = obj;
    });

    ani();
    function ani() {
      update();
      render.render(scene, camera);
      control.update();
      requestAnimationFrame(ani);
    }
  };
  onMounted(() => {
    setTimeout(() => {
      init();
    }, 300);
  });
</script>

<style scoped lang="less">
  .model {
    position: fixed;
    left: 0;
    top: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100vw;
    height: 100vh;
    background: rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(2px);
    .controlBox {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 30px;
      display: flex;
      justify-content: center;
      align-items: center;
      button {
        margin: 0 10px;
      }
    }
    .main2 {
      width: 800px;
      height: 800px;
    }
  }
</style>
