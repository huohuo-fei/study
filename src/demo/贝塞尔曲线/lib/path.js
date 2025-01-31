// 贝塞尔曲线
import { Point } from "./point";
import { Receiver } from "./receiver";
export class Bezier extends Receiver {
    constructor(ctx) {
        // 首个点是起点，末尾点是结束点，其余都是控制点
        // this.points = points
        this.ctx = ctx
    }

    render(){
        
    }

    // 绘制控制点
    renderControlPoint(){
        
    }

    // 绘制起点和终点
    renderStartAndEndPoint(){
        
    }

    // 绘制曲线
    renderBezierCurve(){
        
    }

    // 更新控制点
    updateControlPoint(){
        
    }

    // 更新起点和终点
    updateStartAndEndPoint(){
        
    }

    onPointerDown(e){

    }

    onPointerMove(e){
        
    }
    onPointerUp(e){
        
    }
}