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

/** 鼠标状态 */
export type State = 'scale' | 'scaleX' | 'scaleY' | 'rotate' | 'move' | null;

/** 布尔变量 ,节省内存开销 不需要重复申请 */
let _bool: boolean = false;

/** 虚拟canvas上下文对象 */
const ctx = document
  .createElement('canvas')
  .getContext('2d') as CanvasRenderingContext2D;

export class Frame {
  _img = new Img();

  /** 图案边框的顶点集合 */
  vertices: number[] = [];

  /** 图案中点 */
  center = new Vector2();

  /** 缩放 旋转的对面节点 */
  opposite = new Vector2()

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
    // 绘图
    ctx.save();
    ctx.strokeStyle = this.strokeStyle;
    ctx.fillStyle = this.fillStyle;
    this.drawRectLine(ctx);
    this.drawRectControl(ctx);
    this.drawRectCenter(ctx);
    ctx.restore();
  }

  /** 绘制矩形线框 */
  private drawRectLine(ctx: CanvasRenderingContext2D) {
    const { vertices: fv } = this;
    ctx.beginPath();

    // 这里直接根据传入的路径点绘制线段
    // vertices 是经过矩阵变换后的点，已近是裁剪坐标系下
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
  }

  /** 绘制周围八个矩形控制点 */
  private drawRectControl(ctx: CanvasRenderingContext2D) {
    const {
      dotSize,
      img: {
        size: { x: imgW, y: imgH },
      },
    } = this;

    // 图案尺寸的一半
    const [halfWidth, halfHeight] = [imgW / 2, imgH / 2];

    // 提取缩放量 保证控制点的大小不变
    ctx.beginPath();
    const { elements: e } = this.matrix;
    const sx = new Vector2(e[0], e[1]).length();
    const sy = new Vector2(e[3], e[4]).length();
    const pointSize = new Vector2(dotSize / sx, dotSize / sy);

    // 获取矩形控制点的 半长宽
    const [pointHalfW, pointHalfH] = [pointSize.x / 2, pointSize.y / 2];

    // 绘制矩形控制点
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (i === 1 && j === 1) {
          // 中间不绘制矩形控制点
          continue;
        }

        // 先获取图形的坐标
        const [imgX, imgY] = [i * halfWidth, j * halfHeight];

        // 计算当前矩形控制点的 路径坐标
        const pointVertices = [
          imgX - pointHalfW,
          imgY - pointHalfH, // 左上
          imgX + pointHalfW,
          imgY - pointHalfH, // 右上
          imgX + pointHalfW,
          imgY + pointHalfH, // 右下
          imgX - pointHalfW,
          imgY + pointHalfH, // 左下
        ];

        crtPathByMatrix(ctx, pointVertices, this.matrix, true);
      }
    }

    ctx.fill();
    ctx.stroke();
  }

  /** 绘制圆心中点 */
  private drawRectCenter(ctx: CanvasRenderingContext2D) {
    const { center } = this;
    ctx.beginPath();
    ctx.arc(center.x, center.y, 5, 0, pi2);
    ctx.fill();
    ctx.stroke();
  }

  /** 获取变换状态 */
  getMouseState(mp: Vector2): State {
    const { vertices: fv } = this;

    // 对角线的长度
    const diagonal = new Vector2(fv[8] - fv[0], fv[9] - fv[1]).length();

    // 缩放的距离 -- 鼠标点距离控制点的最大范围，这个范围内，都是缩放状态
    const scaleDist = Math.min(24, diagonal / 3);

    // xy轴缩放  等比缩放  判断矩形线框的四个边角点
    for (let i = 0, len = fv.length; i < len; i += 4) {
      const distance = new Vector2(fv[i], fv[i + 1]).sub(mp).length();
      if (distance <= scaleDist) {
        // 对面节点的 x 索引
        const ind = (i + 8) % 16
        this.opposite.set(fv[ind],fv[ind+1])
        return 'scale';
      }
    }

    // xy轴单独缩放  -- 这里的思路是，绘制一条有宽度的线，判断鼠标点是否在线内
    const state = this.getScaleState(scaleDist, mp);
    if (state) {
      return state;
    }

    // 移动
    ctx.beginPath()
    crtPath(ctx,fv,true)
    if(ctx.isPointInPath(mp.x,mp.y)){
      return 'move'
    }

    // 旋转 -- 在move的基础上  对边框线进行描粗 
    ctx.save()
    ctx.lineWidth = 80
    ctx.beginPath()
    crtPath(ctx,fv,true)
    
    ctx.fillStyle = 'red'
    ctx.fillRect(-200,-200,1000,1000)
    _bool = ctx.isPointInStroke(mp.x,mp.y)
    ctx.restore()
    if(_bool){
      return 'rotate'
    }
    return null;
  }

  /** 绘制四条线段，判断鼠标落点 */
  private getScaleState(scaleDist: number, mp: Vector2): State {
    const { vertices: fv } = this;
    // x y轴的线的顶点
    const lines = [
      [fv[0], fv[1], fv[12], fv[13]], // 6
      [fv[4], fv[5], fv[8], fv[9]],   // 14
      [fv[0], fv[1], fv[4], fv[5]],   // 10
      [fv[8], fv[9], fv[12], fv[13]], // 2
    ];

    // 每条边的对面节点坐标 起始坐标
    const opposites = [6,14,10,2]
    for (let i = 0; i < 4; i++) {
      const stateType = i < 2 ? 'scaleX' : 'scaleY';
      const state = this.simpleScale(scaleDist, mp, lines[i], stateType);
      if (state) {
        this.opposite.set(fv[opposites[i]],fv[opposites[i] + 1])
        return state;
      }
    }
    return null;
  }

  /** 根据传来的点，判断是否处于单轴旋转模式 */
  private simpleScale(
    scaleDist: number,
    mp: Vector2,
    vertices: number[],
    state: State
  ): State {
    ctx.save();
    ctx.lineWidth = scaleDist;
    ctx.beginPath();
    crtPath(ctx, vertices, true);
    _bool = ctx.isPointInStroke(mp.x, mp.y);
    ctx.restore();
    if (_bool) {
      return state;
    }
    return null;
  }
}
