import { EventDispatcher } from '../core/EventDispatcher';
import { Vector2 } from '../math/Vector2';
import { Camera } from '../core/Camera';

/* change 事件  */
const _changeEvent = { type: 'change' };

// 暂存数据的类型
type Stage = {
  cameraZoom: number;
  cameraPosition: Vector2;
  panStart: Vector2; // 移动的起始点
};

type Option = {
  camera?: Camera;
  enableZoom?: boolean;
  zoomSpeed?: number;
  enablePan?: boolean;
  panSpeed?: number;
};

export class OrbitControler extends EventDispatcher {
  camera: Camera;
  enableZoom = true;
  zoomSpeed = 3.0;

  enablePan = true;
  panSpeed = 1.0;

  // 是否正在移动
  panning = false;

  // 变换相机的暂存数据
  stage: Stage = {
    cameraPosition: new Vector2(0),
    cameraZoom: 1,
    panStart: new Vector2(0),
  };

  constructor(camera: Camera, option: Option) {
    super();
    this.camera = camera;
    this.setOption(option);
  }
  setOption(option: Option) {
    Object.assign(this, option);
  }

  // 滚轮缩放
  doScale(deltaY: number) {
    const { enableZoom, zoomSpeed, camera, stage } = this;
    if (!enableZoom) return;

    // 获取设定的缩放值  -- 算法不唯一
    const scale = Math.pow(0.9, zoomSpeed);
    // 用于记录上一个值
    stage.cameraZoom = camera.zoom
    if (deltaY > 0) {
      camera.zoom /= scale;
    } else {
      camera.zoom *= scale;
    }

    this.dispatchEvent(_changeEvent)
  }

  // 鼠标按下
  pointerdown(cx:number,cy:number){
    const {
      enablePan,
      camera,
      stage:{
        cameraPosition,
        panStart
      }
    } = this

    if(!enablePan) return

    this.panning = true
    cameraPosition.copy(camera.position)
    panStart.set(cx,cy)
  }

  pointerup(){
    this.panning = false
  }

  pointermove(cx:number,cy:number){
    const { enablePan,panning ,camera,stage:{panStart}} = this
    if(!enablePan || !panning) return
    const deltaDistance = new Vector2(panStart.x - cx,panStart.y-cy)
    camera.position.add(deltaDistance)
    panStart.set(cx,cy)
    this.dispatchEvent(_changeEvent)
  }
}
