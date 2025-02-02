import { BezierPoint } from './type'
import { ControlPoint } from '../controlPoint';
import { CustomEvent } from '../mode';
export class Point implements BezierPoint {
    x: number;
    y: number;
    link: boolean;
    perControlPoint: ControlPoint;
    nextControlPoint: ControlPoint;
    constructor(e: CustomEvent) {
        this.x = e.x;
        this.y = e.y
        this.link = true
        this.perControlPoint = new ControlPoint(this.x, this.y)
        this.nextControlPoint = new ControlPoint(this.x, this.y)
    }

    restorePoint(p: Point) {
        this.x = p.x
        this.y = p.y
        this.perControlPoint.updatePoint(p.perControlPoint.x, p.perControlPoint.y)
        this.nextControlPoint.updatePoint(p.nextControlPoint.x, p.nextControlPoint.y)
        this.link = p.link

    }

    // 更新当前点的控制点
    updateControlPoint(e: CustomEvent) {
        const { x, y } = e
        if (this.link) {
            this.symmetric(x, y)
        } else {

        }

    }
    updateControlPointByDir(e: CustomEvent, dir: 'per' | 'next') {
        const { x, y } = e
        if (this.link ) {
            this.symmetric(x, y, dir)
        } else {
            this.unSymmetric(x, y, dir)
        }

    }

    updatePointPos(e: CustomEvent) {
        const { x, y } = e
        const deltaX = x - this.x
        const deltaY = y - this.y
        this.x += deltaX
        this.y += deltaY
        this.perControlPoint.updatePoint(this.perControlPoint.x + deltaX, this.perControlPoint.y + deltaY)
        this.nextControlPoint.updatePoint(this.nextControlPoint.x + deltaX, this.nextControlPoint.y + deltaY)
    }

    // 中心对称   -----暂时只考虑 绘制中  不考虑修改的情况
    private symmetric(x: number, y: number, dir = 'per') {
        if (dir === 'next') {
            this.perControlPoint.updatePoint(x, y)
            const deltaX = x - this.x
            const deltaY = y - this.y
            this.nextControlPoint.updatePoint(this.x - deltaX, this.y - deltaY)
        } else {
            this.nextControlPoint.updatePoint(x, y)
            const deltaX = x - this.x
            const deltaY = y - this.y
            this.perControlPoint.updatePoint(this.x - deltaX, this.y - deltaY)
        }

    }

    // 非中心对称  只能更新被点击的控制点
    private unSymmetric(x: number, y: number, dir = 'per') {
        if (dir === 'next') {
            this.perControlPoint.updatePoint(x, y)
        }else{
            this.nextControlPoint.updatePoint(x, y)
        }
    }

    render(): void {

    }

}