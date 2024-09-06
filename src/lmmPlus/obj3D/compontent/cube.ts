import {
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
  LineBasicMaterial,
  Vector3,
  BufferAttribute,
  BufferGeometry,
  LineLoop,
  Group,
  LineSegments,
  DoubleSide,
  EdgesGeometry,
  MeshStandardMaterial,
  NeverDepth,
  Line,
  LineDashedMaterial,
  TypedArray,
  Material,
  Box3,
  Object3D,
  Color,
  LessEqualDepth,
  Matrix4,
  Quaternion,
} from 'three';
import { DASH_SIZE, GAP_SIZE } from './const/boxConst';
import { CommonGeo } from '../geo/CommonGeo';
import {
  DEFAULT_STRETCH,
  UN_UPDATE_RESIZE_CONTROL,
} from '../threeSystem/const';

/**
 * 立方体
 */
export class Cube extends CommonGeo {
  // 底边 侧边 顶部的线框实例
  bottom_line: LineLoop | null = null;
  top_line: LineLoop | null = null;
  side_line: LineSegments | null = null;
  // 底部 侧边 顶部线框的buffer -- 可以更新这个buffre 不需要每次重新生成实例
  bottom_geo: BufferGeometry | null = null;
  top_geo: BufferGeometry | null = null;
  side_geo: BufferGeometry | null = null;
  // 保存着所有 绘制状态下生成的线框 底边 侧边 顶部三组
  bottom_group: Group | null = null;
  // 绘制底部线框的落点
  downPoint: Vector3 = new Vector3();
  // 底部线框的结束点
  upPoint: Vector3 = new Vector3();

  // -------- 几何体相关----------------//
  // 几何体的边框  -- 这里使用自定义线框  用于后期单独改变线框的颜色以及虚线
  lineMesh: Mesh | null = null;
  // 立方体初始的八个顶点的位置  用于计算距离视点的最远位置  实现 虚线功能
  originTotalPoint: number[] | null = null;
  // 有正负的高度
  dirHeight: number = 0;
  // 初始状态的最小包围盒
  minBoxPointArr: Vector3[] = [];

  drawBottom(startPoint: Vector3, endPoint: Vector3) {
    this.downPoint.copy(startPoint);
    this.upPoint.copy(endPoint);
    const material = new LineBasicMaterial({
      color: '#ffffff',
    });
    // 构建 另外两个坐标 -- 立方体 都是垂直的关系
    const p0 = new Vector3(startPoint.x, startPoint.y, startPoint.z);
    const p1 = new Vector3(startPoint.x, startPoint.y, endPoint.z);
    const p2 = new Vector3(endPoint.x, startPoint.y, endPoint.z);
    const p3 = new Vector3(endPoint.x, startPoint.y, startPoint.z);
    // this.box_tem.push(p0, p3);

    const points = [];
    points.push(...p0, ...p1, ...p2, ...p3);

    if (!this.bottom_line) {
      // 根据起点  终点  绘制底边矩形 逆时针
      const positionAttr = new BufferAttribute(new Float32Array(points), 3);
      this.bottom_geo = new BufferGeometry().setAttribute(
        'position',
        positionAttr
      );
      this.bottom_line = new LineLoop(this.bottom_geo, material);

      // 新建一个组 用来保存 组成立方体边框的 12 跟线段
      this.bottom_group = new Group();
      this.bottom_group.name = 'bottomLine';
      this.stretchBottomThree();
      // 添加顶部 侧部 底部
      this.bottom_group.add(this.top_line as LineLoop);
      this.bottom_group.add(this.side_line as LineSegments);
      this.bottom_group.add(this.bottom_line);
    } else {
      // 如果之前已近创建过线  那么只需要更新里面的顶点数据
      const vertices = new Float32Array(points);
      const newPositionAttr = new BufferAttribute(vertices, 3);
      if (this.bottom_geo) {
        this.bottom_geo.setAttribute('position', newPositionAttr);
      }
    }

    return this.bottom_group;
  }

  // 更新底面线框中 竖直线框的高度
  stretchBottomThree(height?: number) {
    if (height) {
      this.height = height;
    }
    const material = new LineBasicMaterial({
      color: '#ffffff',
    });
    // 先构建 立方体的顶面四条线段  使用 lineLoop
    const p0 = new Vector3(
      this.downPoint.x,
      this.downPoint.y + this.height,
      this.downPoint.z
    );
    const p1 = new Vector3(
      this.downPoint.x,
      this.downPoint.y + this.height,
      this.upPoint.z
    );
    const p2 = new Vector3(
      this.upPoint.x,
      this.downPoint.y + this.height,
      this.upPoint.z
    );
    const p3 = new Vector3(
      this.upPoint.x,
      this.downPoint.y + this.height,
      this.downPoint.z
    );
    const points = [];
    points.push(...p0, ...p1, ...p2, ...p3);

    // 然后再构建 侧面的四根线 需要单独绘制  使用 lines
    const p4_0 = new Vector3(
      this.downPoint.x,
      this.downPoint.y + this.height,
      this.downPoint.z
    );
    const p4_1 = new Vector3(
      this.downPoint.x,
      this.downPoint.y,
      this.downPoint.z
    );
    const p5_0 = new Vector3(
      this.downPoint.x,
      this.downPoint.y + this.height,
      this.upPoint.z
    );
    const p5_1 = new Vector3(
      this.downPoint.x,
      this.downPoint.y,
      this.upPoint.z
    );
    const p6_0 = new Vector3(
      this.upPoint.x,
      this.downPoint.y + this.height,
      this.upPoint.z
    );
    const p6_1 = new Vector3(this.upPoint.x, this.downPoint.y, this.upPoint.z);
    const p7_0 = new Vector3(
      this.upPoint.x,
      this.downPoint.y + this.height,
      this.downPoint.z
    );
    const p7_1 = new Vector3(
      this.upPoint.x,
      this.downPoint.y,
      this.downPoint.z
    );

    const pointside = [p4_0, p4_1, p5_0, p5_1, p6_0, p6_1, p7_0, p7_1];

    if (!this.top_geo) {
      // 绘制 顶部的线
      const positionAttr = new BufferAttribute(new Float32Array(points), 3);
      this.top_geo = new BufferGeometry().setAttribute(
        'position',
        positionAttr
      );
      this.top_line = new LineLoop(this.top_geo, material);

      //   绘制侧边线
      this.side_geo = new BufferGeometry().setFromPoints(pointside);
      this.side_line = new LineSegments(this.side_geo, material);

      this.top_line.visible = false;
      this.side_line.visible = false;
    } else {
      // 如果之前已近创建过线  那么只需要更新里面的顶点数据
      const vertices = new Float32Array(points);
      const newPositionAttr = new BufferAttribute(vertices, 3);
      this.top_geo.setAttribute('position', newPositionAttr);
      this.side_geo!.setFromPoints(pointside);
      this.top_line!.visible = true;
      this.side_line!.visible = true;
    }
  }
  createGeo() {
    this.width = Math.abs(this.upPoint.x - this.downPoint.x);
    this.depth = Math.abs(this.upPoint.z - this.downPoint.z);
    this.dirHeight = this.height;
    this.height = Math.abs(this.height);
    return this.buildGeoBySize();
  }
  buildGeoBySize(position?: Vector3, quaternion?: Quaternion, metaData?: any) {
    // 创建立方体
    const geometry = new BoxGeometry(this.width, this.height, this.depth);
    // 每个面的材质
    const materilaArrSource = this.buildMaterial(metaData);
    this.realGeo = new Mesh(geometry, materilaArrSource);
    this.realGeo.name = 'cube';

    // 创建线框
    const edges = new EdgesGeometry(geometry);
    const lineMesh = this.converLine(edges); // converLine2
    this.lineMesh = lineMesh;
    // 组合
    this.originGroup = new Group();
    this.originGroup.add(this.realGeo);
    this.originGroup.add(lineMesh);
    this.originGroup.name = 'cubeBox';
    this.getMinSize();
    this.transformGeo(position, quaternion);
    return this.originGroup;
  }

  buildMaterial(metaData?: any) {
    const materilaArrSource = [];
    if (metaData) {
      for (let i = 0; i < metaData.materials.length; i++) {
        // 判断是否为面的材质类型
        if (metaData.materials[i].type !== 'MeshStandardMaterial') continue;
        const color = new Color(metaData.materials[i].color).getHexString();
        // 在遍历材质时，需要将已近有颜色的面 记录下来  -- 这一版的 depthFunc 返回有问题  只会返回 0 对应的NeverDepth , 不返回 LessEqualDepth
        const depthFunc = metaData.materials[i].depthFunc;
        if (depthFunc !== NeverDepth) {
          this.alreadyChangeIndexs.set(i, '#' + color);
        }
        const m = new MeshStandardMaterial({
          color: '#' + color,
          side: DoubleSide,
          depthFunc: depthFunc === NeverDepth ? NeverDepth : LessEqualDepth,
          polygonOffset: true,
          polygonOffsetFactor: 1,
          polygonOffsetUnits: 4,
        });
        materilaArrSource.push(m);
      }
    } else {
      // 每个面 都需要 实例一个材质
      for (let i = 0; i < 6; i++) {
        const m = new MeshStandardMaterial({
          color: 0xffffff,
          side: DoubleSide,
          depthFunc: NeverDepth,
          polygonOffset: true,
          polygonOffsetFactor: 1,
          polygonOffsetUnits: 4,
        });
        materilaArrSource.push(m);
      }
    }

    return materilaArrSource;
  }
  // 将边缘线框 转为普通的线框 -- 为了解决在导入导出几何体时 不支持 边缘集合体的数据
  converLine(edges: EdgesGeometry) {
    // 所有顶点  前 24 个数据形成的八个顶点 就是 立方体所有不同的八个顶点  后续根据这八个顶点 生成 12根线即可
    const totalVertices = edges.attributes.position.array;
    const maxdistanceArr = this.searchDash(
      totalVertices.slice(0, 24) as Float32Array
    );
    const topVertives = totalVertices.slice(0, 12);
    const bottomVertives = totalVertices.slice(12, 24);
    const lineMesh = new Mesh();
    lineMesh.name = 'boxLineMesh';

    const lineColor = '#ffffff';

    // 顶部的四条边
    for (let i = 0; i < 4; i++) {
      const geo = new BufferGeometry();
      const linePoints = [];
      if (i === 3) {
        // 最后一根线 需要拿起点 和终点连接
        const p1 = topVertives.slice(0, 3);
        const p2 = topVertives.slice(9);
        linePoints.push(...p1, ...p2);
      } else {
        linePoints.push(...topVertives.slice(i * 3, (i + 2) * 3));
      }
      geo.setAttribute(
        'position',
        new BufferAttribute(new Float32Array(linePoints), 3)
      );

      // 需要根据当前使用到的点 ，检测是否包含最远点，包含就是虚线样式
      const isDash = this.checkDash(linePoints, maxdistanceArr);
      let material = null;
      if (isDash) {
        // 是虚线
        material = new LineDashedMaterial({
          color: 0x687b7c,
          linewidth: 1,
          scale: 1,
          dashSize: DASH_SIZE,
          gapSize: GAP_SIZE,
        });
      } else {
        material = new LineBasicMaterial({
          color: lineColor,
        });
      }

      const line = new Line(geo, material);
      line.computeLineDistances();
      line.name = 'edgeLine';
      lineMesh.add(line);
    }

    // 底部四条边
    for (let i = 0; i < 4; i++) {
      const geo = new BufferGeometry();
      const linePoints = [];

      if (i === 3) {
        // 最后一根线 需要拿起点 和终点连接
        const p1 = bottomVertives.slice(0, 3);
        const p2 = bottomVertives.slice(9);
        linePoints.push(...p1, ...p2);
      } else {
        linePoints.push(...bottomVertives.slice(i * 3, (i + 2) * 3));
      }

      geo.setAttribute(
        'position',
        new BufferAttribute(new Float32Array(linePoints), 3)
      );

      const isDash = this.checkDash(linePoints, maxdistanceArr);
      let material = null;
      if (isDash) {
        // 是虚线
        material = new LineDashedMaterial({
          color: 0x687b7c,
          linewidth: 1,
          scale: 1,
          dashSize: DASH_SIZE,
          gapSize: GAP_SIZE,
        });
      } else {
        material = new LineBasicMaterial({
          color: lineColor,
        });
      }
      const line = new Line(geo, material);
      line.computeLineDistances();
      line.name = 'edgeLine';

      lineMesh.add(line);
    }

    //  侧边四条边  --- 上下索引的对应关系->>> 01  10  23  32
    for (let i = 0; i < 4; i++) {
      const geo = new BufferGeometry();
      let bottomIndex = 0;
      if (i % 2 === 0) {
        // 偶数
        bottomIndex = i + 1;
      } else {
        bottomIndex = i - 1;
      }
      const topPoint = topVertives.slice(i * 3, (i + 1) * 3);
      const bottomPoint = bottomVertives.slice(
        bottomIndex * 3,
        (bottomIndex + 1) * 3
      );
      const ls = [...topPoint, ...bottomPoint];
      const isDash = this.checkDash(ls, maxdistanceArr);
      let material = null;
      if (isDash) {
        // 是虚线
        material = new LineDashedMaterial({
          color: 0x687b7c,
          linewidth: 1,
          scale: 1,
          dashSize: DASH_SIZE,
          gapSize: GAP_SIZE,
        });
      } else {
        material = new LineBasicMaterial({
          color: lineColor,
        });
      }
      geo.setAttribute(
        'position',
        new BufferAttribute(new Float32Array(ls), 3)
      );
      const line = new Line(geo, material);
      line.computeLineDistances();
      line.name = 'edgeLine';

      lineMesh.add(line);
    }

    return lineMesh;
  }

  // 计算是否包含最远点
  checkDash(
    linePoints: number[] | TypedArray,
    maxPoint: number[] | TypedArray
  ) {
    for (let i = 0; i < linePoints.length; i += 3) {
      if (
        linePoints[i] === maxPoint[0] &&
        linePoints[i + 1] === maxPoint[1] &&
        linePoints[i + 2] === maxPoint[2]
      ) {
        return true;
      }
    }
    return false;
  }

  // 遍历 八个顶点 寻找最远的点  最远点所连的线 就是虚线
  searchDash(totalVertices: number[] | Float32Array) {
    // console.log(totalVertices,'totalVerticestotalVertices');
    let cameraPosition = this.camera.position.clone();
    let maxDistanceVec = new Vector3();
    let maxDistanceValue = 0;

    /* 计算视点 沿 视线的方向中 距离立方体八个顶点最远的那个，三边就是虚线样式 */
    if (this.originGroup) {
      const translateVec = this.originGroup.position
        .clone()
        .sub(new Vector3(0, 0, 0));
      cameraPosition = cameraPosition.add(translateVec);
    }
    for (let i = 0; i < totalVertices.length; i += 3) {
      const point = new Vector3(
        totalVertices[i],
        totalVertices[i + 1],
        totalVertices[i + 2]
      );
      const distance = cameraPosition.distanceToSquared(point);
      if (distance > maxDistanceValue) {
        maxDistanceVec = point.clone();
        maxDistanceValue = distance;
      }
    }

    if (!this.originTotalPoint) {
      this.originTotalPoint = [...totalVertices];
    }
    return [...maxDistanceVec];
  }

  // 根据落点信息 将几何体移到绘制的位置上 默认插入到原点
  transformGeo(position?: Vector3, quaternion?: Quaternion) {
    if (position) {
      this.originGroup!.translateX(position.x);
      this.originGroup!.translateZ(position.z);
      this.originGroup!.translateY(position.y);
      this.originGroup!.applyQuaternion(quaternion as Quaternion);
    } else {
      const deltaX = (this.downPoint.x + this.upPoint.x) / 2;
      const deltaZ = (this.downPoint.z + this.upPoint.z) / 2;
      this.originGroup!.translateX(deltaX);
      this.originGroup!.translateZ(deltaZ);
      this.originGroup!.translateY(this.dirHeight / 2);
    }
  }

  // 相机改变 更新虚线
  updateDash() {
    const worldPosition = this.getWorldPoint(this.originTotalPoint as number[]);
    const maxDistanceArr = this.searchDash(worldPosition as number[]);
    if (!this.lineMesh) return;

    // 遍历模型，寻找最远点 并更新材质
    for (let i = 0; i < this.lineMesh.children.length; i++) {
      const originVertices = (
        this.lineMesh.children[i] as Mesh
      ).geometry.getAttribute('position').array;
      const worldLinePosition = this.getWorldPoint(
        originVertices as unknown as number[]
      );
      const isDash = this.checkDash(worldLinePosition, maxDistanceArr);
      const childMesh = this.lineMesh.children[i] as Mesh;

      if (isDash) {
        // 如果是虚线 设置虚线的材质
        // 先判断当前是否需要更新材质   -- 这里有 bug 需要更新对应轴的缩放比  通过强制更新间距 解决
        if (childMesh.material instanceof LineBasicMaterial) {
          (childMesh.material as Material).dispose();
          childMesh.material = new LineDashedMaterial({
            color: 0x687b7c,
            linewidth: 1,
            scale: 1,
            dashSize: DASH_SIZE,
            gapSize: GAP_SIZE,
          });
        }
      } else {
        // 设置实线的材质
        if (childMesh.material instanceof LineDashedMaterial) {
          (childMesh.material as Material).dispose();
          childMesh.material = new LineBasicMaterial({
            color: '#ffffff',
          });
        }
      }
    }

    // 寻找到最新的虚线后  立马同步最新的间距  -- 优化空间，只有换了虚线才触发
    this.scaleTotalByValue(0)
  }
  // 每次寻找虚线之前，需要根据原始的点 生成一份世界坐标系下的点
  getWorldPoint(resourceData: number[]) {
    const worldPosition = [];
    for (let i = 0; i < resourceData.length; i += 3) {
      const p0 = resourceData[i];
      const p1 = resourceData[i + 1];
      const p2 = resourceData[i + 2];
      const point = new Vector3(p0, p1, p2).applyMatrix4(
        this.originGroup!.matrix
      );
      worldPosition.push(...point);
    }
    return worldPosition;
  }

  // 更新原点处几何体的尺寸 -- 除了跟新几何体的尺寸 还需要更新虚线的间距
  updateOriginGeo(resizeDir: string, distance: number) {
    if (!this.originGroup) return;
    const { totalScaleX, totalScaleY, totalScaleZ } = this;
    if (resizeDir === 'up') {
      // 最新的 值
      const newValue = totalScaleY + distance / this.height;
      if (newValue < DEFAULT_STRETCH) {
        return UN_UPDATE_RESIZE_CONTROL;
      }
      this.originGroup.scale.set(totalScaleX, newValue, totalScaleZ);
      this.setDashStyleByDir(resizeDir, newValue);
    } else if (resizeDir === 'right') {
      const newValue = totalScaleX + distance / this.width;

      if (newValue < DEFAULT_STRETCH) {
        return UN_UPDATE_RESIZE_CONTROL;
      }
      this.originGroup.scale.set(newValue, totalScaleY, totalScaleZ);
      this.setDashStyleByDir(resizeDir, newValue);
    } else {
      const newValue = totalScaleZ + distance / this.depth;
      if (newValue < DEFAULT_STRETCH) {
        return UN_UPDATE_RESIZE_CONTROL;
      }
      this.originGroup.scale.set(totalScaleX, totalScaleY, newValue);
      this.setDashStyleByDir(resizeDir, newValue);
    }
  }

  // 在 resize 时，重新设置当前虚线的长度  -- 注意 这里线段的顺序，
  setDashStyleByDir(dir: string, scaleValue: number) {
    // 根据改变的方向 确定虚线索引
    if (dir === 'up') {
      this.dashUpdateLine(scaleValue);
    } else if (dir === 'right') {
      this.dashRightUpdateLine(scaleValue);
    } else {
      this.dashFrontUpdateLine(scaleValue);
    }
  }
  updateLineDash(childMesh: Mesh, scale: number) {
    (childMesh.material as LineDashedMaterial).dashSize = DASH_SIZE / scale;
    (childMesh.material as LineDashedMaterial).gapSize = GAP_SIZE / scale;
  }
  dashUpdateLine(scaleValue: number) {
    for (let i = 8; i < this.lineMesh!.children.length; i++) {
      const childMesh = this.lineMesh!.children[i] as Mesh;

      if (childMesh.material instanceof LineDashedMaterial) {
        this.updateLineDash(childMesh, scaleValue);
      }
    }
  }
  dashRightUpdateLine(scaleValue: number) {
    for (let i of [1, 3]) {
      const childMesh = this.lineMesh!.children[i] as Mesh;

      // 寻找顶部的
      if (childMesh.material instanceof LineDashedMaterial) {
        this.updateLineDash(childMesh, scaleValue);

        return;
      }
      let bottomIndex = 0;
      // 寻找底部的
      if (i === 1) {
        bottomIndex = 7;
      } else {
        bottomIndex = 5;
      }
      const childMeshBottom = this.lineMesh!.children[bottomIndex] as Mesh;
      if (childMeshBottom.material instanceof LineDashedMaterial) {
        this.updateLineDash(childMeshBottom, scaleValue);
      }
    }
  }
  dashFrontUpdateLine(scaleValue: number) {
    for (let i of [0, 2]) {
      const childMesh = this.lineMesh!.children[i] as Mesh;

      if (childMesh.material instanceof LineDashedMaterial) {
        this.updateLineDash(childMesh, scaleValue);

        return;
      }
      const bottomIndex = i + 4;
      const childMeshBottom = this.lineMesh!.children[bottomIndex] as Mesh;

      if (childMeshBottom.material instanceof LineDashedMaterial) {
        this.updateLineDash(childMeshBottom, scaleValue);
      }
    }
  }
  // 将缩放量累积起来，下次的变换 基于之前缩放的和
  saveOutSize() {
    const scale = this.originGroup!.scale;
    this.totalScaleX = scale.x;
    this.totalScaleY = scale.y;
    this.totalScaleZ = scale.z;
  }
  setAllDashStyle(scaleX: number, scaleY: number, scaleZ: number) {
    this.dashUpdateLine(scaleY);
    this.dashRightUpdateLine(scaleX);
    this.dashFrontUpdateLine(scaleZ);
  }

  getMinSize() {
    const points = [];

    if (this.minBoxPointArr.length === 0) {
      const box3 = new Box3();
      box3.expandByObject(this.originGroup!); // 计算模型包围盒
      const { min, max } = box3;

      // 计算 立方体的八个顶点 webgl 坐标下   -- 逆时针旋转
      const p0 = new Vector3().copy(min);
      const p7 = new Vector3().copy(max);
      const p1 = new Vector3(min.x, min.y, max.z);
      const p2 = new Vector3(max.x, min.y, max.z);
      const p3 = new Vector3(max.x, min.y, min.z);
      const p4 = new Vector3(max.x, max.y, min.z);
      const p5 = new Vector3(min.x, max.y, min.z);
      const p6 = new Vector3(min.x, max.y, max.z);
      points.push(...p0, ...p1, ...p2, ...p3, ...p4, ...p5, ...p6, ...p7);
      this.minBoxPointArr = [p0, p1, p2, p3, p4, p5, p6, p7];
    } else {
      for (let i = 0; i < this.minBoxPointArr.length; i++) {
        const newPoint = this.minBoxPointArr[i]
          .clone()
          .applyMatrix4(this.originGroup!.matrixWorld);
        points.push(...newPoint);
      }
    }
    return [points];
  }

  // 对整个几何体进行缩放
  scaleTotalByValue(value: number) {
    const { totalScaleX, totalScaleY, totalScaleZ } = this;
    const newScaleX = totalScaleX * (1 + value);
    const newScaleY = totalScaleY * (1 + value);
    const newScaleZ = totalScaleZ * (1 + value);
    this.originGroup!.scale.set(newScaleX, newScaleY, newScaleZ);
    this.setAllDashStyle(newScaleX, newScaleY, newScaleZ);
  }
  scaleTotalByValueEnd() {
    const scale = this.originGroup!.scale;
    this.totalScaleX = scale.x;
    this.totalScaleY = scale.y;
    this.totalScaleZ = scale.z;
  }

  /**
   * 解析数据，还原几何体 ，，这里做了重置操作，还原后的数据，缩放值为1
   * @param obj 
   * @param metaData 
   * @returns 
   */
  parseData(obj: any, metaData: any) {
    const { width, depth, height } = obj.children[0].geometry.parameters;
    this.width = width * obj.scale.x;
    this.depth = depth * obj.scale.z;
    this.height = height * obj.scale.y;
    return this.buildGeoBySize(obj.position as Vector3, obj.quaternion,metaData);
  }
}
