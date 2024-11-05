<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Matrix3 } from 'three';
const canvasRef1 = ref<HTMLCanvasElement>();
const canvasRef2 = ref<HTMLCanvasElement>();
const canvasRef3 = ref<HTMLCanvasElement>();
const canvasRef4 = ref<HTMLCanvasElement>();
const canvasRef5 = ref<HTMLCanvasElement>();
function draw1() {
  if (!canvasRef1.value) return;
  const ctx = canvasRef1.value.getContext('2d') as CanvasRenderingContext2D;
  drawGrid(ctx);
  ctx.fillStyle = 'skyblue';
  ctx.fillRect(0, 0, 50, 50);
  // 位移 (150,100)
  ctx.translate(150, 100);
  ctx.fillRect(0, 0, 50, 50);

  // 旋转 45
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = 'yellow';
  ctx.fillRect(0, 0, 50, 50);

  // 缩放 (2,3)
  ctx.scale(2, 3);
  ctx.fillStyle = 'rgba(255,0,0,0.5)';
  ctx.fillRect(0, 0, 50, 50);
}

let scale2 = 1;
let dir2 = 1;
function draw2() {
  if (scale2 > 2 || scale2 < 1) {
    dir2 *= -1;
  }
  scale2 += 0.004 * dir2;
  if (!canvasRef2.value) return;
  const ctx = canvasRef2.value.getContext('2d') as CanvasRenderingContext2D;
  ctx.clearRect(-300, -300, 600, 600);
  ctx.resetTransform();
  drawGrid(ctx);
  const translateMatrix = new Matrix3().makeTranslation(150, 100);
  const translateMatrixOrigin = translateMatrix.clone();
  const scaleMatrix = new Matrix3().makeScale(scale2, 1.2 * scale2);
  const posToCenterMatrix = new Matrix3().makeTranslation(-25, -25);
  const posToCenterMatrixInvert = new Matrix3().makeTranslation(25, 25);

  ctx.save();
  ctx.transform(
    translateMatrixOrigin.elements[0],
    translateMatrixOrigin.elements[1],
    translateMatrixOrigin.elements[3],
    translateMatrixOrigin.elements[4],
    translateMatrixOrigin.elements[6],
    translateMatrixOrigin.elements[7]
  )
  
  ctx.fillStyle = 'rgba(255,255,0,1)';
  ctx.fillRect(0, 0, 50, 50);
  ctx.restore();

  const matrix = new Matrix3()
    .multiply(translateMatrix)
    .multiply(posToCenterMatrixInvert)
    .multiply(scaleMatrix)
    .multiply(posToCenterMatrix);
  ctx.transform(
    matrix.elements[0],
    matrix.elements[1],
    matrix.elements[3],
    matrix.elements[4],
    matrix.elements[6],
    matrix.elements[7]
  );
  ctx.fillStyle = 'rgba(255,0,0,0.5)';
  ctx.fillRect(0, 0, 50, 50);
  requestAnimationFrame(draw2);
}

function draw3() {
  if (!canvasRef3.value) return;
  const ctx = canvasRef3.value.getContext('2d') as CanvasRenderingContext2D;
  drawGrid(ctx);
  const translateMatrix = new Matrix3().makeTranslation(100, 100);
  const rotateMatrix = new Matrix3().makeRotation(Math.PI / 4);
  const scaleMatrix = new Matrix3().makeScale(2, 1);
  const matrix = new Matrix3()
    .multiply(translateMatrix)
    .multiply(scaleMatrix)
    .multiply(rotateMatrix);
  ctx.transform(
    matrix.elements[0],
    matrix.elements[1],
    matrix.elements[3],
    matrix.elements[4],
    matrix.elements[6],
    matrix.elements[7]
  );
  ctx.fillStyle = 'rgba(255,0,0,0.5)';
  ctx.fillRect(0, 0, 50, 50);
}

let scale = 1;
let dir = 1;
function draw4() {
  if (scale > 2 || scale < 1) {
    dir *= -1;
  }
  scale += 0.004 * dir;
  if (!canvasRef4.value) return;
  const ctx = canvasRef4.value.getContext('2d') as CanvasRenderingContext2D;
  ctx.clearRect(-300, -300, 600, 600);
  ctx.resetTransform();
  drawGrid(ctx);
  const translateMatrix = new Matrix3().makeTranslation(100, 100);
  const rotateMatrix = new Matrix3().makeRotation(Math.PI / 4);
  const scaleMatrix = new Matrix3().makeScale(scale, 1);
  const matrix = new Matrix3()
    .multiply(translateMatrix)
    .multiply(scaleMatrix)
    .multiply(rotateMatrix);
  ctx.transform(
    matrix.elements[0],
    matrix.elements[1],
    matrix.elements[3],
    matrix.elements[4],
    matrix.elements[6],
    matrix.elements[7]
  );
  ctx.fillStyle = 'rgba(255,0,0,0.5)';
  ctx.fillRect(0, 0, 50, 50);
  requestAnimationFrame(draw4);
}

let rad = 0;
function draw5() {
  if (!canvasRef5.value) return;
  const ctx = canvasRef5.value.getContext('2d') as CanvasRenderingContext2D;
  ctx.clearRect(-300, -300, 600, 600);
  ctx.resetTransform();
  ctx.strokeStyle = '#000000';
  drawGrid(ctx);
  rad += 0.01;
  const translateMatrix = new Matrix3().makeTranslation(100, 100);
  const rotateMatrix = new Matrix3().makeRotation(rad);
  const scaleMatrix = new Matrix3().makeScale(2, 1);
  const matrix = new Matrix3()
    .multiply(translateMatrix)
    .multiply(scaleMatrix)
    .multiply(rotateMatrix);
  ctx.transform(
    matrix.elements[0],
    matrix.elements[1],
    matrix.elements[3],
    matrix.elements[4],
    matrix.elements[6],
    matrix.elements[7]
  );
  ctx.fillStyle = 'rgba(255,0,0,0.5)';
  ctx.fillRect(0, 0, 50, 50);

  ctx.fillStyle = 'green';
  ctx.beginPath();
  ctx.arc(50, 0, 4, 0, 2 * Math.PI);
  ctx.fill();

  ctx.resetTransform();
  ctx.beginPath();
  ctx.strokeStyle = 'blue';
  ctx.ellipse(100, 100, 100, 50, 0, 0, 2 * Math.PI);
  ctx.stroke();

  // 正圆
  const t2 = new Matrix3().makeTranslation(200, 250);
  const r2 = new Matrix3().makeRotation(rad);
  const m2 = new Matrix3().multiply(t2).multiply(r2);
  ctx.transform(
    m2.elements[0],
    m2.elements[1],
    m2.elements[3],
    m2.elements[4],
    m2.elements[6],
    m2.elements[7]
  );
  ctx.beginPath();
  ctx.fillStyle = 'rgba(255,0,0,0.5)';
  ctx.fillRect(0, 0, 50, 50);
  ctx.ellipse(0, 0, 50, 50, 0, 0, 2 * Math.PI);
  ctx.stroke();

  ctx.fillStyle = 'green';
  ctx.beginPath();
  ctx.arc(50, 0, 4, 0, 2 * Math.PI);
  ctx.fill();
  requestAnimationFrame(draw5);
}

function drawGrid(ctx: CanvasRenderingContext2D) {
  const width = 300;
  const height = 300;
  const step = 50;
  const row = height / step;
  const col = width / step;
  ctx.save();
  ctx.fillStyle = 'red';
  for (let i = 0; i < row; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * step);
    ctx.lineTo(width, i * step);
    ctx.stroke(); // 渲染路径
  }
  for (let i = 0; i < col; i++) {
    ctx.beginPath();
    ctx.moveTo(i * step, 0);
    ctx.lineTo(i * step, height);
    ctx.stroke(); // 渲染路径
  }
  ctx.restore();
}

onMounted(() => {
  draw1();
  draw2();
  draw3();
  draw4();
  draw5();
});
</script>

<template>
  <div class="container">
    <div class="blog">
      <h2>canvas 基点变换</h2>
      <canvas width="300" height="300" ref="canvasRef1" class="canvas"></canvas>
      <br />
      <canvas width="300" height="300" ref="canvasRef2" class="canvas"></canvas>
    </div>
  </div>
</template>

<style scoped lang="less">
.container {
  height: 100%;
  overflow: auto;
}
.blog {
  width: 60%;
  margin: 10px auto 40px;

  p,
  ul,
  li {
    line-height: 1.5em;
    color: #333;
  }

  canvas {
    display: block;
    margin: auto;
  }
}
</style>
