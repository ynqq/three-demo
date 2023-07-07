import {
  AmbientLight,
  BoxGeometry,
  Color,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Raycaster,
  RepeatWrapping,
  Scene,
  SphereGeometry,
  Texture,
  TextureLoader,
  Vector2,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { GammaCorrectionShader } from 'three/addons/shaders/GammaCorrectionShader.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

export default class Index {
  width: number;
  height: number;
  constructor(parentEl: HTMLDivElement) {
    const render = new WebGLRenderer({
      alpha: true,
    });
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    render.setPixelRatio(this.width / this.height);
    render.setSize(this.width, this.height);
    parentEl.appendChild(render.domElement);

    const scene = new Scene();
    scene.background = new Color('#000');

    const camera = new PerspectiveCamera(75, this.width / this.height, 1, 10000);
    camera.position.set(30, 30, 30);
    camera.lookAt(0, 0, 0);

    const box = new BoxGeometry(10, 10, 10);
    const mesh = new Mesh(box, new MeshBasicMaterial({ color: '#fff' }));
    mesh.position.set(-10, -10, -10);
    scene.add(mesh);

    const geo = new SphereGeometry(5);
    const mesh2 = new Mesh(geo, new MeshBasicMaterial({ color: '#fff' }));
    mesh2.position.set(10, 10, 10);
    scene.add(mesh2);

    scene.add(new AmbientLight('#fff'));

    const controls = new OrbitControls(camera, render.domElement);

    const effect = new EffectComposer(render);
    const renderPass = new RenderPass(scene, camera);
    effect.addPass(renderPass);

    const outlinePass = new OutlinePass(new Vector2(this.width, this.height), scene, camera);
    outlinePass.edgeStrength = 3;
    outlinePass.visibleEdgeColor = new Color('#00baff');
    new TextureLoader().setPath(import.meta.env.VITE_SOME_IP + '/textures/').load('1.png', texture => {
      outlinePass.patternTexture = texture;
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;
    });
    effect.addPass(outlinePass);

    // const gammaPass = new ShaderPass(GammaCorrectionShader);
    // effect.addPass(gammaPass);

    // const effectFXAA = new ShaderPass(FXAAShader);
    // effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
    // effect.addPass(effectFXAA);

    const fbxLoader = new FBXLoader().setPath(import.meta.env.VITE_SOME_IP);
    fbxLoader.load('./models/d1.fbx', obj => {
      obj.scale.set(0.2, 0.2, 0.2);
      obj.name = 'guizi';
      scene.add(obj);
    });

    const mouse = new Vector2(0, 0);
    const raycaster = new Raycaster();
    let selectedObjects: any[] = [];

    function addSelectedObject(object: any) {
      selectedObjects = [];
      selectedObjects.push(object);
    }
    render.domElement.addEventListener('pointermove', onPointerMove);

    function onPointerMove(event: any) {
      if (event.isPrimary === false) return;

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      check();
    }

    function check() {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(scene, true);
      if (intersects?.length) {
        const selectedObject = intersects[0].object;
        addSelectedObject(selectedObject);
        outlinePass.selectedObjects = selectedObjects;
      } else {
        selectedObjects = [];
        outlinePass.selectedObjects = selectedObjects;
      }
    }

    const animate = () => {
      controls.update();
      requestAnimationFrame(animate);
      effect.render();
    };
    animate();
  }
}
