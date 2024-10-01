import { Receiver } from '../driver/Receiver';
import { EventDispatcher } from '../core/EventDispatcher';
import { ThreeLayer } from './ThreeLayer';
import { GeoBase } from './geo/GeoBase';
import { customEvent } from '../driver';
import { eventType } from '../driver';
import { Snapshot } from './snapshot';
/** 每个画布的渲染层  可以有 2d /3d初始化后 生成一个 renderlayer 之后所有的画布操作
 * 都是依据renderLayer 进行
 */

export enum GeoType {
  cube = 'cube',
  cone='cone',
  cylinder='cylinder'
}
export class RenderLayer extends Receiver {
  threeLayer: ThreeLayer;
  geoType: GeoType = GeoType.cube;
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
  cacheSnapshot:Snapshot
  isForceRenderBg:boolean = false

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
    this.cacheSnapshot = new Snapshot(this)
    this.threeLayer.geoBase = this.geoBase;
    this.uiCtx = this.uiCanvas.getContext('2d');
    this.bgCtx = this.bgCanvas.getContext('2d');
    this.renderBg();
    this.registerEvent();
    this.loopRender();
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
        this.threeLayer.transformControl.onPointerdown(event, customEvent);

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
      case eventType.select:
        this.threeLayer.transformControl.onPointermove(event, customEvent);

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
        this.threeLayer.transformControl.onPointerup(event, customEvent);
        break;
    }
  }

  renderDraw() {
    if(this.isForceRenderBg){
      this.renderBg()
      this.isForceRenderBg = false
    }
    this.uiCtx?.clearRect(0, 0, this.width, this.height);
    this.threeLayer.render();
    this.uiCtx?.drawImage(this.topCanvas, 0, 0);
    requestAnimationFrame(() => {
      this.renderDraw();
    })
  }

  renderBg() {
    if (this.bgCtx) {
      // 背景色
      this.bgCtx.fillStyle ='#27453e'

// 创建一个径向渐变
  // const gradient = this.bgCtx.createRadialGradient(this.width / 2, this.height / 2, 0, this.width / 2, this.height / 2, this.width / 2);

  // // 添加颜色停止点
  // gradient.addColorStop(0, '#27453e'); // 中心点为白色
  // gradient.addColorStop(1, '#27453e'); // 外围为黑色

  // // // 将渐变应用到画布上
  // this.bgCtx.fillStyle = gradient;
this.bgCtx.fillRect(0, 0, this.width, this.height);


      // 读取缓存中的图片
      const cacheCanvas = this.cacheSnapshot.cacheCanvas
      this.bgCtx.drawImage(cacheCanvas,0,0)
    }
  }

  getDomElement(): HTMLElement | null {
    return this.uiCanvas;
  }

  loopRender() {
    // setInterval(() => {
      this.renderDraw();
    // }, 30);


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

  onSendDisactive(){
    this.dispatchEvent({type:'disActiveObj'})
  }
  onSendSwitchMode(mode:eventType){
    this.changeMode(mode)
    this.dispatchEvent({
      type: 'switchGeoMode',
      mode,
    });
  }
  onSendActiveObj(){
    this.dispatchEvent({
      type: 'activeObj',
    });
  }
  onSendDisActiveObj(){
    this.dispatchEvent({
      type: 'disActiveObj',
    });
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
    this.addEventListener('switchGeoType',(event) => {
      if(event.value){
        console.log(event.value,'event.value');
        this.geoType = event.value
      }
    })
  }
}
