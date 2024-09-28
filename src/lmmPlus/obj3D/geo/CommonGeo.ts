import {
  Mesh,
  MeshStandardMaterial,
  NeverDepth,
  LessEqualDepth,
  Vector3,
  Group,
  OrthographicCamera,
  Object3D,
  Quaternion,
  Plane,
} from 'three';
import { ThreeLayer } from '../ThreeLayer';
// 几何体的基类  -- 这里提供了每个几何体需要有的方法
abstract class  CommonGeo {
  // 当前选中面的索引
  selectColorIndex: number;
  // 材质索引和颜色值的 map
  alreadyChangeIndexs!: Map<number, string>;
  // 需要恢复颜色的索引
  clearColorIndex: number;
  // 一个确定的几何体  不包含任何边框
  realGeo!: Mesh;
  // 生成的几何体组 包含几何体 以及 外边框
  originGroup: Group | null = null;
  // 渲染层
  renderLayer: ThreeLayer;
  camera: OrthographicCamera;
  height: number = 0;
  width: number = 0;
  depth: number = 0;
  radius: number = 0;

  totalScaleX:number = 1
  totalScaleY:number = 1
  totalScaleZ:number = 1
  constructor(renderLayer: ThreeLayer) {
    this.renderLayer = renderLayer;
    this.camera = this.renderLayer.camera;
    this.selectColorIndex = -1;
    this.clearColorIndex = -1;
    this.alreadyChangeIndexs = new Map();
  }
  /**
   * 给某个面 填充颜色
   * @param {number} materialIndex 材质的索引
   * @param {String} color css 样式的格式  #fff ...
   * @param {String} type 当前的指针模式  move down
   */
  fillColorStyle(materialIndex: number, color: string, type?: string) {
    if (!(this.realGeo.material instanceof Array)) return;
    // 如果传入 none 表示时清空颜色
    if (color === 'none') {
      this.realGeo.material[materialIndex].depthFunc = NeverDepth;
    } else {
      (
        this.realGeo.material[materialIndex] as MeshStandardMaterial
      ).color.setStyle(color);
      this.realGeo.material[materialIndex].depthFunc = LessEqualDepth;
    }

    this.selectColorIndex = materialIndex;
    if (type === 'down') {
      // 指针按下 需要更新颜色信息

      if (color === 'none') {
        this.alreadyChangeIndexs.delete(materialIndex);
      } else {
        this.alreadyChangeIndexs.set(materialIndex, color);
      }
    }

    if (this.selectColorIndex !== this.clearColorIndex) {
      this.clearColor();
      this.clearColorIndex = this.selectColorIndex;
    }
  }

  // 回复之前 面的颜色
  clearColor() {
    if (this.clearColorIndex != -1) {
      const { clearColorIndex } = this;
      const materialColor = this.alreadyChangeIndexs.get(clearColorIndex);
      if (!(this.realGeo.material instanceof Array)) return;
      if (materialColor) {
        // 如果颜色存在 则恢复到之前的颜色
        (
          this.realGeo.material[clearColorIndex] as MeshStandardMaterial
        ).color.setStyle(materialColor);
        this.realGeo.material[clearColorIndex].depthFunc = LessEqualDepth;
      } else {
        (
          this.realGeo.material[clearColorIndex] as MeshStandardMaterial
        ).color.setStyle('#fff');
        this.realGeo.material[clearColorIndex].depthFunc = NeverDepth;
      }
    }
  }

  // 更新颜色  -- 立方体收起后，需要将颜色同步到几何体上
  updateColor(indexColorMap: Map<any, any>) {
    this.alreadyChangeIndexs = new Map(indexColorMap.entries());

    for (let i = 0; i <= 5; i++) {
      const color = this.alreadyChangeIndexs.get(i);
      if (!(this.realGeo.material instanceof Array)) return;
      // 重新设置 立方体的材质
      if (color) {
        (this.realGeo.material[i] as MeshStandardMaterial).color.setStyle(
          color
        );
        this.realGeo.material[i].depthFunc = LessEqualDepth;
      } else {
        this.realGeo.material[i].depthFunc = NeverDepth;
      }
    }
  }

  // ---------------- 每个几何体都需要实现的方法 ---------------- //
  abstract createGeo():Group
  abstract createDefaultGeo(startPoint:Vector3,endPoint: Vector3):Group

  /**
   * 几何体发生旋转后，需要更改几何相关虚线
   * 针对圆柱体和圆锥体，还需要更改侧边的位置
   * @param quaternion 当前旋转量
   * @param plane      平行于本地坐标系 XOZ的平面
   */
  abstract updateDash(quaternion?:Quaternion,plane?:Plane):void

  /**
   * 绘制线框,主要是绘制底部线框 拉伸的高度为零
   * @param startPoint
   * @param endPoint 
   */
  abstract drawBottom(startPoint: Vector3, endPoint: Vector3): Group | null 
  
  /**
   * 拉伸底部线框  生成 线框几何体
   * @param height 拉伸的高度
   */
  abstract stretchBottomThree(height?: number) :void

  /**
   * resize 控制器触发后，需要同步更新几何体大小
   * @param resizeDir 当前拉伸方向 up right front
   * @param distance  拉伸距离
   */
  abstract updateOriginGeo(resizeDir: string, distance: number):void

  /**
   * resize 结束后，需要同步最新的 各轴缩放系数
   */
  abstract saveOutSize():void

  /**
   * 获取几何体最小尺寸 世界坐标系下的三维坐标
   */
  abstract getMinSize():number[][]

  /**
   * 通过控制点 对整个几何体进行等比缩放
   * @param value 缩放值
   */
  abstract scaleTotalByValue(value:number):void

  /**
   * 缩放结束，保存最新的缩放值
   */
  abstract scaleTotalByValueEnd():void
  
  /**
   * 根据数据 将图片恢复为几何体
   * @param obj 几何体
   * @param metaData  保存着几何体相关的元数据
   */
  abstract parseData(obj: Object3D, metaData: any):Group
}

export { CommonGeo };
