<script setup lang="ts">
import { testData } from './mock';
import { TreeList } from './lib/src/Tree';
import { onMounted } from 'vue';

onMounted(() => {
  const targetDom = document.querySelector('.box') as HTMLElement
  const tree = new TreeList(targetDom, {
    data: testData,
  });
  tree.start()
  console.log(tree);
  
});
</script>

<template>
  <div class="box"></div>
</template>
<style scoped>
.box {
  margin: 20px auto;
  width: 1200px;
  height: 600px;
  background-color: black;
  overflow: scroll;
}
</style>
