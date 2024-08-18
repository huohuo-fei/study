import {PlaneGeometry,MeshBasicMaterial,NeverDepth,Mesh} from 'three'
// 创建地板
export default function createFloorPlank() {
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