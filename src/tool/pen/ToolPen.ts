import { BezierPath, ClipRect } from './type'
import { Parser, CustomEvent, DrawParser, EditParser } from "./mode";


export class ToolPen implements BezierPath {
    // 画布
    ctx: CanvasRenderingContext2D;
    toolParser: Parser
    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.toolParser = new DrawParser(this.ctx)
    }

    // 向外暴露的渲染方法
    render(): void {
        this.toolParser.render(this.ctx)
    }

    // 当绘制完成时，切换为编辑状态
    onDrawOver() {
        const points = this.toolParser.exportPoints()
        this.toolParser.dispose()
        this.toolParser = new EditParser(this.ctx, points)
    }


    onPointerdown(event: PointerEvent): void {
        const customevent = this.createEvent(event)
        if (event.ctrlKey) {
            customevent.ctrlKey = true
        }
        this.toolParser.onPointerdown(customevent)
    }
    onPointermove(event: PointerEvent): void {
        const customevent = this.createEvent(event)
        this.toolParser.onPointermove(customevent)
    }
    onPointerup(event: PointerEvent): void {
        const customevent = this.createEvent(event)
        this.toolParser.onPointerup(customevent)
    }

    /**
     * 构造自定义对象，进入到解析器内部的数据要经过处理
     * @param data 
     */
    createEvent(event: PointerEvent): CustomEvent {
        const customEvent = {
            x: event.clientX,
            y: event.clientY,
            rawEvent: event
        }
        return customEvent
    }

    clipCanvas(rect: ClipRect, bitImg: ImageBitmap): Promise<Blob> {
        return new Promise((resolve, reject) => {
            this.ctx.save()
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
            this.toolParser.drawPath(this.ctx)
            this.ctx.clip()
            this.ctx.drawImage(bitImg, 0, 0)
            const canvas = document.createElement('canvas')
            canvas.width = rect.width
            canvas.height = rect.height
            const ctx = canvas.getContext('2d')
            ctx?.drawImage(this.ctx.canvas, rect.x, rect.y, rect.width, rect.height, 0, 0, rect.width, rect.height)
            canvas.toBlob((blob) => {
                resolve(blob!)
            })
            this.ctx.restore()
        })

    }
    exportPenPoints() {
        return this.toolParser.exportPoints()
    }

    dispose() {
        this.toolParser.dispose()
        for (const key in this) {
            if (this.hasOwnProperty(key)) {
                delete this[key]
            }
        }
    }

}