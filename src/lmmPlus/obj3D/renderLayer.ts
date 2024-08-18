import { Receiver } from '../driver/Receiver';
import { EventDispatcher } from '../core/EventDispatcher';
import { ThreeLayer } from './ThreeLayer';
import { GeoBase } from './geo/GeoBase';
import { customEvent } from '../driver';
/** 每个画布的渲染层  可以有 2d /3d初始化后 生成一个 renderlayer 之后所有的画布操作
 * 都是依据renderLayer 进行
 */

export enum GeoType {
  cube = 'cube',
}
export class RenderLayer extends Receiver {
  renderLayer: ThreeLayer;
  type: GeoType = GeoType.cube;
  geoBase?: GeoBase;
  uiCanvas: HTMLCanvasElement;
  topCanvas: HTMLCanvasElement;
  bgCanvas: HTMLCanvasElement;
  width: number;
  height: number;
  isUpdateBgCanvas:boolean = false
  uiCtx:CanvasRenderingContext2D |null
  bgCtx:CanvasRenderingContext2D |null

  constructor(uiCanvas: HTMLCanvasElement, bgCanvas: HTMLCanvasElement) {
    super();
    this.uiCanvas = uiCanvas;
    this.bgCanvas = bgCanvas;
    this.topCanvas = document.createElement('canvas');
    const { width, height } = uiCanvas;
    this.width = width;
    this.height = height;
    this.topCanvas.width = width;
    this.topCanvas.height = height;
    // const ctx = this.topCanvas
    this.renderLayer = new ThreeLayer(this.topCanvas);
    this.geoBase = new GeoBase(this.renderLayer);
    this.uiCtx = this.uiCanvas.getContext('2d')
    this.bgCtx = this.bgCanvas.getContext('2d')
    this.loopRender()
    this.renderBg()
  }

  onPointerdown(event: PointerEvent,customEvent:customEvent) {
    this.geoBase?.pointerStart(customEvent)
  }

  onPointermove(event: PointerEvent,customEvent:customEvent): void {
    this.geoBase?.pointerdoing(customEvent)

  }

  onPointerup(event: PointerEvent,customEvent:customEvent): void {
    this.geoBase?.pointerend(customEvent)

  }

  renderDraw() {
    this.renderLayer.render();
    this.uiCtx?.clearRect(0,0,this.width,this.height)
    this.uiCtx?.drawImage(this.topCanvas, 0, 0);
  }

  renderBg(){
    if(this.bgCtx){
      this.bgCtx.fillStyle = '#39597e'
      this.bgCtx.fillRect(0,0,this.width,this.height)
    }
  }

  getDomElement(): HTMLElement | null {
    return this.uiCanvas
  }

  loopRender(){
    setInterval(() => {
      this.renderDraw()
    },30)
  }
}
