<script setup lang="ts">
import { ref, defineProps, onMounted } from 'vue';
import { Camera } from '../lmm/core/Camera';
import { Img } from '../lmm/objects/Img';
import { Vector2 } from '../lmm/math/Vector2';
import { OrbitControler } from '../lmm/controler/OrbitControler';
import { Scene } from '../lmm/core/Scene';

const props = defineProps({
  size: {
    type: Object,
    default: { width: 0, height: 0 },
  },
});
const canvasRef = ref<HTMLCanvasElement>();
const scene = new Scene();
const orbi = new OrbitControler(scene.camera, {});

const image = new Image();
image.src =
  'https://yxyy-pandora.oss-cn-beijing.aliyuncs.com/stamp-images/1.png';

// 构建图形
const pattern = new Img({ image });
scene.add(pattern)

function render() {
  const imgSize = new Vector2(image.width, image.height).multiplyScalar(0.5);
  // 设置属性
  pattern.setOption({
    // 模型矩阵相关
    position: new Vector2(0, 50),
    rotate: 0.4,
    scale: new Vector2(0.5),

    // Img 属性
    // 负责设置绘制到canvas上的大小 以及偏移
    // 这个偏移，可以理解为重新设置基点。默认的drawImage 是图片的左上角和canvas画布的原点重合，设置了偏移量，就可以让任意点和canvas原点重合
    // size 负责在画布上绘制的内容占据的大小，这里只是让最终显示的大小是 image 的一半 仅此而已，它和image没有任何关系
    // offset 是偏移的值，这里设置为size的负一半，就是想让中心点和canvas原点对齐
    size: imgSize.clone(),
    offset: imgSize.clone().multiplyScalar(-0.5),

    // view 设置裁剪范围
    // 这个裁剪范围尺寸，是基于drawImage的sourceImage,也就是第一个参数源的尺寸大小。
    // pattern 的drawImage是image,所以再裁剪的时候，是按照image的尺寸做参考的
    // 用来提取图片的哪些内容会被显示
    // view: {
    //   x: 0,
    //   y: 0,
    //   width: image.width / 2,
    //   height: image.height / 2,
    // },

    // 样式
    style: {
      globalAlpha: 0.8,
      shadowColor: 'rgba(0,0,0,0.5)',
      shadowBlur: 5,
      shadowOffsetY: 20,
    },
  });

  scene.render()

  requestAnimationFrame(render)
}

onMounted(() => {
  // 绘制
  const ctx = canvasRef.value?.getContext('2d');
  // ctx?.fillRect(0,0,200,200)
  if (ctx) {
    scene.setOption({ canvas:canvasRef.value });
    image.onload = function () {
      render();
    };
  }

  canvasRef.value?.addEventListener('pointerdown', (event) => {
    if (event.button === 1) {
      // 鼠标滚轮按下
      orbi.pointerdown(event.clientX, event.clientY);
    }
  });

  canvasRef.value?.addEventListener('pointermove', ({ clientX, clientY }) => {
    orbi.pointermove(clientX, clientY);
  });

  canvasRef.value?.addEventListener('pointerup', (event) => {
    if (event.button === 1) {
      orbi.pointerup();
    }
  });

  canvasRef.value?.addEventListener('wheel',(event) => {
    orbi.doScale(event.deltaY)
  })
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
