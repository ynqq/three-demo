<template>
  <div ref="mainRef" class="main"></div>
</template>

<script setup lang="ts">
  import Tween from '@tweenjs/tween.js';
  import {
    AmbientLight,
    BoxGeometry,
    Color,
    Group,
    Mesh,
    MeshBasicMaterial,
    MeshPhongMaterial,
    PerspectiveCamera,
    PlaneGeometry,
    Raycaster,
    Scene,
    TextureLoader,
    Vector2,
    WebGLRenderer,
  } from 'three';
  import { onMounted, shallowRef } from 'vue';
  import { useAddEventListener } from './hooks';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

  const mainRef = shallowRef<HTMLDivElement>();

  let width = 0,
    height = 0,
    renderer!: WebGLRenderer,
    scene!: Scene,
    camera!: PerspectiveCamera,
    control!: OrbitControls,
    textLoader!: TextureLoader,
    raycaster = new Raycaster(),
    group!: Group,
    planeMesh!: Mesh;

  interface ModelInfoProps {
    position: [number, number, number];
    size: [number, number, number];
  }

  const modalConfig: Record<string, ModelInfoProps> = {
    mesh1: {
      position: [0, 6, 0],
      size: [10, 10, 10],
    },
    mesh2: {
      position: [-40, 6, 0],
      size: [10, 10, 10],
    },
  };
  let oldName = '';
  const pointer = new Vector2();

  function init() {
    if (mainRef.value) {
      width = mainRef.value.offsetWidth;
      height = mainRef.value.offsetHeight;

      renderer = new WebGLRenderer({ alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
      mainRef.value.appendChild(renderer.domElement);

      scene = new Scene();
      scene.background = new Color('#000000');

      camera = new PerspectiveCamera(75, width / height, 1, 1000);
      camera.position.set(0, 40, 100);
      camera.lookAt(0, 0, 0);

      const ambientLight = new AmbientLight(new Color(0xffffff));
      scene.add(ambientLight);

      // const axesHelper = new AxesHelper(100);
      // scene.add(axesHelper);

      control = new OrbitControls(camera, renderer.domElement);
      control.enableDamping = true;

      textLoader = new TextureLoader().setPath(import.meta.env.VITE_SOME_IP + '/textures/');
      loadWorrdFloor();

      group = new Group();
      for (let i in modalConfig) {
        const { size, position } = modalConfig[i];
        const mesh1 = loadModel(i, size, position);
        group.add(mesh1);
      }
      scene.add(group);

      addEvent();

      animate();
    }
  }

  function getSelectModels(event: MouseEvent) {
    pointer.x = (event.clientX / width) * 2 - 1;
    pointer.y = -(event.clientY / height) * 2 + 1;

    raycaster?.setFromCamera(pointer, camera!);
    const intersects = raycaster!.intersectObjects(group.children, true);
    return intersects || [];
  }

  function onPointerMove(e: MouseEvent) {
    const ins = getSelectModels(e);
    if (ins.length) {
      handleMeshOver(ins[0].object.name);
    } else {
      oldName = '';
      scene.remove(planeMesh);
    }
  }

  function handleMeshOver(name: string) {
    const info = modalConfig[name];
    if (info) {
      if (oldName === name) {
        return;
      }
      oldName = name;
      scene.remove(planeMesh);
      const { size, position } = info;
      const planeGeo = new PlaneGeometry(size[0] * 2, size[1]);
      const material = new MeshBasicMaterial({ color: '#ff0000' });
      planeMesh = new Mesh(planeGeo, material);
      planeMesh.position.set(position[0], position[1] + size[1], position[2]);
      planeMesh.scale.set(0, 0, 0);
      planeMesh.rotation.set((-30 / 180) * Math.PI, 0, 0);

      new Tween.Tween(planeMesh.scale)
        .to({
          x: 1,
          y: 1,
          z: 1,
        })
        .duration(200)
        .easing(Tween.Easing.Linear.None)
        .start();

      scene.add(planeMesh);
    }
  }

  function addEvent() {
    document.addEventListener('mousemove', onPointerMove);
  }

  function loadModel(name: string, size: number[], position: number[]) {
    const box = new BoxGeometry(...size);
    const material = new MeshBasicMaterial({ color: '#00baff' });
    const mesh = new Mesh(box, material);
    mesh.position.set(position[0], position[1], position[2]);
    mesh.name = name;
    return mesh;
  }

  function loadWorrdFloor() {
    const gemotery = new BoxGeometry(200, 200, 1, 20, 20);
    const material = new MeshPhongMaterial({
      map: textLoader.load('floor/WoodFlooringMerbauBrickBondNatural001_COL_1K.jpg'),
    });
    const mesh = new Mesh(gemotery, material);
    mesh.position.y = 0;
    mesh.rotation.x = Math.PI / 2;
    scene.add(mesh);
  }

  function animate() {
    Tween.update();
    renderer.render(scene, camera);
    control.update();
    requestAnimationFrame(animate);
  }

  function handleWindowResize() {
    if (mainRef.value) {
      width = mainRef.value.offsetWidth;
      height = mainRef.value.offsetHeight;

      if (renderer) {
        renderer.setSize(width, height);
      }
      if (camera) {
        camera.aspect = width / height;
        camera.updateMatrixWorld();
      }
    }
  }

  useAddEventListener('resize', handleWindowResize);

  onMounted(() => {
    init();
  });
</script>

<style scoped>
  .main {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
  }
</style>
