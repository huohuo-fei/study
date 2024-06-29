import { Vector2 } from '../math/Vector2'
import { Group } from './Group'
import { Scene } from '../core/Scene'
import { EventDispatcher } from '../core/EventDispatcher'
import { Matrix3 } from '../math/Matrix3'
import { generateUUID } from '../math/MathUtils.js'

export type Object2DType = {
  // position rotate scale 是关于模型矩阵的参数
  position?: Vector2
  rotate?: number
  scale?: Vector2
  // 可见性  不可见的不会执行绘制方法
  visible?: boolean
  // 渲染顺序 从小到大绘制 
  index?: number
  // 便于查找当前对象
  name?: string
  // 父级对象
  parent?: Scene | Group | undefined
  // 当前对象是否受到相机矩阵的影响，只适用于Scene的子级元素。
  enableCamera?: boolean
  [key: string]: any
}

export class Object2D extends EventDispatcher{
      // 自定义属性
      [key: string]: any
      // 位置
      position = new Vector2()
      // 旋转
      rotate = 0
      // 缩放
      scale = new Vector2(1, 1)
      // 可见性
      visible = true
      // 渲染顺序
      index = 0
      // 名称
      name = ''
      // 父级
      parent: Scene | Group | undefined
      // 是否受相机影响-只适用于Scene的children元素
      enableCamera = true
      // UUID
      uuid = generateUUID()
  
      // 类型
      readonly isObject2D = true

      /**
       * 获取本地模型矩阵
       * 基于Matrix3的绝对变换，即在世界坐标系里缩放、旋转、位移的顺序，
       * 也就是参考的坐标系不发生变化
       * 矩阵的算法：模型矩阵 = 位移矩阵 * 旋转矩阵 * 缩放矩阵
       *  */
      get matrix():Matrix3{
        const {position,rotate,scale} = this

        // 此两种写法都可以
        // return new Matrix3().scale(scale.x,scale.y).rotate(rotate).translate(position.x,position.y)

        const mt = new Matrix3().makeTranslation(position.x,position.y)
        const ms = new Matrix3().scale(scale.x,scale.y)
        const mr = new Matrix3().rotate(rotate)
        return mt.multiply(mr).multiply(ms)
      }

      /**
       * 获取对象的世界模型矩阵
       * 自上而下的本地模型矩阵相乘
       */
      get worldMatrix():Matrix3{
        const {parent,matrix} = this
        if(parent){
          return parent.worldMatrix.multiply(matrix)
        }else{
          return matrix
        }
      }

      /**
       * 投影视图模型矩阵
       * 将投影视图矩阵左乘世界模型矩阵
       */
      get pvmMatrix():Matrix3{
        const scene = this.getScene()
        if(scene){
          const {camera} = scene
          return new Matrix3().multiplyMatrices(camera.getPvMatrix(),this.worldMatrix)
        }else{
          return this.worldMatrix
        }
      }

      /**
       * 物体从本地到世界的总缩放量
       */
      get worldScale():Vector2{
        const {scale,parent} = this
        if(parent){
          return scale.clone().multiply(parent.scale)
        }else{
          return scale
        }

      }

      /**
       * 变换物体
       * 按着绝对坐标系的说法 是缩放 旋转 位移  -- 这种解释，非常容易理解切变的概念
       * 按着相对坐标系的说法，就是变换坐标，是 位移 旋转 缩放
       */
      transform(ctx:CanvasRenderingContext2D){
        const {position,scale,rotate} = this
        ctx.translate(position.x,position.y)
        ctx.rotate(rotate)
        ctx.scale(scale.x,scale.y)

      }

      /**
       * 从父级对象中，删除自身
       * 父级对象存在，必然是一个group
       * 按照THREE来讲 Object3D本身也存在子级对象，也有自己的remove方法
       * 这块的逻辑有点奇怪，自己不能调用remove方法，应该先获取父级，
       * 然后调用父级的删除方法。。。
       */
      remove(){
        const {parent} = this
        parent && parent.remove()
      }

      /**
       * 获取场景
       */
      getScene():Scene|null{
        if('isScene' in this){
          return this 
        }else if(this.parent){
          return this.parent.getScene()
        }else{
          return null
        }
      }

      draw(ctx:CanvasRenderingContext2D){
        if(!this.visible) return

        ctx.save()
        // 先执行当前图形对象的矩阵变换 T R S
        this.transform(ctx)
        // 再绘制图形
        this.drawShape(ctx)
        ctx.restore()
      }

      // 绘制图形的接口  
      drawShape(ctx:CanvasRenderingContext2D){}

      // 创建路径接口
      crtPath(ctx:CanvasRenderingContext2D,projectionMatrix:Matrix3){}
}