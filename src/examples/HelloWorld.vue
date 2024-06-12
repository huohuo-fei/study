<script setup lang="ts">
import { ref,defineProps, onMounted} from 'vue'
defineProps({
  size:{
    type:Object,
    default:{width:0,height:0}
  }
})
const canvasRef = ref<HTMLCanvasElement>()

onMounted(() => {
  // 绘制
  const ctx = canvasRef.value?.getContext('2d')
  ctx?.fillRect(0,0,200,200)
})
</script>

<template>
  <canvas ref="canvasRef"></canvas>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
