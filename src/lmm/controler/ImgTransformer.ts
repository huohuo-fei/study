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
    const {img,scale} = this
    img.scale.copy(scale.clone().multiply(this.getLocalScale()))
  }

  /** 获取图案的本地缩放量(基点到鼠标的向量 / 基点到鼠标的起点向量) */
  getLocalScale():Vector2{
    const { img,origin,originToMouseStart,mousePos } = this
    const rotateInvert = -img.rotate
    console.log(rotateInvert,'rotateInvert');
    
    return mousePos.clone().sub(origin).rotate(rotateInvert).divide(originToMouseStart.clone().rotate(rotateInvert))
  }

  /* 双向等比缩放 */
  scale1() {}

  /* 单向缩放 */
  scaleX0() {}
  scaleY0() {}

  /* 单向等比缩放 */
  scaleX1() {}
  scaleY1() {}

  /* 旋转 */
  rotate0() {}

  /* 等量旋转 */
  rotate1() {}

  /* 位移 */
  // 自由位移
  move0() {}
  // 正交位移-作业，留给同学们实现
  move1() {}

  /** 将图案回退到变换之前 */
  restoreImg(){
    this.copyImgData(this)
  }

  /** 将obj中变换数据 拷贝到img中 */
  copyImgData(obj:ImgData){
    const { position, scale, rotate, offset } = obj;
    const {img} = this
    img.position.copy(position);
    img.rotate = rotate;
    img.scale.copy(scale);
    img.offset.copy(offset);
  }
}
