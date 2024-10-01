<script setup lang="ts">
import { useRouter } from 'vue-router';
const router = useRouter()
</script>

<template>
  <div class="home">
    <h1>Home</h1>
    <main>
      <section>
        <h2>浅谈</h2>
      </section>
      <section>
        <h2>案例</h2>
        <aside>
          <button @click="router.push('test-three')">3D画布</button>
          <button @click="router.push('test-path')">2D画布</button>
        </aside>
      </section>
    </main>
  </div>
</template>

<style scoped lang="less">
.home {
  width: 60%;
  margin: 100px auto;
  text-align: center;

  main {
    display: flex;
    section {
      width: 50%;

      aside{
        display: flex;
        flex-direction: column;
        align-items: center;

        button{
          width: 100px;
          height: 30px;
          margin-bottom: 10px;
        }
      }
    }
  }
}
</style>
