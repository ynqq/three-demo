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
  BoxGeometry,
  CubeTextureLoader,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshPhongMaterial,
  PerspectiveCamera,
  Raycaster,
  TextureLoader,
  Vector2,
} from 'three';
import Tween from '@tweenjs/tween.js';

export default class Index {
  rendererIns: Renderer | null = null;
  renderer: IRenderer | null = null;

  sceneIns: Scener | null = null;
  scene: IScener | null = null;

  cameraIns: OrthCameraer | null = null;
  camera!: PerspectiveCamera;

  controlIns: Controler | null = null;
  control: IOrbitControls | null = null;

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
  controls = {
    cameraX: 0,
    cameraY: 0,
    cameraZ: 0,
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
    this.camera.position.set(30, 0, 0);
    this.camera.lookAt(0, 0, 0);
  }
  initControl() {
    this.controlIns = Controler.getInstance(this.camera!, this.renderer!.domElement);
    this.control = this.controlIns.getControl();
  }
  start() {
    // const help = new AxesHelper(1000);
    // help.position.set(0, 0, 0);
    // this.scene?.add(help);

    const light = new AmbientLight(0xffffff);
    this.scene!.add(light);

    this.raycaster = new Raycaster();
    document.addEventListener('mousemove', this.onPointerMove.bind(this));
    document.addEventListener('click', this.onClick.bind(this));
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        this.resetCamera();
      }
    });

    const textureLoader = new CubeTextureLoader().setPath('/textures/');
    const textureCube = textureLoader.load(['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg']);
    this.scene!.background = textureCube;
    this.scene!.environment = textureCube;

    this.material = new MeshLambertMaterial({ map: new TextureLoader().setPath('/textures/').load('1.png') });
    this.initGui();
    this.initBox(10, 6);
  }
  initGui() {
    this.gui = new GUI();
    const cameraX = this.gui.add(this.controls, 'cameraX', 30, 60);
    cameraX.listen();
    cameraX.onChange(val => {
      this.camera?.position.setX(val);
    });
    const cameraY = this.gui.add(this.controls, 'cameraY', 0, 30);
    cameraY.listen();
    cameraY.onChange(val => {
      this.camera?.position.setY(val);
    });
    const cameraZ = this.gui.add(this.controls, 'cameraZ', 0, 30);
    cameraZ.listen();
    cameraZ.onChange(val => {
      this.camera?.position.setZ(val);
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
  onClick() {
    if (this.old) {
      this.clicked = true;
      this.old.object.position.setX(5);
      this.rotateCamera();
    }
  }
  rotateCamera() {
    new Tween.Tween(this.camera.position)
      .to({
        x: this.old.object.position.x * 4,
        y: Math.abs(this.old.object.position.y * 4),
        z: 0,
      })
      .duration(200)
      .start();
  }
  resetCamera() {
    if (this.clicked) {
      this.clicked = false;
      this.old.object.position.setX(0.01);
      this.old = null;
      new Tween.Tween(this.camera.position)
        .to({
          x: 30,
          y: 0,
          z: 0,
        })
        .duration(200)
        .start();
    }
  }
  onPointerMove(event: MouseEvent) {
    this.pointer.x = (event.clientX / this.width) * 2 - 1;
    this.pointer.y = -(event.clientY / this.height) * 2 + 1;

    this.raycaster?.setFromCamera(this.pointer, this.camera!);
    const intersects = this.raycaster!.intersectObjects(this.scene!.children, false);
    if (this.old) {
      if (!this.clicked) {
        this.old.object.position.setX(0.01);
      }
    }
    if (intersects.length > 0 && this.pointer.x && this.pointer.y) {
      if (!this.clicked) {
        const item = intersects[0];
        if (item && item.object.name === 'iitem') {
          item.object.position.setX(2);
          this.old = item;
        }
      }
    } else {
      if (this.old && !this.clicked) {
        this.old.object.position.setX(0.01);
        this.clicked = false;
      }
    }
  }
  animate() {
    Tween.update();
    this.renderer!.render(this.scene!, this.camera!);
    this.control?.update();
    requestAnimationFrame(this.animate.bind(this));
  }
}
