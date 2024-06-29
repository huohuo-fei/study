import { Matrix3 } from '../math/Matrix3'
import { Vector2 } from '../math/Vector2'

/**
 * 基于当前路径点 和 矩阵，计算出变换后的路径
 */
function crtPathByMatrix(ctx:CanvasRenderingContext2D,vertices:number[],matrix:Matrix3){
  const p0 = new Vector2(vertices[0],vertices[1]).applyMatrix3(matrix)
  ctx.moveTo(p0.x,p0.y)

  for(let i=2,len = vertices.length;i<len;i+=2){
    const newPoint = new Vector2(vertices[i],vertices[i+1]).applyMatrix3(matrix)
    ctx.lineTo(newPoint.x,newPoint.y)
  }

  ctx.closePath()

}

export {crtPathByMatrix}