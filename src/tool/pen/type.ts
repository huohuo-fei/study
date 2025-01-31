import { Receiver } from "../Receiver";
import {  PenHelper } from "./helper";
import { BezierPoint } from "./point";
export interface BezierPath extends Receiver{
    ctx:CanvasRenderingContext2D
    points:BezierPoint[]
    isDrawHeple:boolean  // 是否处于绘制辅助线状态
    isDrawing:boolean  // 是否处于绘制状态
    penHelper:PenHelper
    mode:ModeType
}

export enum ModeType {
    DRAW = "draw",
    EDIT = "edit",
    NONE = "none"
}