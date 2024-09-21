import { eventType } from '../../driver';
import { ThreeLayer } from '../ThreeLayer';
import { Cube } from '../compontent/cube';
import { Cone } from '../compontent/cone';
import { Cylinder } from '../compontent/cylinder';
import {
  getPointOfFloor,
  destroyObj,
  converCanvas,
  createCacheCanvas,
  converCanvas2,
} from '../utils';
import {
  Group,
  Mesh,
  Vector3,
  Points,
  Quaternion,
  ObjectLoader,
  Object3D,
  Matrix4,
  Euler,
  Plane,
  MathUtils,
  PlaneHelper,
  BufferGeometry,
  BufferAttribute,
  ShaderMaterial,
  PointsMaterial,
} from 'three';
import { CommonGeo } from './CommonGeo';
import { Vector2 } from '../../math/Vector2';
import { snapshotType } from '../snapshot';
import { GeoType } from '../renderLayer';

/**
 * 统领当前激活的几何体，保存着几何体的实例对象 ，用于分发各种对几何体的操作
 * 最好做到，所有对几何体的直接操作，都必须由geo来操作
 */
export class GeoBase {
  // 当前激活的几何体  -- 后续为数组形式  支持多个几何体
  geoObj!: CommonGeo;
  // 渲染层  -- 用于获取three 相关的方法
  renderLayer: ThreeLayer;
  // 线框实例  在生成几何体后需要销毁
  bottomLine: Group | null = null;
  // 几何体实例 -- 后续要扩充为数组  同时有多个几何体
  originGroup!: Group;
  geoType: GeoType | null = null;
  oldPos: Vector3 = new Vector3();
  testPlane!: Plane;
  constructor(renderLayer: ThreeLayer) {
    this.renderLayer = renderLayer;
  }

  // 读取当前的类型，只有在实例对象时 需要读取，其余的情况，都使用内部的geotype
  unifyGeoType() {
    this.geoType = this.renderLayer.baseLayer.geoType;
  }

  /**
   * 根据类型 实例化几何体
   * @param type 几何体类型
   */
  setGeoObj(type?: GeoType) {
    if (type) {
      this.geoType = type;
    } else {
      this.unifyGeoType();
    }

    switch (this.geoType) {
      case GeoType.cube:
        this.geoObj = new Cube(this.renderLayer);
        break;
      case GeoType.cone:
        this.geoObj = new Cone(this.renderLayer);
        break;
      case GeoType.cylinder:
        this.geoObj = new Cylinder(this.renderLayer);
        break;
    }
  }

  /**
   * 绘制底面线框
   * @param startPoint
   * @param endPoint
   */
  drawBottomLine(startPoint: Vector3, endPoint: Vector3) {
    if (!this.geoObj) {
      this.setGeoObj();
    }
    const bottomLine = this.geoObj.drawBottom(startPoint, endPoint);
    if (!this.bottomLine) {
      this.renderLayer.scene.add(bottomLine!);
      this.bottomLine = bottomLine;
    }
  }

  /**
   * 拉伸底面线框 形成线框几何体
   * @param movePoint
   * @param stretchPointStart
   */
  drawStretchLine(movePoint: [number, number], stretchPointStart: number[]) {
    const pointPos = getPointOfFloor(
      stretchPointStart[0],
      stretchPointStart[1],
      this.renderLayer.camera,
      this.renderLayer.floorPlank
    );
    const pointPos2 = getPointOfFloor(
      movePoint[0],
      movePoint[1],
      this.renderLayer.camera,
      this.renderLayer.floorPlank
    );
    /* 通过计算在XOZ平面移动的距离 在 视线方向投影到 XOZ平面上向量的点乘
     *  然后与相机的高度做比值，可以将XOZ平面的移动距离 映射到 相机视角中的Y值
     */
    const totalHeight = this.renderLayer.camera.position.y;
    const cameraXOZ = new Vector2(
      this.renderLayer.camera.position.x,
      this.renderLayer.camera.position.z
    );
    const geoXOZ = new Vector2(pointPos.x, pointPos.z);
    const moveXOZ = new Vector2(pointPos2.x, pointPos2.z);
    const dir = cameraXOZ.clone().normalize();
    const moveValue = moveXOZ.clone().sub(geoXOZ).dot(dir);
    const ratio = moveValue / cameraXOZ.length();
    const height = -ratio * totalHeight;
    this.geoObj.stretchBottomThree(height);
  }

  createGeo() {
    this.originGroup = this.geoObj.createGeo();
    this.createCameraPos();
    this.buildGeo();
  }

  // 构造虚拟的相机位置
  createCameraPos() {
    const normalVec = this.renderLayer.camera.position.clone();
    this.testPlane = new Plane(normalVec, normalVec.length());
    const planeHelp = new PlaneHelper(this.testPlane, 3, 0xff0000);
    this.renderLayer.scene.add(planeHelp);
  }

  createDefaultGeo(startPoint: Vector3, endPoint: Vector3) {
    if (!this.geoObj) {
      this.setGeoObj();
    }
    this.originGroup = this.geoObj.createDefaultGeo(startPoint, endPoint);
    this.buildGeo();
  }
  buildGeo() {
    this.originGroup && this.renderLayer.scene.add(this.originGroup);
    this.renderLayer.rotateCon.registerControl(this.geoObj);
    this.renderLayer.baseLayer.onSendSwitchMode(eventType.rotate3D);
    this.removeObj();
    this.renderLayer.baseLayer.onSendActiveObj();
  }

  // 旋转几何体 并更新相应的虚线
  rotateGeo(quaternion: Quaternion, cameraQuatern: Quaternion) {
    this.originGroup!.applyQuaternion(quaternion);
    const m = new Matrix4().makeRotationFromQuaternion(quaternion);
    this.geoObj!.middlePlane.applyMatrix4(m);
    // this.geoObj!.midd、、


    const newP = this.calcDot();
    console.log(newP,this.geoObj.width);
    
    const meshPoint = createPointC(new Vector3(2,0,0))
    this.renderLayer.scene.add(meshPoint);
  }

  calcDot() {
    // 计算交线
    var intersection = new Vector3();
    var direction = new Vector3();

    // 计算交线的方向向量
    direction.crossVectors(
      this.testPlane.normal,
      this.geoObj!.middlePlane.normal
    );

    // 计算交线的点
    intersection
      .crossVectors(this.geoObj!.middlePlane.normal, direction)
      .multiplyScalar(
        this.geoObj!.middlePlane.constant /
          this.geoObj!.middlePlane.normal.dot(this.testPlane.normal)
      );
    return direction;

    // 现在，intersection 是交线的点，direction 是交线的方向向量
  }

  buildDot(){

  }
  resizeGeo(dir: string, distance: number) {
    this.geoObj.updateOriginGeo(dir, distance);
  }
  resizeGeoEnd() {
    this.geoObj.saveOutSize();
  }

  /**
   * 对整个几何体进行缩放
   * @param scaleValue
   */
  scaleAllDir(scaleValue: number) {
    this.geoObj.scaleTotalByValue(scaleValue);
  }
  scaleAllDirEnd() {
    this.geoObj.scaleTotalByValueEnd();
  }

  /** 切换控制器 */
  switchControl(mode: eventType) {
    if (mode === eventType.rotate3D) {
      this.renderLayer.resizeCon.destroyControl(this.geoObj);
      this.renderLayer.rotateCon.registerControl(this.geoObj);
    } else if (mode === eventType.resize3D) {
      this.renderLayer.resizeCon.registerControl(this.geoObj);
      this.renderLayer.rotateCon.destroyControl(this.geoObj);
    } else if (mode === eventType.fill3D) {
      this.renderLayer.rotateCon.destroyControl(this.geoObj);
      this.renderLayer.resizeCon.destroyControl(this.geoObj);
    } else if (mode === eventType.draw3D) {
      if (this.originGroup) {
        this.renderLayer.transformControl.destroyTransformGroup();
        this.convertSnapshot();
      }
    } else if (mode === eventType.select) {
      // 切换为 select 模式 如果当前有几何体 则 输出图片
      if (this.originGroup) {
        this.convertSnapshot();
      }
    }
    this.renderLayer.transformControl.destroyTransformGroup();
  }

  /**
   * fillColor 修改颜色 公共的方法，每个几何体的逻辑都一样，所以写在这一层
   * @param {*} index     面的索引
   * @param {*} color
   * @param {*} pointerType  move | down
   */
  fillGeo(index: number, color: string, pointerType?: string) {
    this.geoObj.fillColorStyle(index, color, pointerType);
  }
  clearColorGeo() {
    this.geoObj.clearColor();
  }
  removeObj() {
    destroyObj(this.bottomLine);
    this.renderLayer.scene.remove(this.bottomLine as Group);
    this.bottomLine = null;
  }

  /** 当前几何体失活 输出一张图片到bgcanvas,并保存几何体的相关信息 */
  convertSnapshot() {
    this.removeControl();
    const circlePointsArr = this.geoObj.getMinSize();
    const minBox = converCanvas(
      circlePointsArr,
      this.renderLayer.camera,
      this.renderLayer.canvas
    ) as [number, number, number, number];
    createCacheCanvas(this.renderLayer.canvas).then((offscreenCanvas) => {
      const snapshotData: snapshotType = {
        minBox,
        resourceCanvas: offscreenCanvas,
        originData: {
          type: this.geoType as GeoType,
          data: this.originGroup.toJSON(),
        },
      };
      this.clearObj();
      this.renderLayer.baseLayer.cacheSnapshot.addSnapshot(snapshotData);
      this.renderLayer.baseLayer.onSendDisActiveObj();
    });
  }

  // 解析数据  重新生成几何体
  parseData(snapshotData: snapshotType) {
    const { originData } = snapshotData;
    this.setGeoObj(originData.type);
    new ObjectLoader().parse(originData.data, (obj: Object3D) => {
      this.originGroup = this.geoObj.parseData(obj, originData.data);
      this.renderLayer.scene.add(this.originGroup);
      this.renderLayer.baseLayer.cacheSnapshot.removeSnapshot(snapshotData);
      this.showFrame();
      this.geoObj.updateDash();
      this.renderLayer.baseLayer.onSendActiveObj();
    });
  }

  /**
   * resize rotate 控制器失活，显示控制框
   */
  showFrame() {
    this.removeControl();
    const circlePointsArr = this.geoObj.getMinSize();
    const minBox = converCanvas2(
      circlePointsArr,
      this.renderLayer.camera,
      this.renderLayer.canvas
    );
    // 检测两个点 与 地板的焦点 并绘制一个矩形框
    this.renderLayer.transformControl.initLineRect(minBox);
    this.renderLayer.baseLayer.onSendSwitchMode(eventType.select);
  }

  // 清空数据
  clearObj() {
    this.renderLayer.scene.remove(this.originGroup);
    destroyObj(this.originGroup);
    this.geoObj = null as unknown as CommonGeo;
    this.originGroup = null as unknown as Group;
  }

  // 移除控制器
  removeControl() {
    this.renderLayer.rotateCon.destroyControl(this.geoObj);
    this.renderLayer.resizeCon.destroyControl(this.geoObj);
    this.renderLayer.render();
  }
}

// 创建点
function createPointC(pos:Vector3) {


  const vertices = new Float32Array([pos.x, pos.y, pos.z]);
  const pointGeometry = new BufferGeometry();
  pointGeometry.setAttribute("position", new BufferAttribute(vertices, 3));

  // 使用自定义着色器 顶点着色器代码
  const vertexShader = `
        void main() {
        // 设置点的位置
        // projectionMatrix 投影矩阵  viewMatrix 视图矩阵
        gl_Position = projectionMatrix* viewMatrix  * vec4( position, 1.0 );
        // 设置点的大小为50像素
        gl_PointSize = 30.0;

        }
    `;
  // 片元着色器代码
  const fragmentShader = `
        void main() {
        // 光栅化片元的颜色 绘制圆形
        if (distance(gl_PointCoord, vec2(0.5, 0.5)) > 0.5) discard;
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
        }
    `;
  // 初始化自定义材质对象
  const material = new ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
  });
  const material2 = new PointsMaterial( { color: 0x888888 } );
  // const pointMesh = new Points(pointGeometry, material2);
  const pointMesh = new Points(pointGeometry, material);

  return pointMesh;
}
