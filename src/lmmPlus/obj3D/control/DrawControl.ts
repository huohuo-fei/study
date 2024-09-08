import { converCoordinateTo3D, destroyObj, getPointOfFloor } from '../utils';
import { Receiver } from '../../driver/Receiver';
import { ThreeLayer } from '../ThreeLayer';
import { customEvent } from '../../driver';
import { Group, Points, Vector2, Vector3 } from 'three';
import { createPoint } from '../utils/point';
import { MIN_BOTTOM_LENGTH } from '../threeSystem/const';
class DrawControl extends Receiver {
  renderLayer: ThreeLayer;
  // 是否处于绘制模式  -- 只有在绘制底部线框以及拉伸高度时，为true
  isDraw: boolean = false;
  // 是否处于绘制底部线框模式
  isBottom: boolean = true;
  // 绘制底部线框的起始点位  -- 是世界坐标
  bottomPointStart: Vector3 = new Vector3();
  // 拉伸开始的 XOY 平面的坐标
  stretchPointStart: number[] = [];
  // 两个圆点
  pointMesh1: Points | null = null;
  pointMesh2: Points | null = null;
  movePoint: number[] = [];
  mistakePoint: number[] = [];
  constructor(renderLayer: ThreeLayer) {
    super();
    this.renderLayer = renderLayer;
  }

  onPointerdown(event: PointerEvent, customEvent: customEvent): void {
    if (this.isDraw) {
      this.isDraw = false;
      this.isBottom = true;
      this.createGeo();
      return;
    }
    this.isDraw = true;
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
      this.mistakePoint.push(customEvent.x, customEvent.y);
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
      this.renderLayer.geoBase.drawBottomLine(this.bottomPointStart, pointPos);
    } else {
      // 拉伸底面线框
      this.renderLayer.geoBase.drawStretchLine([x, y], this.stretchPointStart);
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
      this.mistakeTouchDrawBottomLine(customEvent.x, customEvent.y);
    }
  }

  createGeo() {
    this.renderLayer.geoBase.createGeo();
    this.removeObj();
  }
  removeObj() {
    destroyObj(this.pointMesh1);
    destroyObj(this.pointMesh2);
    this.renderLayer.scene.remove(this.pointMesh1 as Points);
    this.renderLayer.scene.remove(this.pointMesh2 as Points);

    this.bottomPointStart = new Vector3();
    this.stretchPointStart = [];
    this.pointMesh1 = null;
    this.pointMesh2 = null;
  }

  // 防止误触
  mistakeTouchDrawBottomLine(upx: number, upy: number) {
    const { mistakePoint } = this;
    const deltaX = upx - mistakePoint[0];
    const deltaY = upy - mistakePoint[1];
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance < MIN_BOTTOM_LENGTH) {
      const [x, y] = converCoordinateTo3D(
        upx,
        upy,
        this.renderLayer.width,
        this.renderLayer.height
      );
      const pointPos = getPointOfFloor(
        x,
        y,
        this.renderLayer.camera,
        this.renderLayer.floorPlank
      );
      this.renderLayer.geoBase.createDefaultGeo(this.bottomPointStart,pointPos)
      this.isDraw = false
      this.removeObj();
    }
    this.mistakePoint = []

  }
}

export { DrawControl };
