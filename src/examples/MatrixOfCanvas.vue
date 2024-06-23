<script setup lang="ts">
import { ref,defineProps, onMounted} from 'vue'
import { Matrix3 } from '../lmm/math/Matrix3'
import { Vector2 } from '../lmm/math/Vector2'
defineProps({
  size:{
    type:Object,
    default:{width:0,height:0}
  }
})
const canvasRef = ref<HTMLCanvasElement>()

onMounted(() => {
  // 绘制
  const ctx = canvasRef.value?.getContext('2d')
  // ctx?.fillRect(0,0,200,200)
  if(ctx){
    testMatrix(ctx)
    matrixRect(ctx)
  }
})

// 使用八个点 绘制一个矩形
const vertices:number[] = [0,0,200,0,200,300,0,300]

// 矩阵的模型数据
const position = new Vector2(300,150)
const rotate = Math.PI / 10
const scale = new Vector2(1,2)

// 矩阵测试
function testMatrix(ctx:CanvasRenderingContext2D){

  // 先经过变换，再绘制矩形
  ctx.save()
  /* 矩阵变换 translate rotate scale */
  ctx.translate(position.x,position.y)
  ctx.rotate(rotate)
  ctx.scale(scale.x,scale.y)
  ctx.beginPath()
  drawRect(ctx,vertices,'pink')
  ctx.restore()

}

// 绘制矩形
function drawRect(ctx:CanvasRenderingContext2D,vertices:number[],color:string="black",lineWidth:number=30){
  ctx.beginPath()
  ctx.fillStyle = color
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  ctx.moveTo(vertices[0],vertices[1])
  for(let i =2;i<vertices.length -1;i+=2){
    ctx.lineTo(vertices[i],vertices[i+1])
  }
  ctx.closePath()
  ctx.stroke()
  ctx.fill()
}

// 使用矩阵的乘法 测试
const [sm,rm,tm] = [
  new Matrix3().makeScale(scale.x,scale.y),
  new Matrix3().makeRotation(rotate),
  new Matrix3().makeTranslation(position.x,position.y)
]

const matrix = tm.multiply(rm).multiply(sm)
// 测试矩阵的 相对变换和绝对变换
// const realMatrix = new Matrix3().scale(scale.x,scale.y).rotate(rotate)
const realMatrix = new Matrix3().rotate(rotate).scale(scale.x,scale.y)
function matrixRect(ctx:CanvasRenderingContext2D){
  const {elements:e} = realMatrix
  ctx.save()
  ctx.transform(e[0],e[1],e[3],e[4],e[6],e[7])
  drawRect(ctx, vertices, '#00acec', 20)
  ctx.restore()
}


</script>

<template>
  <canvas ref="canvasRef" :width="size.width" :height="size.height"></canvas>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
