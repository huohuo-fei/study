import { Vector2 } from '../math/Vector2';
import { Object2D, Object2DType } from '../objects/Object2D';
import { Img } from '../objects/Img';
import { Matrix3 } from '../math/Matrix3';
import { Scene } from '../core/Scene';
import { Frame, State } from './Frame';
import { MouseShape } from './MouseShape';

const _changeEvent = { type: 'change' };

export class ImgControler extends Object2D {
  /** 要控制的图片 */
  _img: Img | null = null;

  /** 图案控制器需要绘制控制框，需要在最上层 */
  index = Infinity;

  /** 不受相机的影响？？ 不太理解 */
  /** 理解：如果是在裁剪坐标系绘制控制框，在其内部，已经拿到了图案的裁剪矩阵
   * 这里已经将相机的变换考虑进去了
   * 在此基础上绘制的框，就是在最终裁剪坐标系下的位置，不需要再次对控制框做相机变换
   */
  enableCamera = false;

  /** 图案控制框 */
  frame: Frame = new Frame();

  /** 鼠标状态 */
  mouseState: State = null;

  /** 鼠标的裁剪坐标系下的坐标 */
  clipMousePos = new Vector2();

  /** 鼠标图案 */
  mouseShape = new MouseShape({
    vertices: this.frame.vertices,
    center: this.frame.center,
    mousePos: this.clipMousePos,
  });

  get img() {
    return this._img;
  }

  set img(val) {
    if (val === this._img) return;

    this._img = val;
    if (val) {
      this.frame.img = val;
      this.dispatchEvent({ type: 'selected', target: val });
    }
    this.dispatchEvent(_changeEvent);
  }

  /**鼠标按下 */
  pointerdown(img: Img | null, mp: Vector2) {
    if (!this.mouseState) {
      // 只有在当前鼠标没有状态时，才会触发
      this.img = img;
      if (!img) {
        return;
      }
    }
    this.mouseState = this.frame.getMouseState(mp);

    // 更新鼠标坐标
    this.clipMousePos.copy(mp)
    this.dispatchEvent(_changeEvent);
  }

  pointermove(mp: Vector2) {
    if (!this.img) return; // 当前没有激活的图案  不执行
    this.mouseState = this.frame.getMouseState(mp);
     // 更新鼠标裁剪坐标位
     this.clipMousePos.copy(mp)
    this.dispatchEvent(_changeEvent);
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { img } = this;
    if (!img) return;

    // 绘制控制框
    this.frame.draw(ctx);

    // 绘制鼠标
    this.mouseShape.draw(ctx,this.mouseState)
  }
}
