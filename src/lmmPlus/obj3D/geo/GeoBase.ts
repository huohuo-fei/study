import { customEvent, eventType } from '../../driver';
import { ThreeLayer } from '../ThreeLayer';
import { Cube } from '../compontent/cube';
import { createPoint } from '../utils/point';
import { converCoordinateTo3D, getPointOfFloor } from '../utils';
import { Group, Mesh, Vector3, Points, Quaternion } from 'three';
import { CommonGeo } from './CommonGeo';
import { Receiver } from '../../driver/Receiver';
import { Vector2 } from '../../math/Vector2';

/**
 * 统领当前激活的几何体，保存着几何体的实例对象 ，用于分发各种对几何体的操作
 */
export class GeoBase extends Receiver {
  // 当前激活的几何体  -- 后续为数组形式  支持多个几何体
  geoObj: CommonGeo;
  // 是否处于绘制模式  -- 只有在绘制底部线框以及拉伸高度时，为true
  isDraw: boolean = false;
  // 是否处于绘制底部线框模式
  isBottom: boolean = true;
  // 渲染层  -- 用于获取three 相关的方法
  renderLayer: ThreeLayer;
  // 绘制底部线框的起始点位  -- 是世界坐标
  bottomPointStart: Vector3 = new Vector3();
  // 拉伸开始的 XOY 平面的坐标
  stretchPointStart: number[] = [];
  // 线框实例  在生成几何体后需要销毁
  bottomLine: Group | null = null;
  // 几何体实例 -- 后续要扩充为数组  同时有多个几何体
  originGroup!: Group;
  // 两个圆点
  pointMesh1: Points | null = null;
  pointMesh2: Points | null = null;
  constructor(renderLayer: ThreeLayer) {
    super();
    this.geoObj = new Cube(renderLayer);
    // renderLayer.scene.add(this.geoObj.geoInstance)
    this.renderLayer = renderLayer;
  }

  onPointerdown(event: PointerEvent, customEvent: customEvent): void {
    if (this.isDraw) {
      this.isDraw = false;
      this.isBottom = true;
      this.createGeo();
      return;
    }
    if (customEvent.eventType === eventType.draw3D) {
      this.isDraw = true;
    } else {
      this.isDraw = false;
    }
    if (this.isDraw && this.isBottom) {
      const [x, y] = converCoordinateTo3D(
        customEvent.x,
        customEvent.y,
        this.renderLayer.width,
        this.renderLayer.height
      );
      const pointPos = getPointOfFloor(
        x,
        y,
        this.renderLayer.camera,
        this.renderLayer.floorPlank
      );
      this.bottomPointStart.copy(pointPos);
      const pointMesh = createPoint(
        x,
        y,
        this.renderLayer.camera,
        this.renderLayer.floorPlank
      );
      this.pointMesh1 = pointMesh;
      this.renderLayer.scene.add(pointMesh);
    }
  }
  onPointermove(event: PointerEvent, customEvent: customEvent): void {
    if (!this.isDraw) return;
    const [x, y] = converCoordinateTo3D(
      customEvent.x,
      customEvent.y,
      this.renderLayer.width,
      this.renderLayer.height
    );
    if (this.isBottom) {
      // 绘制底面线框
      const pointPos = getPointOfFloor(
        x,
        y,
        this.renderLayer.camera,
        this.renderLayer.floorPlank
      );
      this.drawBottomLine(this.bottomPointStart, pointPos);
    } else {
      // 拉伸底面线框
      this.drawStretchLine([x, y]);
    }
  }
  onPointerup(event: PointerEvent, customEvent: customEvent): void {
    if (!this.isDraw) return;

    if (this.isBottom) {
      this.isBottom = false;
      const [x, y] = converCoordinateTo3D(
        customEvent.x,
        customEvent.y,
        this.renderLayer.width,
        this.renderLayer.height
      );
      this.stretchPointStart.push(x, y);
      const pointMesh = createPoint(
        x,
        y,
        this.renderLayer.camera,
        this.renderLayer.floorPlank
      );
      this.pointMesh2 = pointMesh;
      this.renderLayer.scene.add(pointMesh);
    }
  }

  drawBottomLine(startPoint: Vector3, endPoint: Vector3) {
    const bottomLine = this.geoObj.drawBottom(startPoint, endPoint);
    if (!this.bottomLine) {
      this.renderLayer.scene.add(bottomLine!);
      this.bottomLine = bottomLine;
    }
  }
  drawStretchLine(movePoint: [number, number]) {
    const pointPos = getPointOfFloor(
      this.stretchPointStart[0],
      this.stretchPointStart[1],
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
    const totalHeight = this.renderLayer.camera.position.y
    const cameraXOZ = new Vector2(this.renderLayer.camera.position.x,this.renderLayer.camera.position.z)
    const geoXOZ = new Vector2(pointPos.x,pointPos.z)
    const moveXOZ = new Vector2(pointPos2.x,pointPos2.z)
    const dir = cameraXOZ.clone().normalize()
    const moveValue = moveXOZ.clone().sub(geoXOZ).dot(dir)
    const ratio = moveValue/ (cameraXOZ.length())
    const height = -ratio * totalHeight 
    this.geoObj.stretchBottomThree(height);
  }
  createGeo() {
    this.originGroup = this.geoObj.createGeo();
    this.originGroup && this.renderLayer.scene.add(this.originGroup);
    // this.originGroup.add(this.renderLayer.resizeCon.resizeGroup);
    this.renderLayer.resizeCon.registerControl(this.geoObj)
    this.renderLayer.baseLayer.changeMode(eventType.resize3D);
    this.removeObj();
  }

  // 旋转几何体 并更新相应的虚线
  rotateGeo(quaternion: Quaternion) {
    this.originGroup!.applyQuaternion(quaternion);
    this.geoObj.updateDash();
  }
  resizeGeo(dir:string,distance:number){
    this.geoObj.updateOriginGeo(dir,distance)
  }
  resizeGeoEnd(){
    this.geoObj.saveOutSize()
  }
  // 销毁内存中的对象
  destroyObj(obj: any) {
    obj.traverse((obj: any) => {
      if (obj.isGroup) {
        // 如果时 group 需要遍历
        for (let i = 0; i < obj.children.length; i++) {
          this.destroyObj(obj.children[i]);
        }
      } else {
        obj.geometry.dispose();

        // 销毁材质  材质可能是由数组组成 需要做一层判断
        if (obj.material instanceof Array) {
          for (let m of obj.material) {
            m.dispose();
          }
        } else {
          obj.material.dispose();
        }
      }
    });
  }

  removeObj() {
    this.destroyObj(this.bottomLine);
    this.destroyObj(this.pointMesh1);
    this.destroyObj(this.pointMesh2);
    this.renderLayer.scene.remove(this.pointMesh1 as Points);
    this.renderLayer.scene.remove(this.pointMesh2 as Points);
    this.renderLayer.scene.remove(this.bottomLine as Group);
    this.bottomPointStart = new Vector3();
    this.bottomLine = null;
    this.pointMesh1 = null;
    this.pointMesh2 = null;
  }
}
