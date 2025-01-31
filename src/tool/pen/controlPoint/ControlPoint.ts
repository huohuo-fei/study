import { BezierControlPoint } from "./type";

export class ControlPoint implements BezierControlPoint{
    x: number;
    y: number;
    constructor(x:number, y:number) {
        this.x = x
        this.y = y
    }

    updatePoint(x:number,y:number) {
        this.x = x
        this.y = y
    }
}