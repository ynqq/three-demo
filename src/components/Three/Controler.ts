import type { Camera } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export type IOrbitControls = OrbitControls & {
  update(): void;
};

export default class OrbitControler {
  private static instance: OrbitControler | null = null;
  private controls: OrbitControls | null = null;

  private constructor(camera: Camera, rendererDom: HTMLCanvasElement) {
    this.controls = new OrbitControls(camera, rendererDom);
  }

  static getInstance(camera: Camera, rendererDom: HTMLCanvasElement) {
    if (!this.instance) {
      this.instance = new OrbitControler(camera, rendererDom);
    }
    return this.instance;
  }

  getControl() {
    return this.controls;
  }
}
