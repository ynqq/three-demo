import Renderer, { type IRenderer } from '@/components/Three/Renderer';
import Scener, { type IScener } from '@/components/Three/Scener';
import OrthCameraer from '@/components/Three/OrthCameraer';
import Controler, { type IOrbitControls } from '@/components/Three/Controler';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GUI } from 'dat.gui';
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
  textLoader: TextureLoader | null = null;
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

  constructor(parentEl: HTMLDivElement) {
    this.initRender(parentEl);
    this.initScene();
    this.initCamera();
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
    this.control.enableDamping = true;
    this.control.maxPolarAngle = 1.5;
    this.control.minDistance = 30;
    this.control.maxDistance = 50;
    this.control.target = new Vector3(0, 12, 0);
  }
  paintWalls(width: number, depth: number, height: number, x: number, y: number, z: number, rx: number, ry: number, rz: number) {
    new TextureLoader().setPath(import.meta.env.VITE_SOME_IP + '/textures/').load('qiang.png', texture => {
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

    const light = new AmbientLight(0x333333);
    this.scene.add(light);

    const pointeLight = new PointLight('#fff');
    pointeLight.position.set(30, 40, -30);
    this.scene.add(pointeLight);

    const light2 = new DirectionalLight(0x999999, 1);
    light2.position.set(30, 40, -22);
    light2.castShadow = true;
    light2.shadow.mapSize.width = 1024;
    light2.shadow.mapSize.height = 1024;

    const d = 10;

    light2.shadow.camera.left = -d;
    light2.shadow.camera.right = d;
    light2.shadow.camera.top = d;
    light2.shadow.camera.bottom = -d;
    light2.shadow.camera.near = 0.5;
    light2.shadow.camera.far = 1000;

    this.scene.add(light2);

    const width = 200,
      height = 200;
    new TextureLoader().setPath(import.meta.env.VITE_SOME_IP + '/textures/').load('wood-floor.jpg', texture => {
      texture.wrapS = texture.wrapT = RepeatWrapping;
      texture.repeat.set(1, 1);
      const material = new MeshLambertMaterial({ map: texture, side: DoubleSide });
      const gemotery = new PlaneGeometry(width, height);
      const mesh = new Mesh(gemotery, material);
      mesh.position.y = 0;
      mesh.rotation.x = Math.PI / 2;
      this.scene.add(mesh);
    });
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

    const textureLoader = new CubeTextureLoader().setPath(import.meta.env.VITE_SOME_IP + '/textures/');
    const textureCube = textureLoader.load(['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg']);
    this.scene.background = textureCube;
    this.scene.environment = textureCube;

    this.material = new MeshLambertMaterial({ map: new TextureLoader().setPath(import.meta.env.VITE_SOME_IP + '/textures/').load('1.png') });
    this.initModel();
    // this.initGui();

    this.effect = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.effect.addPass(renderPass);

    this.outlinePass = new OutlinePass(new Vector2(this.width, this.height), this.scene, this.camera);
    this.outlinePass.edgeStrength = 3;
    this.outlinePass.visibleEdgeColor = new Color('#00baff');
    this.outlinePass.downSampleRatio = 10;

    new TextureLoader().setPath(import.meta.env.VITE_SOME_IP + '/textures/').load('1.png', texture => {
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
  }
  initGui() {
    this.gui = new GUI();
    const cameraX = this.gui.add(this.controls, 'cameraX', 0, 303, 1);
    cameraX.listen();
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
    const fbxLoader = new FBXLoader().setPath(import.meta.env.VITE_SOME_IP);
    fbxLoader.load('./models/d1.fbx', obj => {
      obj.castShadow = true;
      obj.receiveShadow = true;
      this.group = new Group();
      obj.scale.set(0.2, 0.2, 0.2);
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
    requestAnimationFrame(this.animate.bind(this));
  }
}
