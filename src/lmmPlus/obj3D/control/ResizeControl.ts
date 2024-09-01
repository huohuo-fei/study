import {
  AlwaysDepth,
  MeshBasicMaterial,
  Mesh,
  SphereGeometry,
  CylinderGeometry,
  Group,
  Vector2,
} from 'three';
import { TOP_RENDER_ORDER, RESIZE_CYLINDER_R, RESIZE_CIRCLE_R } from '../threeSystem/const';
import { ThreeLayer } from '../ThreeLayer';
import { CommonGeo } from '../geo/CommonGeo';
import { Receiver } from '../../driver/Receiver';
import { customEvent } from '../../driver';
import { converCoordinateTo3D, getObjByPoint, getPointOfFloor } from '../utils';

enum resizeDir {
  up = 'up',
  right = 'right',
  front = 'front',
  none = 'none',
}
class ResizeControl extends Receiver {
  // 控制器挂载对象的尺寸
  w: number;
  h: number;
  d: number;
  // 物体的缩放系数，需要取倒数，保证控制器的尺寸不会被缩放  -- 就是抵消resize
  totalScaleX: number = 1;
  totalScaleY: number = 1;
  totalScaleZ: number = 1;
  // 控制器的组
  resizeGroup: Group;
  // 也是控制器的组  -- 可以考虑合并
  lineMesh: Mesh | null;
  // 以下六个是 组成resize 控制器的六个元素，三组圆球和圆柱
  cylinderUp!: Mesh;
  circle_up!: Mesh;
  cylinderRight!: Mesh;
  circle_right!: Mesh;
  cylinderFront!: Mesh;
  circle_front!: Mesh;
  // 渲染层
  renderLayer: ThreeLayer;
  // 点击控制轴的方向
  resizeDir: resizeDir;
  // 落点 webgl 坐标系下的点
  downpoint: number[] = [];
  constructor(layer: ThreeLayer) {
    super();
    this.renderLayer = layer;
    // 保存原始数据
    this.w = 1;
    this.h = 1;
    this.d = 1;
    this.resizeGroup = new Group();
    this.lineMesh = null;
    this.resizeDir = resizeDir.none;
  }

  // 初始化 控制条
  initResize() {
    const { h, w, d } = this;
    // up 控制条 和控制点
    const geometryUp = new CylinderGeometry(
      RESIZE_CYLINDER_R,
      RESIZE_CYLINDER_R,
      h,
      32
    );
    const materialUp = new MeshBasicMaterial({
      color: 0x67c255,
      depthFunc: AlwaysDepth,
    });
    this.cylinderUp = new Mesh(geometryUp, materialUp);
    this.cylinderUp.name = 'resize_system_up';
    // 圆柱默认是中心对称，现在将控制器组成的 group 的中点移到了几何体底部的中点上，所以需要向上移动 h/2
    this.cylinderUp.translateY(h / 2);
    const geometry_circle_up = new SphereGeometry(RESIZE_CIRCLE_R);
    const material_circle_up = new MeshBasicMaterial({
      color: 0x67c255,
      depthFunc: AlwaysDepth,
    });
    this.circle_up = new Mesh(geometry_circle_up, material_circle_up);
    this.circle_up.name = 'resize_system_up_circle';
    this.circle_up.translateY(h);

    // right 控制条
    const geometryRight = new CylinderGeometry(
      RESIZE_CYLINDER_R,
      RESIZE_CYLINDER_R,
      w / 2,
      32
    );
    const materialRight = new MeshBasicMaterial({
      color: 0xeb6341,
      depthFunc: AlwaysDepth,
    });
    this.cylinderRight = new Mesh(geometryRight, materialRight);
    this.cylinderRight.name = 'resize_system_right';

    // 整个长度 是 w / 2 向 x 正方向移动 一半 就是 w / 4
    this.cylinderRight.translateX(w / 4);
    // 默认是竖直方向 需要旋转到 X轴方向
    this.cylinderRight.rotateZ(Math.PI / 2);
    const geometry_circle_right = new SphereGeometry(RESIZE_CIRCLE_R);
    const material_circle_right = new MeshBasicMaterial({
      color: 0xeb6341,
      depthFunc: AlwaysDepth,
    });
    this.circle_right = new Mesh(geometry_circle_right, material_circle_right);
    this.circle_right.name = 'resize_system_right_circle';
    this.circle_right.translateX(w / 2);

    // front 控制条
    const geometryFront = new CylinderGeometry(
      RESIZE_CYLINDER_R,
      RESIZE_CYLINDER_R,
      d / 2,
      32
    );
    const materialFront = new MeshBasicMaterial({
      color: 0x549beb,
      depthFunc: AlwaysDepth,
    });
    this.cylinderFront = new Mesh(geometryFront, materialFront);
    this.cylinderFront.name = 'resize_system_front';
    this.cylinderFront.translateZ(d / 4);
    this.cylinderFront.rotateX(Math.PI / 2);

    const geometry_circle_front = new SphereGeometry(RESIZE_CIRCLE_R);
    const material_circle_front = new MeshBasicMaterial({
      color: 0x549beb,
      depthFunc: AlwaysDepth,
    });
    this.circle_front = new Mesh(geometry_circle_front, material_circle_front);
    this.circle_front.name = 'resize_system_front_circle';
    this.circle_front.translateZ(d / 2);

    // 组合 方便统一控制
    this.lineMesh = new Mesh();
    this.lineMesh.name = 'resizeSystem';
    this.lineMesh.renderOrder = TOP_RENDER_ORDER;
    this.lineMesh.add(this.cylinderRight);
    this.lineMesh.add(this.circle_right);
    this.lineMesh.add(this.cylinderUp);
    this.lineMesh.add(this.circle_up);

    if (d !== 0) {
      // 有的几何体  不需要 d 的控制条  :圆锥 圆柱..
      this.lineMesh.add(this.cylinderFront);
      this.lineMesh.add(this.circle_front);
    }

    // 将控制器 移到底面 此时的中心点 就是几何体的底部中心点
    this.lineMesh.translateY(-h / 2);
  }

  /** 根据传入的几何体尺寸 生成并挂载 resize 控制器 */
  registerControl(obj: CommonGeo) {
    const { width, height, depth,totalScaleX,totalScaleY,totalScaleZ } = obj;
    this.w = width;
    this.h = height;
    this.d = depth;
    this.initResize();
    this.lineMesh && this.resizeGroup.add(this.lineMesh);
    this.resizeGroup.renderOrder = TOP_RENDER_ORDER + 1;
    obj.originGroup?.add(this.resizeGroup);

    // 获取物体最新的缩放比 更新
    this.totalScaleX = totalScaleX;
    this.totalScaleY = totalScaleY;
    this.totalScaleZ = totalScaleZ;
    this.updateSize(resizeDir.right,0)
    this.updateSize(resizeDir.front,0)
  }

  /** 销毁指定对象的 控制器 */
  destroyControl(obj: CommonGeo) {
    obj.originGroup?.remove(this.resizeGroup);
    this.lineMesh && this.resizeGroup.remove(this.lineMesh);
    this.destoryMesh();
    this.lineMesh = null;
    this.totalScaleX = 1;
    this.totalScaleY = 1;
    this.totalScaleZ = 1;
  }

  onPointerdown(event: PointerEvent, customEvent: customEvent): void {
    const [x, y] = converCoordinateTo3D(
      customEvent.x,
      customEvent.y,
      this.renderLayer.width,
      this.renderLayer.height
    );
    const targerObjArr = [
      this.resizeGroup,
      this.renderLayer.geoBase.originGroup,
    ];
    const resObj = getObjByPoint(x, y, this.renderLayer.camera, targerObjArr);

    if (resObj) {
      // 点击到了 立方体 查找是否点击 控制条
      const stripObj = resObj.filter((obj) => {
        if (obj.object.name.includes('resize_system')) {
          // 有点击到 resize 控制条
          return true;
        } else {
          return false;
        }
      });

      if (stripObj.length) {
        this.downpoint.push(x, y);
        const name = stripObj[0].object.name;
        if (name.includes('up')) {
          this.resizeDir = resizeDir.up;
        } else if (name.includes('right')) {
          this.resizeDir = resizeDir.right;
        } else {
          this.resizeDir = resizeDir.front;
        }
      }
    } else {
      this.renderLayer.geoBase.showFrame()
      this.resizeDir = resizeDir.none;
    }
  }

  onPointermove(event: PointerEvent, customEvent: customEvent): void {
    if (this.resizeDir === resizeDir.none) return;
    const [x, y] = converCoordinateTo3D(
      customEvent.x,
      customEvent.y,
      this.renderLayer.width,
      this.renderLayer.height
    );
    const pointPos = getPointOfFloor(
      this.downpoint[0],
      this.downpoint[1],
      this.renderLayer.camera,
      this.renderLayer.floorPlank
    );
    const pointPos2 = getPointOfFloor(
      x,
      y,
      this.renderLayer.camera,
      this.renderLayer.floorPlank
    );
    const geoXOZ = new Vector2(pointPos.x, pointPos.z);
    const moveXOZ = new Vector2(pointPos2.x, pointPos2.z);
    let distance = 0;
    if (this.resizeDir === resizeDir.up) {
      const totalHeight = this.renderLayer.camera.position.y;
      const cameraXOZ = new Vector2(
        this.renderLayer.camera.position.x,
        this.renderLayer.camera.position.z
      );
      const dir = cameraXOZ.clone().normalize();
      const moveValue = moveXOZ.clone().sub(geoXOZ).dot(dir);
      const ratio = moveValue / cameraXOZ.length();
      distance = -ratio * totalHeight;
    } else if (this.resizeDir === resizeDir.right) {
      const dir = new Vector2(1, 0);
      distance = moveXOZ.clone().sub(geoXOZ).dot(dir);
    } else {
      const dir = new Vector2(0, 1);
      distance = moveXOZ.clone().sub(geoXOZ).dot(dir);
    }
    this.renderLayer.geoBase.resizeGeo(this.resizeDir, distance * 2);
    this.updateSize(this.resizeDir, distance * 2);
  }

  onPointerup(event: PointerEvent, customEvent: customEvent): void {
    this.resizeDir = resizeDir.none;
    this.downpoint = [];
    this.renderLayer.geoBase.resizeGeoEnd();
    this.unifyScale();
  }

  /**
   * 需要抵消物体的缩放，保证控制器内部的所有元素显示效果不变
   */
  updateSize(dir: string, distance: number) {
    this.scaleCircle(dir, distance);
    this.scaleCylinder(dir, distance);
  }

  // 缩放圆点  -- 不论选择哪个方向缩放，都需要重置控制点的大小
  scaleCircle(dir: string, distance: number) {
    const { totalScaleX, totalScaleY, totalScaleZ } = this;
    switch (dir) {
      case resizeDir.up:
        const scaleY = totalScaleY + distance / this.h;
        this.circle_up.scale.set(1 / totalScaleX, 1 / scaleY, 1 / totalScaleZ);
        this.circle_right.scale.set(
          1 / totalScaleX,
          1 / scaleY,
          1 / totalScaleZ
        );
        this.circle_front.scale.set(
          1 / totalScaleX,
          1 / scaleY,
          1 / totalScaleZ
        );
        break;
      case resizeDir.right:
        const scaleX = totalScaleX + distance / this.w;
        this.circle_up.scale.set(1 / scaleX, 1 / totalScaleY, 1 / totalScaleZ);
        this.circle_right.scale.set(
          1 / scaleX,
          1 / totalScaleY,
          1 / totalScaleZ
        );
        this.circle_front.scale.set(
          1 / scaleX,
          1 / totalScaleY,
          1 / totalScaleZ
        );
        break;
      case resizeDir.front:
        const scaleZ = totalScaleZ + distance / this.d;
        this.circle_up.scale.set(1 / totalScaleX, 1 / totalScaleY, 1 / scaleZ);
        this.circle_right.scale.set(
          1 / totalScaleX,
          1 / totalScaleY,
          1 / scaleZ
        );
        this.circle_front.scale.set(
          1 / totalScaleX,
          1 / totalScaleY,
          1 / scaleZ
        );
        break;
    }
  }

  /**
   * 缩放三根控制条：
   * 这里需要注意：由于在生成圆柱体时，进行了旋转操作，所以在设置缩放比时
   * 需要按照旋转前的方向设置!!
   * @param dir
   * @param distance
   */
  scaleCylinder(dir: string, distance: number) {
    const { totalScaleX, totalScaleY, totalScaleZ } = this;
    switch (dir) {
      case resizeDir.up:
        const scaleY = totalScaleY + distance / this.h;
        this.cylinderRight.scale.set(1 / scaleY, 1, 1 / totalScaleZ);
        this.cylinderFront.scale.set(1 / totalScaleX, 1, 1 / scaleY);
        break;
      case resizeDir.right:
        const scaleX = totalScaleX + distance / this.w;
        this.cylinderUp.scale.set(1 / scaleX, 1, 1 / totalScaleZ);
        this.cylinderFront.scale.set(1 / scaleX, 1, 1 / totalScaleY);
        break;
      case resizeDir.front:
        const scaleZ = totalScaleZ + distance / this.d;
        this.cylinderRight.scale.set(1 / totalScaleY, 1, 1 / scaleZ);
        this.cylinderUp.scale.set(1 / totalScaleX, 1, 1 / scaleZ);
    }
  }

  /**
   * 缩放结束后，需要同步缩放值
   * 由于是控制多个几何体的缩放，所以要记录每个几何体的缩放信息。。。
   */
  unifyScale() {
    this.totalScaleX = this.renderLayer.geoBase.geoObj.totalScaleX;
    this.totalScaleY = this.renderLayer.geoBase.geoObj.totalScaleY;
    this.totalScaleZ = this.renderLayer.geoBase.geoObj.totalScaleZ;
  }

  // 根据传来的值 再次生成resize 控制器
  setResizeByOutSize(outSize: any) {
    const { width, height, depth } = outSize;
    this.w = width;
    this.h = height;
    this.d = depth;

    // 先将之前的resize 移除
    this.lineMesh && this.resizeGroup.remove(this.lineMesh);
    this.destoryMesh();
    this.lineMesh = null;
    this.initResize();
    this.lineMesh && this.resizeGroup.add(this.lineMesh);
  }

  // 销毁lineMesh以及后代对象
  destoryMesh() {
    this.lineMesh &&
      this.lineMesh.traverse((obj: any) => {
        obj.geometry.dispose();
        obj.material.dispose();
      });
  }
}
export { ResizeControl };