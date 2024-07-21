import { Vector2 } from '../math/Vector2';
import { Img } from '../objects/Img';

const pi2 = Math.PI * 2;

/** 图案数据类型 */
export type ImgData = {
  position: Vector2;
  scale: Vector2;
  rotate: number;
  offset: Vector2;
};

type ImgTransformerType = {
  img?: Img;
  origin?: Vector2;
  mousePos?: Vector2;
  mouseStart?: Vector2;
  uniformRotateAng?: number;
};

export class ImgTransformer {
  /** 变换的图案 */
  img = new Img();

  /** 暂存的图案变换信息 */
  position = new Vector2();
  scale = new Vector2();
  rotate = 0;
  offset = new Vector2();

  /** 图案在父级坐标系内的变换基点 */
  origin = new Vector2();

  /** 图案父级坐标系里的鼠标数据   -- 不懂，为什么是父级坐标系 */
  /** 鼠标位置 */
  mousePos = new Vector2();
  /** 鼠标起始位 */
  mouseStart = new Vector2();
  /** mouseStart 减 origin   -- 这个有什么用？ */
  originToMouseStart = new Vector2();

  /** 等量旋转弧度 */
  uniformRotateAng = pi2 / 24;

  constructor(attr: ImgTransformerType = {}) {
    this.setOption(attr);
  }

  setOption(attr: ImgTransformerType) {
    Object.assign(this, attr);
    const { img, mouseStart, origin } = this;
    img && this.passImgDataTo();
    if (origin && mouseStart) {
      this.updateOriginToMouseStart(mouseStart, origin);
    }
  }

  /** 更新基点到鼠标起点的向量  -- 不太理解*/
  updateOriginToMouseStart(mouseStart = this.mouseStart, origin = this.origin) {
    this.originToMouseStart.subVectors(mouseStart, origin);
  }

  /** 把img变换数据传递给obj */
  passImgDataTo(obj: ImgData = this) {
    const { position, scale, rotate, offset } = this.img;
    obj.position.copy(position);
    obj.rotate = rotate;
    obj.scale.copy(scale);
    obj.offset.copy(offset);
  }
  /* 双向缩放 */
  scale0() {
    const { img, scale } = this;
    img.scale.copy(scale.clone().multiply(this.getLocalScale()));
  }

  /** 获取图案的本地缩放量(基点到鼠标的向量 / 基点到鼠标的起点向量) */
  getLocalScale(): Vector2 {
    const { img, origin, originToMouseStart, mousePos } = this;
    const rotateInvert = 0; // -img.rotate
    return mousePos
      .clone()
      .sub(origin)
      .rotate(rotateInvert)
      .divide(originToMouseStart.clone().rotate(rotateInvert));
  }

  /* 双向等比缩放 */
  scale1() {
    const { img, origin, originToMouseStart, mousePos, scale } = this;
    const rotateInvert = 0; // -img.rotate

    const activeVec = mousePos
      .clone()
      .sub(this.mouseStart)
      .rotate(rotateInvert);
    const oldVec = originToMouseStart.clone().rotate(rotateInvert);
    const dir = oldVec.clone().normalize();
    const dotValue = activeVec.clone().dot(dir) / oldVec.length();
    img.scale.copy(scale.clone().multiplyScalar(dotValue + 1));
  }

  /* 单向缩放 */
  scaleX0() {
    this.doScaleSigleDir('x');
  }
  scaleY0() {
    this.doScaleSigleDir('y');
  }

  /* 单向等比缩放 */
  scaleX1() {
    this.doUniformScaleSigleDir('x');
  }
  scaleY1() {
    this.doUniformScaleSigleDir('y');
  }

  /** 单向缩放 */
  doScaleSigleDir(dir: 'x' | 'y') {
    const { img, scale } = this;
    const newScale = this.getLocalScale();
    img.scale[dir] = scale[dir] * newScale[dir];
  }

  /** 单向等比缩放 */
  doUniformScaleSigleDir(dir: 'x' | 'y') {
    const { img, scale } = this;
    const newScale = this.getLocalScale();
    img.scale.copy(scale.clone().multiplyScalar(newScale[dir]));
  }

  /* 旋转 */
  rotate0() {
    const { rotate, img, originToMouseStart, mousePos, origin } = this;
    const activeRad = mousePos.clone().sub(origin).angle();
    const oldRad = originToMouseStart.clone().angle();
    img.rotate = rotate + activeRad - oldRad;
  }

  /* 等量旋转 */
  rotate1() {
    const {
      rotate,
      img,
      originToMouseStart,
      mousePos,
      origin,
      uniformRotateAng,
    } = this;
    const activeRad = mousePos.clone().sub(origin).angle();
    const oldRad = originToMouseStart.clone().angle();
    const deltaRotate = activeRad - oldRad;
    const num = Math.round(deltaRotate / uniformRotateAng);
    img.rotate = rotate + num * uniformRotateAng;
  }

  /* 位移 */
  // 自由位移
  move0() {
    // 不太懂  这里为什么图案直接平移？？不需要考虑
    const { mousePos, img, position } = this;
    img.position.copy(position.clone().add(mousePos.sub(this.mouseStart)));
  }
  // 正交位移-作业，留给同学们实现
  move1() {
    const { mousePos, img, position } = this;
    const deltaMove = mousePos.sub(this.mouseStart);
    if (Math.abs(deltaMove.x) >= Math.abs(deltaMove.y)) {
      // X 移动
      const newVec = position.clone();
      newVec.x += deltaMove.x;
      img.position.copy(newVec);
    } else {
      // Y 移动
      const newVec = position.clone();
      newVec.y += deltaMove.y;
      img.position.copy(newVec);
    }
  }

  /** 将图案回退到变换之前 */
  restoreImg() {
    this.copyImgData(this);
  }

  /** 将obj中变换数据 拷贝到img中 */
  copyImgData(obj: ImgData) {
    const { position, scale, rotate, offset } = obj;
    const { img } = this;
    img.position.copy(position);
    img.rotate = rotate;
    img.scale.copy(scale);
    img.offset.copy(offset);
  }
}
