import { Matrix4 } from "three";
import { customEvent } from "../../driver";
import { Receiver } from "../../driver/Receiver";
import { RenderLayer } from "../renderLayer";
import { getPointOfFloor } from "../utils";

export class Transform{
  baseRender: RenderLayer;
  startPoint:number[]=[0,0]
  constructor(baseRender:RenderLayer){
    this.baseRender = baseRender
  }

  onPointerdown(event?: PointerEvent, customEvent?: customEvent): void {
    console.log('transform');
    
    
  }
  onPointermove(params:{x:number,y:number}): void {
    console.log(params,'move');
    // 图形位移结束后的中点
    const [endX, endY] = [params.x + this.startPoint[0],params.y + this.startPoint[1]];
    // 映射到地板
    const originThree = getPointOfFloor(
      this.startPoint[0],
      this.startPoint[1],
      this.baseRender.threeLayer.camera,
      this.baseRender.threeLayer.floorPlank
    );
    const endThree = getPointOfFloor(
      endX,
      endY,
      this.baseRender.threeLayer.camera,
      this.baseRender.threeLayer.floorPlank
    );
    // 计算物体的位移向量
    const moveVec3 = endThree.sub(originThree);
    // 构建位移矩阵
    const translateMatrix = new Matrix4().makeTranslation(moveVec3);
    // console.log(translateMatrix,moveVec3,'translateMatrix,moveVec3');
    this.baseRender.geoBase?.originGroup.applyMatrix4(translateMatrix);
    
    
  }
  onPointerup(event?: PointerEvent | undefined, customEvent?: customEvent | undefined): void {
    
  }

}