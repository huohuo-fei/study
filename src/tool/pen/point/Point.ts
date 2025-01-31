import { BezierPoint } from './type'
import { ControlPoint } from '../controlPoint';
export class Point implements BezierPoint {
    x: number;
    y: number;
    link: boolean;
    perControlPoint: ControlPoint;
    nextControlPoint: ControlPoint;
    constructor(e: PointerEvent) {
        this.x = e.clientX;
        this.y = e.clientY
        this.link = true
        this.perControlPoint = new ControlPoint(this.x, this.y)
        this.nextControlPoint = new ControlPoint(this.x, this.y)
    }

    // 更新当前点的控制点
    updateControlPoint(e: PointerEvent) {
        const { clientX, clientY } = e
        if (this.link) {
            this.symmetric(clientX, clientY)
        } else {

        }

    }

    // 中心对称   -----暂时只考虑 绘制中  不考虑修改的情况
    private symmetric(x: number, y: number) {
        this.nextControlPoint.updatePoint(x, y) 
        const deltaX = x - this.x
        const deltaY = y - this.y
        this.perControlPoint.updatePoint(this.x - deltaX, this.y - deltaY)
    }

    // 非中心对称  只能更新被点击的控制点
   private unSymmetric(x: number, y: number) {

    }

    render(): void {
        
    }

}