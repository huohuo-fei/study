import { PenHelper } from "../helper";
import { Point } from "../point";
import { ToolPenConst } from "../utils";
import { CustomEvent, IParser } from "./type";

export class Parser implements IParser{
    activePoint: Point | null = null;
    penHelper: PenHelper = new PenHelper();
    points: Point[] = [];
    isDrawHeple: boolean = false;
    ctx: CanvasRenderingContext2D;
    constructor(ctx:CanvasRenderingContext2D){
        this.ctx = ctx;
    }
    exportPoints(): Point[] {
        return JSON.parse(JSON.stringify(this.points))
    }
    onPointerdown(event: CustomEvent){

    }
    onPointermove(event: CustomEvent){

    }
    onPointerup(event: CustomEvent){

    }
    render(ctx: CanvasRenderingContext2D) {
        this.drawPoint(ctx)
        this.drawHelp(ctx)
        this.drawActivePath(ctx)
        this.drawPath(ctx)
    }

    dispose(): void {
        for(let key in this){
            if(this.hasOwnProperty(key)){
                delete this[key]
            }
        }
    }

    
    // 绘制路径点
    private drawPoint(ctx: CanvasRenderingContext2D) {
        ctx.save()
        for (let point of this.points) {
            ctx.fillStyle = ToolPenConst.START_POINT_COLOR
            ctx.fillRect(point.x - ToolPenConst.START_POINT_SIZE / 2,
                point.y - ToolPenConst.START_POINT_SIZE / 2,
                ToolPenConst.START_POINT_SIZE,
                ToolPenConst.START_POINT_SIZE)
        }
        ctx.restore()
    }

    // 绘制辅助线
    private drawHelp(ctx:CanvasRenderingContext2D) {
        if (this.isDrawHeple) {
            this.penHelper.render(ctx)
        }
    }
    
    // 绘制激活的贝塞尔曲线部分
    private drawActivePath(ctx:CanvasRenderingContext2D): void {
        if (this.points.length && this.activePoint) {
            // 拿到最后一个点
            const lastPoint = this.points[this.points.length - 1]
            ctx.save()
            ctx.beginPath()
            ctx.moveTo(lastPoint.x, lastPoint.y)
            ctx.bezierCurveTo(lastPoint.nextControlPoint.x,
                lastPoint.nextControlPoint.y,
                this.activePoint.perControlPoint.x, this.activePoint.perControlPoint.y, this.activePoint.x, this.activePoint.y)
            ctx.stroke()
            ctx.restore()
        }

    }

    // 绘制已经确定的笔迹
    drawPath(ctx:CanvasRenderingContext2D): void {
        if (this.points.length > 1) {
        ctx.save()
            ctx.beginPath()
            ctx.strokeStyle = ToolPenConst.START_POINT_COLOR
            const firstPoint = this.points[0]
            ctx.moveTo(firstPoint.x, firstPoint.y)
            for (let i = 1, len = this.points.length; i < len; i++) {
                const perPoint = this.points[i - 1]
                const point = this.points[i]
                ctx.bezierCurveTo(perPoint.nextControlPoint.x,
                    perPoint.nextControlPoint.y,
                    point.perControlPoint.x, point.perControlPoint.y, point.x, point.y)
            }
            ctx.stroke()
            ctx.restore()
        }
    }
}