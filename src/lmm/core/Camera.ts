import { Vector2 } from '../math/Vector2';
import { Matrix3 } from '../math/Matrix3';
export class Camera {
  position: Vector2;
  zoom: number;

  constructor(x: number = 0, y: number = 0, zoom: number = 1) {
    this.position = new Vector2(x, y);
    this.zoom = zoom;
  }

  // 投影视图矩阵
  getPvMatrix(){
    const {position,zoom} = this
    // 先逆向缩放  再逆向位移
    return new Matrix3().scale(1 / zoom).translate(-position.x,-position.y)
  }

  // 使用相机变换
  transformInvert(ctx:CanvasRenderingContext2D){
    const {position,zoom} = this
    ctx.translate(-position.x,-position.y)
    ctx.scale(1/zoom,1/zoom)
  }
}
