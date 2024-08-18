import {
  WebGLRenderer,
} from "three";

function createRenderer(canvas:OffscreenCanvas|HTMLCanvasElement){
  const renderer = new WebGLRenderer({
    canvas: canvas,
    antialias: true,
    preserveDrawingBuffer: true,
    alpha: true,
  });
  renderer.shadowMap.enabled = true;
  return renderer
}
export default createRenderer