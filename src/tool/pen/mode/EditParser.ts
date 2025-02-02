import { Point } from "../point";
import { ToolPenConst } from "../utils";
import { Parser } from "./Parser";
import { CustomEvent } from "./type";

export class EditParser extends Parser {
    editPoint: Point | null = null;
    isOperate:boolean = false
    constructor(ctx: CanvasRenderingContext2D, points: Point[]) {
        super(ctx)
        this.points = points
        this.restore(points)
    }

    restore(points: Point[]) {
        this.points = points.map((p) => {
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
        this.isOperate = true
        this.searchEditPoint(event)
    }

    onPointermove(event: CustomEvent) {
        if(!this.isOperate)return
        if (this.editPoint && !this.isDrawHeple) {
            // 当前移动的是节点
            this.editPoint.updatePointPos(event)
        } else {
            // 如果辅助线存在  说明移动的是控制点
            this.penHelper.onPointermove(event)
        }
    }
    onPointerup(event: CustomEvent) {
        if (this.editPoint) {
            this.isDrawHeple = true
            this.penHelper.updateHelper(this.editPoint)
        }
        this.isOperate = false
    }

    render(ctx: CanvasRenderingContext2D) {
        super.render(ctx)

    }

    // 寻找编辑节点
    private searchEditPoint(event: CustomEvent) {
        const point = this.searchPointByXY(event.x, event.y)
        if (point) {
            // 命中的是节点
            this.editPoint = point
            this.isDrawHeple = false
            return
        }
        if (this.editPoint) {
            // 没有命中节点，但有编辑点存在的情况  需要判断是否命中控制点
            const dir = this.penHelper.searchPoint(event.x, event.y, this.ctx)
            if (dir !== 'center') {
                // 命中控制点
                this.isDrawHeple = true
                return
            }
        }

        // 什么都没命中 隐藏
        this.isDrawHeple = false
        this.editPoint = null
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