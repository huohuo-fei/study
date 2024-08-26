
import { converCoordinateTo3D, getObjByPoint } from '../utils';
import { Receiver } from '../../driver/Receiver';
import { ThreeLayer } from '../ThreeLayer';
import { customEvent } from '../../driver';
class FillControl extends Receiver {
  renderLayer: ThreeLayer;
  fillColor: string;
  constructor(renderLayer: ThreeLayer) {
    super();
    this.renderLayer = renderLayer;
    this.fillColor = 'pink';
  }
  initControl() {}

  onPointerdown(event: PointerEvent, customEvent: customEvent): void {
    this.fillOperate(customEvent, 'down');
  }
  onPointermove(event: PointerEvent, customEvent: customEvent): void {
    this.fillOperate(customEvent, 'move');
  }
  onPointerup(event: PointerEvent, customEvent: customEvent): void {}

  fillOperate(customEvent: customEvent, operateType: 'move' | 'down') {
    const [x, y] = converCoordinateTo3D(
      customEvent.x,
      customEvent.y,
      this.renderLayer.width,
      this.renderLayer.height
    );
    const target = this.renderLayer.geoBase.originGroup;
    const resObj = getObjByPoint(x, y, this.renderLayer.camera, [target]);
    if (resObj) {
      // todo 可以增加 对边框改色的操作
      // 拿到 name 判断是否为当前的几何体
      const objName = resObj[0].object.name;
      if (true && resObj[0].face) {
        const index = resObj[0].face.materialIndex;
        this.renderLayer.geoBase.fillGeo(index, this.fillColor, operateType);
      }
    } else {
      // 没有选中
      // this.activeGeo.noSelect();
      this.renderLayer.geoBase.clearColorGeo();
    }
  }
}

export { FillControl };
