import { EventDispatcher } from "../core/EventDispatcher"
import {customEvent} from './index'
export class Receiver extends EventDispatcher {
  onPointerdown(event: PointerEvent,customEvent:customEvent) {} 
  onPointermove(event: PointerEvent,customEvent:customEvent) {} 
  onPointerup(event: PointerEvent,customEvent:customEvent) {}
  getDomElement():HTMLElement|null{return null}

}