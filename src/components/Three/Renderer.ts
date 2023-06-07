import { WebGLRenderer, type WebGLRendererParameters } from 'three';

export interface IRendererProps extends WebGLRendererParameters {
  parentEl?: HTMLDivElement | undefined;
  el?: HTMLCanvasElement | undefined;
}

export type IRenderer = WebGLRenderer;

export default class Renderer {
  options: IRendererProps = {} as IRendererProps;
  renderer: IRenderer | null = null;
  private static instance: Renderer | null = null;
  static defaultOptions: IRendererProps = {};
  private width = 0;
  private height = 0;

  private constructor(options: IRendererProps) {
    this.reset();
    this.options = options;
    this.init();
  }
  reset() {
    this.removeEvent();
    Renderer.instance = null;
    this.renderer = null;
  }
  static getInstance(options?: IRendererProps) {
    // if (!this.instance) {
    //   this.instance = new Renderer(options || this.defaultOptions);
    // }
    this.instance = new Renderer(options || this.defaultOptions);
    return this.instance;
  }
  getRender() {
    return this.renderer!;
  }
  private init() {
    const { el, parentEl } = this.options;
    this.renderer = new WebGLRenderer({ canvas: el, alpha: true });
    this.renderer.shadowMap.enabled = true;
    this.renderer.setPixelRatio(window.devicePixelRatio); // 设置像素比
    this.handleRenderSize();
    if (!el) {
      if (parentEl) {
        parentEl.appendChild(this.renderer.domElement);
      } else {
        document.body.appendChild(this.renderer.domElement);
      }
    }
    this.addEvent();
  }
  private handleRenderSize() {
    const { el, parentEl } = this.options;
    if (this.renderer) {
      if (!el) {
        if (parentEl) {
          this.width = parentEl.offsetWidth;
          this.height = parentEl.offsetHeight;
        } else {
          this.width = window.innerWidth;
          this.height = window.innerHeight;
        }
      } else {
        this.width = el.offsetWidth;
        this.height = el.offsetHeight;
      }

      this.renderer.setSize(this.width, this.height);
    }
  }
  private addEvent() {
    window.addEventListener('resize', this.onResize.bind(this));
  }
  private removeEvent() {
    window.removeEventListener('resize', this.onResize.bind(this));
  }
  private onResize() {
    this.handleRenderSize();
  }
  getSize() {
    return {
      width: this.width,
      height: this.height,
    };
  }
}
