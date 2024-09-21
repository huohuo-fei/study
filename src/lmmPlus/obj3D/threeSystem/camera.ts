
import {Vector3,OrthographicCamera} from 'three'
export default function createCamera(canvas:OffscreenCanvas|HTMLCanvasElement){
  const halfH = 2;
  const ratio = canvas.width / canvas.height;
  const halfW = halfH * ratio;
  const [left, right, top, bottom, near, far] = [
    -halfW,
    halfW,
    halfH,
    -halfH,
    0.1,
    100,
  ];
  const eye = new Vector3(0, 4, 10);
  const target = new Vector3(0, 0, 0);

  const camera = new OrthographicCamera(
    left,
    right,
    top,
    bottom,
    near,
    far
  );
  camera.position.copy(eye);
  camera.lookAt(target);
  camera.updateMatrixWorld();
  return camera
}