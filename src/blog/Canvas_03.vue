<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Matrix3 } from 'three';
const canvasRef1 = ref<HTMLCanvasElement>();
const canvasRef2 = ref<HTMLCanvasElement>();
const canvasRef3 = ref<HTMLCanvasElement>();
const canvasRef4 = ref<HTMLCanvasElement>();
const canvasRef5 = ref<HTMLCanvasElement>();
const canvasRef6 = ref<HTMLCanvasElement>();

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

let deltaT = 0
let deltaDir = 1
function draw3() {
  if (!canvasRef3.value) return;
  if (deltaT > 50 || deltaT < 0) {
    deltaDir *= -1
  }
  deltaT += 0.3 * deltaDir


  const ctx = canvasRef3.value.getContext('2d') as CanvasRenderingContext2D;
  ctx.clearRect(-300, -300, 1000, 1000);
  ctx.resetTransform();
  drawGrid(ctx);
  // 这个矩阵是为了将画布中心移到(200,200),方便观察效果
  const translateMatrix = new Matrix3().makeTranslation(100, 100);
  const translateMatrixOrigin = translateMatrix.clone();
  ctx.save();
  ctx.transform(
    translateMatrixOrigin.elements[0],
    translateMatrixOrigin.elements[1],
    translateMatrixOrigin.elements[3],
    translateMatrixOrigin.elements[4],
    translateMatrixOrigin.elements[6],
    translateMatrixOrigin.elements[7]
  )

  ctx.fillStyle = 'rgba(135, 206, 235, .5)';
  ctx.fillRect(0, 0, 100, 100);
  ctx.restore();

  ctx.save()
  ctx.fillStyle = 'rgba(255, 255,0, .3)';
  const scaleMatrix = new Matrix3().makeScale(2, 2)
  const tranRectMatrix = new Matrix3().makeTranslation(-deltaT, -deltaT)
  const matrix = translateMatrixOrigin.clone().multiply(tranRectMatrix).multiply(scaleMatrix)
  ctx.transform(
    matrix.elements[0],
    matrix.elements[1],
    matrix.elements[3],
    matrix.elements[4],
    matrix.elements[6],
    matrix.elements[7])
  ctx.fillRect(0, 0, 100, 100);
  ctx.restore()

  requestAnimationFrame(draw3);
}

let deltaT2 = 0
let deltaDir2 = 1
function draw4() {
  if (!canvasRef4.value) return;
  if (deltaT2 > 50 || deltaT2 < 0) {
    deltaDir2 *= -1
  }
  deltaT2 += 0.3 * deltaDir2


  const ctx = canvasRef4.value.getContext('2d') as CanvasRenderingContext2D;
  ctx.clearRect(-300, -300, 1000, 1000);
  ctx.resetTransform();
  drawGrid(ctx);
  // 这个矩阵是为了将画布中心移到(200,200),方便观察效果
  const translateMatrix = new Matrix3().makeTranslation(100, 100);
  const translateMatrixOrigin = translateMatrix.clone();
  ctx.save();
  ctx.transform(
    translateMatrixOrigin.elements[0],
    translateMatrixOrigin.elements[1],
    translateMatrixOrigin.elements[3],
    translateMatrixOrigin.elements[4],
    translateMatrixOrigin.elements[6],
    translateMatrixOrigin.elements[7]
  )

  ctx.fillStyle = 'rgba(135, 206, 235, .5)';
  ctx.fillRect(0, 0, 100, 100);
  ctx.restore();

  ctx.save()
  ctx.fillStyle = 'rgba(255, 255,0, .3)';
  const scaleMatrix = new Matrix3().makeScale(2, 2)
  const tranRectMatrix = new Matrix3().makeTranslation(-deltaT2, -deltaT2)
  const matrix = translateMatrixOrigin.clone().multiply(scaleMatrix).multiply(tranRectMatrix)
  ctx.transform(
    matrix.elements[0],
    matrix.elements[1],
    matrix.elements[3],
    matrix.elements[4],
    matrix.elements[6],
    matrix.elements[7])
  ctx.fillRect(0, 0, 100, 100);
  ctx.restore()

  requestAnimationFrame(draw4);
}

let deltaT3 = 0
let deltaDir3 = 1
function draw5() {
  if (!canvasRef5.value) return;
  if (deltaT3 > 50 || deltaT3 < 0) {
    deltaDir3 *= -1
  }
  deltaT3 += 0.4 * deltaDir3


  const ctx = canvasRef5.value.getContext('2d') as CanvasRenderingContext2D;
  ctx.clearRect(-300, -300, 1000, 1000);
  ctx.resetTransform();
  drawGrid(ctx);
  // 这个矩阵是为了将画布中心移到(200,200),方便观察效果
  const translateMatrix = new Matrix3().makeTranslation(100, 100);
  const translateMatrixOrigin = translateMatrix.clone();
  ctx.save();
  ctx.transform(
    translateMatrixOrigin.elements[0],
    translateMatrixOrigin.elements[1],
    translateMatrixOrigin.elements[3],
    translateMatrixOrigin.elements[4],
    translateMatrixOrigin.elements[6],
    translateMatrixOrigin.elements[7]
  )

  ctx.fillStyle = 'rgba(135, 206, 235, .5)';
  ctx.fillRect(0, 0, 100, 100);
  ctx.restore();

  ctx.save()
  ctx.fillStyle = 'rgba(255, 255,0, .3)';
  const scaleMatrix = new Matrix3().makeScale(2, 2)
  const tranRectMatrix = new Matrix3().makeTranslation(-deltaT3 / 2, -deltaT3 / 2)
  const matrix = translateMatrixOrigin.clone().multiply(scaleMatrix).multiply(tranRectMatrix)
  ctx.transform(
    matrix.elements[0],
    matrix.elements[1],
    matrix.elements[3],
    matrix.elements[4],
    matrix.elements[6],
    matrix.elements[7])
  ctx.fillRect(0, 0, 100, 100);
  ctx.restore()

  requestAnimationFrame(draw5);
}
function draw6() {
  if (!canvasRef6.value) return;
  const ctx = canvasRef6.value.getContext('2d') as CanvasRenderingContext2D;
  ctx.clearRect(-300, -300, 1000, 1000);
  ctx.resetTransform();
  drawGrid(ctx);
  // 这个矩阵是为了将画布中心移到(200,200),方便观察效果
  const translateMatrix = new Matrix3().makeTranslation(100, 100);
  const translateMatrixOrigin = translateMatrix.clone();
  ctx.save();
  ctx.transform(
    translateMatrixOrigin.elements[0],
    translateMatrixOrigin.elements[1],
    translateMatrixOrigin.elements[3],
    translateMatrixOrigin.elements[4],
    translateMatrixOrigin.elements[6],
    translateMatrixOrigin.elements[7]
  )

  ctx.fillStyle = 'rgba(135, 206, 235, .5)';
  ctx.fillRect(0, 0, 100, 100);
  ctx.restore();

  ctx.save()
  ctx.fillStyle = 'rgba(255, 255,0, .3)';
  const scaleMatrix = new Matrix3().makeScale(2, 2)
  const tranRectMatrix = new Matrix3().makeTranslation(-50, -50)
  const tranRectMatrixInvert = tranRectMatrix.clone().invert()
  const matrix = translateMatrixOrigin.clone().multiply(tranRectMatrixInvert).multiply(scaleMatrix).multiply(tranRectMatrix)
  ctx.transform(
    matrix.elements[0],
    matrix.elements[1],
    matrix.elements[3],
    matrix.elements[4],
    matrix.elements[6],
    matrix.elements[7])
  ctx.fillRect(0, 0, 100, 100);
  ctx.restore()
}

let resT = 0
let resScale = 1
let resTInvert = 0
function draw7() {
  if (!canvasRef6.value) return;
  if (resT < 50) {
    resT += 0.2
  }


  const ctx = canvasRef6.value.getContext('2d') as CanvasRenderingContext2D;
  ctx.clearRect(-300, -300, 1000, 1000);
  ctx.resetTransform();
  drawGrid(ctx);
  // 这个矩阵是为了将画布中心移到(200,200),方便观察效果
  const translateMatrix = new Matrix3().makeTranslation(100, 100);
  const translateMatrixOrigin = translateMatrix.clone();
  ctx.save();
  ctx.transform(
    translateMatrixOrigin.elements[0],
    translateMatrixOrigin.elements[1],
    translateMatrixOrigin.elements[3],
    translateMatrixOrigin.elements[4],
    translateMatrixOrigin.elements[6],
    translateMatrixOrigin.elements[7]
  )

  ctx.fillStyle = 'rgba(135, 206, 235, .5)';
  ctx.fillRect(0, 0, 100, 100);
  ctx.restore();
  ctx.fillStyle = 'rgba(255, 0, 0, .2)';

  // 对齐基点
  function step1() {
    const tranRectMatrix = new Matrix3().makeTranslation(-resT, -resT)
    const matrix = translateMatrixOrigin.clone().multiply(tranRectMatrix)
    ctx.save()
    ctx.transform(
      matrix.elements[0],
      matrix.elements[1],
      matrix.elements[3],
      matrix.elements[4],
      matrix.elements[6],
      matrix.elements[7])
    ctx.fillRect(0, 0, 100, 100);
    ctx.restore()
    if (resT >= 50) {
      step2(tranRectMatrix)
    }
  }

  // 基于当前基点缩放物体
  function step2(mt: Matrix3) {
    if (resScale < 2) {
      resScale += 0.01
    }
    const scaleMatrix = new Matrix3().makeScale(resScale, resScale)
    const matrix = translateMatrixOrigin.clone().multiply(scaleMatrix).multiply(mt)
    ctx.save()
    ctx.fillStyle = 'rgba(255, 255,0, .2)';
    ctx.transform(
      matrix.elements[0],
      matrix.elements[1],
      matrix.elements[3],
      matrix.elements[4],
      matrix.elements[6],
      matrix.elements[7])
    ctx.fillRect(0, 0, 100, 100);
    ctx.restore()
    if (resScale >= 2) {
      step3(mt, scaleMatrix)
    }
  }

  // 将物体移回去
  function step3(mt: Matrix3, ms: Matrix3) {
    if (resTInvert < 50) {
      resTInvert += 0.2
    } else {
      resT = 0
      resScale = 1
      resTInvert = 0
    }
    const mtInvert = new Matrix3().makeTranslation(resTInvert, resTInvert)
    const matrix = translateMatrixOrigin.clone().multiply(mtInvert).multiply(ms).multiply(mt)
    ctx.save()
    ctx.fillStyle = 'rgba(255, 100,100, .3)';
    ctx.transform(
      matrix.elements[0],
      matrix.elements[1],
      matrix.elements[3],
      matrix.elements[4],
      matrix.elements[6],
      matrix.elements[7])
    ctx.fillRect(0, 0, 100, 100);
    ctx.restore()
  }
  step1()

  requestAnimationFrame(draw7)
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
  draw7()
});

const code1 = `
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
`

const code2 =`
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
`

const code3 = `
let deltaT = 0
let deltaDir = 1
function draw3() {
  if (!canvasRef3.value) return;
  if (deltaT > 50 || deltaT < 0) {
    deltaDir *= -1
  }
  deltaT += 0.3 * deltaDir


  const ctx = canvasRef3.value.getContext('2d') as CanvasRenderingContext2D;
  ctx.clearRect(-300, -300, 1000, 1000);
  ctx.resetTransform();
  drawGrid(ctx);
  // 这个矩阵是为了将画布中心移到(200,200),方便观察效果
  const translateMatrix = new Matrix3().makeTranslation(100, 100);
  const translateMatrixOrigin = translateMatrix.clone();
  ctx.save();
  ctx.transform(
    translateMatrixOrigin.elements[0],
    translateMatrixOrigin.elements[1],
    translateMatrixOrigin.elements[3],
    translateMatrixOrigin.elements[4],
    translateMatrixOrigin.elements[6],
    translateMatrixOrigin.elements[7]
  )

  ctx.fillStyle = 'rgba(135, 206, 235, .5)';
  ctx.fillRect(0, 0, 100, 100);
  ctx.restore();

  ctx.save()
  ctx.fillStyle = 'rgba(255, 255,0, .3)';
  const scaleMatrix = new Matrix3().makeScale(2, 2)
  const tranRectMatrix = new Matrix3().makeTranslation(-deltaT, -deltaT)
  const matrix = translateMatrixOrigin.clone().multiply(tranRectMatrix).multiply(scaleMatrix)
  ctx.transform(
    matrix.elements[0],
    matrix.elements[1],
    matrix.elements[3],
    matrix.elements[4],
    matrix.elements[6],
    matrix.elements[7])
  ctx.fillRect(0, 0, 100, 100);
  ctx.restore()

  requestAnimationFrame(draw3);
}
`

const code4 = `
let deltaT2 = 0
let deltaDir2 = 1
function draw4() {
  if (!canvasRef4.value) return;
  if (deltaT2 > 50 || deltaT2 < 0) {
    deltaDir2 *= -1
  }
  deltaT2 += 0.3 * deltaDir2


  const ctx = canvasRef4.value.getContext('2d') as CanvasRenderingContext2D;
  ctx.clearRect(-300, -300, 1000, 1000);
  ctx.resetTransform();
  drawGrid(ctx);
  // 这个矩阵是为了将画布中心移到(200,200),方便观察效果
  const translateMatrix = new Matrix3().makeTranslation(100, 100);
  const translateMatrixOrigin = translateMatrix.clone();
  ctx.save();
  ctx.transform(
    translateMatrixOrigin.elements[0],
    translateMatrixOrigin.elements[1],
    translateMatrixOrigin.elements[3],
    translateMatrixOrigin.elements[4],
    translateMatrixOrigin.elements[6],
    translateMatrixOrigin.elements[7]
  )

  ctx.fillStyle = 'rgba(135, 206, 235, .5)';
  ctx.fillRect(0, 0, 100, 100);
  ctx.restore();

  ctx.save()
  ctx.fillStyle = 'rgba(255, 255,0, .3)';
  const scaleMatrix = new Matrix3().makeScale(2, 2)
  const tranRectMatrix = new Matrix3().makeTranslation(-deltaT2, -deltaT2)
  const matrix = translateMatrixOrigin.clone().multiply(scaleMatrix).multiply(tranRectMatrix)
  ctx.transform(
    matrix.elements[0],
    matrix.elements[1],
    matrix.elements[3],
    matrix.elements[4],
    matrix.elements[6],
    matrix.elements[7])
  ctx.fillRect(0, 0, 100, 100);
  ctx.restore()

  requestAnimationFrame(draw4);
}
`
const code5 = `
let deltaT3 = 0
let deltaDir3 = 1
function draw5() {
  if (!canvasRef5.value) return;
  if (deltaT3 > 50 || deltaT3 < 0) {
    deltaDir3 *= -1
  }
  deltaT3 += 0.4 * deltaDir3


  const ctx = canvasRef5.value.getContext('2d') as CanvasRenderingContext2D;
  ctx.clearRect(-300, -300, 1000, 1000);
  ctx.resetTransform();
  drawGrid(ctx);
  // 这个矩阵是为了将画布中心移到(200,200),方便观察效果
  const translateMatrix = new Matrix3().makeTranslation(100, 100);
  const translateMatrixOrigin = translateMatrix.clone();
  ctx.save();
  ctx.transform(
    translateMatrixOrigin.elements[0],
    translateMatrixOrigin.elements[1],
    translateMatrixOrigin.elements[3],
    translateMatrixOrigin.elements[4],
    translateMatrixOrigin.elements[6],
    translateMatrixOrigin.elements[7]
  )

  ctx.fillStyle = 'rgba(135, 206, 235, .5)';
  ctx.fillRect(0, 0, 100, 100);
  ctx.restore();

  ctx.save()
  ctx.fillStyle = 'rgba(255, 255,0, .3)';
  const scaleMatrix = new Matrix3().makeScale(2, 2)
  const tranRectMatrix = new Matrix3().makeTranslation(-deltaT3 / 2, -deltaT3 / 2)
  const matrix = translateMatrixOrigin.clone().multiply(scaleMatrix).multiply(tranRectMatrix)
  ctx.transform(
    matrix.elements[0],
    matrix.elements[1],
    matrix.elements[3],
    matrix.elements[4],
    matrix.elements[6],
    matrix.elements[7])
  ctx.fillRect(0, 0, 100, 100);
  ctx.restore()

  requestAnimationFrame(draw5);
}

`

const code6 = `
let resT = 0
let resScale = 1
let resTInvert = 0
function draw7() {
  if (!canvasRef6.value) return;
  if (resT < 50) {
    resT += 0.2
  }


  const ctx = canvasRef6.value.getContext('2d') as CanvasRenderingContext2D;
  ctx.clearRect(-300, -300, 1000, 1000);
  ctx.resetTransform();
  drawGrid(ctx);
  // 这个矩阵是为了将画布中心移到(200,200),方便观察效果
  const translateMatrix = new Matrix3().makeTranslation(100, 100);
  const translateMatrixOrigin = translateMatrix.clone();
  ctx.save();
  ctx.transform(
    translateMatrixOrigin.elements[0],
    translateMatrixOrigin.elements[1],
    translateMatrixOrigin.elements[3],
    translateMatrixOrigin.elements[4],
    translateMatrixOrigin.elements[6],
    translateMatrixOrigin.elements[7]
  )

  ctx.fillStyle = 'rgba(135, 206, 235, .5)';
  ctx.fillRect(0, 0, 100, 100);
  ctx.restore();
  ctx.fillStyle = 'rgba(255, 0, 0, .2)';

  // 对齐基点
  function step1() {
    const tranRectMatrix = new Matrix3().makeTranslation(-resT, -resT)
    const matrix = translateMatrixOrigin.clone().multiply(tranRectMatrix)
    ctx.save()
    ctx.transform(
      matrix.elements[0],
      matrix.elements[1],
      matrix.elements[3],
      matrix.elements[4],
      matrix.elements[6],
      matrix.elements[7])
    ctx.fillRect(0, 0, 100, 100);
    ctx.restore()
    if (resT >= 50) {
      step2(tranRectMatrix)
    }
  }

  // 基于当前基点缩放物体
  function step2(mt: Matrix3) {
    if (resScale < 2) {
      resScale += 0.01
    }
    const scaleMatrix = new Matrix3().makeScale(resScale, resScale)
    const matrix = translateMatrixOrigin.clone().multiply(scaleMatrix).multiply(mt)
    ctx.save()
    ctx.fillStyle = 'rgba(255, 255,0, .2)';
    ctx.transform(
      matrix.elements[0],
      matrix.elements[1],
      matrix.elements[3],
      matrix.elements[4],
      matrix.elements[6],
      matrix.elements[7])
    ctx.fillRect(0, 0, 100, 100);
    ctx.restore()
    if (resScale >= 2) {
      step3(mt, scaleMatrix)
    }
  }

  // 将物体移回去
  function step3(mt: Matrix3, ms: Matrix3) {
    if (resTInvert < 50) {
      resTInvert += 0.2
    } else {
      resT = 0
      resScale = 1
      resTInvert = 0
    }
    const mtInvert = new Matrix3().makeTranslation(resTInvert, resTInvert)
    const matrix = translateMatrixOrigin.clone().multiply(mtInvert).multiply(ms).multiply(mt)
    ctx.save()
    ctx.fillStyle = 'rgba(255, 100,100, .3)';
    ctx.transform(
      matrix.elements[0],
      matrix.elements[1],
      matrix.elements[3],
      matrix.elements[4],
      matrix.elements[6],
      matrix.elements[7])
    ctx.fillRect(0, 0, 100, 100);
    ctx.restore()
  }
  step1()

  requestAnimationFrame(draw7)
}
`
</script>

<template>
  <div class="container">
    <div class="blog">
      <h2>canvas 基点变换</h2>
      <p>
        在canvas 中，坐标原点在画布的左上角，这就意味着当我们对画布进行变换操作(平移、旋转、缩放)时，变换的基点就是左上角。
      </p>
      <canvas width="300" height="300" ref="canvasRef1" class="canvas"></canvas>
      <p class="text-label">注1：由上图可知，平移、缩放、旋转，都是针对坐标原点(旋转和缩放的基点，是第一次执行平移后的原点)</p>
      <highlightjs language="JavaScript" :autodetect="false" :code="code1"></highlightjs>
      <p>这种基于原点的变换，并不能满足开发中的所有场景。我们需要想要基于物体的中心点、左上角点、任意点进行变换。
        将变换的原点移动到我们指定的位置，这就是<strong>基点变换</strong>。</p>
      <br />
      <canvas width="300" height="300" ref="canvasRef2" class="canvas"></canvas>
      <p class="text-label">注2：上图缩放变换的基点，就是图形的中心点。</p>
      <highlightjs language="JavaScript" :autodetect="false" :code="code2"></highlightjs>
      <p>canvas 的变换机制我们无法改变(基于画布原点)，但我们可以通过<strong>多个变换</strong>的组合，达到预期的效果。
        举例来说：已知画布上有一个 100x100 的矩形(矩形的左上角点和画布的原点重合)，现在想要缩放到 200x200,条件是不能改变矩形的中心位置。</p>
      <p>现在停下来想一想，如果将100x100的矩形以中心缩放的形式缩放到200x200，那么现在矩形的位置在哪(即左上角点)?
        显然，现在矩形的左上角点在画布上处于(-50,-50)的位置上</p>
      <p>等等!我们只想要对矩形进行缩放，可是最终的效果是，矩形不仅进行了缩放操作，还进行了位移!
        也就是说，对物体进行中心缩放操作，是由 缩放变换 + 位移变换共同作用的结果。
      </p>
      <canvas width="300" height="300" ref="canvasRef3" class="canvas"></canvas>
      <p class="text-label">注3：上图中，我们在缩放开始之前，先进行平移变换。让物体的中心点和坐标原点重合后(此时平移50)，
        再次乘上缩放矩阵，此时就是中心平移的效果</p>
      <highlightjs language="JavaScript" :autodetect="false" :code="code3"></highlightjs>
      <p>仔细观察我们的变换矩阵 <code>matrix = mto * mt * ms</code> ，除了最开始的<code>translateMatrixOrigin</code>
        矩阵之外(将坐标原点200x200 方便观察)，还有一个位移矩阵和缩放矩阵。</p>
      <p>通过上一章，我们知道这个矩阵改如何解释:从左往右理解,先将 <strong>画布</strong> 位移-50*-50，之后再将 <strong>画布</strong> 扩大一倍。
        从右往左理解，先将 <strong>画布中的物体</strong> 尺寸扩大一倍(此时canvas 画布的坐标系没有发生变化)，
        之后再将 <strong>画布中的物体</strong> 移动-50*-50</p>
      <strong>注意加粗的部分，从左往右，是变换的画布，物体没有变换。从右往左，变换的是物体，画布没变。</strong>
      <p>为了验证区分二者，我们再一次做个尝试，将上方的后两个矩阵的顺序对调下，想想会发生什么？</p>
      <canvas width="300" height="300" ref="canvasRef4" class="canvas"></canvas>
      <p class="text-label">注4：现在的矩阵顺序<code>matrix = mto * ms * mt</code>
      </p>
      <highlightjs language="JavaScript" :autodetect="false" :code="code4"></highlightjs>
      <p>
        此时物体的大小是我们所期望的，但并不是中心缩放！而是右下角缩放！
        我们可以想想发生了什么，从左往右：画布先扩大了一倍，然后画布移动-50 * -50，从右往左，物体移动-50 * -50，物体扩大一倍。
        咦，看上去好像没什么变换。no no no 让我们继续分析 (如果你读过上一篇文章，相信你已近清楚了！)。
        第一种解释中，我们认为变换的是画布，先扩大一倍注意：此时的扩大，是在画布没有缩放的情况下，之后画布再位移 -50 *- 50，!此时的位移已近是扩大后的画布了！
        我们上一步操作，将画布的基向量扩大了一倍，所以在移动同样的 50单位时，扩大后的移动距离是扩大前的两倍！
        再来看第二种解释，物体先位移50单位，此时的坐标原点没有改变，只是物体的坐标发生变换。之后再将物体扩大一倍，注意此时的缩放中心
        依然在画布的原点上，并且现在的矩形中心就在原点上，就相当于以物体的右下角点为基点，将物体扩大了一倍。
      </p>
      <p>让我们再来想一想，如果我就想要当前的顺序，还要达到物体中心缩放的效果该怎么办呢？
        按照第一种解释，矩形不在中心的原因，是画布的基向量已近扩大了一倍，所以我们在位移的时候只能移动预想的一半，也就是 25 * 25。
        第二种解释，矩形不在中心的原因，是物体先位移了50 单位，导致物体的中心点处于画布原点，所以我们只能移动25单位！
        芜湖，逻辑闭环！
      </p>
      <canvas width="300" height="300" ref="canvasRef5" class="canvas"></canvas>
      <p class="text-label">注5：现在的效果和注3一样了，但矩阵的顺序却发生了变化</p>
      <highlightjs language="JavaScript" :autodetect="false" :code="code5"></highlightjs>
      <p>现在只剩下最后一个问题，我们上面讨论的，全都是在已经知道变换的结果，去反推矩阵变换信息。可我们本篇讨论的是基点变换，基点呢？
        针对基点变换，笔者采用的是从右往左的理解方式，即变换的是物体，画布没有变化。
        当我们想要以物体上的任意点作为变换的原点时，只需要先将物体移动到画布的原点，再进行变换，变换完成后，再将物体移动回原来的位置即可。
        注意：此时我们变换的是物体，所以变换前后的位移距离不会由于变换本身而改变！
      </p>
      <canvas width="300" height="300" ref="canvasRef6" class="canvas"></canvas>
      <p class="text-label">注6：三个矩阵拆开执行的动画效果</p>
      <highlightjs language="JavaScript" :autodetect="false" :code="code6"></highlightjs>
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

  .text-label {
    color: #999999;
    text-align: center;
    font-size: 12px;
  }
}
</style>
