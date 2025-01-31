import { Point } from "./point";
import { ToolPenConst } from "./utils";
import { BezierPath, ModeType } from './type'
import { PenHelper } from "./helper";


export class ToolPen implements BezierPath {
    // 画布
    ctx: CanvasRenderingContext2D;
    points: Point[];
    isDrawHeple = false
    isDrawing: boolean = false
    penHelper: PenHelper
    activePoint: Point | null = null
    editPoint: Point | null = null
    mode: ModeType = ModeType.NONE
    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.points = [];
        this.penHelper = new PenHelper()
    }

    // 向外暴露的渲染方法
    render(): void {
        if (!this.points.length) return
        this.ctx.beginPath()
        this.drawStartEnd()
        this.drawHelp()
        this.drawPath()
        this.drawActivePath()
    }

    // 绘制起点和终点
    private drawStartEnd(): void {
        this.ctx.save()
        for (let point of this.points) {
            this.ctx.fillStyle = ToolPenConst.START_POINT_COLOR
            this.ctx.fillRect(point.x - ToolPenConst.START_POINT_SIZE / 2,
                point.y - ToolPenConst.START_POINT_SIZE / 2,
                ToolPenConst.START_POINT_SIZE,
                ToolPenConst.START_POINT_SIZE)
        }


        this.ctx.restore()


    }

    // 绘制控制点
    private drawControlPoint(): void {

    }

    // 绘制当前激活的路径
    // 只有在完成一个确定点后 才会绘制
    private drawActivePath(): void {
        if (this.points.length && this.activePoint) {
            // 拿到最后一个点
            const lastPoint = this.points[this.points.length - 1]
            this.ctx.save()
            this.ctx.beginPath()
            this.ctx.moveTo(lastPoint.x, lastPoint.y)
            this.ctx.bezierCurveTo(lastPoint.nextControlPoint.x,
                lastPoint.nextControlPoint.y,
                this.activePoint.perControlPoint.x, this.activePoint.perControlPoint.y, this.activePoint.x, this.activePoint.y)
            this.ctx.stroke()
            this.ctx.restore()
        }

    }

    // 绘制已经确定的笔迹
    private drawPath(): void {
        if (this.points.length > 1) {
            this.ctx.save()
            this.ctx.beginPath()
            this.ctx.strokeStyle = '#558ef0'
            const firstPoint = this.points[0]
            this.ctx.moveTo(firstPoint.x, firstPoint.y)
            for (let i = 1, len = this.points.length; i < len; i++) {
                const perPoint = this.points[i - 1]
                const point = this.points[i]
                this.ctx.bezierCurveTo(perPoint.nextControlPoint.x,
                    perPoint.nextControlPoint.y,
                    point.perControlPoint.x, point.perControlPoint.y, point.x, point.y)
            }
            this.ctx.stroke()
            this.ctx.restore()
        }
    }

    // 绘制辅助虚线
    private drawHelp() {
        if (this.isDrawHeple) {
            this.penHelper.render(this.ctx)
        }

    }

    // 当绘制完成时，将活动点设置为null
    onDrawOver() {
        this.activePoint = null
        this.changeMode(ModeType.EDIT)
    }


    onPointerdown(event: PointerEvent): void {
        if (this.mode === ModeType.EDIT) {
            this.searchEditPoint(event)
            return
        }
        if (this.mode === ModeType.NONE) {
            this.changeMode(ModeType.DRAW)
        }
        const point = new Point(event);
        this.points.push(point)
        this.drawStartEnd()
        this.isDrawHeple = true
        this.penHelper.updateHelper(point)
        this.activePoint = null


    }
    onPointermove(event: PointerEvent): void {
        // 绘制当前最后一个点的辅助线
        if (this.mode !== ModeType.DRAW) return
        if (this.isDrawHeple) {
            const lastPoint = this.points[this.points.length - 1]
            lastPoint.updateControlPoint(event)
            this.penHelper.updateHelper(lastPoint)
        } else {
            const point = new Point(event);
            this.activePoint = point
        }

    }
    onPointerup(event: PointerEvent): void {
        if(this.mode !==ModeType.EDIT){
            this.isDrawHeple = false
        }
    }

    private changeMode(mode: ModeType) {
        this.mode = mode

    }

    // 编辑节点
    private searchEditPoint(event: PointerEvent) {
        const point = this.searchPointByXY(event.clientX, event.clientY)
        if (point) {
            this.editPoint = point
            this.isDrawHeple = true
            this.penHelper.updateHelper(point)
        } else if(this.isDrawHeple){
            // 寻找是否点击了编辑点
            this.penHelper.searchPoint(event.clientX, event.clientY,this.ctx)
        }
    }

    private searchPointByXY(x: number, y: number) {
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