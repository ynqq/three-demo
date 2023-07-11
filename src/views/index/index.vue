<template>
  <div ref="mainRef" class="main"></div>
</template>

<script setup lang="ts">
  import Tween from '@tweenjs/tween.js';
  import {
    AmbientLight,
    Box3,
    BoxGeometry,
    BufferAttribute,
    Clock,
    Color,
    Group,
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
    RawShaderMaterial,
    Raycaster,
    Scene,
    ShaderMaterial,
    TextureLoader,
    Vector2,
    Vector3,
    WebGLRenderer,
  } from 'three';
  import { onMounted, shallowRef } from 'vue';
  import { useAddEventListener } from './hooks';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
  import { TTFLoader } from 'three/addons/loaders/TTFLoader.js';
  import { Font } from 'three/addons/loaders/FontLoader.js';
  import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
  import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
  import Stats from 'three/addons/libs/stats.module.js';

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
    planeMesh!: Mesh,
    font!: Font,
    isMoved = false,
    isMouseDown = false,
    stats!: Stats,
    clock!: Clock;

  interface ModelInfoProps {
    position: [number, number, number];
    size: [number, number, number];
  }

  const modalConfig: Record<string, ModelInfoProps> = {
    mesh1: {
      position: [0, 0.5, 0],
      size: [10, 10, 10],
    },
    mesh2: {
      position: [-40, 0.5, -20],
      size: [10, 10, 10],
    },
    mesh3: {
      position: [-40, 0.5, 20],
      size: [10, 10, 10],
    },
    mesh4: {
      position: [-40, 0.5, -60],
      size: [10, 10, 10],
    },
    mesh5: {
      position: [60, 0.5, -60],
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
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = PCFSoftShadowMap;
      mainRef.value.appendChild(renderer.domElement);

      stats = new Stats();
      mainRef.value.appendChild(stats.dom);

      scene = new Scene();
      scene.background = new Color('#000000');

      camera = new PerspectiveCamera(75, width / height, 1, 1000);
      camera.position.set(0, 50, 60);
      camera.lookAt(0, 0, 0);

      clock = new Clock();

      const ambientLight = new AmbientLight(new Color(0x0f0f0f), 0.6);
      scene.add(ambientLight);
      const dirLight = new PointLight(0xffffff, 1);
      dirLight.castShadow = true;
      dirLight.position.set(0, 50, 60);

      scene.add(dirLight);

      const lightHelper = new PointLightHelper(dirLight);
      scene.add(lightHelper);

      // const axesHelper = new AxesHelper(100);
      // scene.add(axesHelper);

      control = new OrbitControls(camera, renderer.domElement);
      control.enableDamping = true;

      textLoader = new TextureLoader().setPath(import.meta.env.VITE_SOME_IP + '/textures/');
      loadWorrdFloor();

      group = new Group();
      for (let i in modalConfig) {
        const { size, position } = modalConfig[i];
        loadModel(i, size, position);
      }
      scene.add(group);

      addEvent();

      loadFont();

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

  function onMouseMove() {
    if (isMouseDown) {
      isMoved = true;
    }
  }

  function onMouseDown() {
    isMouseDown = true;
  }
  function onMouseUp() {
    isMouseDown = false;
    setTimeout(() => {
      isMoved = false;
    }, 0);
  }

  function onClick(e: MouseEvent) {
    if (isMoved) {
      return;
    }
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
      const planeGeo = new PlaneGeometry(size[0] * 3, size[1] * 2);
      const material = new MeshBasicMaterial({ color: '#ff0000' });
      planeMesh = new Mesh(planeGeo, material);
      planeMesh.position.set(position[0], position[1] + size[1] * 2, position[2]);
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
      const pos = {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
      };
      new Tween.Tween(pos)
        .to({
          x: position[0],
          y: position[1] + 50,
          z: position[2] + 60,
        })
        .duration(1000)
        .easing(Tween.Easing.Circular.Out)
        .onUpdate(() => {
          const vet = new Vector3(pos.x, pos.y - 40, pos.z - 40);
          camera.position.set(pos.x, pos.y, pos.z);
          camera.lookAt(vet);
          control.target = vet;
          camera.updateMatrixWorld();
        })
        .start();
      planeMesh.add(
        createText(name, {
          y: 6,
          z: 0,
          x: 0,
        })
      );
      planeMesh.add(
        createText('库存:20%', {
          y: -2,
          z: 0,
          x: 0,
        })
      );
      planeMesh.add(
        createText('物品编号:1-2-3-4', {
          y: 2,
          z: 0,
          x: 0,
        })
      );
      scene.add(planeMesh);
    }
  }

  function loadFont() {
    const loader = new TTFLoader().setPath(import.meta.env.VITE_SOME_IP + '/fonts/');
    loader.load('demo.ttf', json => {
      font = new Font(json);
    });
  }

  const textMaterial = new RawShaderMaterial({
    vertexShader: `
        uniform mat4 projectionMatrix;
        uniform mat4 viewMatrix;
        uniform mat4 modelMatrix;
        uniform float uTime;

        attribute vec3 position;

        varying float vElevation;

        void main(){
          gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
          vElevation += sin(gl_Position.x - uTime);
        }
      `,
    fragmentShader: `
        precision mediump float;
        varying float vElevation;

        void main(){
          gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0) * vElevation;
        }
      `,
    wireframe: false,
    uniforms: {
      uTime: { value: 0 },
    },
  });
  function createText(
    text: string,
    position: {
      x: number;
      y: number;
      z: number;
    }
  ) {
    const textGeo = new TextGeometry(text, {
      font: font,
      size: 2,
      height: 1,
    });
    textGeo.computeBoundingBox();
    textGeo.computeVertexNormals();

    const centerOffset = -0.5 * (textGeo.boundingBox!.max.x - textGeo.boundingBox!.min.x);
    // const material = new MeshPhongMaterial({ color: 0x000000, flatShading: true });

    const textMesh = new Mesh(textGeo, textMaterial);
    textMesh.position.x = centerOffset;
    textMesh.position.y = position.y;
    textMesh.position.z = position.z;

    textMesh.rotation.x = 0;
    textMesh.rotation.y = Math.PI * 2;

    return textMesh;
  }

  function addEvent() {
    document.addEventListener('click', onClick);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
  }

  function getModelSize(model: any, sizeList: number[]) {
    const [x, y, z] = sizeList;
    const box = new Box3().setFromObject(model);
    const center = box.getCenter(new Vector3());
    const size = box.getSize(new Vector3());
    const maxDistance = Math.max(x / size.x, y / size.y, z / size.z);
    return {
      size,
      center,
      maxDistance,
    };
  }
  function loadModel(name: string, size: number[], position: number[]) {
    const loader = new FBXLoader().setPath(import.meta.env.VITE_SOME_IP + '/models/');
    loader.load('tank/Gas Tank.fbx', model => {
      model.name = name;
      model.children[0].name = name;
      model.traverse(mesh => {
        if (mesh && mesh instanceof Mesh && mesh.isMesh) {
          mesh.geometry.setAttribute('uv2', new BufferAttribute(mesh.geometry.attributes.uv.array, 2));
          mesh.material = new MeshStandardMaterial({
            map: textLoader.load('../models/tank/Gas Tank_Base_Color.png'),
            emissiveMap: textLoader.load('../models/tank/Gas Tank_Mixed_AO.png'),
            normalMap: textLoader.load('../models/tank/Gas Tank_Normal_DirectX.png'),
            // displacementMap: textLoader.load('../models/tank/Gas Tank_Height.png'),
            // displacementScale: 0.1,
            metalnessMap: textLoader.load('../models/tank/Gas Tank_Metallic.png'),
            metalness: 1,
            roughnessMap: textLoader.load('../models/tank/Gas Tank_Metallic.png'),
            roughness: 0.5,
          });
          mesh.castShadow = true;
        }
      });
      model.position.set(position[0], position[1], position[2]);
      group.add(model);
      const { maxDistance } = getModelSize(model, size);
      model.scale.set(maxDistance, maxDistance, maxDistance);
    });
  }

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

  function animate() {
    Tween.update();
    renderer.render(scene, camera);
    control.update();
    stats.update();
    textMaterial.uniforms.uTime.value = clock.getElapsedTime() * 10;
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
