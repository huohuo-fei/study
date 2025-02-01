import { Point } from "../point";
import { Parser } from "./Parser";
import { CustomEvent } from "./type";

export class DrawParser extends Parser{
    onPointerdown(event: CustomEvent): void {
        const point = new Point(event);
        this.points.push(point)
        this.isDrawHeple = true
        this.penHelper.updateHelper(point)
        this.activePoint = null
    }

    onPointermove(event: CustomEvent) {
        if (this.isDrawHeple) {
            // 绘制辅助线情况
            const lastPoint = this.points[this.points.length - 1]
            lastPoint.updateControlPoint(event)
            this.penHelper.updateHelper(lastPoint)
        } else {
            // 绘制自由贝塞尔
            const point = new Point(event);
            this.activePoint = point
        }
    }
    onPointerup(event: CustomEvent){
        this.isDrawHeple = false

    }

    render(ctx:CanvasRenderingContext2D){
        super.render(ctx)

    }
}