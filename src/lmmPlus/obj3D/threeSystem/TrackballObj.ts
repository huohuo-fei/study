import {
  BufferGeometry,
  Line,
  LineBasicMaterial,
  Matrix4,
  Mesh,
  OrthographicCamera,
  Quaternion,
  Spherical,
  Vector2,
  Vector3,
} from 'three';
import { converCoordinateTo3D, getPointOfFloor } from '../utils';
import { ThreeLayer } from '../ThreeLayer';

export default class TrackballObj  {
  // 按下鼠标的 和 对应的模式
  mouseButtons: Map<any, any> = new Map([
    [0, 'rotate'],
    [2, 'pen'],
  ]);
  // 鼠标落点
  dragStart: Vector2 = new Vector2(0, 0);
  // 鼠标操作结束点
  dragEnd: Vector2 = new Vector2(0, 0);
  // 鼠标模式 pen 移动 rotate 旋转  -- 目前只需要实现旋转轨道
  state: string = 'none';
  // 旋转轨道需要使用到的球坐标
  spherical: Spherical = new Spherical();
  // 正交相机
  camera: OrthographicCamera;
  // 相机看向的目标点
  target: Vector3 = new Vector3(0, 0, 0);
  // 缩放系数 滚轮事件  -- 目前不需要
  zoomScale: number = 0.95;
  // 位移轨道  -- 不需要实现
  panOffset: Vector3 = new Vector3();
  // 旋转方向 -- 轨迹球 不需要考虑这个参数
  rotateDir: string = 'xy';
  // 事件代理对象，worker 中没有DOM 模拟部分属性和方法
  proxyElementEvent: any;
  // 投影视图
  pvMatrix: Matrix4 = new Matrix4();
  // 控制轨道变化后 触发的事件
  emitControlChange: (() => void) | undefined;
  pi2: number = Math.PI * 2;
  quaternion: Quaternion = new Quaternion();
  cameraQuatern: Quaternion = new Quaternion();
  rotateAxis: Vector3 | null | undefined;
  floorPlank: Mesh;
  fixAxis: string = 'none'; // axis_y axis_x axis_z
  objMatrix: Matrix4 | null = null;
  objPosition: Vector3 | null = null;
  layer: ThreeLayer;

  constructor({
    camera,
    target,
    floorPlank,
    proxyElementEvent,
    layer,
  }: {
    camera: OrthographicCamera;
    target: Vector3;
    proxyElementEvent: any;
    floorPlank: Mesh;
    layer: ThreeLayer;
  }) {
    this.camera = camera;
    this.target = target;
    this.proxyElementEvent = proxyElementEvent;
    this.floorPlank = floorPlank;
    this.layer = layer;
    this.updateSpherical();
    // this.update();
  }
  updateSpherical() {
    const { spherical, camera, target } = this;
    spherical.setFromVector3(camera.position.clone().sub(target));
  }
  pointerdown(
    pointX: number,
    PointY: number,
    fixAxis?: string,
    modeMatrix?: Matrix4,
    objPosition?: Vector3
  ) {
    const { dragStart, dragEnd, mouseButtons } = this;
    dragStart.set(pointX, PointY);
    dragEnd.set(pointX, PointY);

    // 鼠标事件就是 旋转
    this.state = mouseButtons.get(0);
    if (fixAxis) {
      this.fixAxis = fixAxis;
    }
    if (modeMatrix) {
      this.objMatrix = modeMatrix.clone();
    }
    if (objPosition) {
      this.objPosition = objPosition.clone();
      // this.helpLine();
    }
  }
  pointermove(PointX: number, PointY: number) {
    const { dragStart, dragEnd } = this;
    dragEnd.set(PointX, PointY);
    const quaternion = this.rotate(dragEnd.clone().sub(dragStart));
    dragStart.copy(dragEnd); /*  */
    return {quaternion,cameraQuatern:this.cameraQuatern};
  }
  pointerup() {
    this.state = 'none';
    this.fixAxis = 'none';
  }
  rotate2({ x, y }: { x: number; y: number }) {
    const { position } = this.camera;
    const { width, height } = this.proxyElementEvent;
    const { target, dragStart, dragEnd } = this;
    const ratioX = x / width;
    const ratioY = y / height;
    /* 计算旋转角度 */
    // 基于高度的 x 位置比，用于旋转量的计算
    // 这步操作是为了让 在 x 轴 y 轴移动同样的像素 旋转同样的角度
    const ratioXBaseHeight = x / width;
    const ratioLen = new Vector2(ratioXBaseHeight, ratioY).length();

    // 旋转量 -- 通过 对角占比系数 乘上 一圈的弧度 => 变为旋转量
    const angle = ratioLen * this.pi2;

    // 寻找旋转轴
    const eyeDir = target.clone().sub(position).normalize();

    const [x1, y1] = converCoordinateTo3D(
      dragStart.x,
      dragStart.y,
      width,
      height
    );
    const p1 = new Vector3(x1, 0.5, y1);
    const [x2, y2] = converCoordinateTo3D(dragEnd.x, dragEnd.y, width, height);
    const p2 = new Vector3(x2, 0.5, y2);
    const moveDir = p1.sub(p2).normalize();
    // const moveDir = new Vector3(x,y,0.5).normalize()
    const axis = eyeDir.cross(moveDir);
    this.quaternion.setFromAxisAngle(axis, angle);
    return this.quaternion;
  }
  // 轨迹球旋转
  rotate({ x, y }: { x: number; y: number }) {
    const { right, left, top, bottom, matrix, position } = this.camera;
    const { width: clientWidth, height: clientHeight } = this.proxyElementEvent;

    // 相机宽高
    const cameraW = right - left;
    const cameraH = top - bottom;

    // 鼠标位移距离在画布中的占比
    const ratioX = x / clientWidth;
    const ratioY = -y / clientHeight;

    /* 计算旋转角度 */
    // 基于高度的 x 位置比，用于旋转量的计算
    // 这步操作是为了让 在 x 轴 y 轴移动同样的像素 旋转同样的角度
    const ratioXBaseHeight = x / clientHeight;
    // 位移量 -- 这里记录的是比例 的长度
    // 可以理解为 将x y 轴的移动，统一到一个边长为clientHeight的正方形中，然后根据三角形长度 求这个正方形的对角长度占比
    const ratioLen = new Vector2(ratioXBaseHeight, ratioY).length();

    // 旋转量 -- 通过 对角占比系数 乘上 一圈的弧度 => 变为旋转量
    const angle = ratioLen * this.pi2;

    /* 计算旋转轴 */
    // 在相机世界中的位移距离
    const distanceLeft = ratioX * cameraW;
    const distanceUp = ratioY * cameraH;

    // 相机本地坐标系 x y 轴
    const mx = new Vector3().setFromMatrixColumn(matrix, 0);
    const my = new Vector3().setFromMatrixColumn(matrix, 1);

    // 将鼠标在相机世界的 X Y 轴的位移量 转为世界坐标位
    // 这个操作 就是将相机位的基向量做拉伸 ？？不太理解
    const vx = mx.clone().multiplyScalar(distanceLeft);
    const vy = my.clone().multiplyScalar(distanceUp);

    // 计算鼠标的移动方向 x 轴 -- 归一化 仅仅代表方向
    const moveDir = vx.clone().add(vy).normalize();

    // 计算目标点到视点方向 z 轴 视线方向是 -z 轴
    const eyeDir = this.camera.position.clone().sub(this.target).normalize();

    // 叉乘 计算出旋转轴 旋转轴是 视线方向 和 位移方向的叉乘
    // 这里计算的叉乘方向 属于是负负得正了
    let axis = eyeDir.clone().cross(moveDir);
    if(this.fixAxis !== 'none'){
      // 指定旋转轴 
      let fixRotateAsix = null
      if(this.fixAxis === 'axis_x'){
        fixRotateAsix= new Vector3(1, 0, 0).applyMatrix4(this.objMatrix as Matrix4);
      }else if(this.fixAxis === 'axis_y'){
        fixRotateAsix= new Vector3(0, 1, 0).applyMatrix4(this.objMatrix as Matrix4);
      }else{
        fixRotateAsix= new Vector3(0,0, 1).applyMatrix4(this.objMatrix as Matrix4);
      }

      // 再计算当前的旋转轴 和指定的旋转轴是否同向
      const dirY = fixRotateAsix.sub(this.objPosition as Vector3);
      const v = dirY.clone().dot(axis);
      if (v > 0) {
        axis.copy(dirY);
      } else {
        axis.copy(dirY.multiplyScalar(-1));
      }

    }
    this.quaternion.setFromAxisAngle(axis.normalize(), angle);
    this.cameraQuatern.setFromAxisAngle(axis.normalize().multiplyScalar(-1), angle);
    // this.update()
    return this.quaternion;
  }

  update() {
    const { camera, target, spherical, panOffset } = this;
    //基于平移量平移相机
    // target.add(panOffset);
    // camera.position.add(panOffset);

    //旋转视线
    const rotateOffset = camera.position
      .clone()
      .sub(target)
      .applyQuaternion(this.quaternion);

    //基于最新视线设置相机位置
    camera.position.copy(target.clone().add(rotateOffset));
    //旋转相机上方向
    camera.up.applyQuaternion(this.quaternion);

    //更新投影视图矩阵
    camera.lookAt(target);
    camera.updateMatrixWorld(true);

    //重置旋转量和平移量
    // spherical.setFromVector3(camera.position.clone().sub(target));
    panOffset.set(0, 0, 0);
    this.quaternion.setFromRotationMatrix(new Matrix4());
  }

  getPvMatrix() {
    const {
      camera: { projectionMatrix, matrixWorldInverse },
    } = this;
    return this.pvMatrix.multiplyMatrices(projectionMatrix, matrixWorldInverse);
  }

  // 辅助线
  helpLine() {
    const { objPosition } = this;
    const objY = new Vector3(0, 1, 0).applyMatrix4(this.objMatrix as Matrix4);
    const material = new LineBasicMaterial({
      color: 0xff0000,
    });

    const points = [];
    points.push(objPosition as Vector3);
    points.push(objY);
    const geometry = new BufferGeometry().setFromPoints(points);
    const line = new Line(geometry, material);
    this.layer.scene.add(line);
  }
}
