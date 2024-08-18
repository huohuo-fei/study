import {
  SphereGeometry,
  MeshBasicMaterial,
  Mesh,
  CylinderGeometry,
  Group,
  AlwaysDepth,
  Material,
  NeverDepth,
} from 'three';
import {
  TOP_RENDER_ORDER,
  ROTATE_R,
  ROTATE_H,
  ROTATE_BAND_OFFSET,
} from './const';

class RotateControl {
  // 中间的球体
  sphere: Mesh;
  // 三条旋转带
  cylinder1: Mesh;
  cylinder2: Mesh;
  cylinder3: Mesh;
  // 整个旋转控制器
  rotateControl: Mesh;
  constructor() {
    // 中间的球体
    const sphereGeometry = new SphereGeometry(ROTATE_R);
    const sphereMaterial = new MeshBasicMaterial({
      color: 0xff00ff,
      transparent: true,
      // depthFunc: NeverDepth,
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

    this.rotateControl = new Mesh();
    this.rotateControl.name = 'rotate_control';
    (this.rotateControl.material as Material).depthFunc = AlwaysDepth;

    const rotateBand = new Group();

    // 设置渲染顺序 让这个旋转控制器 最后渲染  -- 需要动态设置
    rotateBand.renderOrder = TOP_RENDER_ORDER;
    rotateBand.add(this.cylinder1);
    rotateBand.add(this.cylinder2);
    rotateBand.add(this.cylinder3);
    rotateBand.name = 'rotate_band';
    this.rotateControl.add(rotateBand);
    this.rotateControl.add(this.sphere);
  }
}

const rotateControl = new RotateControl();

export default rotateControl.rotateControl;
