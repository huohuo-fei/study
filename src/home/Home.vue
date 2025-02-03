<script setup lang="ts">
import { useRouter } from 'vue-router';
const router = useRouter();
const copy = (text: string) => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(function () {
      alert('复制成功~');
    });
  } else {
    const aux = document.createElement('input');
    aux.setAttribute('value', text);
    document.body.appendChild(aux);
    aux.select();
    document.execCommand('copy');
    document.body.removeChild(aux); 
    alert('复制成功');
  }
};
</script>

<template>
  <div class="home">
    <h1>Home</h1>
    <main>
      <section>
        <h2>浅谈</h2>
        <aside>
          <button @click="router.push('blog-canvas-01')">canvas相对变换、绝对变换</button>
          <button @click="router.push('blog-canvas-02')">canvas中矩阵乘法顺序的理解</button>
          <button @click="router.push('blog-canvas-03')">canvas 基点变换</button>
        </aside>
      </section>
      <section>
        <h2>案例</h2>
        <aside>
          <button @click="router.push('test-three')">3D画布</button>
          <button @click="router.push('test-path')">2D画布</button>
          <button @click="router.push('test-pen')">钢笔抠图</button> 
        </aside>
      </section>
    </main>
    <div class="link">
      <a href="https://github.com/huohuo-fei/study" target="_blank">
        <img src="../assets/github.svg" alt="github" srcset="" />
      </a>
      <a href="https://gitee.com/huohuofei/canvas2d" target="_blank">
        <img src="../assets/gitee.svg" alt="gitee" href="" />
      </a>
      <img
        src="../assets/wx.svg"
        alt="wx"
        title="h_f_qwer"
        @click="copy('h_f_qwer')"
      />
    </div>
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

      aside {
        display: flex;
        flex-direction: column;
        align-items: center;

        button {
          min-width: 100px;
          height: 30px;
          margin-bottom: 10px;
        }
      }
    }
  }
}

.link {
  position: absolute;
  top: 0;
  right: 20px;

  img {
    width: 30px;
    height: 30px;
    margin-left: 10px;
    border-radius: 50%;
    cursor: pointer;
  }
}
</style>
