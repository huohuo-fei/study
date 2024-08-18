import {
  Vector3,
  Vector2,
  BufferGeometry,
  Points,
  PointsMaterial,
  BufferAttribute,
  PlaneGeometry,
  MeshBasicMaterial,
  Mesh,
  Raycaster,
  ShaderMaterial,
  NeverDepth,
  OrthographicCamera,
} from "three";

import { getPointOfFloor } from ".";
// 创建点
function createPoint(x:number, y:number, camera:OrthographicCamera, floorPlan:any) {
  // 获取点击在 floorPlan 的点
  const clickPoint = getPointOfFloor(x, y, camera, floorPlan);

  const vertices = new Float32Array([clickPoint.x, clickPoint.y, clickPoint.z]);
  const pointGeometry = new BufferGeometry();
  pointGeometry.setAttribute("position", new BufferAttribute(vertices, 3));

  // 使用自定义着色器 顶点着色器代码
  const vertexShader = `
        void main() {
        // 设置点的位置
        // projectionMatrix 投影矩阵  viewMatrix 视图矩阵
        gl_Position = projectionMatrix* viewMatrix  * vec4( position, 1.0 );
        // 设置点的大小为50像素
        gl_PointSize = 12.0;

        }
    `;
  // 片元着色器代码
  const fragmentShader = `
        void main() {
        // 光栅化片元的颜色 绘制圆形
        if (distance(gl_PointCoord, vec2(0.5, 0.5)) > 0.5) discard;
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
        }
    `;
  // 初始化自定义材质对象
  const material = new ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
  });
  const material2 = new PointsMaterial( { color: 0x888888 } );
  // const pointMesh = new Points(pointGeometry, material2);
  const pointMesh = new Points(pointGeometry, material);

  return pointMesh;
}
// 创建地板
function floorPlan() {
  // 创建一个平面几何体
  const planeGeometry = new PlaneGeometry(60, 60); // 设置平面的宽度和高度

  // 创建一个材质
  const planeMaterial = new MeshBasicMaterial({
    depthTest: true,
    depthFunc: NeverDepth,
    color: 0xffff00,
    transparent: true,
    opacity: 0.2, // 设置透明度
  }); // 设置平面的颜色

  // 创建一个平面网格
  const planeMesh = new Mesh(planeGeometry, planeMaterial);
  planeMesh.name = "floorPlan";

  // 将平面放置在 XOZ 平面上
  planeMesh.rotation.x = -Math.PI / 2; // 旋转平面使其与 XOZ 平面对齐
  planeMesh.position.y = 0; // 设置平面的 Y 坐标 绘制在
  return planeMesh;
}

export { createPoint, floorPlan };
