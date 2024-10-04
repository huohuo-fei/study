<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
const canvasRef1 = ref<HTMLCanvasElement>();
const canvasRef2 = ref<HTMLCanvasElement>();
const canvasRef3 = ref<HTMLCanvasElement>();
const canvasRef4= ref<HTMLCanvasElement>();
function draw1() {
  if (!canvasRef1.value) return;
  const ctx = canvasRef1.value.getContext('2d') as CanvasRenderingContext2D;
  ctx.fillStyle = 'rgba(100,100,100,1)';
  ctx.transform(1, 0, 0, 1, 50, 50);
  ctx.fillRect(0, 0, 50, 50);

  ctx.fillStyle = 'rgba(100,100,100,0.6)';
  ctx.transform(1, 0, 0, 1, 50, 50);
  ctx.fillRect(0, 0, 50, 50);

  ctx.save()
  ctx.fillStyle = 'rgba(100,100,100,0.3)';
  ctx.transform(1, 0, 0, 1, 50,50);
  ctx.fillRect(0, 0, 50, 50);
  ctx.restore()

}

function draw2() {
  if (!canvasRef2.value) return;
  const ctx = canvasRef2.value.getContext('2d') as CanvasRenderingContext2D;
  ctx.fillStyle = 'rgba(100,100,100,1)';
  ctx.setTransform(1, 0, 0, 1, 50, 50);
  ctx.fillRect(0,0, 50, 50);
  ctx.fillStyle = 'rgba(255,255,2,0.6)';

  ctx.setTransform(1, 0, 0, 1, 50, 50);
  ctx.fillRect(0,0, 70, 70);
  ctx.fillStyle = 'rgba(100,100,100,0.3)';

  ctx.setTransform(1, 0, 0, 1, 100, 100);
  ctx.fillRect(0,0, 50, 50);
}

function draw3(){
  if (!canvasRef3.value) return;
  const ctx = canvasRef3.value.getContext('2d') as CanvasRenderingContext2D;
  ctx.fillStyle = 'rgba(100,100,100,1)';
  ctx.transform(1, 0, 0, 1, 50, 50);
  ctx.fillRect(0, 0, 50, 50);

  ctx.fillStyle = 'rgba(200,0,0,0.6)';
  ctx.transform(1, 0, 0, 1, 50, 50);
  ctx.fillRect(0, 0, 50, 50);

  ctx.fillStyle = 'rgba(100,100,100,0.6)';
  ctx.transform(2, 0, 0, 1, 0, 0);
  ctx.fillRect(0, 0, 50, 50);


  ctx.fillStyle = 'rgba(200,0,0,0.6)';
  ctx.transform(1, 0, 0, 1, 50, 50);
  ctx.fillRect(0, 0, 50, 50);

  ctx.fillStyle = 'rgba(100,100,100,0.3)';
  const angle = Math.PI / 6
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  ctx.transform(cos, sin, -sin, cos, 0,0);
  ctx.fillRect(0, 0, 50, 50);
}
function draw4(){
  if (!canvasRef4.value) return;
  const ctx = canvasRef4.value.getContext('2d') as CanvasRenderingContext2D;
  ctx.fillStyle = 'rgba(100,100,100,1)';
  ctx.transform(1, 0, 0, 1, 50, 50);
  ctx.fillRect(0, 0, 50, 50);

  ctx.fillStyle = 'rgba(200,0,0,0.6)';
  const angle = Math.PI / 6
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  ctx.transform(1,0,0,1, 50,50);
  ctx.fillRect(0, 0, 50, 50);
  ctx.fillStyle = 'rgba(100,100,100,0.6)';
  ctx.transform(cos, sin, -sin, cos, 0,0);
  ctx.fillRect(0, 0, 50, 50);

  ctx.fillStyle = 'rgba(200,0,0,0.6)';
  ctx.transform(1, 0, 0, 1, 50, 50);
  ctx.fillRect(0, 0, 50, 50);
  ctx.fillStyle = 'rgba(100,100,100,0.3)';
  ctx.transform(2, 0, 0, 1, 0, 0);
  ctx.fillRect(0, 0, 50, 50);
}

onMounted(() => {
  draw1();
  draw2();
  draw3()
  draw4()
});
</script>

<template>
  <div>
    <div class="blog">
      <h2>浅谈canvas的相对变换、绝对变换</h2>
      <p>我们知道：canvas有位移、旋转、缩放画布的方法。同时，也提供了`transform()`与`setTransform()`两个变换方法，用矩阵的形式表示所有的变换。那这两个方法有什么区别呢？MDN上对二者的解释是：</p>
      <ul>
        <li>Canvas 2D API 的 **`CanvasRenderingContext2D.transform()`** 方法用于将由该方法的参数所描述的矩阵与**当前的变换**相乘。你可以缩放、旋转、平移和倾斜上下文</li>
        <li>**`CanvasRenderingContext2D.setTransform()`** 方法用于使用单位矩阵**重新设置（覆盖）当前的**变换并调用变换，此变换由方法的变量进行描述。这使你能够对上下文进行缩放、旋转、平移（移动）和倾斜操作。</li>
      </ul>
      <p>从官方的解释上可以看到，`transform`是基于当前的变换而进行的，`setTransform`则是重置了当前的变换。文字有些抽象，我们可以尝试运行几个例子：</p>

      <div class="box">
        <canvas
      width='300' height='300'
      ref="canvasRef1"
      class="canvas"
    ></canvas>
    <canvas
      width="300" height="300"
      ref="canvasRef2"
      class="canvas"
    ></canvas>
      </div>
      <p>我们可以看到，`transform`每次变换，都是参考当前的坐标系，或者说矩阵进行的。第一个正方形向右下偏移50px绘制，此时相对的是左上角的canvas原点。第二个进行相同的变换，但此时的基点，是变换后的基点，也就是官方说的当前变换的基础上进行的变换。</p>
      <p>而`setTransform`绘制出的三个正方形，三次的变换基点都是左上角的canvas原点。

总的来说`transform`是相对当前变换的变换，也就是相对变换，首次执行的变换，可以理解为当前变换的矩阵为三阶单位矩阵。`setTransform`则是绝对变换，永远都相对于画布的原点进行变换。</p>


    <canvas
      width="500" height="500"
      ref="canvasRef4"
      class="canvas"
    ></canvas>
    <canvas
      width="500" height="500"
      ref="canvasRef3"
      class="canvas"
    ></canvas>
    </div>

  </div>
</template>

<style scoped lang="less">
.blog{
  width: 60%;
  margin: auto;

}
</style>
