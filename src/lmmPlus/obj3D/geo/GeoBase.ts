import { customEvent, eventType } from '../../driver';
import { ThreeLayer } from '../ThreeLayer';
import { Cube } from '../compontent/cube';
import { createPoint } from '../utils/point';
import { converCoordinateTo3D, getPointOfFloor } from '../utils';
import { Group, Mesh, Vector3,Points } from 'three';
import { CommonGeo } from './CommonGeo';

export class GeoBase {
  geoObj: CommonGeo;
  isDraw: boolean = false;
  isBottom: boolean = true;
  renderLayer: ThreeLayer;
  bottomPointStart: Vector3 = new Vector3();
  stretchPointStart: number[] = [];
  bottomLine: Group | null = null;
  originGroup: Group | null = null;;
  pointMesh1: Points|null = null;
  pointMesh2: Points|null = null;
  constructor(renderLayer: ThreeLayer) {
    this.geoObj = new Cube(renderLayer);
    // renderLayer.scene.add(this.geoObj.geoInstance)
    this.renderLayer = renderLayer;
  }

  pointerStart(customEvent: customEvent) {
    if (this.isDraw) {
      this.isDraw = false;
      this.isBottom = true
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
      this.pointMesh1 = pointMesh
      this.renderLayer.scene.add(pointMesh);
    }
  }
  pointerdoing(customEvent: customEvent) {
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
  pointerend(customEvent: customEvent) {
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
      this.pointMesh2 = pointMesh
      this.renderLayer.scene.add(pointMesh);
    }
  }

  drawBottomLine(startPoint: Vector3, endPoint: Vector3) {
    const bottomLine = this.geoObj.drawBottom(startPoint, endPoint);
    if (!this.bottomLine) {
      this.renderLayer.scene.add(bottomLine);
      this.bottomLine = bottomLine;
    }
  }
  drawStretchLine(movePoint: [number, number]) {
    this.geoObj.drawBottomThree(this.stretchPointStart, movePoint);
  }
  createGeo() {
    this.originGroup = this.geoObj.createGeo();
    this.originGroup && this.renderLayer.scene.add(this.originGroup);
    this.originGroup.add(this.renderLayer.rotateControl)
    this.removeObj()
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

  removeObj(){
    this.destroyObj(this.bottomLine)
    this.destroyObj(this.pointMesh1)
    this.destroyObj(this.pointMesh2)
    this.renderLayer.scene.remove(this.pointMesh1 as Points)
    this.renderLayer.scene.remove(this.pointMesh2 as Points)
    this.renderLayer.scene.remove(this.bottomLine as Group)
    this.bottomPointStart = new Vector3()
    this.bottomLine = null
    this.pointMesh1 = null
    this.pointMesh2 = null
  }
}
