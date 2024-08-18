import {
  AlwaysDepth,
  MeshBasicMaterial,
  Mesh,
  SphereGeometry,
  CylinderGeometry,
  Group,
} from "three";
import {
  TOP_RENDER_ORDER,
  RESIZE_CYLINDER_R,
  RESIZE_CIRCLE_R,
} from "./const";

class ResizeControl {
  w: number;
  h: number;
  d: number;
  totalDistanceX: number;
  totalDistanceY: number;
  totalDistanceZ: number;
  perDisY: number;
  resizeGroup: Group;
  lineMesh: Mesh | null;
  cylinderUp!: Mesh;
  circle_up!: Mesh;
  cylinderRight!: Mesh;
  circle_right!: Mesh;
  cylinderFront!: Mesh;
  circle_front!: Mesh;
  position!: number[];
  offsetX!: number;
  offsetZ!: number;
  temY!: number;
  constructor(w:number, h:number, d:number) {
    // 保存原始数据
    this.w = w;
    this.h = h;
    this.d = d;

    // 缩放尺寸时 保存  啥的数据来着？？
    this.totalDistanceX = 0;
    this.totalDistanceY = 0;
    this.totalDistanceZ = 0;

    // 这个又是？
    this.perDisY = 0;
    this.resizeGroup = new Group();
    this.lineMesh = null;
    this.initResize();
    this.lineMesh && this.resizeGroup.add(this.lineMesh);
    this.resizeGroup.renderOrder = TOP_RENDER_ORDER + 1
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
    this.cylinderUp.name = "resize_system_up";

    // 圆柱默认是中心对称，现在将控制器组成的 group 的中点移到了几何体底部的中点上，所以需要向上移动 h/2
    this.cylinderUp.translateY(h / 2);

    const geometry_circle_up = new SphereGeometry(RESIZE_CIRCLE_R);
    const material_circle_up = new MeshBasicMaterial({
      color: 0x67c255,
      depthFunc: AlwaysDepth,
    });
    this.circle_up = new Mesh(geometry_circle_up, material_circle_up);
    this.circle_up.name = "resize_system_up_circle";
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
    this.cylinderRight.name = "resize_system_right";

    // 整个长度 是 w / 2 向 x 正方向移动 一半 就是 w / 4
    this.cylinderRight.translateX(w / 4);
    // 默认是竖直方向 需要旋转到 X轴方向
    this.cylinderRight.rotateZ(Math.PI / 2);

    // 记录一个在 X 轴上的 初始位置的偏移量  -- 更新 控制条长度时 需要用到
    this.offsetX = w / 4;

    const geometry_circle_right = new SphereGeometry(RESIZE_CIRCLE_R);
    const material_circle_right = new MeshBasicMaterial({
      color: 0xeb6341,
      depthFunc: AlwaysDepth,
    });
    this.circle_right = new Mesh(geometry_circle_right, material_circle_right);
    this.circle_right.name = "resize_system_right_circle";
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
    this.cylinderFront.name = "resize_system_front";
    this.cylinderFront.translateZ(d / 4);
    this.cylinderFront.rotateX(Math.PI / 2);

    this.offsetZ = d / 4;

    const geometry_circle_front = new SphereGeometry(RESIZE_CIRCLE_R);
    const material_circle_front = new MeshBasicMaterial({
      color: 0x549beb,
      depthFunc: AlwaysDepth,
    });
    this.circle_front = new Mesh(geometry_circle_front, material_circle_front);
    this.circle_front.name = "resize_system_front_circle";
    this.circle_front.translateZ(d / 2);

    // 组合 方便统一控制
    this.lineMesh = new Mesh();
    this.lineMesh.name = "resizeSystem";
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

    // 保存resize 控制器的初始位置
    this.position = [
      this.lineMesh.position.x,
      this.lineMesh.position.y,
      this.lineMesh.position.z,
    ];
    this.temY = this.lineMesh.position.y;
  }

  /**
   * 更新控制条 主要三步操作：重新生成一个期望长度的圆柱体，重新设置控制点的位置 。。
   * @param {*} resizeDir resize 方向 决定重新设置那个控制条
   * @param {*} distance  每次移动的距离
   */
  update(resizeDir:string, distance:number) {
    if (resizeDir === "up") {
      // 更新UP 方向 整个控制器的原点都会向下移
      const newY = this.position[1] - distance / 2;
      // 新的控制位置
      this.lineMesh!.position.y = newY;
      // 设置圆点的位置
      this.circle_up.position.y = this.h + distance;
      // 新构建 控制条 销毁之前的 geo   TODO renderer.info 查看 如果不销毁geo 会发生什么
      this.cylinderUp.geometry.dispose();
      const newGeo = new CylinderGeometry(
        RESIZE_CYLINDER_R,
        RESIZE_CYLINDER_R,
        this.h + distance,
        32
      );
      newGeo.translate(0, distance / 2 + this.perDisY / 2, 0);
      this.cylinderUp.geometry = newGeo;

      this.temY = newY;
      this.totalDistanceY = distance;
    } else if (resizeDir === "right") {
      const newX = this.w / 2 + distance / 2;
      this.circle_right.position.x = newX;
      this.cylinderRight.geometry.dispose();
      const newGeo = new CylinderGeometry(
        RESIZE_CYLINDER_R,
        RESIZE_CYLINDER_R,
        newX,
        32
      ); // new CylinderGeometry(0.005, 0.005, this.w + distance, 32);
      newGeo.translate(0, this.offsetX - newX / 2, 0); // offset 是初始位置的偏移量
      this.cylinderRight.geometry = newGeo;

      this.totalDistanceX = distance;
    } else {
      const newZ = this.d / 2 + distance / 2;
      this.circle_front.position.z = newZ;
      this.cylinderFront.geometry.dispose();
      const newGeo = new CylinderGeometry(
        RESIZE_CYLINDER_R,
        RESIZE_CYLINDER_R,
        newZ,
        32
      );
      newGeo.translate(0, newZ / 2 - this.offsetZ, 0);
      this.cylinderFront.geometry = newGeo;
      this.totalDistanceZ = distance;
    }
  }

  updateSize() {
    // up
    this.lineMesh!.position.y = this.temY;
    this.position[1] = this.temY;
    this.perDisY += this.totalDistanceY;
    this.h += this.totalDistanceY;

    // right
    this.w += this.totalDistanceX;

    // front
    this.d += this.totalDistanceZ;

    this.totalDistanceX = 0;
    this.totalDistanceY = 0;
    this.totalDistanceZ = 0;
  }

  // 根据传来的值 再次生成resize 控制器
  setResizeByOutSize(outSize:any) {
    const { width, height, depth } = outSize;
    this.w = width;
    this.h = height;
    this.d = depth;
    this.perDisY = 0

    // 先将之前的resize 移除
    this.lineMesh && this.resizeGroup.remove(this.lineMesh);
    this.destoryMesh()
    this.lineMesh = null;
    this.initResize();
    this.lineMesh &&  this.resizeGroup.add(this.lineMesh);
  }

  // 销毁lineMesh以及后代对象
  destoryMesh() {
    this.lineMesh && this.lineMesh.traverse((obj:any) => {
      obj.geometry.dispose()
      obj.material.dispose()
    });
  }
}
export { ResizeControl };
