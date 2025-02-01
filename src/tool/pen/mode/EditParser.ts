import { Point } from "../point";
import { ToolPenConst } from "../utils";
import { Parser } from "./Parser";
import { CustomEvent } from "./type";

export class EditParser extends Parser {
    editPoint: Point | null = null;
    constructor(ctx: CanvasRenderingContext2D,points: Point[]) {
        super(ctx)
        this.points = points
        this.restore(points)
    }

    restore(points:Point[]){
      this.points =  points.map((p) => {
            const customEvent = {
                x: p.x,
                y: p.y
            }
            const newPoint = new Point(customEvent)
            newPoint.restorePoint(p)
            return newPoint

        })

    }

    onPointerdown(event: CustomEvent): void {
        this.searchEditPoint(event)
    }

    onPointermove(event: CustomEvent) {
        this.penHelper.onPointermove(event)
    }
    onPointerup(event: CustomEvent) {
        this.penHelper.onPointerup(event)
    }

    render(ctx: CanvasRenderingContext2D) {
        super.render(ctx)

    }

    // 寻找编辑节点
    private searchEditPoint(event: CustomEvent) {
        const point = this.searchPointByXY(event.x, event.y)
        if (point) {
            this.editPoint = point
            this.isDrawHeple = true
            this.penHelper.updateHelper(point)
        } else if (this.isDrawHeple) {
            // 寻找是否点击了编辑点
            this.penHelper.searchPoint(event.x, event.y,this.ctx)
        }
    }
    private searchPointByXY(x: number, y: number): Point | undefined {
        for (let point of this.points) {
            const center = { x: point.x, y: point.y }
            const size = ToolPenConst.START_POINT_SIZE
            const minX = center.x - size
            const maxX = center.x + size
            const minY = center.y - size
            const maxY = center.y + size
            if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
                return point
            }
        }
    }
}