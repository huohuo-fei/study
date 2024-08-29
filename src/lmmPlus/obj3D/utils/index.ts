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

export function threeToCanvas(webglPoint: Vector3, canvasW: number, canvasH: number) {
  const [x, y] = [
    ((webglPoint.x + 1) / 2) * canvasW,
    (-(webglPoint.y - 1) / 2) * canvasH,
  ];
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

export const converCanvas = (
  circlePointsArr: any,
  camera: OrthographicCamera,
  canvas: OffscreenCanvas | HTMLCanvasElement
)=> {
  const points = [];
  // 对传来的数据做双重循环 [[],[],[]],每一个数组 都是一个不同类型的点的集合
  for (let i = 0; i < circlePointsArr.length; i++) {
    for (let j = 0; j < circlePointsArr[i].length; j += 3) {
      const point = new Vector3(
        circlePointsArr[i][j],
        circlePointsArr[i][j + 1],
        circlePointsArr[i][j + 2]
      );
      const standardVec = point.project(camera);
      console.log(standardVec,'standardVec');
      
      // 需要将 NDC 尺寸的坐标 转为 canvas尺寸下的坐标  -- 屏幕坐标
      const [screenX, screenY] = threeToCanvas(
        standardVec,
        canvas.width,
        canvas.height
      );
      points.push([screenX, screenY]);
    }
  }
  return cicleMinBox(points);
}

// 寻找webgl坐标下的 包围盒点位
export const converCanvas2 = (
  circlePointsArr: any,
  camera: OrthographicCamera,
  canvas: OffscreenCanvas | HTMLCanvasElement
)=> {
  const points = [];
  // 对传来的数据做双重循环 [[],[],[]],每一个数组 都是一个不同类型的点的集合
  for (let i = 0; i < circlePointsArr.length; i++) {
    for (let j = 0; j < circlePointsArr[i].length; j += 3) {
      const point = new Vector3(
        circlePointsArr[i][j],
        circlePointsArr[i][j + 1],
        circlePointsArr[i][j + 2]
      );
      const standardVec = point.project(camera);
      points.push([standardVec.x, standardVec.y]);
    }
  }
  return cicleMinBox(points);
}


function cicleMinBox(pointArr: any) {
  // 根据传入的坐标，记录四个值：minX minY maxX maxY
  let minX = 0;
  let minY = 0;
  let maxX = 0;
  let maxY = 0;

  for (let i = 0; i < pointArr.length; i++) {
    const [x, y] = pointArr[i];
    if (i === 0) {
      minX = x;
      maxX = x;
      minY = y;
      maxY = y;
      continue;
    }
    if (x < minX) {
      minX = x;
    }
    if (x > maxX) {
      maxX = x;
    }

    if (y < minY) {
      minY = y;
    }
    if (y > maxY) {
      maxY = y;
    }
  }

    const OFFSET_LITTLE = 0;

  return [minX - OFFSET_LITTLE, minY-OFFSET_LITTLE, maxX +OFFSET_LITTLE, maxY+OFFSET_LITTLE];
}

  /**
   * 根据包围盒信息 生成 canvas 副本，并对当前几何体数据做保存
   */
export const createCacheCanvas = (minX: number, minY: number, maxX: number, maxY: number,canvas:HTMLCanvasElement |OffscreenCanvas) => {
    const OFFSET_LITTLE = 0;
    // 计算位置 和大小 这里添加一个偏移量 扩大最小包围盒
    const [newMinX, newMinY, newMaxX, newMaxY] = [
      minX - OFFSET_LITTLE,
      minY - OFFSET_LITTLE,
      maxX + OFFSET_LITTLE,
      maxY + OFFSET_LITTLE,
    ];

    const [width, height] = [newMaxX - newMinX, newMaxY - newMinY];
    return new Promise<ImageBitmap>((resolve, reject) => {
      // 向 3D 画布截取指定内容时 需要注意：3D画布考虑了像素比的问题，所以，截取范围和坐标需要 * dip
      createImageBitmap(
        canvas,
        newMinX,
        newMinY,
        width,
        height
      ).then((imageBitmap) => {
        resolve(imageBitmap);
      });
    });
  }
