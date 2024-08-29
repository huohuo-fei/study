import {
  BufferAttribute,
  BufferGeometry,
  Group,
  LineBasicMaterial,
  LineLoop,
  Mesh,
  MeshBasicMaterial,
  Vector3,
} from 'three';
import { customEvent } from '../../driver';
import { Receiver } from '../../driver/Receiver';
import { ThreeLayer } from '../ThreeLayer';
import { Vector2 } from '../../math/Vector2';
import { getPointOfFloor } from '../utils';

// 绘制控制框
export class TransformControl extends Receiver {
  rectLineMesh: Mesh | null = null;
  baserRender: ThreeLayer;
  rectSideLength = 0.02;

  constructor(renderLayer: ThreeLayer) {
    super();

    this.baserRender = renderLayer;
  }

  createLineFrame(minbox: number[], type: 'big' | 'small' = 'big') {
    // 计算矩形的四个点
    const p0 = getPointOfFloor(
      minbox[0],
      minbox[1],
      this.baserRender.camera,
      this.baserRender.floorPlank
    );
    const p1 = getPointOfFloor(
      minbox[0],
      minbox[3],
      this.baserRender.camera,
      this.baserRender.floorPlank
    );
    const p2 = getPointOfFloor(
      minbox[2],
      minbox[3],
      this.baserRender.camera,
      this.baserRender.floorPlank
    );
    const p3 = getPointOfFloor(
      minbox[2],
      minbox[1],
      this.baserRender.camera,
      this.baserRender.floorPlank
    );

    /** 矩形平面 **/
    const geometry = new BufferGeometry();
    // 创建一个简单的矩形. 在这里我们左上和右下顶点被复制了两次。
    // 因为在两个三角面片里，这两个顶点都需要被用到。
    const vertices = new Float32Array([
      ...p0,
      ...p3,
      ...p2,
      ...p2,
      ...p1,
      ...p0,
    ]);

    // itemSize = 3 因为每个顶点都是一个三元组。
    geometry.setAttribute('position', new BufferAttribute(vertices, 3));
    let materialPlane 

    if(type === 'small'){
      materialPlane = new MeshBasicMaterial({
        color: 0xffffff,
      });
    }else{
      materialPlane = new MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0, // 设置透明度
      });
    }
    const rectPlane = new Mesh(geometry, materialPlane);

    /** 矩形框 **/
    const points = [];
    points.push(...p0, ...p1, ...p2, ...p3);

    const positionAttr = new BufferAttribute(new Float32Array(points), 3);
    const rectLineGeo = new BufferGeometry().setAttribute(
      'position',
      positionAttr
    );
    const material = new LineBasicMaterial({
      color: '#558ef0', // 558ef0
    });
    const rectLineMesh = new LineLoop(rectLineGeo, material);

    const controlPlane = new Group()
    controlPlane.add(rectLineMesh)
    controlPlane.add(rectPlane)
    this.baserRender.scene.add(controlPlane);
  }

  createRectCube(minBox: number[]) {
    const { rectSideLength } = this;
    const halfLength = rectSideLength / 2;
    const points = [
      new Vector2(minBox[0], minBox[1]),
      new Vector2(minBox[0], minBox[3]),
      new Vector2(minBox[2], minBox[3]),
      new Vector2(minBox[2], minBox[1]),
    ];

    const totalPoints = points.map((item) => {
      return [
        item.x - halfLength,
        item.y - halfLength,
        item.x + halfLength,
        item.y + halfLength,
      ];
    });

    for (let i = 0; i < totalPoints.length; i++) {
      this.createLineFrame(totalPoints[i],'small')
    }
  }

  onPointerdown(event: PointerEvent, customEvent: customEvent): void {}
  onPointermove(event: PointerEvent, customEvent: customEvent): void {}
  onPointerup(event: PointerEvent, customEvent: customEvent): void {}
}
