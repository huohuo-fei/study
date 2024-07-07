import { Matrix3 } from '../math/Matrix3';
import { Vector2 } from '../math/Vector2';
import { Img } from '../objects/Img';
import { crtPathByMatrix, crtPath } from '../objects/ObjectUtils';

const pi2 = Math.PI * 2;

/** 在哪个坐标系绘制控制框
 * moMatrix:偏移坐标转世界坐标
 * pvmoMatrix:偏移坐标转裁剪坐标
 */
type Leve = 'moMatrix' | 'pvmoMatrix';

type FrameType = {
  img?: Img;
  Level?: Leve;
};

export class Frame {
  _img = new Img();

  /** 图案边框的顶点集合 */
  vertices: number[] = [];

  /** 图案中点 */
  center = new Vector2();

  /** 路径变换矩阵 */
  matrix = new Matrix3();

  /** 要把路径变换到哪个坐标系下 默认是裁剪坐标系 */
  level = 'pvmoMatrix';

  /** 描边色 */
  strokeStyle = '#558ef0';

  /** 填充色 */
  fillStyle = '#fff';

  /** 矩形点的尺寸 */
  readonly dotSize = 8;

  constructor(attr: FrameType = {}) {
    for (const [key, val] of Object.entries(attr)) {
      this[key] = val;
    }
  }

  get img() {
    return this._img;
  }

  set img(val) {
    // set get 除了保护作用之外  在触发赋值和读取时，可以做额外的操作
    this._img = val;
    this.updateShape();
  }

  /** 更新矩阵、路径点、中点 */
  private updateShape() {
    const {
      vertices: fv,
      level,
      img: {
        size: { x: imgW, y: imgH },
      },
    } = this;

    // 根据图形的尺寸，生成路径的控制点
    // 顺时针 左上角起点
    const vertices = [
      0,
      0,
      imgW / 2,
      0,
      imgW,
      0,
      imgW,
      imgH / 2,
      imgW,
      imgH,
      imgW / 2,
      imgH,
      0,
      imgH,
      0,
      imgH / 2,
    ];

    // 更新路径变换矩阵
    this.matrix = this.img[level];

    // 更新控制框
    for (let i = 0, len = vertices.length; i < len; i += 2) {
      const { x, y } = new Vector2(vertices[i], vertices[i + 1]).applyMatrix3(
        this.matrix
      );
      fv[i] = x;
      fv[i + 1] = y;
    }

    // 更新中点
    this.center.copy(
      new Vector2(fv[0], fv[1]).lerp(new Vector2(fv[8], fv[9]), 0.5)
    );
  }

  /** 重写draw 方法 绘制 线框 控制点 中点 */
  draw(ctx: CanvasRenderingContext2D) {
    this.updateShape();

    const {
      vertices: fv,
      img: {
        size: { x: imgW, y: imgH },
      },
      center,
      dotSize,
    } = this;

    // 图案尺寸的一半
    const [halfWidth, halfHeight] = [imgW / 2, imgH / 2];

    // 绘图
    ctx.save();
    ctx.strokeStyle = this.strokeStyle;
    ctx.fillStyle = this.fillStyle;

    // 矩形框
    ctx.beginPath();
    const rectVertices: number[] = [
      fv[0],
      fv[1],
      fv[4],
      fv[5],
      fv[8],
      fv[9],
      fv[12],
      fv[13],
    ];
    crtPath(ctx, rectVertices, true);
    ctx.stroke();

    // 提取缩放量 保证控制点的大小不变
    ctx.beginPath();
    const { elements: e } = this.matrix;
    const sx = new Vector2(e[0], e[1]).length();
    const sy = new Vector2(e[3], e[4]).length();
    const pointSize = new Vector2(dotSize / sx, dotSize / sy);

    // 获取矩形控制点的 半长宽
    const [pointHalfW,pointHalfH] = [pointSize.x /2,pointSize.y/2]

    // 绘制矩形控制点
    for(let i = 0;i<3;i++){
      for(let j = 0;j<3;j++){

        if(i === 1&& j===1){
          // 中间不绘制矩形控制点
          continue
        }

        // 先获取图形的坐标
        const [imgX,imgY] = [i*halfWidth,j*halfHeight]

        // 计算当前矩形控制点的 路径坐标
        const pointVertices = [
          imgX - pointHalfW,imgY - pointHalfH, // 左上
          imgX + pointHalfW,imgY - pointHalfH, // 右上
          imgX + pointHalfW,imgY + pointHalfH, // 右下
          imgX - pointHalfW,imgY + pointHalfH, // 左下
        ]

        crtPathByMatrix(ctx,pointVertices,this.matrix,true)
      }
    }

    ctx.fill()
    ctx.stroke()

    // 中点
    ctx.beginPath()
    ctx.arc(center.x,center.y,5,0,pi2)
    ctx.fill()
    ctx.stroke()
    ctx.restore()
  }
}
