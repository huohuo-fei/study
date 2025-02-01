import { BezierPath } from './type'
import { Parser,CustomEvent,DrawParser, EditParser } from "./mode";


export class ToolPen implements BezierPath {
    // 画布
    ctx: CanvasRenderingContext2D;
    toolParser:Parser
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
        this.toolParser = new EditParser(this.ctx,points)
    }


    onPointerdown(event: PointerEvent): void {
        const customevent = this.createEvent(event)
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
    createEvent(event:PointerEvent):CustomEvent{
        const customEvent = {
            x:event.clientX,
            y:event.clientY,
            rawEvent:event
        }
        return customEvent
    }

}