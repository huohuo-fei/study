import {
  AlwaysDepth,
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  Group,
  LineBasicMaterial,
  LineLoop,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Vector3,
} from 'three';
import { customEvent } from '../../driver';
import { Receiver } from '../../driver/Receiver';
import { ThreeLayer } from '../ThreeLayer';
import { Vector2 } from '../../math/Vector2';
import { converCoordinateTo3D, getObjByPoint, getPointOfFloor } from '../utils';

// 控制框，负责在平面上变换几何体，

enum transformType {
  move = 'move',
  scale = 'scale',
  none = 'none',
}

enum scaleDir {
  transformScale0 = 'transformScale0',
  transformScale1 = 'transformScale1',
  transformScale2 = 'transformScale2',
  transformScale3 = 'transformScale3',
  none = 'none',
}
export class TransformControl extends Receiver {
  rectLineMesh: Mesh | null = null;
  baserRender: ThreeLayer;
  rectSideWidth: number;
  rectSideHeight: number;
  transformGroup: Group | null;
  transformType: transformType = transformType.none;
  scaleDir: scaleDir = scaleDir.none;
  dragStart: Vector2 = new Vector2(0, 0);
  dragEnd: Vector2 = new Vector2(0, 0);
  baseWidth: number = 0;
  totalScaleX: number = 1;
  totalScaleY: number = 1;
  totalScaleZ: number = 1;
  minBox: number[] = [];
  centerPos: Vector3 | null = null;
  oldValue: number = 0;

  constructor(renderLayer: ThreeLayer) {
    super();

    this.transformGroup = new Group();
    // 小矩形控制框的边长是10  len 就是10px 转为 webgl坐标的长度
    const len = (10 * 2) / renderLayer.width;
    this.baserRender = renderLayer;
    const { right, left, top, bottom } = renderLayer.camera;
    // 相机宽高
    const cameraW = right - left;
    const cameraH = top - bottom;
    const ratio = cameraW / cameraH;
    this.rectSideWidth = len;
    this.rectSideHeight = len * ratio;
  }
  initLineRect(minbox: number[]) {
    this.minBox = [...minbox];
    this.createLineFrame(minbox);
    this.createRectCube(minbox);
    this.baserRender.scene.add(this.transformGroup!);
  }

  /**
   * @param minbox 几何体在相机视口下的最小盒子
   * @param type 是move的打平面 还是四个控制矩形框的小平面
   * @param dir 四个小平面的标志
   */
  createLineFrame(
    minbox: number[],
    type: 'big' | 'small' = 'big',
    dir?: string
  ) {
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

    // 如果是大框，需要计算框的中点
    if (type === 'big') {
      this.centerPos = p2.clone().sub(p0).multiplyScalar(0.5).add(p0);
    }

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
    let materialPlane;

    if (type === 'small') {
      materialPlane = new MeshBasicMaterial({
        color: 0xffffff,
        depthFunc: AlwaysDepth,
      });
    } else {
      materialPlane = new MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0, // 设置透明度
      });
    }
    const rectPlane = new Mesh(geometry, materialPlane);
    if (type === 'big') {
      rectPlane.name = 'transformMove';
    } else {
      rectPlane.name = 'transformScale' + dir;
    }
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
      depthFunc: AlwaysDepth,
    });
    const rectLineMesh = new LineLoop(rectLineGeo, material);
    const controlPlane = new Mesh();

    controlPlane.add(rectLineMesh);
    controlPlane.add(rectPlane);

    // 这里需要将控制框的位置 移到中点，默认的位置是 (0,0,0),在缩放时 需要做基点变换
    controlPlane.translateX(-this.centerPos!.x);
    controlPlane.translateZ(-this.centerPos!.z);
    this.transformGroup?.add(controlPlane);
    if (type === 'big') {
      this.transformGroup!.translateX(this.centerPos!.x);
      this.transformGroup!.translateZ(this.centerPos!.z);
      (this.transformGroup as Group).name = 'transformGroup';
    }
  }

  /**
   * 用于生成控制框的四个矩形
   * @param minBox 相机视口下的最小包围盒
   */
  createRectCube(minBox: number[]) {
    const { rectSideWidth, rectSideHeight } = this;
    const halfW = rectSideWidth / 2;
    const halfH = rectSideHeight / 2;
    const points = [
      new Vector2(minBox[0], minBox[1]),
      new Vector2(minBox[0], minBox[3]),
      new Vector2(minBox[2], minBox[3]),
      new Vector2(minBox[2], minBox[1]),
    ];

    const totalPoints = points.map((item) => {
      return [item.x - halfW, item.y - halfH, item.x + halfW, item.y + halfH];
    });

    for (let i = 0; i < totalPoints.length; i++) {
      this.createLineFrame(totalPoints[i], 'small', String(i));
    }
  }

  onPointerdown(event: PointerEvent, customEvent: customEvent): void {
    const [x, y] = converCoordinateTo3D(
      customEvent.x,
      customEvent.y,
      this.baserRender.width,
      this.baserRender.height
    );
    const targerObjArr = [this.transformGroup!];
    const resObj = getObjByPoint(x, y, this.baserRender.camera, targerObjArr);
    if (resObj) {
      const { dragStart } = this;
      const [x, y] = converCoordinateTo3D(
        customEvent.x,
        customEvent.y,
        this.baserRender.width,
        this.baserRender.height
      );
      dragStart.set(x, y);
      // 需要判断当前是否点击缩放
      const scaleItem = resObj.filter((item) =>
        item.object.name.includes('Scale')
      );
      if (scaleItem.length) {
        const name = scaleItem[0].object.name;
        this.scaleDir = name as scaleDir;
        this.transformType = transformType.scale;
      } else {
        this.transformType = transformType.move;
      }
    } else {
      this.transformType = transformType.none;
    }
  }
  onPointermove(event: PointerEvent, customEvent: customEvent): void {
    if (this.transformType === transformType.none) return;
    const { dragEnd } = this;
    const [x, y] = converCoordinateTo3D(
      customEvent.x,
      customEvent.y,
      this.baserRender.width,
      this.baserRender.height
    );
    dragEnd.set(x, y);
    if (this.transformType === transformType.move) {
      this.move();
    } else {
      this.scale();
    }
  }
  onPointerup(event: PointerEvent, customEvent: customEvent): void {
    this.transformType = transformType.none;
  }

  move() {
    const { dragStart, dragEnd } = this;
    this.translateByVec(
      new Vector2(dragEnd.x - dragStart.x, dragEnd.y - dragStart.y)
    );
    this.dragStart.copy(this.dragEnd);
  }

  scale() {
    const { dragStart, dragEnd } = this;
    const vecDir = this.calcDirVec();
    if (!vecDir) return;
    const dir = vecDir.clone().normalize();
    const totalLen = vecDir.clone().length();
    const moveDir = new Vector2(
      dragEnd.x - dragStart.x,
      dragEnd.y - dragStart.y
    );
    const dotValue = moveDir.dot(dir);
    const scaleValue =   dotValue / totalLen;

    this.calcTranslateScale(scaleValue);
    this.scaleTotalByValue(scaleValue);
    this.baserRender.geoBase.geoObj.scaleTotalByValue(scaleValue);
    this.oldValue = scaleValue;
  }

  /**
   * 根据当前点击了哪个缩放点，计算相应的单位向量
   */
  calcDirVec() {
    if (this.scaleDir === 'none') {
      console.error('ERROR: scaleDir err');
      return;
    }
    const { minBox } = this;
    switch (this.scaleDir) {
      case scaleDir.transformScale0:
        return new Vector2(minBox[0] - minBox[2], minBox[1] - minBox[3]);
      case scaleDir.transformScale1:
        return new Vector2(minBox[0] - minBox[2], minBox[3] - minBox[1]);
      case scaleDir.transformScale2:
        return new Vector2(minBox[2] - minBox[0], minBox[3] - minBox[1]);
      default:
        return new Vector2(minBox[2] - minBox[0], minBox[1] - minBox[3]);
    }
  }

  /**
   * 计算缩放操作 需要位移的量，主要是为了实现对点固定缩放的效果
   * 在缩放的同时执行位移，可以达到定点缩放的视觉效果
   */
  calcTranslateScale(scaleValue: number) {
    if (this.scaleDir === scaleDir.none) return;
    const { minBox } = this;
    // 提取位移量  0.5 只需要位移一半，保证对点固定
    // 缩放使用的是变换累计的方法，位移使用的是增量变换,所以需要oldValue 来记住上次变换的量
    let translateX = 0;
    let translateY = 0;

    switch (this.scaleDir) {
      case scaleDir.transformScale0:
        translateX =
          0.5 * (minBox[0] - minBox[2]) * (scaleValue - this.oldValue);
        translateY =
          0.5 * (minBox[1] - minBox[3]) * (scaleValue - this.oldValue);
        break;
      case scaleDir.transformScale1:
        translateX =
          0.5 * (minBox[0] - minBox[2]) * (scaleValue - this.oldValue);
        translateY =
          0.5 * (minBox[3] - minBox[1]) * (scaleValue - this.oldValue);
        break;

      case scaleDir.transformScale2:
        translateX =
          0.5 * (minBox[2] - minBox[0]) * (scaleValue - this.oldValue);
        translateY =
          0.5 * (minBox[3] - minBox[1]) * (scaleValue - this.oldValue);
        break;

      default:
        translateX =
          0.5 * (minBox[2] - minBox[0]) * (scaleValue - this.oldValue);
        translateY =
          0.5 * (minBox[1] - minBox[3]) * (scaleValue - this.oldValue);
    }
    this.translateByVec(new Vector2(translateX, translateY));
  }

  /**
   * 通过位移量，计算出几何体和控制边框的位移
   * @param moveVec2 位移向量  在 标准视口坐标系下的位移量
   */
  translateByVec(moveVec2: Vector2) {
    const translateVec = getPointOfFloor(
      moveVec2.x,
      moveVec2.y,
      this.baserRender.camera,
      this.baserRender.floorPlank
    );
    const translateMatrix = new Matrix4().makeTranslation(translateVec);
    this.transformGroup?.applyMatrix4(translateMatrix);
    this.baserRender.geoBase.originGroup.applyMatrix4(translateMatrix);
  }

  // 对整个几何体进行缩放
  scaleTotalByValue(value: number) {
    const { totalScaleX, totalScaleY, totalScaleZ } = this;
    const newScaleX = totalScaleX * (1 + value);
    const newScaleY = totalScaleY * (1 + value);
    const newScaleZ = totalScaleZ * (1 + value);
    this.transformGroup!.scale.set(newScaleX, newScaleY, newScaleZ);
  }
}
