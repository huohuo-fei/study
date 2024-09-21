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
    <canvas
      width='500' height='500'
      ref="canvasRef1"
      class="canvas"
    ></canvas>
    <canvas
      width="500" height="500"
      ref="canvasRef2"
      class="canvas"
    ></canvas>

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
</template>

<style scoped lang="less"></style>
