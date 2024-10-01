<script setup lang="ts">
import { computed, defineProps, onMounted, ref } from 'vue';
import { RenderApp } from '../lmmPlus/obj3D';
import { eventType } from '../lmmPlus/driver';
import { RenderLayer } from '../lmmPlus/obj3D/renderLayer';
import { useRouter } from 'vue-router';
import {GeoType} from '../lmmPlus/obj3D/renderLayer' 

const props = defineProps({
  size: {
    type: Object,
    default: { width: 0, height: 0 },
  },
  threeMode: {
    type: String,
    default: eventType.draw3D,
  },
});
const router = useRouter()
const canvasContainer = ref<HTMLCanvasElement>();
const renderKit = RenderApp;
let renderLayer: RenderLayer;
const snapshotLength = ref(0)
const disActiveObj = ref(false)

function initRenderLayer() {
  renderLayer = renderKit.createDrawCtx(
    canvasContainer.value as HTMLCanvasElement
  );

  // 事件监听
  renderLayer.addEventListener('switchGeoMode', (event) => {
    if (event.mode) {
      actMode.value = typeMap.get(event.mode);
    }
  });
  renderLayer.addEventListener('changeSnapshot', (event) => {
    snapshotLength.value = event.value
  });
  // disActiveObj
  renderLayer.addEventListener('disActiveObj', (event) => {
    disActiveObj.value = true
  });
  renderLayer.addEventListener('activeObj', (event) => {
    disActiveObj.value = false
  });
}

onMounted(() => {
  if (canvasContainer.value) {
    initRenderLayer();
  }
});

/** 模式切换 S */
enum geoMode {
  draw = 'draw',
  fill = 'fill',
  rotate = 'rotate',
  resize = 'resize',
  select = 'select'
}
const typeMap = new Map<eventType, geoMode>([
  [eventType.draw3D, geoMode.draw],
  [eventType.rotate3D, geoMode.rotate],
  [eventType.resize3D, geoMode.resize],
  [eventType.fill3D, geoMode.fill],
  [eventType.select, geoMode.select],
]);

const actMode = ref(typeMap.get(eventType.draw3D));
const switchMode = (mode: eventType) => {
  if(actMode.value === typeMap.get(mode))return
  actMode.value = typeMap.get(mode);
  renderLayer.dispatchEvent({ type: 'switchMode', mode });
};
/** 模式切换 E */

/** 模式下的操作 S */
const changeFillColor = (none?: string) => {
  if (none) {
    renderLayer.dispatchEvent({ type: 'changeFillColor', color: 'none' });
    return;
  }
  const r = Math.floor(Math.random() * 56) + 200;
  const g = Math.floor(Math.random() * 201);
  const b = Math.floor(Math.random() * 201);
  const newFillColor = `rgb(${r},${g},${b})`;
  renderLayer.dispatchEvent({ type: 'changeFillColor', color: newFillColor });
};

const disAbleControl = computed(() => {
  return actMode.value === typeMap.get(eventType.draw3D) || disActiveObj.value
})
/** 模式下的操作 E */

const geoType = ref<GeoType>(GeoType.cube)
const changeGeoType = (event:Event) =>{
  geoType.value = ((event.target as HTMLInputElement).value) as GeoType
  renderLayer.dispatchEvent({ type: 'switchGeoType', value:geoType.value });
}
</script>

<template>
  <div class="box">
    <div
      ref="canvasContainer"
      class="canvas-container"
    ></div>
    <div class="side">
    <select class="select" :value="geoType" @change="changeGeoType">
      <option :value="GeoType.cube">立方体</option>
      <option :value="GeoType.cylinder">圆柱体</option>
      <!-- <option :value="GeoType.cone">圆锥体</option> -->
    </select>
      <button class="btn" @click="switchMode(eventType.draw3D)">draw</button>
      <button class="btn" @click="switchMode(eventType.resize3D)" :disabled="disAbleControl">
        resize
      </button>
      <button class="btn" @click="switchMode(eventType.rotate3D)" :disabled="disAbleControl">
        rotate
      </button>
      <button class="btn" @click="switchMode(eventType.fill3D)" :disabled="disAbleControl">fill</button>
      <button class="btn" @click="switchMode(eventType.select)" :disabled="snapshotLength ===0">select</button>

      <p>当前模式：{{ actMode }}</p>
      <template v-if="actMode === typeMap.get(eventType.fill3D)">
        <button class="btn" @click="changeFillColor()">切换颜色</button>
        <button class="btn" @click="changeFillColor('none')">清空颜色</button>
      </template>
      <hr/>
      <button class="btn" @click="router.replace('/')">Home</button>
    </div>
  </div>
</template>

<style>
.box {
  width: 100%;
  height: 100%;
  display: flex;
}

.side {
  width: 200px;
  box-sizing: border-box;
  padding-left: 10px;
}

.btn {
  display: block;
  width: 80px;
  height: 30px;
  margin: 10px;
  cursor: pointer;
}
.canvas-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.canvas-container canvas {
  position: absolute;
  top: 0;
  left: 0;
}

.select{
  margin-left: 10px;
}

hr{
box-sizing: border-box;
margin-right: 10px;
}

</style>


