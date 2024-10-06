import {
  Mesh,
  BufferGeometry,
  LineBasicMaterial,
  LineSegments,
  Line,
  CircleGeometry,
  EdgesGeometry,
  Vector3,
  Vector2,
  Group,
  MeshStandardMaterial,
  DoubleSide,
  CylinderGeometry,
  NeverDepth,
  LessEqualDepth,
  Matrix4,
  Color,
  BufferAttribute,
  LineDashedMaterial,
  OrthographicCamera,
  TypedArray,
  MeshBasicMaterial,
  Quaternion,
  Euler,
  MathUtils,
  Plane,
  PlaneHelper,
  Object3D,
  Object3DEventMap,
  AxesHelper,
} from 'three';
import { CommonGeo } from '../geo/CommonGeo';
// 圆柱体特有的变量
import {
  CIRCLE_TOP_LINE,
  CIRCLE_BOTTOM_LINE,
  DEFAULT_RADIUS,
  DEFAULT_HEIGHT,
  MIN_SIZE_H,
} from './const/cylinderConst';

// 全局变量
import {
  DASH_SIZE,
  GAP_SIZE,
  LINE_INIT_COLOR,
  LINE_DASH_INIT_COLOR,
  DEFAULT_STRETCH,
  UPDATE_RESIZE_CONTROL,
  UN_UPDATE_RESIZE_CONTROL,
} from '../threeSystem/const';
import { ThreeLayer } from '../ThreeLayer';
import { createBufferLine } from '../utils';

/* 圆柱和圆锥 基本架构都一样  复制过来的 */
export class Cylinder extends CommonGeo {
  // 圆柱半径
  radius: number = 0;
  // 分段数
  segments: number = 64;
  // 底部线框的几何体
  bottom_geo: null | CircleGeometry = null;
  // 底部线框几何体的  线框
  bottom_edges: null | EdgesGeometry = null;
  bottom_lineSegments: null | LineSegments = null;
  // 底部线框的组  -- 里面包含了底部的圆 和 侧面的线
  bottom_group!: Group;
  // 圆柱侧面的几何体和线
  side_geo: null | BufferGeometry = null;
  side_line: null | LineSegments = null;
  // 圆柱竖直的几何体和线
  vertical_geo: null | BufferGeometry = null;
  vertical_line: null | LineSegments = null;
  rotate_x!: number;
  top_geo!: CircleGeometry;
  top_lineSegments!: LineSegments;
  lineMesh!: Mesh;
  downPoint: Vector3 = new Vector3();
  upPoint: Vector3 = new Vector3();
  dirHeight: number = 0;
  middlePlaneHelper: Object3D<Object3DEventMap> | null = null;
  middlePlane: Plane | null = null;

  // 生成圆柱几何体的侧边
  threeSideLine: Mesh | null = null;
  posMatrix: Matrix4 = new Matrix4();
  newX: Vector3 = new Vector3(-1, 0, 0);
  oldRotateMatrix: Matrix4 = new Matrix4();
  flagZ: number = 0;
  rotateInfo: Quaternion | null = null;
  constructor(renderLayer: ThreeLayer) {
    super(renderLayer);
    this.getRotate(this.camera);
  }
  // 获取相机的旋转信息   轴信息  -- 弧度表示
  getRotate(camera: OrthographicCamera) {
    this.rotate_x = camera.rotation.x;
  }

  // 绘制底部线框
  drawBottom(startPoint: Vector3, endPoint: Vector3) {
    this.downPoint.copy(startPoint);
    this.upPoint.copy(endPoint);
    const p_1 = new Vector2(startPoint.x, startPoint.z);
    const p_2 = new Vector2(endPoint.x, endPoint.z);
    this.radius = p_2.sub(p_1).length();

    if (!this.bottom_geo) {
      // 首次创建
      this.bottom_geo = new CircleGeometry(this.radius, this.segments);
      this.bottom_edges = new EdgesGeometry(this.bottom_geo);
      const lineMaterial = new LineBasicMaterial({ color: '#fff' });
      this.bottom_lineSegments = new LineSegments(
        this.bottom_edges,
        lineMaterial
      );

      // 创建一个组 将线框统一管理
      this.bottom_group = new Group();
      this.bottom_group.name = 'bottomLine';
      // 先将之后更新高度要用到的线 添加到组里面,
      this.stretchBottomThree();
      this.bottom_group.add(this.side_line as LineSegments);
      this.bottom_group.add(this.vertical_line as LineSegments);
      this.bottom_group.add(this.bottom_lineSegments);

      // 设置圆形的位置 由  XOY 平面 旋转到XOZ 平面
      this.bottom_group.position.y = startPoint.y;
      this.bottom_group.position.x = startPoint.x;
      this.bottom_group.position.z = startPoint.z;
      this.bottom_group.rotateX(Math.PI / 2);
      this.bottom_group.rotateZ(this.rotate_x - 0.1);
    } else {
      // 更新 半径
      this.bottom_geo.dispose();
      this.bottom_lineSegments!.geometry.dispose();
      this.bottom_geo = new CircleGeometry(this.radius, this.segments);
      this.bottom_edges = new EdgesGeometry(this.bottom_geo);
      this.bottom_lineSegments!.geometry = this.bottom_edges;
    }
    return this.bottom_group;
  }

  /**
   * 根据高度 更新圆柱线框的高度
   * @param {*} startPoint
   * @param {*} movePoint
   */
  stretchBottomThree(height?: number) {
    if (height) {
      this.height = height;
    }
    const material = new LineBasicMaterial({
      color: 0xffffff,
    });

    // 根据传入高度 动态变化的点
    const controlPoint = new Vector3(0, 0, -this.height); // 这里要取负   之前旋转过

    // 构建侧面的四条边
    const points = [];
    points.push(new Vector3(this.radius, 0, -this.height));
    points.push(new Vector3(this.radius, 0, 0));

    points.push(new Vector3(-this.radius, 0, -this.height));
    points.push(new Vector3(-this.radius, 0, 0));

    points.push(new Vector3(0, this.radius, -this.height));
    points.push(new Vector3(0, this.radius, 0));

    points.push(new Vector3(0, -this.radius, -this.height));
    points.push(new Vector3(0, -this.radius, 0));

    if (!this.side_geo) {
      this.side_geo = new BufferGeometry().setFromPoints(points);
      this.side_line = new LineSegments(this.side_geo, material);

      // 首次添加 不可见 只有在 高度变化时  才会显示出来
      this.side_line.visible = false;
    } else {
      this.side_geo.setFromPoints(points);
    }

    // 中间的绿色线
    const material2 = new LineBasicMaterial({
      color: '#67c255',
    });
    const points2 = [controlPoint, new Vector3(0, 0, 0)];
    if (!this.vertical_geo) {
      this.vertical_geo = new BufferGeometry().setFromPoints(points2);
      this.vertical_line = new LineSegments(this.vertical_geo, material2);
      this.vertical_line.visible = false;
    } else {
      this.vertical_geo.setFromPoints(points2);
    }

    if (height) {
      // 传入点开始点 说明当前正在绘制高度 显示侧边线框
      this.vertical_line!.visible = true;
      this.side_line!.visible = true;

      // 此时需要绘制顶部圆形
      if (!this.top_geo) {
        this.top_geo = new CircleGeometry(this.radius, this.segments);
        const topEdges = new EdgesGeometry(this.top_geo);
        const lineMaterial = new LineBasicMaterial({ color: '#fff' });
        this.top_lineSegments = new LineSegments(topEdges, lineMaterial);
        this.bottom_group.add(this.top_lineSegments);
      } else {
        this.top_lineSegments.position.z = -this.height;
      }
    }
  }

  // 根据之前绘制的三维线框 在画布原点绘制一个几何体
  createGeo() {
    if (Math.abs(this.height) < MIN_SIZE_H) {
      this.dirHeight = 0;
      this.height = MIN_SIZE_H;
    } else {
      this.dirHeight = this.height;
      this.height = Math.abs(this.height);
    }
    return this.buildGeoBySize();
  }

  /**
   *在原点处  生成一个默认的几何体
   * @param {boolean} isDefauleHeight 是否启用 设置默认的拉伸高度  不启用，所有的尺寸都是默认的 启用 高度值是默认的
   * @returns
   */
  createDefaultGeo(startPoint: Vector3, endPoint: Vector3) { 
    this.downPoint.copy(startPoint);
    this.upPoint.copy(endPoint);
    this.radius =  DEFAULT_RADIUS;
    this.height =  DEFAULT_HEIGHT;
    return this.buildGeoBySize();
  }

  buildGeoBySize(matrix?: any, metaData?: any) {
    // 创建圆柱
    const geometry = new CylinderGeometry(
      this.radius,
      this.radius,
      this.height,
      64
    );
    const materilaArrSource = this.buildMaterial(metaData);
    this.realGeo = new Mesh(geometry, materilaArrSource);
    this.realGeo.name = 'cylinder';

    // 创建线框  -- 圆锥 圆柱 需要特殊处理...
    const edges = new EdgesGeometry(geometry, 9);
    this.lineMesh = this.converLine(edges);
    // 组合
    this.originGroup = new Group();
    this.originGroup.add(this.realGeo);
    this.originGroup.add(this.lineMesh);
    this.originGroup.name = 'cylinderBox';
    this.transformGeo(matrix);
    this.createMiddlePlane();
    return this.originGroup;
  }

  buildMaterial(metaData?: any) {
    const materilaArrSource = [];
    if (metaData) {
      for (let i = 0; i < metaData.materials.length; i++) {
        if (metaData.materials[i].type !== 'MeshStandardMaterial') continue;
        const color = new Color(metaData.materials[i].color).getHexString();
        // 在遍历材质时，需要将已近有颜色的面 记录下来
        const depthFunc = metaData.materials[i].depthFunc;
        if (depthFunc !== NeverDepth) {
          this.alreadyChangeIndexs.set(i, '#' + color);
        }
        const m = new MeshStandardMaterial({
          color: '#' + color,
          side: DoubleSide,
          depthFunc: depthFunc === NeverDepth ? NeverDepth : LessEqualDepth,
          polygonOffset: true,
          polygonOffsetFactor: 1,
          polygonOffsetUnits: 4,
        });
        materilaArrSource.push(m);
      }
    } else {
      for (let i = 0; i < 3; i++) {
        const m = new MeshStandardMaterial({
          color: 0xffff00,
          side: DoubleSide,
          depthFunc: NeverDepth, // 默认是不渲染的  只有在 填充颜色后 才会渲染
          polygonOffset: true,
          polygonOffsetFactor: 1,
          polygonOffsetUnits: 4,
        });
        materilaArrSource.push(m);
      }
    }

    return materilaArrSource;
  }

  /**
   * 构建一个平行于 XOZ的平面
   */
  createMiddlePlane() {
    this.middlePlane = new Plane(new Vector3(0, 1, 0));
    const quaternion = new Quaternion();
    this.originGroup?.matrix.clone().decompose(new Vector3(), quaternion, new Vector3());
    const rotateMatrix = new Matrix4().makeRotationFromQuaternion(quaternion);
    this.middlePlane.applyMatrix4(rotateMatrix);
    // this.middlePlaneHelper = new PlaneHelper(this.middlePlane,2,0xffff00)
    // this.renderLayer.scene.add(this.middlePlaneHelper)
  }

  // 将边缘线框  转为普通的线框 使用 bufferGeomrty
  converLine(edges: EdgesGeometry) {
    // 获取所有顶点
    const vertices = edges.attributes.position.array;
    const circle_1 = vertices.slice(0, vertices.length / 2);

    // 两条侧边   -- 对于侧边 需要应用相机的变化
    const material2 = new LineBasicMaterial({ color: LINE_INIT_COLOR });

    const points1 = [
      new Vector3(this.radius, -this.height / 2, 0),
      new Vector3(this.radius, this.height / 2, 0),
    ];
    const points2 = [
      new Vector3(-this.radius, -this.height / 2, 0),
      new Vector3(-this.radius, this.height / 2, 0),
    ];

    const geo3 = new BufferGeometry().setFromPoints(points1);
    const side1 = new Line(geo3, material2);
    const geo4 = new BufferGeometry().setFromPoints(points2);
    const side2 = new Line(geo4, material2);
    // 保存侧边的组
    const sideMesh = new Mesh();
    sideMesh.add(side1);
    sideMesh.add(side2);
    // 保存上下两个圆形的组
    const circles = this.searchDash(circle_1);
    // 保存整个线框的组
    const lineMesh = new Mesh();
    lineMesh.add(sideMesh);
    lineMesh.add(circles);
    return lineMesh;
  }

  // 寻找虚线  -- 这里的思路是 ：将圆 分为两个圆弧绘制 根据条件 让某个圆弧的材质变为虚线
  searchDash(vertices: TypedArray) {
    const halfCircle = vertices.slice(0, vertices.length / 2);
    const halfCircleOther = vertices.slice(vertices.length / 2);
    const material1 = new LineBasicMaterial({
      color: LINE_INIT_COLOR,
    });
    const material2 = new LineBasicMaterial({
      color: LINE_INIT_COLOR,
    });
    // const halfGeo = new
    const halfGeo = new BufferGeometry();
    halfGeo.setAttribute('position', new BufferAttribute(halfCircle, 3));
    const line1 = new Line(halfGeo, material1);
    line1.computeLineDistances();

    const halfGeoOther = new BufferGeometry();
    halfGeoOther.setAttribute(
      'position',
      new BufferAttribute(halfCircleOther, 3)
    );
    const line2 = new Line(halfGeoOther, material2);
    line2.computeLineDistances();

    const circle = new Mesh();
    circle.name = CIRCLE_TOP_LINE;
    circle.add(line1, line2);

    // 将圆 旋转90°  让两个圆弧 从 x 轴开始绘制
    circle.rotateY(Math.PI / 2);

    const cirlce2 = circle.clone();
    cirlce2.name = CIRCLE_BOTTOM_LINE;
    cirlce2.translateY(-this.height);
    const childMesh = cirlce2.children[0] as Mesh;
    if (!(childMesh.material instanceof Array)) {
      childMesh.material.dispose();
    }
    childMesh.material = new LineDashedMaterial({
      color: LINE_DASH_INIT_COLOR,
      linewidth: 1,
      scale: 1,
      dashSize: DASH_SIZE,
      gapSize: GAP_SIZE,
    });

    const circlesMesh = new Mesh();
    circlesMesh.add(circle, cirlce2);
    return circlesMesh;
  }

  // 根据落点信息 将几何体移到绘制的位置上 默认插入到原点
  transformGeo(matrix?: any) {
    if (matrix) {
      this.originGroup?.applyMatrix4(matrix);
    } else {
      const deltaX = this.downPoint.x;
      const deltaZ = this.downPoint.z;
      const posMatrix = new Matrix4().makeTranslation(
        deltaX,
        this.dirHeight / 2,
        deltaZ
      );
      this.originGroup?.applyMatrix4(posMatrix);
      this.posMatrix?.copy(posMatrix);
    }
  }

  // 旋转时，同步更新几何体的边界线 以及 虚线
  updateDash(quaternion: Quaternion, plane: Plane) {
    /** 先计算在世界坐标系下，两个平面的交点坐标 **/
    // 先将旋转量同步到平面上
    const rotateMatrix = new Matrix4().makeRotationFromQuaternion(quaternion);
    this.middlePlane!.applyMatrix4(rotateMatrix);
    // 计算出两个平面的交点坐标
    const originCenter = this.calcIntersectionDir(plane);

    // 物体本身的旋转矩阵  -- 这里通过解构矩阵的方式 获取旋转量
    // 之前的  setFromRotationMatrix 在物体发生缩放时，会出现旋转量不正确的问题
    const modelQuaternion = new Quaternion();
    this.originGroup?.matrix.clone().decompose(new Vector3(), modelQuaternion, new Vector3());

    this.updateSidePos(originCenter, modelQuaternion);
    this.updateDashPos(modelQuaternion);
  }

  /**
   * 通过交点 和 物体的旋转量，计算要让圆柱体侧边保持相对不变的旋转量
   * 主要思路是：将物体坐标再次变换到 Y轴 和世界坐标同向的位置
   * 然后，再计算当前交点的位置 绕Y轴的旋转量，
   * 应用这个旋转量的逆，就可以让物体再Y轴方向上保持相对不动
   * @param originCenter     交点坐标 世界坐标位
   * @param modelQuaternion  物体本身的旋转量
   */
  updateSidePos(originCenter: Vector3, modelQuaternion: Quaternion) {
    const matrixInvert = modelQuaternion.clone().invert();
    const XOZpoint = originCenter.clone().applyQuaternion(matrixInvert);
    const { x, z } = XOZpoint;
    // Math.atan2() 返回从原点 (0,0) 到 (x,y) 点的线段与 x 轴正方向之间的平面角度 (弧度值)，也就是 Math.atan2(y,x)
    // 这里 Math.atan2(z, -x) 使用-ｘ是由于默认的交点方向是X的负方向
    const rad = Math.atan2(z, -x);
    // 这个计算的视线方向，是相对于模型坐标系而言的，所以需要旋转回去
    const matrixRotateInvert = this.oldRotateMatrix.invert();
    this.oldRotateMatrix = new Matrix4().makeRotationY(rad);
    this.lineMesh.applyMatrix4(matrixRotateInvert);
    this.lineMesh.applyMatrix4(this.oldRotateMatrix);
  }

  /**
   * 计算本地坐标系的Y轴 与视线方向的夹角值，得出当前物体相对视点的位置
   * 如果方向基本相同，那么正对视点，虚线就在下方 反之 虚线就在物体的上方
   * @param modelQuaternion
   */
  updateDashPos(modelQuaternion: Quaternion) {
    // 计算本地坐标系的Y轴 和视线的夹角
    const eyeDir = this.camera.position.clone();
    const dir = new Vector3(0, 1, 0).applyQuaternion(modelQuaternion);
    const dotValue = eyeDir.dot(dir);
    const toplineMesh = this.lineMesh.getObjectByName(CIRCLE_TOP_LINE);
    const bottomlineMesh = this.lineMesh.getObjectByName(CIRCLE_BOTTOM_LINE);
    // 根据相机的位置  动态切换显示的虚线
    let cancelDashObj;
    let setDashObj;
    const flagPos = Math.sign(dotValue);
    if (flagPos > 0) {
      // 俯视 取消虚线的是 bottom
      cancelDashObj = toplineMesh;
      setDashObj = bottomlineMesh;
    } else {
      cancelDashObj = bottomlineMesh;
      setDashObj = toplineMesh;
    }
    const childMeshCancel = cancelDashObj?.children[0] as Line;
    const childMeshDash = setDashObj?.children[0] as Line;

    // 检测 需要取消虚线的边框  是否为虚线  如果不是 那么不用做任何操作
    if (childMeshCancel.material instanceof LineDashedMaterial) {
      // 需要将虚线显示在bottom
      childMeshCancel.material.dispose();
      childMeshCancel.material = new LineBasicMaterial({
        color: LINE_INIT_COLOR,
      });

      (childMeshDash.material as MeshBasicMaterial).dispose();
      childMeshDash.material = new LineDashedMaterial({
        color: LINE_DASH_INIT_COLOR,
        linewidth: 1,
        scale: 1,
        dashSize: DASH_SIZE / this.totalScaleX,
        gapSize: GAP_SIZE / this.totalScaleX,
      });
    }
  }
  // 计算当前视线的垂面 与 平行于模型坐标系XOZ平面的交点 以及方向
  // 这里的交点一定是世界坐标的圆心，两个面都经过原点，所以只需要知道方向即可
  calcIntersectionDir(plane: Plane) {
    // 计算交线方向
    const direction = new Vector3();
    // 计算交线的方向向量
    direction.crossVectors(plane.normal, this.middlePlane!.normal);
    return direction.normalize();
  }

  /**
   * 获取圆锥 计算最小包围盒所需的所有顶点数据
   * @returns {Array} 返回所有顶点
   */
  setCicleMinBoxPoint() {
    // 创建圆柱
    const geometry = new CylinderGeometry(
      this.radius * this.totalScaleX,
      this.radius * this.totalScaleX,
      this.height * this.totalScaleY,
      64
    );
    const circlePoints = geometry.attributes.position.array;
    return [circlePoints];
  }

  // 圆柱体的最小包围盒 通过遍历几何体所有的顶点计算得出
  getMinSize() {
    const geometry = new CylinderGeometry(
      this.radius,
      this.radius,
      this.height,
      64
    );
    geometry.applyMatrix4(this.originGroup!.matrixWorld);
    const circlePoints = geometry.attributes.position
      .array as unknown as number[];
    return [circlePoints];
  }

  // 更新原点处几何体的尺寸
  updateOriginGeo(resizeDir: string, distance: number) {
    const { totalScaleX, totalScaleY, totalScaleZ } = this;
    if (resizeDir === 'up') {
      const newValue = totalScaleY + distance / this.height;
      if (newValue < DEFAULT_STRETCH) {
        return UN_UPDATE_RESIZE_CONTROL;
      }
      this.originGroup!.scale.set(totalScaleX, newValue, totalScaleZ);
    } else if (resizeDir === 'right') {
      const newValue = totalScaleX + distance / this.radius / 2;
      if (newValue < DEFAULT_STRETCH) {
        return UN_UPDATE_RESIZE_CONTROL;
      }
      this.originGroup!.scale.set(
        newValue, // b对于半径 需要做 /2
        totalScaleY,
        newValue
      );
      this.setDashStyle(newValue);
    }
    return UPDATE_RESIZE_CONTROL;
  }

  // resize 时 更新虚线样式
  setDashStyle(scaleValue: number) {
    // 圆柱的虚线 只需要考虑圆弧的情况
    const modelQuaternion = new Quaternion();
    this.originGroup?.matrix.clone().decompose(new Vector3(), modelQuaternion, new Vector3());
    const eyeDir = this.camera.position.clone();
    const dir = new Vector3(0, 1, 0).applyQuaternion(modelQuaternion);
    const dotValue = eyeDir.dot(dir);
    // 根据相机的位置  动态切换显示的虚线
    const flagPos = Math.sign(dotValue);
    const toplineMesh = this.lineMesh.getObjectByName(CIRCLE_TOP_LINE);
    const bottomlineMesh = this.lineMesh.getObjectByName(CIRCLE_BOTTOM_LINE);
    let updateStyleObj;
    if (flagPos > 0) {
      // 俯视 需要更新底部的虚线
      updateStyleObj = bottomlineMesh;
    } else {
      updateStyleObj = toplineMesh;
    }
    // 更新
    const updateLine = updateStyleObj!.children[0] as Line;
    (updateLine.material as LineDashedMaterial).dashSize =
      DASH_SIZE / scaleValue;
    (updateLine.material as LineDashedMaterial).gapSize = GAP_SIZE / scaleValue;
  }

  saveOutSize(): void {
    const scale = this.originGroup!.scale;
    this.totalScaleX = scale.x;
    this.totalScaleY = scale.y;
    this.totalScaleZ = scale.z;
  }

  helpTest() {
    const modelQuaternion = new Quaternion().setFromRotationMatrix(
      this.originGroup?.matrix.clone() as Matrix4
    );
    const position = new Vector3();
    const quaternion = new Quaternion();
    const scale = new Vector3();
    this.originGroup?.matrix.clone().decompose(position, quaternion, scale);
    const xAxis = new Vector3(0, 1, 0).applyQuaternion(quaternion);
    const pos = this.originGroup?.position?.clone() as Vector3;
    xAxis.add(pos);
    const line = new BufferGeometry().setFromPoints([pos, xAxis]);
    const material2 = new LineBasicMaterial({
      color: 'red',
    });
    const lineMesh = new LineSegments(line, material2);
    this.renderLayer.scene.add(lineMesh);

    console.log(modelQuaternion.normalize(), quaternion.normalize(), 'quaternion');
  }
  scaleTotalByValue(value: number): void {
    const { totalScaleX, totalScaleY, totalScaleZ } = this;
    const newScaleX = totalScaleX * (1 + value);
    const newScaleY = totalScaleY * (1 + value);
    const newScaleZ = totalScaleZ * (1 + value);
    this.originGroup!.scale.set(newScaleX, newScaleY, newScaleZ);
    this.setDashStyle(newScaleX);
  }
  scaleTotalByValueEnd(): void {
    const scale = this.originGroup!.scale;
    this.totalScaleX = scale.x;
    this.totalScaleY = scale.y;
    this.totalScaleZ = scale.z;
  }
  parseData(obj: any, metaData: any): Group<Object3DEventMap> {
    const { radiusTop, height } = obj.children[0].geometry.parameters;
    this.radius = radiusTop;
    this.height = height;
    return this.buildGeoBySize(obj.matrix, metaData);
  }
}
