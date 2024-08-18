<script setup lang="ts">
import { onMounted, ref } from 'vue';

const contRef = ref<HTMLDivElement>()
const size = ref<{width:number|undefined,height:number|undefined}>({width:0,height:0})

onMounted(() => {
  const cont = contRef.value
  size.value.width = cont?.clientWidth
  size.value.height = cont?.clientHeight

})
</script>

<template>
  <div id="cont" ref="contRef">
    <router-view :size="size"></router-view>
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
