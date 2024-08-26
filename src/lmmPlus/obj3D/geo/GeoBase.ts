import {  eventType } from '../../driver';
import { ThreeLayer } from '../ThreeLayer';
import { Cube } from '../compontent/cube';
import {  getPointOfFloor,destroyObj } from '../utils';
import { Group, Mesh, Vector3, Points, Quaternion } from 'three';
import { CommonGeo } from './CommonGeo';
import { Receiver } from '../../driver/Receiver';
import { Vector2 } from '../../math/Vector2';

/**
 * 统领当前激活的几何体，保存着几何体的实例对象 ，用于分发各种对几何体的操作
 */
export class GeoBase  {
  // 当前激活的几何体  -- 后续为数组形式  支持多个几何体
  geoObj: CommonGeo;
  // 渲染层  -- 用于获取three 相关的方法
  renderLayer: ThreeLayer;
  // 线框实例  在生成几何体后需要销毁
  bottomLine: Group | null = null;
  // 几何体实例 -- 后续要扩充为数组  同时有多个几何体
  originGroup!: Group;
  constructor(renderLayer: ThreeLayer) {
    this.geoObj = new Cube(renderLayer);
    this.renderLayer = renderLayer;
  }

  drawBottomLine(startPoint: Vector3, endPoint: Vector3) {
    const bottomLine = this.geoObj.drawBottom(startPoint, endPoint);
    if (!this.bottomLine) {
      this.renderLayer.scene.add(bottomLine!);
      this.bottomLine = bottomLine;
    }
  }
  drawStretchLine(movePoint: [number, number],stretchPointStart:number[]) {
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

  /**
   * fillColor 修改颜色 公共的方法，每个几何体的逻辑都一样，所以写在这一层
   * @param {*} index     面的索引
   * @param {*} color
   * @param {*} pointerType  move | down
   */
  fillGeo(index:number, color:string, pointerType?:string) {
    this.geoObj.fillColorStyle(index, color, pointerType);
  }
  clearColorGeo(){
    this.geoObj.clearColor();
  }
  removeObj() {
    destroyObj(this.bottomLine);
    this.renderLayer.scene.remove(this.bottomLine as Group);
    this.bottomLine = null;
  }
}
