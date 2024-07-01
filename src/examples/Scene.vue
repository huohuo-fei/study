<script setup lang="ts">
import { ref, defineProps, onMounted, withCtx } from 'vue';
import { Camera } from '../lmm/core/Camera';
import { Img } from '../lmm/objects/Img';
import { Vector2 } from '../lmm/math/Vector2';
import { Scene } from '../lmm/core/Scene';

const props = defineProps({
  size: {
    type: Object,
    default: { width: 0, height: 0 },
  },
});
const canvasRef = ref<HTMLCanvasElement>();
const scene = new Scene();

const image = new Image();
image.src =
  'https://yxyy-pandora.oss-cn-beijing.aliyuncs.com/stamp-images/1.png';

// 构建图形
const pattern = new Img({ image });
scene.add(pattern);

// 鼠标额裁剪坐标位
const mouseClipPos = new Vector2(Infinity);

// 测试
function test(canvas: HTMLCanvasElement) {
  const imgSize = new Vector2(image.width, image.height).multiplyScalar(0.6);
  pattern.setOption({
    // 模型矩阵
    position: new Vector2(0, 0),
    scale: new Vector2(0.5),
    rotate: 0,

    // Img 属性
    size: imgSize.clone(),
    offset: imgSize.clone().multiplyScalar(-0.5),

    // 样式
    style: {
      globalAlpha: 0.8,
      shadowColor: 'rgba(0,0,0,0.5)',
      shadowBlur: 20,
      shadowOffsetY: 60,
    },
  });

  // 相机位移测试
  scene.camera.position.set(50, 100);

  // 记录鼠标的裁剪坐标
  canvas.addEventListener('pointermove', ({ clientX, clientY }) => {
    const newPos = scene.clientToClip(clientX, clientY)
    mouseClipPos.copy(newPos);
  });

  // 动画
  ani();
}

function ani(time = 0) {
  // 相机缩放测试
  const inter = (Math.sin(time * 0.002) + 1) / 2;
  // scene.camera.zoom = inter + 0.5;

  // 投影
  // pattern.style.shadowBlur = 10 * (1 - inter);
  // pattern.style.shadowOffsetY = 80 * (1 - inter);

  // 选择测试
  if (scene.isPointInObj(pattern, mouseClipPos, pattern.pvmoMatrix)) {
    pattern.rotate += 0.02;
    // console.log('在里面');
    
  }

  scene.render();
  scene.ctx.save();
  scene.ctx.beginPath()
  scene.ctx.translate(scene.canvas.width/2,scene.canvas.height/2)
  pattern.crtPath(scene.ctx);
  scene.ctx.stroke();
  scene.ctx.restore();
  requestAnimationFrame(ani);
}

onMounted(() => {
  // 绘制
  const canvas = canvasRef.value;
  // ctx?.fillRect(0,0,200,200)
  if (canvas) {
    scene.setOption({ canvas });
    image.onload = function () {
      test(canvas);
    };
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
