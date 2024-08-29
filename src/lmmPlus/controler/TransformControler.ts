import { Vector2 } from '../math/Vector2';
import { Matrix3 } from '../math/Matrix3';
import { Scene } from '../core/Scene';
import { MouseShape } from './MouseShape';
import { Object2DTransformer } from './Object2DTransformer';
import { Object2D } from '../objects/Object2D';
import { ControlFrame, State } from './Frame';

const _changeEvent = { type: 'change' };
const beforeTransform = { type: 'beforeTransform' };

/** 变换之前的暂存数据类型 */
type TransformData = {
  position: Vector2;
  rotate: number;
  scale: Vector2;
};

/**
 * 变换控制器 统领所有的变换:
 * 2D对象变换  Object2DTransformer
 * 包围盒变换  ControlFrame
 * 鼠标变换    MouseShape
 */
export class TransformControler extends Object2D {
  /** 要控制的obj */
  _obj: Object2D | null = null;
  /** 图案控制框 */
  frame = new ControlFrame();

  /** 图案控制器需要绘制控制框，需要在最上层 */
  index = Infinity;

  /** 不受相机的影响？？ 不太理解 */
  /** 理解：如果是在裁剪坐标系绘制控制框，在其内部，已经拿到了图案的裁剪矩阵
   * 这里已经将相机的变换考虑进去了
   * 在此基础上绘制的框，就是在最终裁剪坐标系下的位置，不需要再次对控制框做相机变换
   */
  enableCamera = false;

  /** 鼠标状态 */
  mouseState: State = null;

  /** 鼠标的裁剪坐标系下的坐标 */
  clipMousePos = new Vector2();

  /** 鼠标图案 */
  mouseShape = new MouseShape({
    vertices: this.frame.clipVertices,
    center: this.frame.clipCenter,
    mousePos: this.clipMousePos,
  });

  /** 控制状态 */
  private controlState: State = null;

  /** 拖拽起始结束位 */
  dragStart = new Vector2();
  dragEnd = new Vector2();

  /** 拖拽起始位 结束位 减去 基点 */
  start2Origin = new Vector2();
  end2Origin = new Vector2();

  /** alt 键是否按下 */
  private _altKey = false;
  /** shift 键是否按下 */
  private shiftKey = false;

  /** 变换器 */
  transformer = new Object2DTransformer();

  // 父级pvm 逆矩阵  -- TODO:直接考虑塌陷到图案的
  parentPvmInvert = new Matrix3();

  // 选中图案时暂存的数据 用于取消变换
  controlStage: TransformData = {
    position: new Vector2(),
    scale: new Vector2(),
    rotate: 0,
  };

  get obj() {
    return this._obj;
  }
  set obj(val) {
    if (val === this._obj) return;

    this._obj = val;
    if (val) {
      this.frame.obj = val;
      this.saveTransformData();
      this.transformer.setLocalMatrixDataByObject2D(val);
      this.dispatchEvent({ type: 'selected', target: val });
    } else {
      this.mouseState = null;
      this.controlState = null;
    }
    this.dispatchEvent(_changeEvent);
  }

  get altKey() {
    return this._altKey;
  }

  set altKey(val) {
    if (val === this._altKey) return;
    this._altKey = val;

    const { controlState } = this;

    // 按下alt键 需要变换基点
    if (controlState) {
      // 清理相对变换
      this.transformer.clearRelativeMatrixData();
      // 重置基点
      this.setOrigin();
      // 设置起点到基点向量
      this.start2Origin.subVectors(
        this.dragStart,
        this.transformer.localPosition
      );
      // 终点到基点
      this.end2Origin.subVectors(this.dragEnd, this.transformer.localPosition);
      // 重新变换
      this.relativeTransform(controlState);
    }
    this.dispatchEvent(_changeEvent);
  }

  /**鼠标按下 */
  pointerdown(obj: Object2D | null, mp: Vector2) {
    if (!this.mouseState) {
      // 只有在当前鼠标没有状态时，才会触发
      this.obj = obj;
      if (!obj) {
        return;
      }
    }
    // 更新鼠标裁剪坐标
    this.clipMousePos.copy(mp);
    this.mouseState = this.frame.getMouseState(mp);
    const pvmInvert = this.obj?.parent?.pvmMatrix.invert();
    pvmInvert && this.parentPvmInvert.copy(pvmInvert);
    if (this.mouseState) {
      this.dragStart.copy(mp.clone().applyMatrix3(this.parentPvmInvert));
      this.controlState = this.mouseState;
      this.obj && this.transformer.setLocalMatrixDataByObject2D(this.obj);
      this.setOrigin();
      // 设置起点到基点向量
      this.start2Origin.subVectors(
        this.dragStart,
        this.transformer.localPosition
      );
    }

    this.dispatchEvent(_changeEvent);
  }

  pointermove(mp: Vector2) {
    if (!this.obj) return;
    // 更新鼠标裁剪坐标位
    this.clipMousePos.copy(mp);

    if (this.controlState) {
      this.dragEnd.copy(mp.clone().applyMatrix3(this.parentPvmInvert));
      this.end2Origin.subVectors(this.dragEnd, this.transformer.localPosition);
      this.relativeTransform(this.controlState)
    } else {
      // 获取鼠标状态
      this.mouseState = this.frame.getMouseState(mp);
    }
    this.dispatchEvent(_changeEvent);
  }

  pointerup() {
    const { obj, controlState, transformer } = this;
    if (!obj || !controlState) return;
    transformer.setLocalMatrixDataByObject2D(obj);
    transformer.clearRelativeMatrixData();
    this.controlState = null;
    this.dispatchEvent(_changeEvent);
  }

  /** 键盘按下 */
  keydown(key: string, altKey: boolean, shiftKey: boolean) {
    this.altKey = altKey;
    this.shiftKey = shiftKey;
    if (this.obj) {
      switch (key) {
        case 'Escape':
          // ESC取消变换
          // 将选中图案时保存的图案变换数据 拷贝到图案中
          this.cancleTransform();
          this.obj = null;
          break;
        case 'Enter':
          // enter 确认变换
          this.obj = null;
          break;
        case 'Delete':
          // 将img从其所在的group中删除
          this.obj.remove();
          // 图案置空
          this.obj = null;
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

  /** 相对变换 */
  relativeTransform(controlState: string) {
    const { transformer, start2Origin, dragStart, dragEnd, end2Origin, obj } =
      this;
    const key = controlState + Number(this.shiftKey);
    if (!obj || !transformer[key]) {
      return;
    }
    if (controlState === 'move') {
      transformer[key](dragStart, dragEnd);
      this.dispatchEvent({ type: 'transforme', value:dragEnd.clone().sub(dragStart) });
    } else {
      transformer[key](start2Origin, end2Origin);
    }
    this.dispatchEvent({ type: 'transformed', obj });
  }

  /** 设置基点 */
  setOrigin() {
    const {
      altKey,
      controlState,
      frame: { localCenter, localOpposite },
      transformer,
    } = this;
    let curOrigin =
      altKey || controlState === 'rotate' ? localCenter : localOpposite;
    transformer.setOrigin(curOrigin);
  }

  /** 图案控制状态发生变换，需要将当前图案的信息做暂存 */
  saveTransformData() {
    const { obj, controlStage } = this;
    obj && this.passTransformData(obj, controlStage);
  }
  /* 取消变换，恢复图形变换前的状态 */
  cancleTransform() {
    const { obj, controlStage } = this;
    obj && this.passTransformData(controlStage, obj);
  }

  /* 把一个对象的变换数据传递给另一个对象 */
  passTransformData(obj0: TransformData, obj1: TransformData) {
    const { position, scale, rotate } = obj0;
    obj1.position.copy(position);
    obj1.scale.copy(scale);
    obj1.rotate = rotate;
  }
  updateFrame() {
    this.obj?.computeBoundingBox()
}

  draw(ctx: CanvasRenderingContext2D) {
    const { obj } = this;
    if (!obj) return;
    // 设置本地模型矩阵
    this.controlState && obj.decomposeModelMatrix(this.transformer.matrix);

    // 绘制控制框
    this.frame.draw(ctx);

    // 绘制鼠标
    this.mouseShape.draw(ctx, this.mouseState);
  }
}
