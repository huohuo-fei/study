import { Receiver } from '../driver/Receiver';
import { EventDispatcher } from '../core/EventDispatcher';
import { ThreeLayer } from './ThreeLayer';
import { CanvasDrawLayer } from './CanvasDrawLayer';
import { GeoBase } from './geo/GeoBase';
import { customEvent } from '../driver';
import { eventType } from '../driver';
/** 每个画布的渲染层  可以有 2d /3d初始化后 生成一个 renderlayer 之后所有的画布操作
 * 都是依据renderLayer 进行
 */

export enum GeoType {
  cube = 'cube',
}
export class RenderLayer extends Receiver {
  threeLayer: ThreeLayer;
  drawLayer!: CanvasDrawLayer;
  type: GeoType = GeoType.cube;
  geoBase?: GeoBase;
  uiCanvas: HTMLCanvasElement;
  topCanvas: HTMLCanvasElement;
  topCanvas2: HTMLCanvasElement;
  bgCanvas: HTMLCanvasElement;
  width: number;
  height: number;
  isUpdateBgCanvas: boolean = false;
  uiCtx: CanvasRenderingContext2D | null;
  bgCtx: CanvasRenderingContext2D | null;
  eventType: eventType = eventType.draw3D;

  constructor(uiCanvas: HTMLCanvasElement, bgCanvas: HTMLCanvasElement) {
    super();
    this.uiCanvas = uiCanvas;
    this.bgCanvas = bgCanvas;
    this.topCanvas = document.createElement('canvas');
    this.topCanvas2 = document.createElement('canvas');
    const { width, height } = uiCanvas;
    this.width = width;
    this.height = height;
    this.topCanvas.width = width;
    this.topCanvas.height = height;
    this.topCanvas2.width = width;
    this.topCanvas2.height = height;
    this.threeLayer = new ThreeLayer(this.topCanvas, this);
    this.geoBase = new GeoBase(this.threeLayer);
    this.threeLayer.geoBase = this.geoBase;
    this.uiCtx = this.uiCanvas.getContext('2d');
    this.bgCtx = this.bgCanvas.getContext('2d');
    this.renderBg();
    this.registerEvent();
    this.initDrawLayer();
    this.loopRender();
  }

  // 2D 画布
  initDrawLayer() {
    this.drawLayer = new CanvasDrawLayer(this.topCanvas2, this);
  }

  onPointerdown(event: PointerEvent, customEvent: customEvent) {
    switch (customEvent.eventType) {
      case eventType.draw3D:
        this.threeLayer.drawCon.onPointerdown(event, customEvent);
        break;
      case eventType.rotate3D:
        this.threeLayer.rotateCon.onPointerdown(event, customEvent);
        break;
      case eventType.resize3D:
        this.threeLayer.resizeCon.onPointerdown(event, customEvent);
        break;
      case eventType.fill3D:
        this.threeLayer.fillCon.onPointerdown(event, customEvent);
        break;
      case eventType.select || eventType.transform3d:
        this.drawLayer.onPointerdown(event, customEvent);
        break
      case  eventType.transform3d:
        this.drawLayer.onPointerdown(event, customEvent);
        break
    }
  }

  onPointermove(event: PointerEvent, customEvent: customEvent): void {
    
    switch (customEvent.eventType) {
      case eventType.draw3D:
        this.threeLayer.drawCon.onPointermove(event, customEvent);
        break;
      case eventType.rotate3D:
        this.threeLayer.rotateCon.onPointermove(event, customEvent);
        break;
      case eventType.resize3D:
        this.threeLayer.resizeCon.onPointermove(event, customEvent);
        break;
      case eventType.fill3D:
        this.threeLayer.fillCon.onPointermove(event, customEvent);
        break;
      case eventType.select :
        this.drawLayer.onPointermove(event, customEvent);
        break
      case eventType.transform3d:
        this.drawLayer.onPointermove(event, customEvent);

    }
  }

  onPointerup(event: PointerEvent, customEvent: customEvent): void {
    switch (customEvent.eventType) {
      case eventType.draw3D:
        this.threeLayer.drawCon.onPointerup(event, customEvent);
        break;
      case eventType.rotate3D:
        this.threeLayer.rotateCon.onPointerup(event, customEvent);
        break;
      case eventType.resize3D:
        this.threeLayer.resizeCon.onPointerup(event, customEvent);
        break;
      case eventType.fill3D:
        this.threeLayer.fillCon.onPointerup(event, customEvent);
        break;
      case eventType.select:
        this.drawLayer.onPointerup(event, customEvent);
        break
      case eventType.transform3d:
        this.drawLayer.onPointerup(event, customEvent);

    }
  }

  renderDraw() {
    this.uiCtx?.clearRect(0, 0, this.width, this.height);
    if (this.eventType === eventType.select) {
      this.drawLayer.render();
      this.uiCtx?.drawImage(this.topCanvas2, 0, 0);
    } else {
      this.threeLayer.render();
      this.uiCtx?.drawImage(this.topCanvas, 0, 0);
    }
  }

  renderBg() {
    if (this.bgCtx) {
      this.bgCtx.fillStyle = '#39597e';
      this.bgCtx.fillRect(0, 0, this.width, this.height);
    }
  }

  getDomElement(): HTMLElement | null {
    return this.uiCanvas;
  }

  loopRender() {
    setInterval(() => {
      this.renderDraw();
    }, 30);
  }

  changeMode(eventType: eventType) {
    this.eventType = eventType;
  }

  getMode() {
    return this.eventType;
  }

  setMode(mode: eventType) {
    this.eventType = mode;
  }

  registerEvent() {
    this.addEventListener('switchMode', (event) => {
      if (event.mode) {
        this.setMode(event.mode);
        this.geoBase?.switchControl(event.mode);
      }
    });
    this.addEventListener('changeFillColor', (event) => {
      if (event.color) {
        this.threeLayer.fillCon.changeColor(event.color);
      }
    });
  }
}
