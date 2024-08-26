import { RenderLayer } from './renderLayer';
import { OrbitControler } from '../controler/OrbitControler';
import { Scene } from '../core/Scene';
import { Group } from '../objects/Group';
import { TransformControler } from '../controler/TransformControler';
import { Img2D } from '../objects/Img';
import { Vector2 } from '../math/Vector2';
import { Receiver } from '../driver/Receiver';
import { customEvent } from '../driver';
import { selectObjByScene } from '../objects/ObjectUtils';
import { Object2D } from '../objects/Object2D';

// 文件主要处理渲染相关的逻辑
export class CanvasDrawLayer extends Receiver {
  baseLayer: RenderLayer;

  canvas: OffscreenCanvas | HTMLCanvasElement;
  width: number;
  height: number;
  scene: Scene;
  group: Group;
  transformControler: TransformControler;
  selectObj:Object2D | null = null
  constructor(
    canvas: OffscreenCanvas | HTMLCanvasElement,
    baseRenderLayer: RenderLayer
  ) {
    super()
    this.scene = new Scene();
    this.group = new Group();
    this.transformControler = new TransformControler();
    this.canvas = canvas;
    const { width, height } = canvas;
    this.width = width;
    this.height = height;
    this.baseLayer = baseRenderLayer;
    this.init();
  }
  init() {
    this.scene.setOption({ canvas: this.canvas as HTMLCanvasElement });
    this.scene.add(this.group)
    this.scene.add(this.transformControler)
  }

  testData() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.arc(0, 0, 150, 0, Math.PI * 2);
    ctx.fillStyle = 'pink';
    ctx.fill();

    const size = new Vector2(canvas.width, canvas.height).multiplyScalar(0.3);
    const img = new Img2D({
      image: canvas,
      // 模型矩阵
      position: new Vector2(0, 0),
      offset: new Vector2(-size.x / 2, -size.y / 2),
      name: 'img',
      size,
      // 样式
      style: {
        shadowColor: 'rgba(0,0,0,0.5)',
        shadowOffsetY: 0,
        shadowBlur: 0,
      },
    });

    this.group.add(img);
  }

  render() {
    this.scene.render(); 
  }

  onPointerdown(event: PointerEvent, customEvent: customEvent): void {
    const mp = this.scene.clientToClip(customEvent.x, customEvent.y);
    this.selectObj = selectObjByScene(this.group.children, mp,this.scene);
    this.transformControler.pointerdown(this.selectObj, mp);
    console.log('down');
    
  }

  onPointermove(event: PointerEvent, customEvent: customEvent): void {
    const clipMp = this.scene.clientToClip(customEvent.x, customEvent.y);
    this.transformControler.pointermove(clipMp);
    this.selectObj = selectObjByScene(this.group.children, clipMp,this.scene);
    
  }

  onPointerup(event: PointerEvent, customEvent: customEvent): void {
    this.transformControler.pointerup();
  }

  addImg(imgResource:HTMLCanvasElement|HTMLImageElement){
    const size = new Vector2(imgResource.width, imgResource.height)
    const img = new Img2D({
      image: imgResource,
      // 模型矩阵
      position: new Vector2(0, 0),
      offset: new Vector2(-size.x / 2, -size.y / 2),
      name: 'img',
      size,
    });
    this.group.add(img)
  }

 
}
