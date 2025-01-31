import { Receiver } from "../../Receiver"
import { BezierControlPoint } from "../controlPoint"

export interface BezierPoint extends Receiver{
    x:number
    y:number
    // 链接，当前点的两个控制点是否为中心对称
    link?:boolean
    perControlPoint?:BezierControlPoint
    nextControlPoint?:BezierControlPoint
    updateControlPoint:(e:PointerEvent)=>void
}