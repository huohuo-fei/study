import { Receiver } from "../Receiver";
export interface BezierPath extends Receiver{
    ctx:CanvasRenderingContext2D
}
export type ClipRect = {
    x:number,
    y:number,
    width:number,
    height:number
}

export type BitMapInfo = {
    bitmap: ImageBitmap | null,
    offsetX: number,
    offsetY: number,
    scale: number
}