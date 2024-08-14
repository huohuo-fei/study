import { Matrix3 } from '../math/Matrix3';
import { Vector2 } from '../math/Vector2';
import { TextStyle, TextStyleType } from '../style/TextStyle';
import { Object2D, Object2DType } from './Object2D';
import { crtPathByMatrix } from './ObjectUtils';
import { StandStyle, StandStyleType } from '../style/StandStyle';

// 路劲的绘制模式 普通模式  以及使用 贝塞尔曲线拟合的模式
enum drawMode {
  normal = 'normal',
  arcPath = 'arcPath',
}

/** 路径对象 */
export type PathType = {
  style?: StandStyleType;
  mode?: drawMode;
} & Object2DType;

export class Path extends Object2D {
  private pointArr: Vector2[] = [];
  style:StandStyle = new StandStyle()
  mode:drawMode = drawMode.normal

  constructor(attr: PathType = {}) {
    super();
    this.setOption(attr);
  }
  get size(){
    const {
      boundingBox: { min, max },
      pointArr,
    } = this;
    return new Vector2(max.x - min.x,max.y-min.y)
  }

  start(mp: Vector2) {
    this.pointArr.push(mp);
  }

  doing(mp:Vector2){
    this.pointArr.push(mp)
    this.getScene()?.render()
  }

  end(mp:Vector2){
    this.pointArr.push(mp)
    this.getScene()?.render()
  }

  setOption(attr: PathType = {}) {
    for (let [key, val] of Object.entries(attr)) {
      if (key === 'style' || key === 'mode') {
        this.style.setOption(val as TextStyleType);
      } else {
        this[key] = val;
      }
    }
  }

  computeBoundingBox() {
    const {
      boundingBox: { min, max },
      pointArr,
    } = this;
    const minPoint = new Vector2();
    const maxPoint = new Vector2();
    for (let i = 0, len = pointArr.length; i < len; i++) {
      if(i === 0){
        minPoint.x = pointArr[i].x
        minPoint.y = pointArr[i].y
        maxPoint.x = pointArr[i].x
        maxPoint.y = pointArr[i].y
        continue
      }
      if (minPoint.x > pointArr[i].x) {
        minPoint.x = pointArr[i].x;
      }
      if (minPoint.y > pointArr[i].y) {
        minPoint.y = pointArr[i].y;
      }

      if (maxPoint.x < pointArr[i].x) {
        maxPoint.x = pointArr[i].x;
      }
      if (maxPoint.y < pointArr[i].y) {
        maxPoint.y = pointArr[i].y;
      }
    }

    min.set(minPoint.x, minPoint.y);
    max.set(maxPoint.x, maxPoint.y);
  }

  crtPath(ctx: CanvasRenderingContext2D, matrix = this.pvmMatrix) {
    this.computeBoundingBox();
    const {
      boundingBox: {
        min: { x: x0, y: y0 },
        max: { x: x1, y: y1 },
      },
    } = this;

    crtPathByMatrix(ctx, [x0, y0, x1, y0, x1, y1, x0, y1], matrix);
  }

  drawShape(ctx: CanvasRenderingContext2D) {
    const { style, pointArr } = this;
    style.apply(ctx);
    ctx.beginPath()
    if (this.mode === drawMode.normal) {
      // 普通模式  不会对点进行任何特殊的操作
      for (let i = 0, len = pointArr.length; i < len; i++) {
        if (i === 0) {
          ctx.moveTo(pointArr[i].x, pointArr[i].y);
          continue;
        }
        ctx.lineTo(pointArr[i].x, pointArr[i].y);
      }
    }
    ctx.stroke();
  }
}
