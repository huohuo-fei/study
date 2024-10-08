/** 负责3D渲染相关 */
import {
  Scene,
  WebGLRenderer,
  OrthographicCamera,
  DirectionalLight,
  Mesh,
  Vector3,
  AxesHelper,
} from 'three';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
import createCamera from './threeSystem/camera';
import createControls from './threeSystem/controls';
import createLight from './threeSystem/light';
import createRenderer from './threeSystem/render';
import createScene from './threeSystem/scene';
import createFloorPlank from './threeSystem/floorPlank';
import TrackballObj from './threeSystem/TrackballObj';
import { RotateControl } from './control/RotateControl';
import { ResizeControl } from './control/ResizeControl';
import { FillControl } from './control/FillControl';
import { DrawControl } from './control/DrawControl';
import { RenderLayer } from './renderLayer';
import { GeoBase } from './geo/GeoBase';
import { TransformControl } from './control/TransformControl';

// 文件主要处理渲染相关的逻辑
export class ThreeLayer {
  threeRender: WebGLRenderer;
  scene: Scene;
  camera: OrthographicCamera;
  light: DirectionalLight;
  control: TrackballControls;
  floorPlank: Mesh;
  width: number;
  height: number;
  rotateCon: RotateControl;
  resizeCon: ResizeControl;
  fillCon: FillControl;
  drawCon: DrawControl;
  baseLayer: RenderLayer;
  geoBase!: GeoBase;
  trackballObj: TrackballObj;
  axesHelper: AxesHelper;
  canvas: OffscreenCanvas | HTMLCanvasElement
  transformControl:TransformControl
  //  uiCanvasCtx: HTMLCanvasElement;
  constructor(
    canvas: OffscreenCanvas | HTMLCanvasElement,
    baseRenderLayer: RenderLayer
  ) {
    this.threeRender = createRenderer(canvas);
    this.canvas = canvas
    this.scene = createScene();
    this.camera = createCamera(canvas);
    this.light = createLight();
    this.control = createControls(this.camera, canvas as HTMLCanvasElement);
    this.scene.add(this.light);
    this.floorPlank = createFloorPlank();
    this.scene.add(this.floorPlank);
    const { width, height } = canvas;
    this.width = width;
    this.height = height;
    this.rotateCon = new RotateControl(this);
    this.resizeCon = new ResizeControl(this);
    this.fillCon = new FillControl(this);
    this.drawCon = new DrawControl(this);
    this.transformControl = new TransformControl(this)
    this.baseLayer = baseRenderLayer;
    this.trackballObj = new TrackballObj({
      camera: this.camera,
      target: new Vector3(0, 0, 0),
      proxyElementEvent: canvas,
      floorPlank: this.floorPlank,
      layer: this,
    });

    this.axesHelper = new AxesHelper(10);
    // this.scene.add(this.axesHelper);
  }

  render() {
    this.threeRender.render(this.scene, this.camera);
  }
}
