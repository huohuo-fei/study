import { Vector2 } from '../math/Vector2';
import { Object2D, Object2DType } from '../objects/Object2D';
import { Img } from '../objects/Img';
import { Matrix3 } from '../math/Matrix3';
import { Scene } from '../core/Scene';
import { Frame, State } from './Frame';
import { MouseShape } from './MouseShape';
import { ImgTransformer } from './ImgTransformer';
import { ImgData } from './ImgTransformer';

const _changeEvent = { type: 'change' };

/** 变换之前的暂存数据类型 */
type TransformStage = {
  clipCenter: Vector2;
  clipOpposite: Vector2;
  parentPvmInvert: Matrix3;
};

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

  /** 控制状态 */
  private _controlState: State = null;

  /** alt 键是否按下 */
  private _altKey = false;
  /** shift 键是否按下 */
  private shiftKey = false;

  /** 图案基点 在裁剪坐标系的位置 */
  clipOrigin = new Vector2();

  /** 图案在父级坐标系内的变换基点 */
  origin = new Vector2();
  /** 鼠标在图案父级坐标系的坐标位 */
  parentMousePos = new Vector2();

  /** 选中图案时暂存的数据，用于取消变换 */
  controlStage: ImgData = {
    position: new Vector2(),
    rotate: 0,
    scale: new Vector2(),
    offset: new Vector2(),
  };

  /** 变换前的暂存数据，用于设置变换基点，将裁剪坐标转图案父级坐标 -- 和上面哪个有什么区别？ */
  transformStage: TransformStage = {
    clipCenter: new Vector2(),
    clipOpposite: new Vector2(),
    parentPvmInvert: new Matrix3(),
  };

  /** 图案编辑器 */
  imgTransformer = new ImgTransformer({
    origin: this.origin,
    mousePos: this.parentMousePos,
  });

  /** 使用 访问器 监听 controlState altKey 变换，后续要做些操作*/
  get controlState() {
    return this._controlState;
  }

  set controlState(val) {
    if (val === this._controlState) return;
    this._controlState = val;
    const { img } = this;

    if (!img || !val) return;

    /* 图案控制状态变换 */
    // 暂存变换数据
    this.saveTransformData(img);

    if (val === 'move') {
      // 如果是移动状态，不需要基点变换
      return;
    }

    // 对于旋转和缩放，都需要基点变换 ，
    if (val === 'rotate') {
      this.setRotateOrigin();
    } else if (val.includes('scale')) {
      this.setScaleOrigin();
    }

    // 在不改变图案世界位置下 基于变换基点，偏移图案
    // 基点发生变换后，图案会跟着变，所以要让图案再逆着变换回来，
    // 保证基点变换前后的图案位置 在裁剪坐标系下一致
    this.offsetImgByOrigin(img);
  }

  get altKey() {
    return this._altKey;
  }

  set altKey(val) {
    if (val === this._altKey) return;
    this._altKey = val;

    const { controlState, img, origin, imgTransformer } = this;
    if (!img) return;

    // 按下alt键 需要变换基点
    if (controlState?.includes('scale')) {
      // 将图案回退到变换之前的状态
      imgTransformer.restoreImg();

      // 缩放基点设置中心
      this.setScaleOrigin();
      //根据变换基点 偏移图案
      this.offsetImgByOrigin(img);
      // 变换图案
      this.transformImg();
    }
  }
  get img() {
    return this._img;
  }

  set img(val) {
    if (val === this._img) return;

    this._img = val;
    if (val) {
      // 在选中图形后 除了通知图案选择框外，还需要通知图案变换控制器
      this.imgTransformer.setOption({ img: val });
      this.imgTransformer.passImgDataTo(this.controlStage); // 不懂？？
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
    this.clipMousePos.copy(mp);

    if (this.mouseState) {
      // 控制状态和鼠标状态同步  如果控制状态发生变换，需要对图案的信息做保存
      this.controlState = this.mouseState;
      // 更新鼠标父级位
      this.updateParentMousePos();
    }

    this.dispatchEvent(_changeEvent);
  }

  pointermove(mp: Vector2) {
    if (!this.img) return; // 当前没有激活的图案  不执行
    // 更新鼠标裁剪坐标位
    this.clipMousePos.copy(mp);

    if (this.controlState) {
      // 更新鼠标在父级坐标系的位置
      this.updateParentMousePos();

      // 变换图案
      this.transformImg();
    } else {
      // 获取鼠标状态
      this.mouseState = this.frame.getMouseState(mp);
    }
    this.dispatchEvent(_changeEvent);
  }

  pointerup() {
    if (this.controlState) {
      this.controlState = null;
      this.dispatchEvent(_changeEvent);
    }
  }

  /** 键盘按下 */
  keydown(key: string, altKey: boolean, shiftKey: boolean) {
    this.altKey = altKey;
    this.shiftKey = shiftKey;
    if (this.img) {
      switch (key) {
        case 'Escape':
          // ESC取消变换
          // 将选中图案时保存的图案变换数据 拷贝到图案中
          this.imgTransformer.copyImgData(this.controlStage);
          // 图案置空
          this.img = null;
          break;
        case 'Enter':
          // enter 确认变换
          this.img = null;
          break;
        case 'Delete':
          // 将img从其所在的group中删除
          this.img.remove();
          // 图案置空
          this.img = null;
          break;
      }
    }
    this.dispatchEvent(_changeEvent);
  }

  /** 键盘抬起 */
  keyup(altKey: boolean, shiftKey: boolean) {
    this.shiftKey = shiftKey;
    this.altKey = altKey;

    this.dispatchEvent(_changeEvent);
  }

  /** 通过父级逆矩阵 和鼠标裁剪坐标，获取鼠标在父级下的坐标位置
   * 就是将裁剪坐标或者说顶层坐标，下沉到图案的父级坐标系下
   *    -- 不太理解为什么要转 */
  updateParentMousePos() {
    const {
      clipMousePos,
      parentMousePos,
      transformStage: { parentPvmInvert },
    } = this;
    parentMousePos.copy(clipMousePos.clone().applyMatrix3(parentPvmInvert));
  }

  /** 图案控制状态发生变换，需要将当前图案的信息做暂存 */
  saveTransformData(img: Img) {
    const {
      clipMousePos,
      imgTransformer,
      frame,
      transformStage: { clipCenter, clipOpposite, parentPvmInvert },
    } = this;

    const { parent } = img;
    // 设置裁剪中点  控制框的中点
    clipCenter.copy(frame.center);
    // 裁剪坐标系的对点  默认是缩放的基点
    clipOpposite.copy(frame.opposite);
    // 父级mvp 逆矩阵
    parent && parentPvmInvert.copy(parent.pvmMatrix.invert());
    console.log(parent?.pvmMatrix,img.parent,'omg~~~');
    

    // 将图案位置信息 和鼠标位置信息  更新到imgTransformer 中
    imgTransformer.setOption({
      img,
      mouseStart: clipMousePos.clone().applyMatrix3(parentPvmInvert),
    });
  }

  /** 设置旋转基点 */
  setRotateOrigin() {
    const {
      origin,
      imgTransformer,
      clipOrigin,
      transformStage: { clipCenter, parentPvmInvert },
    } = this;

    clipOrigin.copy(clipCenter);
    // 将图案中心点 从裁剪坐标 转父级
    origin.copy(clipCenter.clone().applyMatrix3(parentPvmInvert));
    // 更新父级坐标中 基点到鼠标起点的向量
    imgTransformer.updateOriginToMouseStart();
  }

  /** 设置缩放基点 */
  setScaleOrigin() {
    const {
      altKey,
      origin,
      imgTransformer,
      clipOrigin,
      transformStage: { clipCenter, parentPvmInvert, clipOpposite },
    } = this;

    if (altKey) {
      // 中心缩放
      clipOrigin.copy(clipCenter);
      origin.copy(clipCenter.applyMatrix3(parentPvmInvert));
    } else {
      // 对点缩放
      clipOrigin.copy(clipOpposite);
      origin.copy(clipOpposite.applyMatrix3(parentPvmInvert));
    }

    imgTransformer.updateOriginToMouseStart();
  }

  /** 根据基点 偏移图案 */
  offsetImgByOrigin(img: Img) {
    const { offset, position, scale, rotate, pvmMatrix } = img;

    // 先计算出 基点在 图案本地坐标系下的值
    const imgOrigin = this.clipOrigin.clone().applyMatrix3(pvmMatrix.invert());
    // 再计算出基点 和 图案之前的偏移的  插值
    /**
     * 如果图案之前的offset(0,0) ,说明之前的图案是以左上角为基点，
     * 也就是说画布的原点在图案的左上角
     * 假设现在的基点为图案的中心(100,100)，那么需要将图案在父级坐标系中移动(-100,-100)
     */
    const curOffset = new Vector2().subVectors(offset, imgOrigin);
    // 当前偏移 和已有偏移的插值
    /**
     * 这个会计算出为了对齐基点图案偏移的变换量
     * 我们需要根据这个变换量，通过移动图案的本地坐标系，抵消掉
     */
    const diff = new Vector2().subVectors(curOffset, offset);
    // 图案需要应用最新的偏移值  保证基点对齐
    offset.copy(curOffset);

    // 上一级的position 再偏移回来，以确保图案的世界位不变
    /**
     * diff 变量是基于图案本地坐标系计算出来的，
     * offset 最终会调用ctx.drawimg方法，对图案进行整体的偏移
     * offset 这个变量，是基于画布变换后 偏移的，也就是说应用了画布的 旋转和缩放变换
     * diff也需要应用画布的变化，
     */
    position.sub(diff.multiply(scale).rotate(rotate));
  }

  /** 变换图案 */
  transformImg() {
    const { imgTransformer, controlState, shiftKey, img } = this;

    // controlState + Number(shiftKey) 拼接变换方法 scale0 ...
    controlState && imgTransformer[controlState + Number(shiftKey)]();
    this.dispatchEvent({ type: 'transformed', target: img });
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { img } = this;
    if (!img) return;

    // 绘制控制框
    this.frame.draw(ctx);

    // 绘制鼠标
    this.mouseShape.draw(ctx, this.mouseState);
  }
}
