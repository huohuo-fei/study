import { EventDispatcher } from "../core/EventDispatcher"
import {customEvent, eventType} from './index'
export class Receiver extends EventDispatcher {
  onPointerdown(event: PointerEvent,customEvent:customEvent) {} 
  onPointermove(event: PointerEvent,customEvent:customEvent) {} 
  onPointerup(event: PointerEvent,customEvent:customEvent) {}
  getDomElement():HTMLElement|null{return null}
  getMode():eventType{return eventType.draw3D}

}