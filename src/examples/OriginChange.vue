<script setup lang="ts">
import { ref, defineProps, onMounted, withCtx, version } from 'vue';
import { Camera } from '../lmm/core/Camera';
import { Img } from '../lmm/objects/Img';
import { Vector2 } from '../lmm/math/Vector2';
import { Scene } from '../lmm/core/Scene';
import { ImgControler } from '../lmm/controler/ImgControler';
import { OrbitControler } from '../lmm/controler/OrbitControler';
import { imgLoadPromises } from '../lmm/objects/ObjectUtils';
import { Group } from '../lmm/objects/Group';
import { Object2DType } from '../lmm/objects/Object2D';
import { Object2D } from '../lmm/objects/Object2D';
import { Matrix3 } from '../lmm/math/Matrix3';
const props = defineProps({
  size: {
    type: Object,
    default: { width: 0, height: 0 },
  },
});
const canvasRef = ref<HTMLCanvasElement>();
const scene = new Scene();
const group = new Group();
const orbi = new OrbitControler(scene.camera, {});
const imgContr = new ImgControler();

/** 变换基点 */
const origin = new Vector2(150, 100);

/** 本地矩阵  就是图案的模型矩阵 */
const localPosition_old = new Vector2(50, 50);
const localRotate = 0.2;
const localScale = new Vector2(1.5, 1);
const localMatrix = new Matrix3()
  .scale(localScale.x, localScale.y)
  .rotate(localRotate)
  .translate(localPosition_old.x, localPosition_old.y);

/** 绘制矩形 */
const drawRect = (
  ctx: CanvasRenderingContext2D,
  m: Matrix3,
  fillStyle = '#000'
) => {
  const { elements: e } = m;
  ctx.save();
  ctx.fillStyle = fillStyle;
  ctx.transform(e[0], e[1], e[3], e[4], e[6], e[7]);
  ctx.fillRect(0, 0, 150, 100);
  ctx.stroke();
  ctx.restore();
};

/** 一些辅助线 */
const helpline = (ctx: CanvasRenderingContext2D) => {
  ctx.beginPath();
  ctx.strokeStyle = 'red';
  ctx.moveTo(-800, 0);
  ctx.lineTo(800, 0);
  ctx.moveTo(0, -800);
  ctx.lineTo(0, 800);
  ctx.stroke();
};

/** m1矩阵，让原点对齐origin */
const m1 = new Matrix3().makeTranslation(-origin.x, -origin.y);

/** localPosition 是origin 在父级坐标系的点位 */
const localPosition = origin.clone().applyMatrix3(localMatrix);
/** m2_1 矩阵 是为了将现在的基点 origin 和之前的origin对齐
 * 这步 需要注意：区分使用的参数是 图案本地的参数，还是父级坐标下的参数
 */
const m2_1 = new Matrix3().makeTranslation(localPosition.x, localPosition.y);
/** m2_2 为了将基点变换后的图案 和之前的图案完全重合 */
const m2_2 = new Matrix3().scale(localScale.x,localScale.y).rotate(localRotate).translate(localPosition.x,localPosition.y)
/** m2_3 是基于m2_2 变换后 做的相对变换 */
const relativeScale = new Vector2(1.2,1.5)
const relativeRotate = 0.2
const relativeTranslate = new Vector2(30,0)
const relativeMatrix = new Matrix3().scale(relativeScale.x,relativeScale.y).rotate(relativeRotate)

/** TODO:relative 相关的变换顺序，需要思考... */
const m2_3 =new Matrix3().scale(localScale.x *relativeScale.x,localScale.y *relativeScale.y).rotate(localRotate + relativeRotate).translate(localPosition.x + relativeTranslate.x,localPosition.y + relativeTranslate.y)

onMounted(() => {
  // 绘制
  const canvas = canvasRef.value;
  const ctx = canvas?.getContext('2d');
  // ctx?.fillRect(0,0,200,200)
  if (canvas && ctx) {
    ctx.translate(300, 300);
    testDraw(ctx);
  }
});

// 相对变换矩阵，基点变换之后，做的变换
const relativeRotateMatrix = new Matrix3().rotate(relativeRotate).multiply(new Matrix3().scale(relativeScale.x,relativeScale.y))
/** 需要执行的绘制操作 */
const testDraw = (ctx: CanvasRenderingContext2D) => {
  helpline(ctx);
  // 绘制初始矩形  -- 就是默认情况下 基点在左上角
  drawRect(ctx, localMatrix);

  // 通过m1矩阵，将基点移到了初始矩阵的右下角
  drawRect(ctx, m1, 'orange');
  drawRect(ctx, localMatrix.clone().multiply(m1), 'red');

  // 初始位置对齐矩阵
  const positionMatrix = new Matrix3().makeTranslation(localPosition.x,localPosition.y)

  const realAndLocalMatrix = new Matrix3().scale(localScale.x * relativeScale.x,localScale.y * relativeScale.y).rotate(localRotate + relativeRotate).translate(relativeTranslate.x,relativeTranslate.y)
  drawRect(ctx, positionMatrix.multiply(realAndLocalMatrix).multiply(m1) , 'pink');

  // 通过m2_1 * m1 矩阵 让基点变换前后的  origin 点位对齐
  // drawRect(ctx, m2_1.clone().multiply(m1), 'skyblue');

  // 基点变换后 重合
  // const resM = m2_1.clone().multiply(localMatrix.clone().multiply(m1))

  const resM = localMatrix.clone().multiply(m1)
  const resa = relativeRotateMatrix.clone().multiply(resM)

  // 把本地的模型变换量 和相对变换量 累加
  const resc = new Matrix3().scale(localScale.x *relativeScale.x,localScale.y *relativeScale.y).rotate(localRotate + relativeRotate).translate(localPosition_old.x,localPosition_old.y)
  const localPosition2 = origin.clone().applyMatrix3(resc)
  const m1_1 = new Matrix3().makeTranslation(-origin.x, -origin.y);
  const newM1 = new Matrix3().makeTranslation(-localPosition2.x, -localPosition2.y);
  const resd = newM1.multiply(resc)
  const rese = new Matrix3().makeTranslation(localPosition.x,localPosition.y)
  const resf = rese.multiply(resd)

  const resb = m2_1.clone().multiply(resa)
  // drawRect(ctx, resf, 'skyblue');
  // drawRect(ctx, m2_2.multiply(m1), 'red');
  drawRect(ctx, m2_3.multiply(m1), 'yellow');

  // t2(ctx,m1)
};

function t2(ctx:CanvasRenderingContext2D,m:Matrix3){
  const { elements: e } = m;
  ctx.save()
  ctx.transform(e[0], e[1], e[3], e[4], e[6], e[7]);
  ctx.moveTo(-100,0)
  ctx.lineTo(100,0)
  ctx.moveTo(0,-100)
  ctx.lineTo(0,100)
  ctx.strokeStyle = 'green'
  ctx.stroke()

  ctx.beginPath()
  ctx.strokeStyle = 'yellow'
  ctx.rotate(0.2)
  ctx.moveTo(-100,0)
  ctx.lineTo(100,0)
  ctx.moveTo(0,-100)
  ctx.lineTo(0,100)
  ctx.stroke()
  ctx.restore()
}

const btnRotate = (type: 'add' | 'sub') => {
  const canvas = canvasRef.value;
  const ctx = canvas?.getContext('2d');
  if (ctx && canvas) {
    if (type === 'add') {
      ctx.clearRect(-500, -500, canvas?.width, canvas?.height);
      ctx.rotate(0.1);
      testDraw(ctx);
    } else {
      ctx.clearRect(-500, -500, canvas?.width, canvas?.height);
      ctx.rotate(-0.1);
      testDraw(ctx);
    }
  }
};
</script>

<template>
  <canvas ref="canvasRef" :width="size.width" :height="size.height"></canvas>
  <button class="add" @click="btnRotate('add')">旋转按钮-测试基点 ++</button>
  <button class="sub" @click="btnRotate('sub')">旋转按钮-测试基点 --</button>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}

button {
  position: absolute;
  left: 0;
  top: 0;
}

.sub {
  left: 0;
  top: 50px;
}
</style>
