/** 负责3D渲染相关 */
import { Scene, WebGLRenderer,OrthographicCamera ,DirectionalLight,Mesh} from "three";
import { TrackballControls  } from 'three/examples/jsm/controls/TrackballControls.js';
import createCamera from "./threeSystem/camera";
import createControls from "./threeSystem/controls";
import createLight from "./threeSystem/light";
import createRenderer from "./threeSystem/render";
import createScene from "./threeSystem/scene";
import createFloorPlank from './threeSystem/floorPlank'
import RotateControl from "./threeSystem/RotateControl";


// 文件主要处理渲染相关的逻辑
export class ThreeLayer {
   threeRender:WebGLRenderer
   scene:Scene
   camera:OrthographicCamera
   light:DirectionalLight
   control:TrackballControls
   floorPlank:Mesh
   width:number
   height:number
   rotateControl:Mesh
  //  uiCanvasCtx: HTMLCanvasElement;
  constructor(canvas:OffscreenCanvas|HTMLCanvasElement){
    this.threeRender = createRenderer(canvas)
    this.scene = createScene()
    this.camera = createCamera(canvas)
    this.light = createLight()
    this.control = createControls(this.camera,canvas as HTMLCanvasElement)
    this.scene.add(this.light)
    this.floorPlank = createFloorPlank()
    this.scene.add(this.floorPlank)
    const {width,height} = canvas
    this.width = width
    this.height = height
    this.rotateControl = RotateControl
    
  }

  render(){
    this.threeRender.render(this.scene,this.camera)
    // this.uiCanvas.drawImage()
  }

}