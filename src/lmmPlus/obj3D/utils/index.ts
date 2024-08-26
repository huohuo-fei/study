import {
  Group,
  Mesh,
  OrthographicCamera,
  Raycaster,
  Vector2,
  Vector3,
} from 'three';

// 获取3d 世界坐标
//  export function get3DCoordinate(offsetX: number, offsetY: number,width:number,height:number): number[] {
//     return canvasTo3D(
//       offsetX,
//       offsetY,
//       width,
//       height
//     );
//   }

/**
 * canvas坐标系 转 webgl 坐标系
 * @param {*} canvasX  在canvas 坐标系中的 x
 * @param {*} canvasY  y
 * @param {*} canvasW  canvas画布的宽度
 * @param {*} canvasH  高度 converCoordinateTo3D
 */
export function converCoordinateTo3D(
  canvasX: number,
  canvasY: number,
  canvasW: number,
  canvasH: number
) {
  const [x, y] = [(canvasX / canvasW) * 2 - 1, -(canvasY / canvasH) * 2 + 1];
  return [x, y];
}

// 获取鼠标点和  平面的焦点
/**
 *
 * @param {*} x canvas 下的 x 坐标
 * @param {*} y
 * @param {*} camera
 * @param {*} floorPlan
 * @returns {Vector3}
 */
export function getPointOfFloor(
  x: number,
  y: number,
  camera: any,
  floorPlan: any
) {
  // // 创建一个 Raycaster
  const raycaster = new Raycaster();

  // // 获取鼠标点击的屏幕坐标
  const mouse = new Vector2(x, y);

  // // 设置 Raycaster 的起点和方向
  raycaster.setFromCamera(mouse, camera);

  // // 计算 Raycaster 与坐标平面 XOZ 的焦点
  const intersection = raycaster.intersectObject(floorPlan);

  if (intersection.length > 0) {
    // 获取焦点的世界坐标
    const point = intersection[0].point;
    // console.log('Intersection point:', point);
    return point;
  } else {
    // console.log('No intersection found.');
    return new Vector3(0, 0, 0);
  }
}

export function getObjByPoint(
  x: number,
  y: number,
  camera: OrthographicCamera,
  obj: Group[]
) {
  const raycaster = new Raycaster();
  raycaster.params.Line.threshold = 0.01;

  // 获取鼠标点击的屏幕坐标
  const mouse = new Vector2(x, y);

  // 设置 Raycaster 的起点和方向
  raycaster.setFromCamera(mouse, camera);

  // 计算 Raycaster 与坐标平面 XOZ 的焦点
  const intersection = raycaster.intersectObjects(obj);

  if (intersection.length > 0) {
    // 获取焦点的世界坐标
    return intersection;
  } else {
    return false;
  }
}

// 销毁内存中的对象
export function destroyObj(obj: any) {
  obj.traverse((obj: any) => {
    if (obj.isGroup) {
      // 如果时 group 需要遍历
      for (let i = 0; i < obj.children.length; i++) {
        destroyObj(obj.children[i]);
      }
    } else {
      obj.geometry.dispose();

      // 销毁材质  材质可能是由数组组成 需要做一层判断
      if (obj.material instanceof Array) {
        for (let m of obj.material) {
          m.dispose();
        }
      } else {
        obj.material.dispose();
      }
    }
  });
}
