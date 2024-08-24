<script setup lang="ts">
import { defineProps, onMounted, ref } from 'vue';
import { ThreeLayer } from '../lmmPlus/obj3D/ThreeLayer';
import { Cube } from '../lmmPlus/obj3D/compontent/cube';
import {RenderApp} from '../lmmPlus/obj3D'
import { eventType } from '../lmmPlus/driver';

const props = defineProps({
  size: {
    type: Object,
    default: { width: 0, height: 0 },
  },
  threeMode:{
    type:String,
    default:eventType.draw3D
  }
});
const canvasContainer = ref<HTMLCanvasElement>();
const renderKit = RenderApp 

function testCube(){
  renderKit.createDrawCtx(canvasContainer.value as HTMLCanvasElement)
}

onMounted(() => {
  if(canvasContainer.value){
    testCube()
  }
});
</script>

<template>
  <div ref="canvasContainer" class="canvas-container" :style="{width:size.width +'px',height:size.height + 'px'}">
  </div>
</template>

<style>
.read-the-docs {
  color: #888;
}
.canvas-container{
  position: relative;
}

.canvas-container canvas{
  position: absolute;
  top: 0;
  left: 0;
}
</style>
