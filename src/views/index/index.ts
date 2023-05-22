import Renderer, { type IRenderer } from '@/components/Three/Renderer';
import Scener, { type IScener } from '@/components/Three/Scener';
import OrthCameraer, { type IOrthCamera } from '@/components/Three/OrthCameraer';
import Controler, { type IOrbitControls } from '@/components/Three/Controler';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GUI } from 'dat.gui';
import {
  AmbientLight,
  AxesHelper,
  Box3,
  BoxGeometry,
  CubeTextureLoader,
  EdgesGeometry,
  LineBasicMaterial,
  LineSegments,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshPhongMaterial,
  PerspectiveCamera,
  Raycaster,
  TextureLoader,
  Vector2,
  Vector3,
} from 'three';
import Tween from '@tweenjs/tween.js';
import { handleHideModel, handleShowModel } from './components/util';

export default class Index {
  rendererIns: Renderer | null = null;
  renderer: IRenderer | null = null;

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
  controls = {
    cameraX: 0,
  };

  constructor(parentEl: HTMLDivElement) {
    this.initRender(parentEl);
    this.initScene();
    this.initCamera();
    if (this.renderer && this.scene && this.camera) {
      this.initControl();
      this.renderer.render(this.scene, this.camera);
      this.start();
      this.animate();
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
    this.camera.position.set(30, 30, 0);
    this.camera.lookAt(0, 0, 0);
  }
  initControl() {
    this.controlIns = Controler.getInstance(this.camera!, this.renderer!.domElement);
    this.control = this.controlIns.getControl()!;
    this.control.enableZoom = false;
  }
  start() {
    // const help = new AxesHelper(1000);
    // help.position.set(0, 0, 0);
    // this.scene.add(help);

    const light = new AmbientLight(0xffffff);
    this.scene.add(light);

    this.raycaster = new Raycaster();
    document.addEventListener('mousemove', this.onPointerMove.bind(this));
    document.addEventListener('click', this.onClick.bind(this));
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        this.resetCamera();
      }
    });

    const textureLoader = new CubeTextureLoader().setPath(import.meta.env.VITE_SOME_IP);
    const textureCube = textureLoader.load(['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg']);
    this.scene.background = textureCube;
    this.scene.environment = textureCube;

    this.material = new MeshLambertMaterial({ map: new TextureLoader().setPath(import.meta.env.VITE_SOME_IP).load('1.png') });
    this.initModel();
    // this.initGui();
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
      obj.scale.set(0.2, 0.2, 0.2);
      const { size } = this.getModelSize(obj);
      // const box = new BoxGeometry(size.x, size.y, size.z);
      // const material = new MeshBasicMaterial({
      //   transparent: true,
      //   color: '#00baff',
      //   opacity: 0.5,
      // });
      // const mesh = new Mesh(box, material);
      // mesh.position.set(center.x, center.y, center.z);
      // this.scene.add(mesh);
      this.obj = obj;
      obj.name = 'obj';
      const newObj = obj.clone(),
        newObj2 = obj.clone();
      newObj.name = 'obj2';
      newObj2.name = 'obj3';
      this.scene.add(obj);
      newObj.position.setZ(size.z);
      this.scene.add(newObj);
      newObj2.position.setZ(-size.z);
      this.scene.add(newObj2);
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
    const v = new Vector3(0, 0, x.z);
    this.camera.lookAt(v);
    this.control.target = v;
    new Tween.Tween(this.camera.position).to(x).duration(200).start();
  }
  resetCamera() {
    handleHideModel();
    const v = new Vector3(0, 0, 0);
    this.camera.lookAt(v);
    this.control.target = v;
    new Tween.Tween(this.camera.position)
      .to({
        x: 30,
        y: 30,
        z: 0,
      })
      .duration(200)
      .start();
  }
  getSelectModels(event: MouseEvent) {
    this.pointer.x = (event.clientX / this.width) * 2 - 1;
    this.pointer.y = -(event.clientY / this.height) * 2 + 1;

    this.raycaster?.setFromCamera(this.pointer, this.camera!);
    const intersects = this.raycaster!.intersectObjects(this.scene!.children, true);
    return intersects || [];
  }
  onPointerMove(event: MouseEvent) {
    // const ins = this.getSelectModels(event);
  }
  animate() {
    Tween.update();
    this.renderer!.render(this.scene, this.camera);
    this.control?.update();
    requestAnimationFrame(this.animate.bind(this));
  }
}
