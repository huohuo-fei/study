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

export class Img2D extends Object2D {
  image: CanvasImageSource = new Image();
  offset: Vector2 = new Vector2();
  size: Vector2 = new Vector2(300,150);
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

  // 绘图
  protected drawShape(ctx: CanvasRenderingContext2D) {
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
      boundingBox:{
        min:{x:x0,y:y0},
        max:{x:x1,y:y1}
      },
    } = this;
this.computeBoundingBox()
    crtPathByMatrix(ctx, [x0,y0, x1,y0, x1, y1,x0,y1], matrix);
  }

  // 边界盒子
  computeBoundingBox(){
    const {boundingBox:{min,max},size,offset} = this
    min.copy(offset)
    max.addVectors(offset,size)
  }
}
