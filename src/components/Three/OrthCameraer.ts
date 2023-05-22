import { OrthographicCamera } from 'three';
import type { IPositionConfig } from './types';

export interface IOrthCameraProps {
  width: number;
  height: number;
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
  near?: number;
  far?: number;
}
export type IOrthCamera = OrthographicCamera;

export default class OrthCameraer {
  private static instance: OrthCameraer | null = null;
  private camera: IOrthCamera | null = null;

  options: IOrthCameraProps = { width: 0, height: 0 };
  position: IPositionConfig;
  look: IPositionConfig;

  private constructor(options: IOrthCameraProps, position: IPositionConfig, look: IPositionConfig) {
    this.options = options;
    this.position = position;
    this.look = look;
    this.init();
  }

  static getInstance(options: IOrthCameraProps, position: IPositionConfig, look: IPositionConfig) {
    if (!this.instance) {
      this.instance = new OrthCameraer(options, position, look);
    }
    return this.instance;
  }
  getCamera() {
    return this.camera!;
  }

  private init() {
    let { left, right, top, bottom, near, far } = this.options;
    const { width, height } = this.options;
    if (!left) {
      left = -width / 2;
      right = width / 2;
      top = height / 2;
      bottom = -height / 2;
      near = near || 1;
      far = far || 1000;
    }
    this.camera = new OrthographicCamera(left, right, top, bottom, near, far);
    this.camera.position.set(this.position.x, this.position.y, this.position.z);
    this.camera.lookAt(this.look.x, this.look.y, this.look.z);
  }
}
