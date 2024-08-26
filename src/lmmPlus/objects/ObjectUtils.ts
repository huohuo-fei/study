import { Scene } from '../core/Scene';
import { Matrix3 } from '../math/Matrix3';
import { Vector2 } from '../math/Vector2';
import { Object2D } from './Object2D';

/**
 * 基于当前路径点 和 矩阵，计算出变换后的路径
 */
const crtPathByMatrix = (
  ctx: CanvasRenderingContext2D,
  vertices: number[],
  matrix: Matrix3,
  closePath = true
) => {
  const p0 = new Vector2(vertices[0], vertices[1]).applyMatrix3(matrix);
  ctx.moveTo(p0.x, p0.y);

  for (let i = 2, len = vertices.length; i < len; i += 2) {
    const newPoint = new Vector2(vertices[i], vertices[i + 1]).applyMatrix3(
      matrix
    );
    ctx.lineTo(newPoint.x, newPoint.y);
  }

  closePath && ctx.closePath();
};

/**
 * 根据传来的顶点，绘制路径 
 * 与crtPathByMatrix 相比，就是少了 将点应用矩阵变换的过程
 * @param ctx 
 * @param vertices 
 * @param closePath 
 */
const crtPath = (ctx:CanvasRenderingContext2D,vertices:number[],closePath = false) =>{
  const p0 = new Vector2(vertices[0], vertices[1]);
  ctx.moveTo(p0.x, p0.y);

  for (let i = 2, len = vertices.length; i < len; i += 2) {
    const newPoint = new Vector2(vertices[i], vertices[i + 1])
    ctx.lineTo(newPoint.x, newPoint.y);
  }
  closePath && ctx.closePath();
}
const imgLoadPromise = (img: HTMLImageElement) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    img.onload = function () {
      resolve(img);
    };
    img.onerror = function () {
      reject(img);
    };
  });
};

const imgLoadPromises = (imgs: HTMLImageElement[]) => {
  return imgs.map((item) => imgLoadPromise(item));
};
function SelectObj(scene: Scene) {
	return function (objGroup: Object2D[], mp: Vector2): Object2D | null {
		for (let obj of [...objGroup].reverse()) {
			if (scene.isPointInObj(obj, mp, obj.pvmMatrix)) {
				return obj
			}
		}
		return null
	}
}

function selectObjByScene(objGroup: Object2D[], mp: Vector2,scene:Scene): Object2D | null{
	for (let obj of [...objGroup].reverse()) {
    if (scene.isPointInObj(obj, mp, obj.pvmMatrix)) {
      return obj
    }
  }
  return null
}
export { crtPathByMatrix, imgLoadPromises, imgLoadPromise ,crtPath,SelectObj,selectObjByScene};
