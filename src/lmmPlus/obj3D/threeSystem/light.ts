import {
  DirectionalLight,
  Color,
  Vector3,
} from "three";

function createLight() {
  const color = new Color("#fff");
  // 平行光
  const light = new DirectionalLight(color, 5.0);
  // 设置灯光的位置   默认情况 位置在 远点 照射的方向也是 远点
  light.position.set(6, 4, 10);
  return light;
}

function changeLight(vector:Vector3, light:any) {
  light.position.set(vector.x, vector.y, vector.z);
  // light.target.position = new Vector3(0,0,0)
}
export default createLight
export { changeLight };
