import { Matrix3 } from '../math/Matrix3';
import { Vector2 } from '../math/Vector2';
import { crtPathByMatrix, crtPath } from '../objects/ObjectUtils';
import { Object2D } from '../objects/Object2D';

type Leve = 'worldMatrix' | 'pvmMatrix';

type ControlFrameType = {
  obj?: Object2D;
  Level?: Leve;
};

/** 鼠标状态 */
export type State = 'scale' | 'scaleX' | 'scaleY' | 'rotate' | 'move' | null;

/** 布尔变量 ,节省内存开销 不需要重复申请 */
let _bool: boolean = false;
const pi2 = Math.PI * 2;

/** 虚拟canvas上下文对象 */
const ctx = document
  .createElement('canvas')
  .getContext('2d') as CanvasRenderingContext2D;

export class ControlFrame {
  // 目标对象
  _obj = new Object2D();
  /** 图案本地坐标系内的边框的顶点集合 */
  localVertices: number[] = [];
  /** 图案裁剪坐标系的边框的顶点集合 */
  clipVertices: number[] = [];
  /** 当前节点索引 */
  nodeIndex = 0;
  /** 本地坐标系的中点 */
  localCenter = new Vector2();
  /** 裁剪坐标系的中点 */
  clipCenter = new Vector2();
  /** 路径变换矩阵 */
  matrix = new Matrix3();

  /** 要把路径变换到哪个坐标系下 默认是裁剪坐标系 */
  level = 'pvmMatrix';

  /** 描边色 */
  strokeStyle = '#558ef0';

  /** 填充色 */
  fillStyle = '#fff';

  /** 矩形点的尺寸 */
  readonly dotSize = 8;

  constructor(attr: ControlFrameType = {}) {
    for (const [key, val] of Object.entries(attr)) {
      this[key] = val;
    }
  }

  get obj() {
    return this._obj;
  }

  set obj(val) {
    // set get 除了保护作用之外  在触发赋值和读取时，可以做额外的操作
    this._obj = val;
    val.computeBoundingBox();
    this.updateVertices();
  }

  /** 获取对面节点 */
  get localOpposite(): Vector2 {
    return this.getOpposite('localVertices');
  }
  get clipOpposite(): Vector2 {
    return this.getOpposite('clipVertives');
  }
  getOpposite(type: 'localVertices' | 'clipVertives'): Vector2 {
    const { nodeIndex } = this;
    const vertices = this[type];
    const ind = (nodeIndex + 8) % 16;
    return new Vector2(vertices[ind], vertices[ind + 1]);
  }

  /** 跟新本地坐标和裁剪坐标下的边框顶点 */
  updateVertices() {
    const {
      clipCenter,
      localCenter,
      clipVertices: cv,
      localVertices,
      level,
      obj,
      obj: {
        boundingBox: {
          min: { x: x0, y: y0 },
          max: { x: x1, y: y1 },
        },
      },
    } = this;

    const xm = (x0 + x1) / 2;
    const ym = (y0 + y1) / 2;

    // 边框的八个点
    this.localVertices = [
      x0,y0,xm,y0,x1,y0,x1,ym,x1,y1,xm,y1,x0,y1,x0,ym,
    ];
    const lv = this.localVertices;
    this.matrix = obj[level]
    for (let i = 0, len = lv.length; i < len; i += 2) {
      const { x, y } = new Vector2(lv[i], lv[i + 1]).applyMatrix3(this.matrix);
      cv[i] = x;
      cv[i + 1] = y;
    }

    localCenter.copy(new Vector2((lv[0] + lv[8]) / 2,(lv[1] + lv[9]) / 2))
    clipCenter.copy(
      new Vector2(cv[0], cv[1]).lerp(new Vector2(cv[8], cv[9]), 0.5)
    )
  }

  /** 重写draw 方法 绘制 线框 控制点 中点 */
  draw(ctx: CanvasRenderingContext2D) {
    this.updateVertices();
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
    const { clipVertices: fv } = this;
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
      obj: {
        size: { x: imgW, y: imgH },
        offset:{x:ox,y:oy}
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
          ox + imgX - pointHalfW,
          oy + imgY - pointHalfH, // 左上
          ox + imgX + pointHalfW,
          oy + imgY - pointHalfH, // 右上
          ox + imgX + pointHalfW,
          oy + imgY + pointHalfH, // 右下
          ox + imgX - pointHalfW,
          oy + imgY + pointHalfH, // 左下
        ];

        crtPathByMatrix(ctx, pointVertices, this.matrix, true);
      }
    }

    ctx.fill();
    ctx.stroke();
  }

  /** 绘制圆心中点 */
  private drawRectCenter(ctx: CanvasRenderingContext2D) {
    const { clipCenter } = this;
    ctx.beginPath();
    ctx.arc(clipCenter.x, clipCenter.y, 5, 0, pi2);
    ctx.fill();
    ctx.stroke();
  }

  /** 获取变换状态 */
  getMouseState(mp: Vector2): State {
    const { clipVertices: fv } = this;

    // 对角线的长度
    const diagonal = new Vector2(fv[8] - fv[0], fv[9] - fv[1]).length();

    // 缩放的距离 -- 鼠标点距离控制点的最大范围，这个范围内，都是缩放状态
    const scaleDist = Math.min(24, diagonal / 3);

    // xy轴缩放  等比缩放  判断矩形线框的四个边角点
    for (let i = 0, len = fv.length; i < len; i += 4) {
      const distance = new Vector2(fv[i], fv[i + 1]).sub(mp).length();
      if (distance <= scaleDist) {
        // 对面节点的 x 索引
        this.nodeIndex = i
        return 'scale';
      }
    }

    // xy轴单独缩放  -- 这里的思路是，绘制一条有宽度的线，判断鼠标点是否在线内
    const state = this.getScaleState(scaleDist, mp);
    if (state) {
      return state;
    }

    // 移动
    ctx.beginPath();
    crtPath(ctx, fv, true);
    if (ctx.isPointInPath(mp.x, mp.y)) {
      return 'move';
    }

    // 旋转 -- 在move的基础上  对边框线进行描粗
    ctx.save();
    ctx.lineWidth = 80;
    ctx.beginPath();
    crtPath(ctx, fv, true);

    ctx.fillStyle = 'red';
    ctx.fillRect(-200, -200, 1000, 1000);
    _bool = ctx.isPointInStroke(mp.x, mp.y);
    ctx.restore();
    if (_bool) {
      return 'rotate';
    }
    return null;
  }

  /** 绘制四条线段，判断鼠标落点 */
  private getScaleState(scaleDist: number, mp: Vector2): State {
    const { clipVertices: fv } = this;
    // x y轴的线的顶点
    const lines = [
      [fv[0], fv[1], fv[12], fv[13]], // 14
      [fv[4], fv[5], fv[8], fv[9]], // 6
      [fv[0], fv[1], fv[4], fv[5]], // 10
      [fv[8], fv[9], fv[12], fv[13]], // 2
    ];

    // 每条边的对面节点坐标 起始坐标
    const opposites = [14, 6, 2, 10];
    for (let i = 0; i < 4; i++) {
      const stateType = i < 2 ? 'scaleX' : 'scaleY';
      const state = this.simpleScale(scaleDist, mp, lines[i], stateType);
      if (state) {

        this.nodeIndex = opposites[i]
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
