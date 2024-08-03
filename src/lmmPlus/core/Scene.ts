import { Camera } from './Camera';
import { Group } from '../objects/Group';
import { Object2D } from '../objects/Object2D';
import { Vector2 } from '../math/Vector2';
import { Matrix3 } from '../math/Matrix3';
type SceneType = {
  canvas?: HTMLCanvasElement;
  camera?: Camera;
  autoClear?: boolean; // 绘制前是否清空画布
};
// 管理着编辑器中所有的元素
export class Scene extends Group {
  private _canvas = document.createElement('canvas');
  ctx: CanvasRenderingContext2D = this._canvas.getContext(
    '2d'
  ) as CanvasRenderingContext2D;
  camera: Camera = new Camera();
  autoClear: boolean = true;
  readonly isScene = true;

  constructor(attr: SceneType = {}) {
    super();
    this.setOption(attr);
  }

  get canvas() {
    return this._canvas;
  }
  set canvas(value) {
    if (value === this._canvas) return;
    this._canvas = value;
    this.ctx = this._canvas.getContext('2d') as CanvasRenderingContext2D;
  }

  // 设置上面的三个属性
  setOption(attr: SceneType) {
    // 使用for of 循环 可以触发 get set 拦截器
    for (const [key, val] of Object.entries(attr)) {
      this[key] = val;
    }
  }

  // 渲染
  render() {
    const {
      canvas: { width, height },
      ctx,
      camera,
      children,
      autoClear,
    } = this;

    ctx.save();
    // 清理画布 这是在没有移动画布中心点的情况下,所以当前清理的也就是整个屏幕的像素范围
    autoClear && ctx.clearRect(0, 0, width, height);
    // 移动canvas 原点
    ctx.translate(width / 2, height / 2);

    for (let child of children) {
      ctx.save();
      // 如果图像受到camera 控制 则对画布执行相机变换的逆变换--相当于应用到物体上
      child.enableCamera && camera.transformInvert(ctx);

      // 再次基础上进行绘图
      child.draw(ctx)
      ctx.restore()
    }

    ctx.restore()
  }

  // client 坐标转canvas坐标
  clientToCanvas(clientX:number,clientY:number){
    const {canvas} = this
    const {left,top} = canvas.getBoundingClientRect()
    return new Vector2(clientX-left,clientY-top)
  }

  // canvas 坐标 转裁剪坐标
  canvasToClip({x,y}:Vector2){
    const {canvas:{width,height}} = this

    // 裁剪坐标 是画布的中心点变换后的坐标系 
    // 中心点由左上角变为屏幕的中心
    return new Vector2(x - width/2,y-height / 2)
  }

  // client => clip
  clientToClip(clientX:number,clientY:number){
    return this.canvasToClip(this.clientToCanvas(clientX,clientY))
  }

  // 基于某个坐标系  判断某个点是否在图形内
  // 具体是什么坐标系  要看传入的矩阵和点 这两个对应起来就行
  isPointInObj(obj:Object2D,mp:Vector2,matrix:Matrix3 = new Matrix3()){
    const { ctx } = this
    ctx.beginPath()
    obj.crtPath(ctx,matrix)
    ctx.stroke()
    // ctx.fillRect(0,0,100,100)
    
    
    return ctx.isPointInPath(mp.x,mp.y)
  }
}
