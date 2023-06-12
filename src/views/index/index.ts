import Renderer, { type IRenderer } from '@/components/Three/Renderer';
import Scener, { type IScener } from '@/components/Three/Scener';
import OrthCameraer from '@/components/Three/OrthCameraer';
import Controler, { type IOrbitControls } from '@/components/Three/Controler';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GUI } from 'dat.gui';
import Stats from 'three/addons/libs/stats.module.js';

import {
  AmbientLight,
  Box3,
  BoxGeometry,
  Color,
  CubeTextureLoader,
  DirectionalLight,
  DoubleSide,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Raycaster,
  RepeatWrapping,
  TextureLoader,
  Vector2,
  Vector3,
  Group,
  AxesHelper,
  DirectionalLightHelper,
  PCFSoftShadowMap,
  SphereGeometry,
  SpotLight,
  HemisphereLight,
  PointLightHelper,
  LoadingManager,
  MeshStandardMaterial,
  MeshPhongMaterial,
} from 'three';
import Tween from '@tweenjs/tween.js';
import { handleHideModel, handleShowModel } from './components/util';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js';

export default class Index {
  rendererIns: Renderer | null = null;
  renderer!: IRenderer;

  sceneIns: Scener | null = null;
  scene!: IScener;

  cameraIns: OrthCameraer | null = null;
  camera!: PerspectiveCamera;

  controlIns: Controler | null = null;
  control!: IOrbitControls;

  width = 0;
  height = 0;
  raycaster: Raycaster | null = null;
  obj: any;
  pointer: any = new Vector2();
  textLoader!: TextureLoader;
  material: MeshLambertMaterial | null = null;
  old: any;
  clicked = false;
  gui!: GUI;
  selectModel: any;
  moving = false;
  controls = {
    cameraX: 0,
  };
  outlinePass: any;
  selectedObjects: any[] = [];
  effect!: EffectComposer;
  group!: Group;
  stats!: Stats;
  loadingManager!: LoadingManager;

  constructor(parentEl: HTMLDivElement) {
    this.initRender(parentEl);
    this.initStats(parentEl);
    const manager = {
      onError: (url: string) => {
        alert(url + '加载失败');
      },
      onProgress(url: string, loaded: number, total: number) {
        document.querySelector<HTMLDivElement>('.loading')!.innerText = '正在加载，请稍后...' + ((loaded / total) * 100).toFixed(0) + '%';
      },
      onLoad() {
        document.querySelector<HTMLDivElement>('.loading')!.style.display = 'none';
      },
    };
    this.loadingManager = new LoadingManager(manager.onLoad, manager.onProgress, manager.onError);

    this.textLoader = new TextureLoader(this.loadingManager).setPath(import.meta.env.VITE_SOME_IP + '/textures/');
    this.initScene();
    this.initCamera();
    this.initGui();
    if (this.renderer && this.scene && this.camera) {
      this.initControl();
      this.renderer.render(this.scene, this.camera);
      this.start();
      this.animate();
      // this.handleKey();
    }
  }

  initRender(parentEl: HTMLDivElement) {
    this.rendererIns = Renderer.getInstance({
      parentEl: parentEl,
      alpha: false,
      antialias: true,
    });
    this.renderer = this.rendererIns.getRender();
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    const { width, height } = this.rendererIns.getSize();
    this.width = width;
    this.height = height;
  }
  initScene() {
    this.sceneIns = Scener.getInstance();
    this.scene = this.sceneIns.getScene();
  }
  initCamera() {
    this.camera = new PerspectiveCamera(75, this.width / this.height, 1, 50000);
    this.camera.position.set(30, 12, 0);
    this.camera.lookAt(0, 12, 0);
  }
  initControl() {
    this.controlIns = Controler.getInstance(this.camera!, this.renderer!.domElement);
    this.control = this.controlIns.getControl()!;
    const f3 = this.gui.addFolder('控制');
    const params = {
      control: true,
    };
    this.control.enableDamping = true;
    this.control.target = new Vector3(0, 12, 0);
    this.control.maxPolarAngle = 1.5;
    this.control.minDistance = 30;
    this.control.maxDistance = 50;
    f3.add(params, 'control').onChange(e => {
      if (e) {
        this.control.target = new Vector3(0, 12, 0);
        this.control.maxPolarAngle = 1.5;
        this.control.minDistance = 30;
        this.control.maxDistance = 50;
      } else {
        this.control.target = new Vector3(0, 12, 0);
        this.control.maxPolarAngle = Math.PI;
        this.control.minDistance = 0;
        this.control.maxDistance = Infinity;
      }
    });
    f3.open();
  }
  paintWalls(width: number, depth: number, height: number, x: number, y: number, z: number, rx: number, ry: number, rz: number) {
    this.textLoader.load('qiang.png', texture => {
      texture.wrapS = texture.wrapT = RepeatWrapping;
      texture.repeat.set(1, 1);
      const material = new MeshLambertMaterial({
        map: texture,
        side: DoubleSide,
      });
      const gemotery = new BoxGeometry(width, depth, height);
      const mesh = new Mesh(gemotery, material);
      mesh.position.set(x, y, z);
      mesh.rotation.x = Math.PI * rx;
      mesh.rotation.y = Math.PI * ry;
      mesh.castShadow = true;
      if (rz) {
        mesh.rotation.z = Math.PI * rz;
      }
      this.scene.add(mesh);
    });
  }
  handleKey() {
    window.addEventListener('keyup', (e: KeyboardEvent) => {
      this.handleKeyAction(e.key);
    });
  }
  handleKeyAction(key: string) {
    const config: Record<string, () => void> = {
      w: this.handleToW,
      a: this.handleToA,
      s: this.handleToS,
      d: this.handleToD,
    };
    if (config[key]) {
      config[key].bind(this)();
    }
  }
  handleToW() {
    this.camera.position.setX(this.camera.position.x - 1);
  }
  handleToA() {
    this.camera.position.setZ(this.camera.position.z + 1);
  }
  handleToS() {
    this.camera.position.setX(this.camera.position.x + 1);
  }
  handleToD() {
    this.camera.position.setZ(this.camera.position.z - 1);
  }
  start() {
    // const help = new AxesHelper(1000);
    // help.position.set(0, 0, 0);
    // this.scene.add(help);

    const light = new AmbientLight(0xffffff, 0.8);
    this.scene.add(light);

    const dirLight = new PointLight(0xffffff, 1);
    dirLight.position.set(100, 300, 130);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    const lh = new PointLightHelper(dirLight);
    this.scene.add(lh);

    this.scene.add(dirLight);

    const f2 = this.gui.addFolder('点光源');
    const params = {
      color: '#ffffff',
    };
    f2.addColor(params, 'color')
      .onChange(e => {
        dirLight.color.set(e);
      })
      .name('颜色');
    f2.add(dirLight.position, 'x', -400, 400);
    f2.add(dirLight.position, 'y', -400, 400);
    f2.add(dirLight.position, 'z', -400, 400);
    f2.open();
    const width = 200,
      height = 200;
    const texture = this.textLoader.load('floor/WoodFlooringMerbauBrickBondNatural001_COL_1K.jpg');
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(1, 1);
    const material2 = new MeshStandardMaterial({
      map: texture,
      side: DoubleSide,
      transparent: true,
      roughnessMap: this.textLoader.load('floor/WoodFlooringMerbauBrickBondNatural001_GLOSS_1K.jpg'),
      roughness: 0.7,
      metalnessMap: this.textLoader.load('floor/WoodFlooringMerbauBrickBondNatural001_REFL_1K.jpg'),
      metalness: 1,
      displacementMap: this.textLoader.load('floor/WoodFlooringMerbauBrickBondNatural001_DISP_1K.jpg'),
      displacementBias: 0.5,
      displacementScale: 0.5,
      bumpMap: this.textLoader.load('floor/WoodFlooringMerbauBrickBondNatural001_BUMP_1K.jpg'),
    });
    f2.add(material2, 'displacementScale', 0, 1);
    f2.add(material2, 'displacementBias', 0, 1);
    f2.add(material2, 'metalness', 0, 1);
    // f2.add(material2, 'normalScale', 0, 1);
    f2.add(material2, 'roughness', 0, 1);
    f2.add(material2, 'bumpScale', 0, 1);
    const gemotery = new BoxGeometry(width, height, 1, 200, 200);
    const mesh2 = new Mesh(gemotery, material2);
    mesh2.receiveShadow = true;
    mesh2.position.y = 0;
    mesh2.rotation.x = Math.PI / 2;
    this.scene.add(mesh2);
    this.paintWalls(width, 10, height, -width / 2, height / 2, 0, 0, 0, 1 / 2);
    this.paintWalls(width, 10, height, 0, height / 2, -height / 2, 1 / 2, 0, 0);
    this.paintWalls(width, 10, height, 0, height / 2, height / 2, 1 / 2, 0, 0);

    this.raycaster = new Raycaster();
    document.addEventListener('mousedown', () => {
      this.clicked = true;
    });
    document.addEventListener('mousemove', this.onPointerMove.bind(this));
    document.addEventListener('click', this.onClick.bind(this));
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        this.resetCamera();
      }
    });

    const textureLoader = new CubeTextureLoader(this.loadingManager).setPath(import.meta.env.VITE_SOME_IP + '/textures/');
    const textureCube = textureLoader.load(['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg']);
    this.scene.background = textureCube;
    this.scene.environment = textureCube;

    this.material = new MeshLambertMaterial({
      map: this.textLoader.load('1.png'),
    });
    this.initModel();

    this.effect = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.effect.addPass(renderPass);

    this.outlinePass = new OutlinePass(new Vector2(this.width, this.height), this.scene, this.camera);
    this.outlinePass.edgeStrength = 3;
    this.outlinePass.visibleEdgeColor = new Color('#00baff');
    this.outlinePass.downSampleRatio = 10;

    this.textLoader.load('1.png', texture => {
      this.outlinePass.patternTexture = texture;
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;
    });
    this.effect.addPass(this.outlinePass);
    const gammaPass = new ShaderPass(GammaCorrectionShader);
    this.effect.addPass(gammaPass);

    const effectFXAA = new ShaderPass(FXAAShader);
    effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
    this.effect.addPass(effectFXAA);

    const geo = new SphereGeometry(6);
    const material = new MeshPhongMaterial({
      color: '#00baff',
      displacementBias: 0.5,
      displacementScale: 0.5,
    });
    material.envMap = textureCube;
    const mesh = new Mesh(geo, material);
    mesh.position.set(-30, 8, 0);
    mesh.castShadow = true;
    this.scene.add(mesh);

    const t = new Tween.Tween(mesh.position)
      .to({
        x: mesh.position.x,
        y: 30,
        z: mesh.position.z,
      })
      .duration(500)
      .easing(Tween.Easing.Linear.None)
      .yoyo(true)
      .repeat(Infinity);

    const folder = this.gui.addFolder('球');
    // folder.add(mesh.position, 'x', -100, 100);
    // folder.add(mesh.position, 'y', -100, 100);
    // folder.add(mesh.position, 'z', -100, 100);
    folder.add(mesh, 'visible', true);
    const param = {
      ani: false,
    };
    folder.add(param, 'ani', false).onChange(() => {
      if (t.isPlaying()) {
        if (t.isPaused()) {
          t.resume();
        } else {
          t.pause();
        }
      } else {
        t.start();
      }
    });
    folder.open();
  }
  initStats(parentEl: HTMLDivElement) {
    this.stats = new Stats();
    parentEl.appendChild(this.stats.dom);
  }
  initGui() {
    this.gui = new GUI();
  }
  getModelSize(model: any) {
    const box = new Box3().setFromObject(model);
    const center = box.getCenter(new Vector3());
    const size = box.getSize(new Vector3());
    return {
      size,
      center,
    };
  }
  initModel() {
    const fbxLoader = new FBXLoader(this.loadingManager).setPath(import.meta.env.VITE_SOME_IP);
    fbxLoader.load('./models/d1.fbx', obj => {
      obj.traverse(e => {
        if ((e as any).isMesh) {
          e.castShadow = true;
          e.receiveShadow = true;
        }
      });
      this.group = new Group();
      obj.scale.set(0.2, 0.2, 0.2);
      obj.position.setY(1.5);
      const { size } = this.getModelSize(obj);
      this.obj = obj;
      obj.name = 'obj';
      const newObj = obj.clone(),
        newObj2 = obj.clone();
      newObj.name = 'obj2';
      newObj2.name = 'obj3';
      this.group.add(obj);
      newObj.position.setZ(size.z);
      this.group.add(newObj);
      newObj2.position.setZ(-size.z);
      this.group.add(newObj2);
      this.scene.add(this.group);
    });
  }
  initBox(row: number, col: number) {
    const w = 10,
      h = 2,
      d = 4;
    const geo = new BoxGeometry(w + 0.001, h * row + 0.001, d * col + 0.001);
    const groups = [],
      mat = new Array(6).fill(null);
    mat[0] = new MeshBasicMaterial({ opacity: 0, transparent: true });
    [1, 2, 3, 4, 5].forEach(item => {
      mat[item] = this.material!;
    });
    groups.push({ start: 0, count: 6, materialIndex: 0 }); // 0-6  index[0,4,5, 0,5,1] 用材质1
    groups.push({ start: 6, count: 6, materialIndex: 1 }); // 6-12 index[1,5,6, 1,6,2] 用材质2
    groups.push({ start: 12, count: 6, materialIndex: 2 });
    groups.push({ start: 18, count: 6, materialIndex: 3 });
    groups.push({ start: 24, count: 6, materialIndex: 4 });
    groups.push({ start: 30, count: 6, materialIndex: 5 });
    geo.groups = groups;
    const mesh = new Mesh(geo, mat);

    mesh.position.set(0, 0, 0);
    mesh.name = 'box';
    this.scene?.add(mesh);

    for (let i = 0; i < row; i++) {
      for (let j = 0; j < col; j++) {
        const geometry = new BoxGeometry(w, h, d);
        const mesh = new Mesh(geometry);
        mesh.material = [];
        mesh.material[0] = this.material!;
        mesh.material[1] = new MeshBasicMaterial({ opacity: 0, transparent: true });
        [2, 3, 4, 5].forEach(item => {
          (mesh.material as Material[])[item] = new MeshBasicMaterial({ color: '#000' });
        });

        mesh.position.set(0.01, (h * row) / 2 - h / 2 - h * i, (d * col) / 2 - d / 2 - d * j);
        mesh.name = 'iitem';
        this.scene?.add(mesh);
      }
    }
  }
  onClick(e: MouseEvent) {
    if (this.moving) {
      this.clicked = false;
      this.moving = false;
      return;
    }
    const ins = this.getSelectModels(e);

    if (ins.length) {
      const model = ins[0].object.parent;
      const config: Record<string, Vector3> = {
        obj: new Vector3(20, 20, 0),
        obj2: new Vector3(20, 20, 4),
        obj3: new Vector3(20, 20, -4),
      };
      if (config[model!.name]!) {
        handleShowModel();
        this.rotateCamera(config[model!.name]!);
      }
    }
  }
  rotateCamera(x: Vector3) {
    const v = new Vector3(0, 12, x.z);
    this.camera.lookAt(v);
    this.control.target = v;
    new Tween.Tween(this.camera.position).to(x).duration(200).start();
  }
  resetCamera() {
    this.clicked = false;
    this.moving = false;
    handleHideModel();
    const v = new Vector3(0, 12, 0);
    this.camera.lookAt(v);
    this.control.target = v;
    new Tween.Tween(this.camera.position)
      .to({
        x: 30,
        y: 12,
        z: 0,
      })
      .duration(200)
      .start();
  }
  getSelectModels(event: MouseEvent) {
    this.pointer.x = (event.clientX / this.width) * 2 - 1;
    this.pointer.y = -(event.clientY / this.height) * 2 + 1;

    this.raycaster?.setFromCamera(this.pointer, this.camera!);
    const intersects = this.raycaster!.intersectObjects(this.group!.children, true);
    return intersects || [];
  }
  onPointerMove(event: MouseEvent) {
    if (this.clicked) {
      this.moving = true;
    }
    const ins = this.getSelectModels(event);
    if (ins.length) {
      const selectedObject = ins[0].object.parent;
      this.selectedObjects = [selectedObject];
      this.outlinePass.selectedObjects = this.selectedObjects;
    } else {
      this.selectedObjects = [];
      this.outlinePass.selectedObjects = this.selectedObjects;
    }
  }
  animate() {
    Tween.update();
    this.effect.render();
    // this.renderer.render(this.scene, this.camera);
    this.control?.update();
    this.stats.update();
    requestAnimationFrame(this.animate.bind(this));
  }
}
