<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { eventType } from './lmmPlus/driver';
const contRef = ref<HTMLDivElement>()
const size = ref<{width:number|undefined,height:number|undefined}>({width:0,height:0})
const threeMode = ref<eventType>(eventType.draw3D)
onMounted(() => {
  const cont = contRef.value
  size.value.width = cont?.clientWidth
  size.value.height = cont?.clientHeight

})
</script>

<template>
  <div id="cont" ref="contRef">
    <router-view :size="size" :three-mode="threeMode"></router-view>
  </div>
  <nav>
    <div>导航</div>
    <!-- <router-link to="/test-controler">轨道控制器</router-link> -->
    <!-- <router-link to="/test-imgcontroler">图案控制器</router-link> -->
    <!-- <router-link to="/test-transform">变换</router-link> -->
    <router-link to="/test-text2D">文字</router-link>
    <router-link to="/test-Path">路径</router-link>
    <router-link to="/test-three">3D</router-link>
  </nav>

  <div>
    <button @click="threeMode =eventType.rotate3D ">rotate</button>
    <button @click="threeMode = eventType.fill3D">fill</button>
    <button @click="threeMode = eventType.resize3D">resize</button>
  </div>

</template>

<style scoped>
nav {
    width: 200px;
    padding: 15px;
    border-left: 1px solid #ddd;
}
.nav-tit {
    font-weight: bold;
    margin-bottom: 15px;
}
nav a {
    display: block;
    margin-bottom: 10px;
}
#cont {
    flex: 1;
}
.router-link-active {
    color: #00acec;
}
</style>
