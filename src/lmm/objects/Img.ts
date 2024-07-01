// 所有的图片  拥有 ctx的 drawImage
import { Matrix3 } from '../math/Matrix3';
import { Vector2 } from '../math/Vector2';
import { BasicStyle, BasicStyleType } from '../style/BasicStyle';
import { Object2D, Object2DType } from './Object2D';
import { crtPathByMatrix } from './ObjectUtils';

// drawimg时的视图参数
type View = {
  x: number;
  y: number;
  width: number;
  height: number;
};
// 交叉类型
type ImgType = Object2DType & {
  image?: CanvasImageSource;
  offset?: Vector2;
  size?: Vector2;
  view?: View | undefined;
  src?: string;
  style?: BasicStyleType;
};

export class Img extends Object2D {
  image: CanvasImageSource = new Image();
  offset: Vector2 = new Vector2();
  size: Vector2 = new Vector2();
  view: View | undefined;
  style: BasicStyle = new BasicStyle();

  readonly isImg = true;

  constructor(attr: ImgType = {}) {
    super();
    this.setOption(attr);
  }

  // 属性设置
  setOption(attr: ImgType) {
    // 这里设置属性，如果时 style 相关的，需要写到img.style里面
    for (let [key, val] of Object.entries(attr)) {
      switch (key) {
        case 'src':
          if (this.image instanceof Image) {
            // 如果src 存在，
            this.image.src = val as string;
          }
          break;
        case 'style':
          this.style.setOption(val as BasicStyle);
          break;
        default:
          this[key] = val;
      }
    }
  }

  /**
   * 世界模型矩阵 * 偏移矩阵
   * 基点偏移会用到  -- TODO:不懂
   */
  get moMatrix(): Matrix3 {
    const {
      offset: { x, y },
    } = this;
    return this.worldMatrix.multiply(new Matrix3().makeTranslation(x, y));
  }

  /**
   * 投影视图模型偏移矩阵，
   * 用于将本地顶点 提升到裁剪坐标系 绘制图案控制器
   * TODO:不太懂。。。
   */
  get pvmoMatrix(): Matrix3 {
    const {
      offset: { x, y },
    } = this;

    // 这个offset矩阵，是在drawImage时，图片相对于canvas原点的偏移
    const offsetMatrix = new Matrix3().makeTranslation(x, y)
    return this.pvmMatrix.multiply(offsetMatrix);
  }

  // 绘图
  protected  drawShape(ctx: CanvasRenderingContext2D) {
    const { image, offset, size, view, style } = this;

    // 先应用样式
    style.apply(ctx);

    if (view) {
      ctx.drawImage(
        image,
        view.x,
        view.y,
        view.width,
        view.height,
        offset.x,
        offset.y,
        size.x,
        size.y
      );
    } else {
      ctx.drawImage(image, offset.x, offset.y, size.x, size.y);
    }
  }

  // 绘制图像边界
  crtPath(ctx: CanvasRenderingContext2D, matrix = this.pvmoMatrix) {
    const {
      size: { x: imgW, y: imgH },
    } = this;
    //  [0, 0, imgW, 0, imgW, imgH, 0, imgH] 边界的四个顶点坐标
    crtPathByMatrix(ctx, [0, 0, imgW, 0, imgW, imgH, 0, imgH], matrix);
  }
}
