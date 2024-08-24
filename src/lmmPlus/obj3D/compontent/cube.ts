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
} from 'three';
import { DASH_SIZE, GAP_SIZE } from './const/boxConst';
import { CommonGeo } from '../geo/CommonGeo';

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
  buildGeoBySize() {
    // 创建立方体
    const geometry = new BoxGeometry(this.width, this.height, this.depth);
    // this.getAllVer(geometry);
    // 每个面 都需要 实例一个材质
    const materilaArrSource = [];
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
    this.transformGeo(this.originGroup);
    return this.originGroup;
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
    const cameraPosition = this.camera.position.clone();
    let maxDistanceVec = new Vector3();
    let maxDistanceValue = 0;
    const originTotalVec = []; // 保存的原始顶点数据
    for (let i = 0; i < totalVertices.length; i += 3) {
      const point = new Vector3(
        totalVertices[i],
        totalVertices[i + 1],
        totalVertices[i + 2]
      );
      // if(!this.originTotalPoint){
      //   // 第一次遍历顶点时  保存原始的顶点向量
      //   originTotalVec.push(point)
      // }
      // const distance = cameraPosition.sub(point).lengthSq()  //todo:计算向量的长度为什么不对啊
      const distance = cameraPosition.distanceToSquared(point); //todo:计算向量的长度为什么不对啊
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
  transformGeo(geo: Group) {
    const deltaX = (this.downPoint.x + this.upPoint.x) / 2;
    const deltaZ = (this.downPoint.z + this.upPoint.z) / 2;
    geo.translateX(deltaX);
    geo.translateZ(deltaZ);
    geo.translateY(this.dirHeight / 2);
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
      const worldLinePosition = this.getWorldPoint(originVertices as unknown as number[]);
      const isDash = this.checkDash(worldLinePosition, maxDistanceArr);
      const childMesh = this.lineMesh.children[i] as Mesh;

      if (isDash) {
        // 如果是虚线 设置虚线的材质
        // 先判断当前是否需要更新材质   -- 这里有 bug 需要更新对应轴的缩放比
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
}