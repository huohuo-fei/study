import {
  Mesh,
  BufferGeometry,
  LineBasicMaterial,
  LineSegments,
  Line,
  CircleGeometry,
  EdgesGeometry,
  Vector3,
  ConeGeometry,
  Vector2,
  Group,
  MeshStandardMaterial,
  DoubleSide,
  Matrix4,
  NeverDepth,
  LessEqualDepth,
  Color,
  BufferAttribute,
  LineDashedMaterial,
  Path,
  OrthographicCamera,
} from "three";
import { CommonGeo } from "../geo/CommonGeo";
// 全局变量
import {
  DASH_SIZE,
  GAP_SIZE,
  LINE_INIT_COLOR,
  LINE_DASH_INIT_COLOR,
  DEFAULT_STRETCH,
  UPDATE_RESIZE_CONTROL,
  UN_UPDATE_RESIZE_CONTROL,
} from "../threeSystem/const";

// 圆锥特有的变量
import { DEFAULT_RADIUS, DEFAULT_HEIGHT } from './const/coneConst'
import { ThreeLayer } from "../ThreeLayer";

// export class Cone extends CommonGeo {
//   radius: number = 0;
//   segments: number = 64;
//   bottom_geo: null | CircleGeometry = null;
//   bottom_edges: null | EdgesGeometry = null;
//   bottom_lineSegments: null | LineSegments = null;
//   bottom_group: null | Group = null;
//   side_geo: null | BufferGeometry = null;
//   side_line: null | LineSegments = null;
//   vertical_geo: null | BufferGeometry = null;
//   vertical_line: null | LineSegments = null;
//   helperCircleMatrix: Matrix4 = new Matrix4();
//   sideRotateOne: Matrix4 = new Matrix4();
//   sideRotateTwo: Matrix4 = new Matrix4();
//   rotate_x!: number;
//   rotate_y!: number;
//   top_point!: Vector3;
//   sideMesh!: Mesh;
//   sideRotate!: Matrix4;
//   theatCircleValue!: number;
//   bottomCircleLine!: Mesh;

//   constructor(renderLayer:ThreeLayer){
//     super(renderLayer)
//     this.getRotate(this.camera)
//   }

//   // 获取相机的旋转信息   轴信息  -- 弧度表示
//   getRotate(camera: OrthographicCamera) {
//     this.rotate_x = camera.rotation.x;
//     const { x, y, z } = camera.position;
//     this.rotate_y = Math.atan2(x, z);
//     this.rotate_x = Math.atan2(y, z);
//   }

//   // 绘制底部线框
//   drawBottom(
//     startPoint: Vector3, endPoint: Vector3
//   ) {

//     const p_1 = new Vector2(startPoint.x, startPoint.z);
//     const p_2 = new Vector2(endPoint.x, endPoint.z);
//     this.radius = p_2.sub(p_1).length();

//     if (!this.bottom_geo) {
//       // 首次创建
//       this.bottom_geo = new CircleGeometry(this.radius, this.segments);
//       this.bottom_edges = new EdgesGeometry(this.bottom_geo);
//       const lineMaterial = new LineBasicMaterial({ color: "#fff" });
//       this.bottom_lineSegments = new LineSegments(
//         this.bottom_edges,
//         lineMaterial
//       );

//       // 创建一个组 将线框统一管理
//       this.bottom_group = new Group();
//       this.bottom_group.name = "bottomLine";
//       // 先将之后更新高度要用到的线 添加到组里面,
//       this.stretchBottomThree();
//       this.bottom_group.add(this.side_line as LineSegments);
//       this.bottom_group.add(this.vertical_line as LineSegments);
//       this.bottom_group.add(this.bottom_lineSegments);

//       // 设置圆形的位置 由  XOY 平面 旋转到XOZ 平面
//       this.bottom_group.position.y = startPoint.y;
//       this.bottom_group.position.x = startPoint.x;
//       this.bottom_group.position.z = startPoint.z;
//       this.bottom_group.rotateX(Math.PI / 2);
//     } else {
//       // 更新 半径
//       this.bottom_geo.dispose();
//       this.bottom_lineSegments!.geometry.dispose();
//       this.bottom_geo = new CircleGeometry(this.radius, this.segments);
//       this.bottom_edges = new EdgesGeometry(this.bottom_geo);
//       this.bottom_lineSegments!.geometry = this.bottom_edges;
//     }
//     return this.bottom_group;
//   }

//   /**
//    * 根据高度 更新圆锥线框的高度
//    * @param {*} startPoint
//    * @param {*} movePoint
//    */
//   stretchBottomThree(height?:number) {
//     if (height) {
//       this.height = height;
//     }
//     const material = new LineBasicMaterial({
//       color: 0xffffff,
//     });

//     // 根据传入高度 动态变化的点
//     const controlPoint = new Vector3(0, 0, -this.height); // 这里要取负   之前旋转过

//     // 构建侧面的四条边
//     const points = [];
//     points.push(controlPoint);
//     points.push(new Vector3(this.radius, 0, 0));

//     points.push(controlPoint);
//     points.push(new Vector3(-this.radius, 0, 0));

//     points.push(controlPoint);
//     points.push(new Vector3(0, this.radius, 0));

//     points.push(controlPoint);
//     points.push(new Vector3(0, -this.radius, 0));

//     if (!this.side_geo) {
//       this.side_geo = new BufferGeometry().setFromPoints(points);
//       this.side_line = new LineSegments(this.side_geo, material);

//       // 首次添加 不可见 只有在 高度变化时  才会显示出来
//       this.side_line.visible = false;
//     } else {
//       this.side_geo.setFromPoints(points);
//     }

//     // 中间的绿色线
//     const material2 = new LineBasicMaterial({
//       color: "#67c255",
//     });
//     const points2 = [controlPoint, new Vector3(0, 0, 0)];
//     if (!this.vertical_geo) {
//       this.vertical_geo = new BufferGeometry().setFromPoints(points2);
//       this.vertical_line = new LineSegments(this.vertical_geo, material2);
//       this.vertical_line.visible = false;
//     } else {
//       this.vertical_geo.setFromPoints(points2);
//     }

//     if (height) {
//       // 传入点开始点 说明当前正在绘制高度 显示侧边线框
//       this.vertical_line!.visible = true;
//       this.side_line!.visible = true;
//     }
//   }

//   createGeo(){
//     this.height = Math.abs(this.height);
//     return this.buildGeoBySize();
//   }

//   // 创建一个默认的圆锥
//   createDefaultGeo(startPoint: Vector3, endPoint: Vector3) {
//     this.radius = true ? this.radius : DEFAULT_RADIUS;
//     this.height = true ? DEFAULT_STRETCH : DEFAULT_HEIGHT;
//     return this.buildGeoBySize();
//   }

//   buildGeoBySize() {
//     this.top_point = new Vector3(0, this.height / 2, 0);
//     // 创建圆锥
//     const geometry = new ConeGeometry(this.radius, this.height, 64);
//     // 需要给每个面设置不同的material -- 为了后期单独给面
//     const materilaArrSource = [];
//     for (let i = 2; i >= 0; i--) {
//       const m = new MeshStandardMaterial({
//         color: 0xffff00,
//         side: DoubleSide,
//         depthFunc: NeverDepth, // 默认是不渲染的  只有在 填充颜色后 才会渲染
//         polygonOffset: true,
//         polygonOffsetFactor: 1,
//         polygonOffsetUnits: 4,
//       });
//       materilaArrSource.push(m);
//     }
//     this.realGeo = new Mesh(geometry, materilaArrSource);
//     this.realGeo.name = "cone";

//     // 创建线框  -- 圆锥 圆柱 需要特殊处理...
//     const edges = new EdgesGeometry(geometry, 10);
//     const lineMesh = this.converLine(edges);
//     // 组合
//     this.originGroup = new Group();
//     this.originGroup.add(this.realGeo);
//     this.originGroup.add(lineMesh);
//     this.originGroup.name = "coneBox";
//     return this.originGroup;
//   }

//   // 将边缘线框  转为普通的线框 使用 bufferGeomrty
//   converLine(edges: EdgesGeometry) {
//     // 获取所有顶点
//     const vertices = edges.attributes.position.array;
//     // 底部的圆
//     const geo1 = new BufferGeometry();
//     geo1.setAttribute("position", new BufferAttribute(vertices, 3));

//     // 两条侧边   -- 对于侧边 需要应用相机的变化  -- 保证一直正对相机
//     const material2 = new LineBasicMaterial({ color: LINE_INIT_COLOR });

//     const points1 = [
//       new Vector3(this.radius, -this.height / 2, 0),
//       new Vector3(0, this.height / 2, 0),
//     ];
//     const points2 = [
//       new Vector3(-this.radius, -this.height / 2, 0),
//       new Vector3(0, this.height / 2, 0),
//     ];

//     const geo3 = new BufferGeometry().setFromPoints(points1);
//     const side1 = new Line(geo3, material2);

//     const geo4 = new BufferGeometry().setFromPoints(points2);
//     const side2 = new Line(geo4, material2);

//     // 保存侧边的网格
//     this.sideMesh = new Mesh();

//     // 将相机的变化，应用于侧边 目的是 让侧边两条线 一直紧贴边界
//     const rotateMatrixY = new Matrix4().makeRotationY(this.rotate_y);
//     this.sideRotate = new Matrix4().multiply(rotateMatrixY);
//     // this.sideMesh.applyMatrix4(this.sideRotate); // hf_ 20:51

//     this.sideMesh.applyMatrix4(this.sideRotate);
//     this.sideMesh.name = "cylinderSide";
//     this.sideMesh.add(side1);
//     this.sideMesh.add(side2);

//     const lineMesh = new Mesh();
//     // lineMesh.add(line1);
//     lineMesh.add(this.sideMesh);

//     // 这里需要调一下 根据相机位置 更新线框的方法
//     this.updateSideByEuler(this.camera);
//     const bottomLineDash = this.setDash();
//     this.sideMesh.add(bottomLineDash);

//     return lineMesh;
//   }

//   // 设置底面圆的虚线
//   setDash() {
//     // 获取 实线的起始角度
//     const angle1 = Math.PI / 2 - this.theatCircleValue;
//     const startAngle = angle1 + this.theatCircleValue * 2;
//     const botomPath = new Path().arc(0, 0, this.radius, startAngle, angle1);
//     const points = botomPath.getPoints(50);
//     const geometry = new BufferGeometry();
//     geometry.setFromPoints(points);
//     const material = new LineBasicMaterial({
//       color: LINE_INIT_COLOR,
//     });
//     // 实线
//     const solidLine = new Line(geometry, material);

//     // 虚线
//     const dashPath = new Path().arc(
//       0,
//       0,
//       this.radius,
//       startAngle,
//       angle1,
//       true
//     );
//     const dashPoints = dashPath.getPoints(50);
//     const geoDash = new BufferGeometry().setFromPoints(dashPoints);
//     const mateDash = new LineDashedMaterial({
//       color: LINE_DASH_INIT_COLOR,
//       linewidth: 1,
//       scale: 1,
//       dashSize: DASH_SIZE,
//       gapSize: GAP_SIZE,
//     });

//     const dashLine = new Line(geoDash, mateDash);
//     dashLine.computeLineDistances();

//     this.bottomCircleLine = new Mesh();
//     this.bottomCircleLine.add(solidLine, dashLine);
//     this.bottomCircleLine.rotateX(-Math.PI / 2);
//     this.bottomCircleLine.translateZ(-this.height / 2);
//     this.updateDash();

//     // 获取
//     return this.bottomCircleLine;
//   }

//   // 更新虚线
//   updateDash() {
//     // 需要更新实线和虚线
//     // 角度信息
//     let angle1 = Math.PI / 2 - this.theatCircleValue;
//     let startAngle = angle1 + this.theatCircleValue * 2;

//     // 设置一个是否绘制虚线的标志
//     const upFalg = this.height > 0 && this.camera.position.y < 0;
//     const downFalg = this.height < 0 && this.camera.position.y > 0;
//     const isNotDrawDash = this.theatCircleValue === 0 || upFalg || downFalg;
//     if (isNotDrawDash) {
//       startAngle = 0;
//       angle1 = Math.PI * 2;
//     }

//     // 实线
//     const solidPath = new Path().arc(0, 0, this.radius, startAngle, angle1);
//     const solidPoints = solidPath.getPoints(50);
//     const childrenMesh = this.bottomCircleLine.children[0] as Line;
//     childrenMesh.geometry.dispose();
//     childrenMesh.geometry = new BufferGeometry().setFromPoints(solidPoints);

//     // 虚线  如果是相切不绘制
//     if (isNotDrawDash) {
//       this.bottomCircleLine.children[1].visible = false;
//       return;
//     }
//     const dashPath = new Path().arc(
//       0,
//       0,
//       this.radius,
//       startAngle,
//       angle1,
//       true
//     );
//     const dashPoints = dashPath.getPoints(50);
//     const childrenMeshTwo = this.bottomCircleLine.children[1] as Line;
//     childrenMeshTwo.visible = true;
//     childrenMeshTwo.geometry.dispose();
//     childrenMeshTwo.geometry = new BufferGeometry().setFromPoints(dashPoints);
//     childrenMeshTwo.computeLineDistances();
//   }

//   // 更新侧边线框
//   updateSideByEuler(camera: OrthographicCamera) {
//     const { x, y, z } = camera.position;
//     const rotateY = Math.atan2(x, z);

//     // 先将侧边线 旋转到正对相机的位置
//     const invertMatrix = this.sideRotate.clone().invert();
//     this.sideRotate = new Matrix4().makeRotationY(rotateY);
//     this.sideMesh.applyMatrix4(invertMatrix);
//     this.sideMesh.applyMatrix4(this.sideRotate);

//     // 计算投影到 圆锥底面的点
//     // 相机和原点之间的距离
//     const p = Math.sqrt(x * x + z * z);
//     // 相机和圆锥地面的高度
//     const H = y + (this.height * this.totalScaleY) / 2;
//     // 圆锥的高度
//     const h = this.height * this.totalScaleY;
//     // H / h = L / l   L = l + p
//     const r = H / h;
//     const l = p / (r - 1);
//     // 计算圆心角度的 cos 值
//     const cosTheatCircle = (this.radius * this.totalScaleX) / l;
//     if (Math.abs(cosTheatCircle) >= 1) {
//       // 这里就不存在切点，将边框线隐藏
//       this.sideMesh.children[0].visible = false;
//       this.sideMesh.children[1].visible = false;
//       this.theatCircleValue = Math.acos(1);
//       this.bottomCircleLine && this.updateDash();
//       return;
//     }
//     this.sideMesh.children[0].visible = true;
//     this.sideMesh.children[1].visible = true;
//     this.theatCircleValue = Math.acos(cosTheatCircle);
//     // 计算侧边线需要旋转的角度
//     const resRad = Math.PI / 2 - this.theatCircleValue;
//     // 开始旋转 侧边 ~~~
//     const sideclone = (this.sideMesh.children[0] as Line).geometry
//       .getAttribute("position")
//       .clone();
//     const sideclone2 = (this.sideMesh.children[1] as Line).geometry
//       .getAttribute("position")
//       .clone();
//     const oneInvert = this.sideRotateOne.invert();
//     const oneInvert2 = this.sideRotateTwo.invert();
//     this.sideRotateOne = new Matrix4().makeRotationY(resRad);
//     this.sideRotateTwo = new Matrix4().makeRotationY(-resRad);
//     sideclone.applyMatrix4(oneInvert);
//     sideclone.applyMatrix4(this.sideRotateOne);
//     sideclone2.applyMatrix4(oneInvert2);
//     sideclone2.applyMatrix4(this.sideRotateTwo);
//     (this.sideMesh.children[0] as Line).geometry.setAttribute(
//       "position",
//       sideclone
//     );
//     (this.sideMesh.children[1] as Line).geometry.setAttribute(
//       "position",
//       sideclone2
//     );

//     if (this.bottomCircleLine) {
//       // 如果存在底面圆弧 就要更新
//       this.updateDash();
//     }
//   }
//   /**
//    * 获取圆锥 计算最小包围盒所需的所有顶点数据
//    * @returns {Array} 返回所有顶点
//    */
//   setCicleMinBoxPoint() {
//     // 将圆锥底部的圆弧 和顶部的顶点坐标都返回出去
//     this.top_point = new Vector3(0, (this.height * this.totalScaleY) / 2, 0);
//     // 创建圆锥
//     const geometry = new ConeGeometry(
//       this.radius * this.totalScaleX,
//       this.height * this.totalScaleY,
//       64
//     );
//     const circlePoints = geometry.attributes.position.array;
//     const topPoint = [this.top_point.x, this.top_point.y, this.top_point.z];
//     return [circlePoints, topPoint];
//   }

//   // 更新原点处几何体的尺寸
//   updateOriginGeo(resizeDir: string, distance: number) {
//     const { totalScaleX, totalScaleY, totalScaleZ } = this;
//     if (resizeDir === "up") {
//       const newValue = totalScaleY + distance / this.height;
//       if (newValue < DEFAULT_STRETCH) {
//         return UN_UPDATE_RESIZE_CONTROL;
//       }
//       this.originGroup!.scale.set(totalScaleX, newValue, totalScaleZ);
//     } else if (resizeDir === "right") {
//       const newValue = totalScaleX + distance / this.radius / 2;
//       if (newValue < DEFAULT_STRETCH) {
//         return UN_UPDATE_RESIZE_CONTROL;
//       }
//       this.originGroup!.scale.set(
//         newValue, // b对于半径 需要做 /2
//         totalScaleY,
//         newValue
//       );
//       this.setDashStyle(totalScaleX + distance / this.radius / 2);
//     }
//     return UPDATE_RESIZE_CONTROL;
//   }

//   // 将上一次的变化量 累加起来
//   setOriginGeo() {
//     const scale = this.originGroup!.scale;
//     this.totalScaleX = scale.x;
//     this.totalScaleY = scale.y;
//     this.totalScaleZ = scale.z;

//     // 对于圆锥来说，改变尺寸 意味着改变投影大小，需要在抬起后 重新计算边界线问题
//     this.updateSideByEuler(this.camera);
//   }

//   // 更新底部线框的 实线 / 虚线样式
//   setDashStyle(scaleValue: number) {
//     const childLine = this.bottomCircleLine.children[1] as Line;
//     (childLine.material as LineDashedMaterial).dashSize =
//       DASH_SIZE / scaleValue;
//     (childLine.material as LineDashedMaterial).gapSize = GAP_SIZE / scaleValue;
//   }

//   parseObj(obj: any, metaData: any) {
//     const { radius, height } = obj.children[0].geometry.parameters;
//     this.radius = radius;
//     this.height = height;
//     // 创建圆锥
//     const geometry = new ConeGeometry(this.radius, this.height);

//     // 需要给每个面设置不同的material -- 为了后期单独给面
//     const materilaArrSource = [];
//     for (let i = 0; i < metaData.data.materials.length; i++) {
//       if (metaData.data.materials[i].type !== "MeshStandardMaterial") continue;

//       const color = new Color(metaData.data.materials[i].color).getHexString();
//       // 在遍历材质时，需要将已近有颜色的面 记录下来
//       const depthFunc = metaData.data.materials[i].depthFunc;
//       if (depthFunc !== NeverDepth) {
//         this.alreadyChangeIndexs.set(i, "#" + color);
//       }
//       const m = new MeshStandardMaterial({
//         color: "#" + color,
//         side: DoubleSide,
//         depthFunc: depthFunc === NeverDepth ? NeverDepth : LessEqualDepth,
//         polygonOffset: true,
//         polygonOffsetFactor: 1,
//         polygonOffsetUnits: 4,
//       });
//       materilaArrSource.push(m);
//     }
//     this.realGeo = new Mesh(geometry, materilaArrSource);
//     this.realGeo.name = "cone";

//     // 创建线框  -- 圆锥 圆柱 需要特殊处理...
//     const edges = new EdgesGeometry(geometry, 30);
//     const lineMesh = this.converLine(edges);
//     this.top_point = new Vector3(0, this.height / 2, 0);

//     // 组合
//     this.originGroup = new Group();
//     this.originGroup.add(this.realGeo);
//     this.originGroup.add(lineMesh);
//     this.originGroup.name = "coneBox";
//     this.originGroup.scale.set(obj.scale.x, obj.scale.y, obj.scale.z);
//     this.totalScaleX = obj.scale.x;
//     this.totalScaleY = obj.scale.y;
//     this.totalScaleZ = obj.scale.z;
//     return this.originGroup;
//   }
// }
