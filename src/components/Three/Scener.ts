import { Scene, Color, Object3D } from 'three';

export type IScener = Scene;

export default class Scener {
  private static instance: Scener | null = null;
  private scene: IScener | null = null;

  private constructor() {
    this.init();
  }

  private init() {
    this.scene = new Scene();
    // this.setBackground(new Color(0x000000));
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new Scener();
    }
    return this.instance;
  }
  getScene() {
    return this.scene!;
  }

  add(...rest: Object3D[]) {
    this.scene!.add(...rest);
    return this.scene;
  }

  setBackground(color: Scene['background']) {
    this.scene!.background = color;
  }
}
