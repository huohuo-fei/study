import { Matrix3 } from '../math/Matrix3';
import { Vector2 } from '../math/Vector2';
import { TextStyle, TextStyleType } from '../style/TextStyle';
import { Object2D, Object2DType } from './Object2D';
import { crtPathByMatrix } from './ObjectUtils';

type TextType = {
  text?: string;
  maxWidth?: number | undefined;
  style?: TextStyleType;
} & Object2DType

/** 虚拟的画布 主要借用ctx上的方法 */
const virtuallyCtx = new OffscreenCanvas(300, 300).getContext(
  '2d'
) as OffscreenCanvasRenderingContext2D;

/** 文字对齐方式引起的偏移量  -- 默认下 画布的原点在文字的左上角 */
const alignRatio = {
  start: 0,
  left: 0,
  center: -0.5,
  end: -1,
  right: -1,
};
const baseLineRatio = {
  top: 0,
  middle: -0.5,
  bottom: -1,
  hanging: -0.05,
  alphabetic: -0.78,
  ideographic: -1,
};

export class Text2D extends Object2D {
  text = '';
  maxWidth: number | undefined;
  style: TextStyle = new TextStyle();

  readonly isText = true;
  constructor(attr: TextType = {}) {
    super();
    this.setOption(attr);
  }

  setOption(attr: TextType = {}) {
    for (let [key, val] of Object.entries(attr)) {
      if (key === 'style') {
        this.style.setOption(val as TextStyleType);
      } else {
        this[key] = val;
      }
    }
  }

  /** 文本尺寸 */
  get size(): Vector2 {
    const { style, text, maxWidth } = this;
    style.setFont(virtuallyCtx);
    const { width } = virtuallyCtx.measureText(text);
    const w = maxWidth === undefined ? width : Math.min(maxWidth, width);
    return new Vector2(w, style.fontSize);
  }

  // TODO:再看看 object2D中的有关偏移量 offset
  computeBoundingBox(): void {
    const {
      boundingBox: { min, max },
      size,
      offset,
      style: { textAlign, textBaseline },
    } = this;

    min.set(
      offset.x + size.x * alignRatio[textAlign],
      offset.y + size.y * baseLineRatio[textBaseline]
    );
    max.addVectors(min, size);
  }

  /** 绘制图像边界 */
  crtPath(ctx: CanvasRenderingContext2D, matrix = this.pvmMatrix): void {
    this.computeBoundingBox();
    const {
      boundingBox: {
        min: { x: x0, y: y0 },
        max: { x: x1, y: y1 },
      },
    } = this;

    crtPathByMatrix(ctx, [x0, y0, x1, y0, x1, y1, x0, y1], matrix);
  }

  /** 绘图 */
  drawShape(ctx: CanvasRenderingContext2D) {
    const {
      text,
      offset: { x, y },
      maxWidth,
      style,
    } = this;

    style.apply(ctx);
    for (let method of style.drawOrder) {
      style[`${method}Style`] && ctx[`${method}Text`](text, x, y, maxWidth);
    }
  }
}
