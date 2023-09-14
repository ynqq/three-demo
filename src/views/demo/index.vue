<template>
  <div id="box1"></div>
</template>

<script setup lang="ts">
  import { update } from '@tweenjs/tween.js';
  import {
    AmbientLight,
    AnimationClip,
    AnimationMixer,
    AxesHelper,
    Box3,
    BoxGeometry,
    BoxHelper,
    Clock,
    Group,
    Mesh,
    MeshBasicMaterial,
    PerspectiveCamera,
    Raycaster,
    Scene,
    Vector2,
    Vector3,
    WebGLRenderer,
  } from 'three';
  import { onMounted } from 'vue';

  import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
  import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
  import { GUI } from 'dat.gui';
  onMounted(() => {
    let width = window.innerWidth,
      height = window.innerHeight;
    const renderer = new WebGLRenderer({ alpha: true, antialias: true });
    const css3Renderer = new CSS3DRenderer();
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    css3Renderer.setSize(width, height);
    document.querySelector('#box1')!.appendChild(renderer.domElement);
    document.querySelector('.cssrender')!.appendChild(css3Renderer.domElement);

    const scene = new Scene();
    const camera = new PerspectiveCamera(70, width / height, 1, 1000);
    camera.position.set(0, 10, 10);
    camera.lookAt(0, 1.2, 0);

    const raycaster = new Raycaster();
    const point = new Vector2(0, 0);
    const boxGroup = new Group();
    let person!: GLTF['scene'];
    let mixer!: AnimationMixer;
    const actions: AnimationClip[] = [];
    const clock = new Clock();
    const oldCameraPos = new Vector3().copy(camera.position);

    // {
    //   const box = new SphereGeometry(1);
    //   const mesh = new Mesh(box, new MeshBasicMaterial({ color: 'red' }));
    //   mesh.position.set(0, 50, 50);
    //   scene.add(mesh);
    // }

    const ax = new AxesHelper(1000);
    scene.add(ax);

    const light = new AmbientLight('#00baff');
    scene.add(light);

    // const control = new OrbitControls(camera, renderer.domElement);
    // control.target.set(0, 1.2, 0);
    // control.enableDamping = true;
    // control.enableZoom = false;
    // control.minPolarAngle = -Math.PI;
    // control.maxPolarAngle = Math.PI;
    // control.enablePan = false;
    // control.enableRotate = false;

    const gltfLoader = new GLTFLoader().setPath(import.meta.env.VITE_SOME_IP + '/models/');
    // const fbxLoader = new FBXLoader().setPath(import.meta.env.VITE_SOME_IP + '/models/');
    // const textLoader = new TextureLoader().setPath(import.meta.env.VITE_SOME_IP + '/textures/');

    const keyAction: Record<string, boolean> = {};

    gltfLoader.load('/warehouse.glb', obj => {
      obj.scene.scale.set(0.05, 0.05, 0.05);
      // obj.scene.position.set(0, -5, 0);
      const box = new Box3().setFromObject(obj.scene);
      const center = new Vector3();

      box.getCenter(center);
      obj.scene.position.add(new Vector3(0, 60, 0).sub(center));
      // const bottomY = box.min.y;
      // obj.scene.position.add(new Vector3(0, -bottomY, 0));
      scene.add(obj.scene);
      // obj.scene.updateWorldMatrix(true, true);

      function addBox(row: number, col: number) {
        const geometry = new BoxGeometry(30, 40, 30);
        // const edges = new EdgesGeometry(geometry);
        // const line = new LineSegments(
        //   edges,
        //   new LineBasicMaterial({
        //     color: 'red',
        //   })
        // );
        // // line.position.set(-65, -14, -20);
        // line.position.add(new Vector3(-72, -(center.y - 60) / 2, -22));
        // scene.add(line);
        const material = new MeshBasicMaterial({ color: 0xff0000 });
        const mesh = new Mesh(geometry, material);
        let z = 0;
        if (col === 5) {
          z = -22;
        } else if (col > 5) {
          z = -22 - (col - 5) * 50;
        } else {
          z = -22 + (5 - col) * 50;
        }
        if (row <= 3) {
          mesh.position.add(new Vector3(-172 + 50 * (row - 1), 11, z));
        } else {
          mesh.position.add(new Vector3(22 + 50 * (row - 3), 11, z));
        }
        // mesh.position.add(new Vector3(-172, 11, -22));
        // mesh.position.add(new Vector3(-122, 11, -22));
        // mesh.position.add(new Vector3(72, 11, -22));
        // mesh.position.add(new Vector3(122, 11, -22));
        // mesh.position.add(new Vector3(122, 11, 72));
        boxGroup.add(mesh);
      }
      function addPerson() {
        gltfLoader.load('Soldier.glb', gltf => {
          person = gltf.scene;
          person.scale.set(4, 4, 4);
          const animations = gltf.animations;
          mixer = new AnimationMixer(person);
          actions.push(animations[0]);
          actions.push(animations[3]);
          mixer.clipAction(actions[0]).play();
          scene.add(person);
        });
      }
      {
        addPerson();
        window.addEventListener('keydown', (e: KeyboardEvent) => {
          keyAction[e.key] = true;
          mixer.clipAction(actions[0]).stop();
          mixer.clipAction(actions[1]).play();
        });
        window.addEventListener('keyup', (e: KeyboardEvent) => {
          keyAction[e.key] = false;
          mixer.clipAction(actions[1]).stop();
          mixer.clipAction(actions[0]).play();
        });
      }

      {
        addBox(1, 1);
        addBox(2, 2);
        addBox(3, 3);
        addBox(1, 5);
        addBox(4, 5);
        // addBox(3, 6);
        scene.add(boxGroup);
      }
    });
    let boxHelper!: BoxHelper;
    window.addEventListener('click', e => {
      point.setX((e.clientX / width) * 2 - 1);
      point.setY(-((e.clientY / height) * 2 - 1));
      raycaster.setFromCamera(point, camera);
      const boxs = raycaster.intersectObject(boxGroup);
      const [box] = boxs;
      if (box) {
        if ((box.object as any).isSelect) {
          (box.object as any).isSelect = false;
          scene.remove(boxHelper);
          return;
        }
        (box.object as any).isSelect = true;
        boxHelper = new BoxHelper(box.object);
        scene.add(boxHelper);
      }
    });

    const config = {
      moveDistance: 0.2,
      rotationSpeed: 0.02,
    };

    const cameraDistance = 20;

    const gui = new GUI();
    gui.add(config, 'moveDistance').name('运动速度');
    gui.add(config, 'rotationSpeed').name('旋转速度');

    function handlePersonMove() {
      if (person) {
        camera.position.x = person.position.x;
        camera.position.y = person.position.y + cameraDistance;
        camera.position.z = person.position.z + cameraDistance;
        camera.lookAt(person.position);
        if (keyAction['w']) {
          const forward = new Vector3(0, 0, -1);
          forward.applyQuaternion(person.quaternion);
          person.position.add(forward.multiplyScalar(config.moveDistance));
          // person.position.z -= config.moveDistance;
          if (!keyAction['a'] && !keyAction['d']) {
            mixer.clipAction(actions[0]).stop();
            mixer.clipAction(actions[1]).play();
          }
        }
        if (keyAction['s']) {
          const forward = new Vector3(0, 0, 1);
          forward.applyQuaternion(person.quaternion);
          person.position.add(forward.multiplyScalar(config.moveDistance));
          if (!keyAction['a'] && !keyAction['d']) {
            mixer.clipAction(actions[0]).stop();
            mixer.clipAction(actions[1]).play();
          }
          // person.position.z += config.moveDistance;
        }
        if (keyAction['a']) {
          // person.position.x -= config.moveDistance;
          person.rotation.y += config.rotationSpeed;
        }
        if (keyAction['d']) {
          // person.position.x += config.moveDistance;
          person.rotation.y -= config.rotationSpeed;
        }
      }
    }

    function animate() {
      handlePersonMove();
      if (mixer) {
        mixer.update(clock.getDelta());
      }
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
      css3Renderer.render(scene, camera);
      update();
    }

    function handleResize() {
      width = window.innerWidth;
      height = window.innerHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    window.addEventListener('resize', handleResize);
    animate();
  });
</script>

<style scoped>
  #box1 {
    width: 100%;
    height: 100%;
  }
</style>
