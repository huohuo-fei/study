import { State } from './Frame';
import { Vector2 } from '../math/Vector2';
import { crtPath } from '../objects/ObjectUtils';

type MouseShapeType = {
  fillStyle?: string;
  strokeStyle?: string;
  mousePos?: Vector2;
  center?: Vector2;
  vertices?: number[];
  moveVertices?: number[];
  rotateVertices?: number[];
  scaleVertices?: number[];
};

export class MouseShape {
  /** 鼠标位置 */
  mousePos = new Vector2();
  /** 图案中心位置 */
  center = new Vector2();
  /** 图案边框的顶点集合 */
 readonly vertices: number[] = [];

  /** 移动图案的路径 */
  moveVertices: number[] = [0, 0, 14, 14, 6, 14, 0, 20];
  /** 旋转图案路径 */
  rotateVertices: number[] = [
    -10.61, -10.61, -2.83, -9.9, -5.66, -7.07, -2.83, -4.24, -1.41, 0, -2.83,
    4.24, -5.66, 7.07, -2.83, 9.9, -10.61, 10.61, -9.9, 2.83, -7.07, 5.66,
    -4.24, 2.83, -3.11, 0, -4.24, -2.83, -7.07, -5.66, -9.9, -2.83,
  ];
  /** 缩放图案 */
  scaleVertices: number[] = [
    1, 4, 1, 1, 5, 1, 5, 5, 11, 0, 5, -5, 5, -1, 1, -1, 1, -4, -1, -4, -1, -1,
    -5, -1, -5, -5, -11, 0, -5, 5, -5, 1, -1, 1, -1, 4,
  ];

  /** 样式 */
  fillStyle = '#000';
  strokeStyle = '#fff';

  constructor(attr: MouseShapeType) {
    Object.assign(this, attr);
  }

  /** scale 状态 等比缩放 */
  private scale(ctx: CanvasRenderingContext2D) {
    const { mousePos, center } = this;

    // 缩放图标的旋转弧度，保证图标永远指向圆心
    const scaleRotate = new Vector2().subVectors(center, mousePos).angle();
    this.drawScale(ctx, scaleRotate);
  }

  /** Y轴缩放 保证样式永远和图案竖直关系 */
  private scaleY(ctx: CanvasRenderingContext2D) {
    const { center, vertices } = this;
    const scaleRotate = new Vector2()
      .subVectors(center, new Vector2(vertices[2], vertices[3]))
      .angle();
    this.drawScale(ctx, scaleRotate);
  }

  /** X轴缩放 保证样式永远和图案水平关系 */
  private scaleX(ctx: CanvasRenderingContext2D) {
    const { center, vertices } = this;
    const scaleRotate = new Vector2()
      .subVectors(center, new Vector2(vertices[6], vertices[7]))
      .angle();
      console.log(vertices,'vertices');
      
    this.drawScale(ctx, scaleRotate);
  }
  private drawScale(ctx: CanvasRenderingContext2D, angle: number) {
    ctx.rotate(angle);
    ctx.beginPath();
    crtPath(ctx, this.scaleVertices, true);
  }

  /** 移动状态 */
  private move(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    crtPath(ctx, this.moveVertices, true);
  }

  /** 旋转状态 */
  rotate(ctx: CanvasRenderingContext2D) {
    const { center, mousePos } = this;
    const rotateAngle = new Vector2().subVectors(mousePos,center).angle();
    ctx.rotate(rotateAngle);
    ctx.beginPath();
    crtPath(ctx, this.rotateVertices, true);
  }

  /** 绘制鼠标样式 */
  draw(ctx:CanvasRenderingContext2D,state:State){
    if(!state){
      return
    }

    const { fillStyle,strokeStyle,mousePos } = this
    ctx.save()
    ctx.lineWidth = 1
    ctx.strokeStyle = strokeStyle
    ctx.fillStyle = fillStyle
    ctx.translate(mousePos.x,mousePos.y)

    // 执行对应的鼠标类型方法
    this[state](ctx)
    ctx.fill()
    ctx.stroke()
    ctx.restore()

  }
}
