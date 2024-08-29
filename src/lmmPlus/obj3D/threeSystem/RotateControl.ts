import {
  SphereGeometry,
  MeshBasicMaterial,
  Mesh,
  CylinderGeometry,
  Group,
  AlwaysDepth,
  Material,
  NeverDepth,
  Vector3,
  Object3D,
} from 'three';
import {
  TOP_RENDER_ORDER,
  ROTATE_R,
  ROTATE_H,
  ROTATE_BAND_OFFSET,
} from './const';

import { converCoordinateTo3D, getObjByPoint } from '../utils';
import { Receiver } from '../../driver/Receiver';
import { ThreeLayer } from '../ThreeLayer';
import { customEvent } from '../../driver';
import { CommonGeo } from '../geo/CommonGeo';

enum rotateType {
  trackball = 'trackball',
  fixAxis = 'fixAxis',
  none = 'none',
}

class RotateControl extends Receiver {
  // 中间的球体
  sphere!: Mesh;
  // 三条旋转带
  cylinder1!: Mesh;
  cylinder2!: Mesh;
  cylinder3!: Mesh;
  // 整个旋转控制器
  controler!: Group;
  isTrackball: boolean = false;
  renderLayer: ThreeLayer;
  rotateMode: rotateType = rotateType.none;
  constructor(renderLayer: ThreeLayer) {
    super();
    this.renderLayer = renderLayer;
    this.initControl();
  }
  initControl() {
    // 中间的球体
    const sphereGeometry = new SphereGeometry(ROTATE_R);
    const sphereMaterial = new MeshBasicMaterial({
      color: 0xff00ff,
      transparent: true,
      opacity: 0, // 设置透明度
    });
    this.sphere = new Mesh(sphereGeometry, sphereMaterial);
    this.sphere.name = 'axis_sphere'; // axis_sphere

    // 三条圆环带
    const geo1 = new CylinderGeometry(
      ROTATE_R,
      ROTATE_R,
      ROTATE_H,
      32,
      1,
      true
    );
    // geo1.thetaLength = Math.PI;
    const mat1 = new MeshBasicMaterial({
      color: 0x67c255,
      depthFunc: AlwaysDepth,
    });
    this.cylinder1 = new Mesh(geo1, mat1);
    this.cylinder1.name = 'axis_y';
    const geo2 = new CylinderGeometry(
      ROTATE_R + ROTATE_BAND_OFFSET,
      ROTATE_R + ROTATE_BAND_OFFSET,
      ROTATE_H,
      32,
      1,
      true
    );
    // geo1.thetaLength = Math.PI;
    const mat2 = new MeshBasicMaterial({
      color: 0x549beb,
      depthFunc: AlwaysDepth,
    });
    this.cylinder2 = new Mesh(geo2, mat2);
    this.cylinder2.rotateX(Math.PI / 2);
    this.cylinder2.name = 'axis_z';

    const geo3 = new CylinderGeometry(
      ROTATE_R + ROTATE_BAND_OFFSET * 2,
      ROTATE_R + ROTATE_BAND_OFFSET * 2,
      ROTATE_H,
      32,
      1,
      true
    );
    // geo1.thetaLength = Math.PI;
    const mat3 = new MeshBasicMaterial({
      color: 0xeb6341,
      depthFunc: AlwaysDepth,
    });
    this.cylinder3 = new Mesh(geo3, mat3);
    this.cylinder3.rotateZ(Math.PI / 2);
    this.cylinder3.name = 'axis_x';

    this.controler = new Group();
    this.controler.name = 'rotate_control';
    // (this.controler.material as Material).depthFunc = AlwaysDepth;

    const rotateBand = new Group();

    // 设置渲染顺序 让这个旋转控制器 最后渲染  -- 需要动态设置
    rotateBand.renderOrder = TOP_RENDER_ORDER;
    rotateBand.add(this.cylinder1);
    rotateBand.add(this.cylinder2);
    rotateBand.add(this.cylinder3);
    rotateBand.name = 'rotate_band';
    this.controler.add(rotateBand);
    this.controler.add(this.sphere);
  }

  onPointerdown(event: PointerEvent, customEvent: customEvent): void {
    const [x, y] = converCoordinateTo3D(
      customEvent.x,
      customEvent.y,
      this.renderLayer.width,
      this.renderLayer.height
    );
    const targerObjArr = [
      this.controler,
      this.renderLayer.geoBase.originGroup,
    ];
    const resObj = getObjByPoint(x, y, this.renderLayer.camera, targerObjArr);
    if (resObj) {
      // 点击了目标物体 首先需要判断 当前点击的物体中 是否有旋转控制器
      const rotateCon = resObj.filter((obj) => {
        return obj.object.name.includes('axis');
      });
      if (rotateCon.length) {
        // 点击了 旋转控制器 需要判断 首个元素是否控制球
        const objectName = rotateCon[0].object.name;
        if (objectName === 'axis_sphere') {
          // 应用轨迹球旋转模式
          this.renderLayer.trackballObj.pointerdown(
            customEvent.x,
            customEvent.y
          );
          this.rotateMode = rotateType.trackball;
        } else {
          // 固定轴
          this.renderLayer.trackballObj.pointerdown(
            customEvent.x,
            customEvent.y,
            objectName,
            this.renderLayer.geoBase.originGroup.matrix,
            this.renderLayer.geoBase.originGroup.position
          );
          this.rotateMode = rotateType.fixAxis;
        }
      } else {
        this.rotateMode = rotateType.none;
      }
    } else {
      this.rotateMode = rotateType.none;
      this.renderLayer.geoBase.convertSnapshot()
    }
  }
  onPointermove(event: PointerEvent, customEvent: customEvent): void {
    if (
      this.rotateMode === rotateType.trackball ||
      this.rotateMode === rotateType.fixAxis
    ) {
      const quaternion = this.renderLayer.trackballObj.pointermove(
        customEvent.x,
        customEvent.y
      );
      this.renderLayer.geoBase.rotateGeo(quaternion);
    }
  }
  onPointerup(event: PointerEvent, customEvent: customEvent): void {
    this.rotateMode = rotateType.none;
    this.renderLayer.trackballObj.pointerup();
  }

  registerControl(geoBase:CommonGeo){
    const {x,y,z} = geoBase.originGroup?.scale as Vector3
    this.controler.scale.set(1/x,1/y,1/z)
    geoBase.originGroup?.add(this.controler)
  }
  destroyControl(geoBase:CommonGeo){
    geoBase.originGroup?.remove(this.controler)
    this.controler.scale.set(1,1,1)

  }
}

export { RotateControl };
