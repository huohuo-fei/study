
import { Point } from "../point";
import { ToolPenConst } from "../utils";
import { IPenHelper } from "./type";
import { CustomEvent } from "../mode";

export class PenHelper implements IPenHelper {
    link: boolean;
    centerPoint: { x: number; y: number } = { x: 0, y: 0 };
    perPoint: { x: number; y: number } = { x: 0, y: 0 };
    nextPoint: { x: number; y: number } = { x: 0, y: 0 };
    originPoint: Point | null = null
    selectControlType: "per" | "next" | "center" = "center"
    constructor() {
        this.link = true
    }

    updateHelper(point: Point): void {
        this.originPoint = point
        this.centerPoint.x = point.x;
        this.centerPoint.y = point.y;
        this.perPoint.x = point.perControlPoint.x
        this.perPoint.y = point.perControlPoint.y
        this.nextPoint.x = point.nextControlPoint.x
        this.nextPoint.y = point.nextControlPoint.y
        this.link = point.link

    }
    render(ctx: CanvasRenderingContext2D): void {
        ctx.save()
        ctx.strokeStyle = ToolPenConst.HELPER_COLOR
        ctx.fillStyle = ToolPenConst.HELPER_COLOR
        ctx.setLineDash([5])
        ctx.beginPath();
        if (this.link) {
            ctx.moveTo(this.perPoint.x, this.perPoint.y);
            ctx.lineTo(this.nextPoint.x, this.nextPoint.y);
            ctx.stroke();
        }

        ctx.moveTo(this.perPoint.x, this.perPoint.y);
        ctx.arc(this.perPoint.x, this.perPoint.y, ToolPenConst.HELPER_RADIUS, 0, Math.PI * 2);
        ctx.moveTo(this.nextPoint.x, this.nextPoint.y);
        ctx.arc(this.nextPoint.x, this.nextPoint.y, ToolPenConst.HELPER_RADIUS, 0, Math.PI * 2);
        ctx.fill()
        ctx.restore()
    }

    searchPoint(x: number, y: number, ctx: CanvasRenderingContext2D) {
        ctx.save()
        ctx.beginPath()
        ctx.arc(this.perPoint.x, this.perPoint.y, ToolPenConst.HELPER_RADIUS, 0, Math.PI * 2);
        const isPer = ctx.isPointInPath(x, y)
        if (isPer) {
            this.selectControlType = "next"
            return
        }
        ctx.beginPath()
        ctx.arc(this.nextPoint.x, this.nextPoint.y, ToolPenConst.HELPER_RADIUS, 0, Math.PI * 2);
        const isNext = ctx.isPointInPath(x, y)
        if (isNext) {
            this.selectControlType = "per"
            return
        }
        this.selectControlType = "center"
    }

    onPointermove(event: CustomEvent) {
        if(this.selectControlType === "per" || this.selectControlType === "next"){
            this.originPoint?.updateControlPointByDir(event,this.selectControlType)
            this.updateHelper(this.originPoint as Point)
        }
    }
    onPointerup(event: CustomEvent) {
        this.selectControlType = "center"
    }
}