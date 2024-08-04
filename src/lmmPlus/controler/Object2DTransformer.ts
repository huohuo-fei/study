import { Matrix3 } from '../math/Matrix3';
import { Vector2 } from '../math/Vector2';
import { Object2D } from '../objects/Object2D';
const pi2 = Math.PI * 2;

/** 对任意Object2D对象的变换 */
export class Object2DTransformer {
  /** 本地变换数据 */
  localMatrix = new Matrix3();
  localRotate = 0;
  localScale = new Vector2(1);
  localPosition = new Vector2();
  /** 本地坐标系内的变换基点 */
  origin = new Vector2();

  /** 相对量变换 */
  relativePosition = new Vector2();
  relativeRotate = 0;
  relativeScale = new Vector2(1);

  /** 等量旋转弧度 */
  uniformRotateAng = pi2 / 24;

  /** 基点变换后的矩阵  -- 这里可以按照自己的想法改 */
  get matrix() {
    const {
      relativePosition,
      relativeRotate,
      relativeScale,
      origin,
      localPosition,
      localRotate,
      localScale,
    } = this;

    // 先将目标基点，对齐坐标原点
    const m2 = new Matrix3().makeTranslation(-origin.x, -origin.y);

    // 计算出 本地矩阵 和变换矩阵的合矩阵
    const m3 = new Matrix3()
      .scale(localScale.x * relativeScale.x, localScale.y * relativeScale.y)
      .rotate(localRotate + relativeRotate)
      .translate(
        localPosition.x + relativePosition.x,
        localPosition.y + relativePosition.y
      );

    // 这里有个疑问，并没有将位置归位吧？
    return m3.clone().multiply(m2);
  }

  /* 设置基点 */
  setOrigin(localOrigin: Vector2) {
    // 本地坐标系下的基点坐标
    this.origin.copy(localOrigin);
    // 将基点坐标转为裁剪空间下 或者说 父级坐标下 用于图案归位 TODO:有待测试
    this.localPosition.copy(localOrigin.clone().applyMatrix3(this.localMatrix));
  }

  /** 根据Obj对象 获取本地矩阵数据 */
  setLocalMatrixDataByObject2D(obj: Object2D) {
    this.localMatrix.copy(obj.matrix);
    this.localScale.copy(obj.scale);
    this.localRotate = obj.rotate;
    this.localPosition.copy(obj.position);
  }
  /* 清理相对数据 */
  clearRelativeMatrixData() {
    this.relativePosition.set(0, 0);
    this.relativeRotate = 0;
    this.relativeScale.set(1, 1);
  }
  /** 获取相对缩放量 -- 就是将当前的点位信息回退到旋转之前  TODO:不回退也行吧？ */
  getRelativeScale(start2Origin: Vector2, end2Origin: Vector2) {
    const a = end2Origin.clone().rotate(-this.localRotate);
    const b = start2Origin.clone().rotate(-this.localRotate);
    return new Vector2(a.x / b.x, a.y / b.y);
  }

  /* 双向缩放 */
  scale0(start2Origin: Vector2, end2Origin: Vector2) {
    this.relativeScale.copy(this.getRelativeScale(start2Origin, end2Origin));
  }

  /* 双向等比缩放  TODO:优化算法 */
  scale1(start2Origin: Vector2, end2Origin: Vector2) {
    const { x, y } = this.getRelativeScale(start2Origin, end2Origin);
    this.relativeScale.set((x + y) / 2);
  }

  /* 单向缩放 */
  scaleX0(start2Origin: Vector2, end2Origin: Vector2) {
    this.doScaleSigleDir('x', start2Origin, end2Origin);
  }
  scaleY0(start2Origin: Vector2, end2Origin: Vector2) {
    this.doScaleSigleDir('y', start2Origin, end2Origin);
  }

  /* 单向等比缩放 */
  scaleX1(start2Origin: Vector2, end2Origin: Vector2) {
    this.doUniformScaleSigleDir('x',start2Origin,end2Origin);
  }
  scaleY1(start2Origin: Vector2, end2Origin: Vector2) {
    this.doUniformScaleSigleDir('y',start2Origin,end2Origin);
  }

  /** 单向缩放 */
  doScaleSigleDir(dir: 'x' | 'y', start2Origin: Vector2, end2Origin: Vector2) {
    const s = this.getRelativeScale(start2Origin, end2Origin);
    this.relativeScale[dir] = s[dir];
  }

  /** 单向等比缩放 */
  doUniformScaleSigleDir(
    dir: 'x' | 'y',
    start2Origin: Vector2,
    end2Origin: Vector2
  ) {
    const s = this.getRelativeScale(start2Origin, end2Origin);
    this.relativeScale.set(s[dir]);
  }

  /* 旋转 */
  rotate0(start2Origin: Vector2, end2Origin: Vector2) {
    this.relativeRotate = end2Origin.angle() - start2Origin.angle();
  }

  /* 等量旋转 */
  rotate1(start2Origin: Vector2, end2Origin: Vector2) {
    const { origin, uniformRotateAng } = this;
    const ang = end2Origin.angle() - start2Origin.angle();
    this.relativeRotate =
      Math.floor((ang + uniformRotateAng / 2) / uniformRotateAng) *
      uniformRotateAng;
  }

  /* 位移 */
  // 自由位移
  move0(dragStart: Vector2, dragEnd: Vector2) {
    this.relativePosition.subVectors(dragEnd, dragStart)
  }
  // 正交位移-作业，留给同学们实现
  move1() {
  }



}
