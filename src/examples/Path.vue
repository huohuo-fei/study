<script setup lang="ts">
import { ref, defineProps, onMounted, withCtx } from 'vue';
import { Camera } from '../lmmPlus/core/Camera';
import { Img2D } from '../lmmPlus/objects/Img';
import { Vector2 } from '../lmmPlus/math/Vector2';
import { Scene } from '../lmmPlus/core/Scene';
import { OrbitControler } from '../lmmPlus/controler/OrbitControler';
import { imgLoadPromises, SelectObj } from '../lmmPlus/objects/ObjectUtils';
import { Group } from '../lmmPlus/objects/Group';
import { Object2D } from '../lmmPlus/objects/Object2D';
import { Matrix3 } from '../lmmPlus/math/Matrix3';
import { TransformControler } from '../lmmPlus/controler/TransformControler';
import { Path } from '../lmmPlus/objects/Path';
import { useRouter } from 'vue-router';

const props = defineProps({
  size: {
    type: Object,
    default: { width: 0, height: 0 },
  },
});
const router = useRouter()
const canvasRef = ref<HTMLCanvasElement>();
const scene = new Scene();
const orbi = new OrbitControler(scene.camera, {});
const selectObj = SelectObj(scene);
const transformControler = new TransformControler();
scene.add(transformControler);

const cursor = ref('default');
const updateMouseStyle = () => {
  if (transformControler.mouseState) {
    cursor.value = 'none';
  } else if (activePath) {
    cursor.value = 'pointer';
  } else {
    cursor.value = 'default';
  }
};

// 按需渲染
orbi.addEventListener('change', () => {
  scene.render();
});

transformControler.addEventListener('change', () => {
  scene.render();
});

let pathObj: Path | null;
let activePath: Object2D | null;
function drawPath(ctx: CanvasRenderingContext2D) {
  canvasRef.value?.addEventListener('pointerdown', ({ clientX, clientY }) => {
    const mp = scene.clientToClip(clientX, clientY);

    if (currentModel.value === optModel.draw) {
      pathObj = new Path();
      scene.add(pathObj);
      pathObj.start(mp);
    } else {
      activePath = selectObj(scene.children, mp);
      transformControler.pointerdown(activePath, mp);
      updateMouseStyle();
    }
  });
  canvasRef.value?.addEventListener('pointermove', ({ clientX, clientY }) => {
    const mp = scene.clientToClip(clientX, clientY);

    if (pathObj && currentModel.value === optModel.draw) {
      pathObj.doing(mp);
    } else {
      transformControler.pointermove(mp);
      activePath = selectObj(scene.children, mp);
      updateMouseStyle();
    }
  });
  canvasRef.value?.addEventListener('pointerup', ({ clientX, clientY }) => {
    const mp = scene.clientToClip(clientX, clientY);
    if (pathObj && currentModel.value === optModel.draw) {
      pathObj.end(mp);
      pathObj = null;
    } else {
      transformControler.pointerup();
    }
  });
  /* 键盘按下 */
  window.addEventListener(
    'keydown',
    ({ key, altKey, shiftKey }: KeyboardEvent) => {
      transformControler.keydown(key, altKey, shiftKey);
      updateMouseStyle();
    }
  );

  /* 键盘抬起 */
  window.addEventListener('keyup', ({ altKey, shiftKey }: KeyboardEvent) => {
    transformControler.keyup(altKey, shiftKey);
  });
}

onMounted(() => {
  // 绘制
  const canvas = canvasRef.value;
  const ctx = canvas?.getContext('2d');
  // ctx?.fillRect(0,0,200,200)
  if (canvas && ctx) {
    scene.setOption({ canvas });
    drawPath(ctx);
  }
});

enum optModel {
  draw = 'draw',
  select = 'select',
}
const currentModel = ref<optModel>(optModel.draw);
</script>

<template>
  <canvas
    :style="{ cursor: cursor }"
    ref="canvasRef"
    :width="size.width"
    :height="size.height"
  ></canvas>
  <div class="operate">
    <button
      :class="currentModel === optModel.draw ? 'active' : ''"
      @click="currentModel = optModel.draw"
    >
      draw
    </button>
    <button
      :class="currentModel === optModel.select ? 'active' : ''"
      @click="currentModel = optModel.select"
    >
      select
    </button>
    <button @click="router.replace('/')" >
      Home
    </button>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}

.operate {
  position: absolute;
  top: 5px;
  left: 100px;

  button {
    cursor: pointer;
    margin-right: 10px;
  }
}

.active {
  background-color: skyblue;
}
</style>
