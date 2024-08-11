<script setup lang="ts">
import { ref, defineProps, onMounted, withCtx } from 'vue';
import { Camera } from '../lmmPlus/core/Camera';
import { Img2D } from '../lmmPlus/objects/Img';
import { Vector2 } from '../lmmPlus/math/Vector2';
import { Scene } from '../lmmPlus/core/Scene';
import { OrbitControler } from '../lmmPlus/controler/OrbitControler';
import { imgLoadPromises, SelectObj } from '../lmmPlus/objects/ObjectUtils';
import { Group } from '../lmmPlus/objects/Group';
import { Object2D } from '../lmmPlus/objects/Object2D';
import { Matrix3 } from '../lmmPlus/math/Matrix3';
import { TransformControler } from '../lmmPlus/controler/TransformControler';
import { Text2D } from '../lmmPlus/objects/Text2D';
const props = defineProps({
  size: {
    type: Object,
    default: { width: 0, height: 0 },
  },
});
const canvasRef = ref<HTMLCanvasElement>();
const scene = new Scene();
const orbi = new OrbitControler(scene.camera, {});
const text2d = new Text2D({
  text: 'Sphinx',
  style: {
    fontSize: 100,
    fillStyle: 'red',
    strokeStyle:'blue',
    textAlign: 'center',
    textBaseLine: 'middle',
  },
});
scene.add(text2d);
// 按需渲染
orbi.addEventListener('change', () => {
  scene.render();
});

function drawText() {
  // scene.draw(ctx);
  scene.render()
  console.log('rect');
  
  const {
        ctx,
        canvas: { width, height },
    } = scene
    ctx.save()
    ctx.strokeStyle = 'maroon'
    ctx.translate(width / 2, height / 2)
    ctx.beginPath()
    text2d.crtPath(ctx, text2d.pvmMatrix)
    ctx.closePath()
    ctx.stroke()
    ctx.restore()

}

onMounted(() => {
  // 绘制
  const canvas = canvasRef.value;
  const ctx = canvas?.getContext('2d');
  // ctx?.fillRect(0,0,200,200)
  if (canvas && ctx) {
    scene.setOption({ canvas })
    drawText();
  }
});
</script>

<template>
  <canvas ref="canvasRef" :width="size.width" :height="size.height"></canvas>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
