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
  // 位移 (100,100)
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
  console.log(ctx.getTransform(), 'getTransform');
}

function draw2() {
  if (!canvasRef2.value) return;
  const ctx = canvasRef2.value.getContext('2d') as CanvasRenderingContext2D;
  drawGrid(ctx);
  const translateMatrix = new Matrix3().makeTranslation(150, 100);
  const rotateMatrix = new Matrix3().makeRotation(Math.PI / 4);
  const scaleMatrix = new Matrix3().makeScale(2, 3);
  const matrix = new Matrix3()
    .multiply(translateMatrix)
    .multiply(rotateMatrix)
    .multiply(scaleMatrix);
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

let rad = 0
function draw5() {
  if (!canvasRef5.value) return;
  const ctx = canvasRef5.value.getContext('2d') as CanvasRenderingContext2D;
  ctx.clearRect(-300,-300,600,600)
  ctx.resetTransform();
  ctx.strokeStyle = '#000000'
  drawGrid(ctx);
  rad +=0.01
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

  ctx.fillStyle = 'green'
  ctx.beginPath();
  ctx.arc(50, 0, 4, 0, 2 * Math.PI);
  ctx.fill()

  ctx.resetTransform();
  ctx.beginPath();
  ctx.strokeStyle = 'blue'
  ctx.ellipse(100, 100, 100, 50, 0, 0, 2 * Math.PI);
  ctx.stroke();


  // 正圆
  const t2 = new Matrix3().makeTranslation(200, 250);
  const r2 = new Matrix3().makeRotation(rad);
  const m2 = new Matrix3()
    .multiply(t2)
    .multiply(r2);
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
  ctx.fillRect(0,0, 50, 50);
  ctx.ellipse(0,0, 50, 50, 0, 0, 2 * Math.PI);
  ctx.stroke();

  ctx.fillStyle = 'green'
  ctx.beginPath();
  ctx.arc(50, 0, 4, 0, 2 * Math.PI);
  ctx.fill()
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
      <h2>canvas 中的矩阵乘法顺序</h2>
      <p>
        在上一篇分析相对变换与绝对变换的文章中，我们在讨论canvas的`transform`,说它是基于当前变换而变换的，基于一次，可以理解为
        与当前矩阵相乘。这篇文章主要讨论的是矩阵的乘法，其中重点讨论矩阵乘法的顺序（从左往右，以及从右往左），这个问题也是我开始学习3D变换过程中困惑的点。
        矩阵乘法的意义，可以看B站上<a
          href="https://www.bilibili.com/video/BV1ib411t7YR/?spm_id_from=333.999.0.0&vd_source=5ada382aabd47e1c6f9773391b0419df"
          target="_blank"
          >这个视频</a
        >，我觉得对于了解矩阵是足够的。
      </p>
      <p>
        先引入一个案例：基于一个
        100*100的矩形，先平移(100,100),再旋转45°，再缩放(2，3)
      </p>
      <canvas width="300" height="300" ref="canvasRef1" class="canvas"></canvas>

      <p>
        我们先使用了最基本的API，实现了这个需求，如果我想要组合起来，使用`transform`方法的话，就需要使用到矩阵的乘法。根据MDN对此方法的描述，我们可以知道，transform所接收的六个参数，其实是一个三阶矩阵的前两行，e,f表示x轴
        y 轴的位移量，如果 b、c为零的话，a、d 就是 x y
        轴的缩放，a、b、c、d整体描述旋转的量，如果对详细的推到感兴趣，可以戳
        <a
          href="https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-2d-matrices.html"
          target="_blank"
          >webGl基础</a
        >，这篇文章详细地讲解了二维矩阵。
      </p>

      <p>
        理解了上述知识，那接下来我们就需要将每一步的变换都写为一个矩阵的形式，最后再得出一个最终的矩阵：
        这里我们使用 ThreeJS提供的三阶矩阵的类。
        依据打印的<code>ctx.getTransform</code>,可以看到两种方法的transform参数是相同的，
        我们都是实现了<code>M = T * R *S</code>矩阵乘法。
      </p>
      <canvas width="300" height="300" ref="canvasRef2" class="canvas"></canvas>
      <p>
        再解释矩阵的乘法顺序之前，先谈一个常见的效果 --
        错切，就是将旋转矩阵和缩放矩阵的顺序换一下。如果不太理解矩阵乘法的顺序，那么对于这个现象就不好解释。下面的图案就是在案例2的基础上，改动得到的，我们发现他已经变为一个平行四边形，不再是矩形了
      </p>
      <canvas width="300" height="300" ref="canvasRef3" class="canvas"></canvas>

      <p>通常来讲，矩阵乘法的顺序有两种解释，一种从右往左，一种从左往右</p>
      <p>
        先看第一种，也是被多数人熟知的方式<code>M = T * R * S</code
        >,我们先对物体本身做缩放的变换（2，3），再对物体做旋转变换（45°），最后位移（150，100），在这个变换里面，所有的基点，都是变换之前的canvas原点，在这个例子中，就是绝对坐标，在左上角。
      </p>
      <p>
        另一种解释：先对物体所在的坐标系左位移（150，100），再对物体所在的坐标系旋转（45°），最后拉伸物体的坐标系（2，3）.这种解释，本质上认为矩阵代表的就是物体本身的坐标系，而初始状态的矩阵为单位矩阵，没有发生变换，所以和绝对坐标系重合。
      </p>
      <p>
        乍一看，好像没有什么不一样，但是，我们的第一个例子，也就是使用canvas提供的变换方法
        ，所书写的顺序其实是第二种，那我们看一下MDN上关于scale方法的解释：
        Canvas 2D API 的 <code>CanvasRenderingContext2D.scale()</code>
        方法用于根据水平和垂直方向，为 canvas 单位添加缩放变换。 默认情况下，在
        canvas 中一个单位实际上就是一个像素。例如，如果我们将 0.5
        作为缩放因子，最终的单位会变成 0.5
        像素，并且形状的尺寸会变成原来的一半。相似的方式，我们将 2.0
        作为缩放因子，将会增大单位尺寸变成两个像素。形状的尺寸将会变成原来的两倍。
      </p>
      <p>
        其实质，是对坐标系的基向量，或者说单位向量做了缩放，所以，整个画布的所有元素都发生了变换，改变坐标系正好和第二种解释对应，而书写顺序，也是第二种。
      </p>
      <p>
        那我们再来解释下之前提到的问题 -- 错切，<code>M = S *R</code>
        这里需要注意：x y 轴的缩放系数不能一致。
      </p>
      <p>
        按照从左往右的说法，所有的变换都是基于当前的绝对坐标系下，然后作用与物体本身。在绝对坐标系下对物体旋转
        45°，此时的坐标原点是左上角。然后，继续在绝对坐标系下
        对物体缩放（2，1）。注意：此时的X Y
        轴依然没有发生旋转，相当于沿着X轴方向对物体做拉伸、拉伸的系数是2,Y方向的值不变，所以发生了错切。这也是X
        Y 缩放系数不能相同的原因。
      </p>
      <canvas width="300" height="300" ref="canvasRef4" class="canvas"></canvas>

      <p>
        第二种解释：物体本身的坐标系发生变换，x
        方向的单位长度变为原来的2倍，而y方向不变，所以现在的 x y
        方向上的单位长度不一致。我们知道，对于任意一点（x,y），旋转a°后，新的坐标为（xcos(a)
        + y sin(a),-xsin(a) + ycos(a)），可以简化为圆上任意一点绕圆心做旋转。而x y 单位长度不一样的旋转，可以简化为 椭圆任意一点，绕圆心做旋转。
      </p>
      <canvas width="300" height="300" ref="canvasRef5" class="canvas"></canvas>
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
