/** 驱动层 主要负责对点的处理 外部所有的点 都经过驱动层 传入画布系统 */
/** 整个项目只有一个驱动，但可以对应多个画布  或者说多个接收器， */
import { Receiver } from './Receiver';
class Driver {
  listener = new Set<Receiver>();
  constructor() {
    this.initListen();
  }

  addListener(receiver: Receiver) {
    this.listener.add(receiver);
  }
  removeListener(receiver: Receiver) {
    this.listener.delete(receiver);
  }

  initListen() {
    window.addEventListener('pointerdown', this.dPointerDown.bind(this));
    window.addEventListener('pointermove', this.dPointerMove.bind(this));
    window.addEventListener('pointerup', this.dPointerUp.bind(this));
  }
  dPointerDown(event: PointerEvent) {
    for (const recriver of this.listener) {
      const dom = recriver.getDomElement();
      if (dom !== event.target) return;
      const { rawEvent, customEvent } = this.converEvent(event, recriver);
      recriver.onPointerdown(rawEvent, customEvent);
    }
  }
  dPointerMove(event: PointerEvent) {
    for (const recriver of this.listener) {
      const dom = recriver.getDomElement();
      if (dom !== event.target) return;
      const { rawEvent, customEvent } = this.converEvent(event, recriver);
      recriver.onPointermove(rawEvent, customEvent);
    }
  }
  dPointerUp(event: PointerEvent) {
    for (const recriver of this.listener) {
      const dom = recriver.getDomElement();
      if (dom !== event.target) return;
      const { rawEvent, customEvent } = this.converEvent(event, recriver);
      recriver.onPointerup(rawEvent, customEvent);
    }
  }

  converEvent(rawEvent: PointerEvent, recriver: Receiver) {
    const dom = recriver.getDomElement();
    const { clientX, clientY, pointerId } = rawEvent;
    const customEvent = {
      x: clientX,
      y: clientY,
      pointerId,
      eventType: recriver.getMode(),
    };
    if (dom) {
      const { x, y } = dom.getBoundingClientRect();
      customEvent.x = clientX - x;
      customEvent.y = clientY - y;
    }

    return { customEvent, rawEvent };
  }
}

export enum eventType {
  draw = 'draw',
  select = 'select',
  draw3D = 'draw3D',
  rotate3D = 'rotate3D',
  fill3D = 'fill3D',
  resize3D = 'resize3D',
}

export interface customEvent {
  x: number;
  y: number;
  pointerId: number;
  eventType: eventType;
}

export const driver = new Driver();
