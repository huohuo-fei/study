<script setup lang="ts">
import { onMounted, ref ,provide} from 'vue';
import { RenderApp } from './lmmPlus/obj3D';
const renderKit = RenderApp;
provide('renderKit', renderKit);
const containerRef = ref<HTMLDivElement>();
const size = ref<{ width: number | undefined; height: number | undefined }>({
  width: 0,
  height: 0,
});
onMounted(() => {
  const container = containerRef.value;
  size.value.width = container?.clientWidth;
  size.value.height = container?.clientHeight;
});
</script>

<template>
  <div id="container" ref="containerRef">
    <router-view :size="size"></router-view>
  </div>
  <!-- <div class="side">
    <div class="nav">
      <div>导航</div>
      <router-link to="/test-containerainerroler">轨道控制器</router-link>
      <router-link to="/test-imgcontainerainerroler">图案控制器</router-link>
      <router-link to="/test-transform">变换</router-link>
      <router-link to="/test-text2D">文字</router-link>
      <router-link to="/test-Path">路径</router-link>
      <router-link to="/test-three">3D</router-link>
    </div>

    <div class="containerrol">
      <button @click="threeMode = eventType.rotate3D">rotate</button>
      <button @click="threeMode = eventType.fill3D">fill</button>
      <button @click="threeMode = eventType.resize3D">resize</button>
    </div>
  </div> -->
</template>

<style scoped>
.side {
  width: 200px;
  padding: 15px;
  border-left: 1px solid #ddd;
}
#container {
  flex: 1;
}
.router-link-active {
  color: #00acec;
}
</style>
