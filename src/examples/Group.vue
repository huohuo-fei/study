<script setup lang="ts">
import { ref, defineProps, onMounted } from 'vue';
import { Camera } from '../lmm/core/Camera';
import { Img } from '../lmm/objects/Img';
import { Vector2 } from '../lmm/math/Vector2';
import { Group } from '../lmm/objects/Group';
import { imgLoadPromises } from '../lmm/objects/ObjectUtils';

const props = defineProps({
  size: {
    type: Object,
    default: { width: 0, height: 0 },
  },
});
const canvasRef = ref<HTMLCanvasElement>();

const group = new Group()
const images:HTMLImageElement[] = []

for(let i = 1;i<8;i++){
  const img = new Image()
  img.src = `https://yxyy-pandora.oss-cn-beijing.aliyuncs.com/stamp-images/${i}.png`
  images.push(img)
}

function render(ctx:CanvasRenderingContext2D) {
const imgs = images.map((item,i) =>{
  const img = new Img({
    image:item,
    position:new Vector2(200,50*i + 80),
    scale:new Vector2(0.8),
    size:new Vector2(item.width,item.height).multiplyScalar(0.3),
    style:{
      shadowColor:"rbga(0,0,0,.5)",
      shadowBlur:5,
      shadowOffsetY:20
    }
  })
  return img
})
group.add(...imgs)
console.log('draw');

group.draw(ctx)
}

onMounted(() => {
  // 绘制
  const ctx = canvasRef.value?.getContext('2d');
  if (ctx) {
    const imgArrPromise = imgLoadPromises(images)
    Promise.all(imgArrPromise).then(() => {
      render(ctx)
    })

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
