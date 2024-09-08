
import { Group } from "three"
import { RenderLayer } from "../renderLayer"
import { GeoType } from "../renderLayer"
export type snapshotType = {
  minBox:number[], // 几何体具体的位置信息
  resourceCanvas:OffscreenCanvas, // 几何体平面图
  originData:{
    type:GeoType,
    data:Object
  }, // 几何体原始三维数据 。。。待定
}

// 用于保存几何体的三维快照信息 
export class Snapshot {
  geoSnapshot:Set<snapshotType> = new Set()
  baserRender: RenderLayer
  width: number
  height: number
  baseOffscreenCanvas: OffscreenCanvas
  baseCtx: OffscreenCanvasRenderingContext2D | null
  constructor(renderLayer:RenderLayer){
    this.baserRender = renderLayer
    this.width = renderLayer.width
    this.height = renderLayer.height
    this.baseOffscreenCanvas = new OffscreenCanvas(this.width ,this.height)
    this.baseCtx = this.baseOffscreenCanvas.getContext('2d')
  }

  get cacheCanvas(){
    this.baseCtx?.clearRect(0,0,this.width,this.height)
    for(let snapshot of this.geoSnapshot){
      this.baseCtx?.drawImage(snapshot.resourceCanvas,0,0)
    }
    return this.baseOffscreenCanvas
  }

  addSnapshot(data:snapshotType){
    this.geoSnapshot.add(data)
    this.baserRender.isForceRenderBg = true
    this.baserRender.dispatchEvent({type:'changeSnapshot',value:this.geoSnapshot.size})
  }

  removeSnapshot(data:snapshotType){
    this.geoSnapshot.delete(data)
    this.baserRender.isForceRenderBg = true
    this.baserRender.dispatchEvent({type:'changeSnapshot',value:this.geoSnapshot.size})

  }

/**
 * 根据传入的canvas 坐标，倒序寻找图片
 * @param x 
 * @param y 
 * @returns 
 */
  searchGeoByPointe(x:number,y:number){
    for(let snapshot of Array.from(this.geoSnapshot).reverse()){
      const minBox = snapshot.minBox
      if(minBox[0]<x&&minBox[1]<y&&minBox[2]>x&&minBox[3]>y){
        this.baserRender.geoBase?.parseData(snapshot)
        return
      }
    }
    console.log('没有选中物体');
  }
}