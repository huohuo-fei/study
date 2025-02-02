import { Receiver } from "../../Receiver";
import { PenHelper } from "../helper";
import { Point } from "../point";

export interface IParser extends Receiver {
    onPointerdown?: (event: CustomEvent) => void
    onPointermove?: (event: CustomEvent) => void
    onPointerup?: (event: CustomEvent) => void
    render(ctx?: CanvasRenderingContext2D): void
    exportPoints(): Point[]
    dispose(): void
    points: Point[];
    isDrawHeple:boolean
    penHelper:PenHelper
    activePoint:null | Point
    ctx:CanvasRenderingContext2D
}

export type CustomEvent = {
    x: number;
    y: number;
    rawEvent?: PointerEvent
    ctrlKey?: boolean
}