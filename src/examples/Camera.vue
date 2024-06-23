<script setup lang="ts">
import { ref, defineProps, onMounted } from 'vue';
import { Camera } from '../lmm/core/Camera';

defineProps({
  size: {
    type: Object,
    default: { width: 0, height: 0 },
  },
});
const canvasRef = ref<HTMLCanvasElement>();
const camera = new Camera(-10, -10, 1);

onMounted(() => {
  // 绘制
  const ctx = canvasRef.value?.getContext('2d');
  // ctx?.fillRect(0,0,200,200)
  if (ctx) {
    testCamera(ctx);
  }
});
function testCamera(ctx: CanvasRenderingContext2D) {
  // 直接变换
  // camera.transformInvert(ctx)
  // 调用视图投影矩阵变换
  const { elements: e } = camera.getPvMatrix();
  ctx.transform(e[0], e[1], e[3], e[4], e[6], e[7]);
  ctx.fillRect(0, 0, 200, 200);
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
