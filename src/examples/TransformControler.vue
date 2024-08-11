<script setup lang="ts">
import { ref, defineProps, onMounted } from 'vue';
import { Camera } from '../lmmPlus/core/Camera';
import { Img2D } from '../lmmPlus/objects/Img';
import { Vector2 } from '../lmmPlus/math/Vector2';
import { Scene } from '../lmmPlus/core/Scene';
import { OrbitControler } from '../lmmPlus/controler/OrbitControler';
import { imgLoadPromises, SelectObj } from '../lmmPlus/objects/ObjectUtils';
import { Group } from '../lmmPlus/objects/Group';
import { Object2DType } from '../lmmPlus/objects/Object2D';
import { Object2D } from '../lmmPlus/objects/Object2D';
import { Matrix3 } from '../lmmPlus/math/Matrix3';
import { TransformControler } from '../lmmPlus/controler/TransformControler';
import { Text2D } from '../lmmPlus/objects/Text2D';
const props = defineProps({
  size: {
    type: Object,
    default: { width: 0, height: 0 },
  },
});
const canvasRef = ref<HTMLCanvasElement>();
const scene = new Scene();
const group = new Group();
const orbi = new OrbitControler(scene.camera, {});
scene.add(group);
const selectObj = SelectObj(scene);

/** 图案控制器 */
const transformControler = new TransformControler();
scene.add(transformControler);
// 鼠标样式
const cursor = ref('default');

// 鼠标滑上的图案
let imgHover: Object2D | null = null;

// 选择图案的方法

const images: HTMLImageElement[] = [];
for (let i = 1; i < 2; i++) {
  const image = new Image();
  image.src = `https://yxyy-pandora.oss-cn-beijing.aliyuncs.com/stamp-images/${i}.png`;
  images.push(image);
}

// 测试图案控制器
function test() {
  // 先将所有图形 放到一个group

  for (let i = 0, len = images.length; i < len; i++) {
    const size = new Vector2(images[i].width, images[i].height).multiplyScalar(
      0.3
    );
    const img = new Img2D({
      image: images[i],
      // 模型矩阵
      position: new Vector2(0, i * 150 - 250),
      rotate: 0.3,
      offset: new Vector2(-size.x / 2, -size.y / 2),
      name: 'img' + i,
      size,
      // 样式
      style: {
        shadowColor: 'rgba(0,0,0,0.5)',
        shadowOffsetY: 20,
        shadowBlur: 5,
      },
    });
    if (i === 1) {
      // img.setOption({enableCamera:false})
    }
    group.add(img);
  }
  // scene.camera.position.set(0, 200);
  scene.render();
  enableControl();
}

// 按需渲染
orbi.addEventListener('change', () => {
  scene.render();
});

transformControler.addEventListener('change', () => {
  scene.render();
});

// 轨道控制器
const enableControl = () => {
  canvasRef.value?.addEventListener('pointerdown', (event) => {
    if (event.button === 1) {
      orbi.pointerdown(event.clientX, event.clientY);
    } else if (event.button === 0) {
      const mp = scene.clientToClip(event.clientX, event.clientY);

      imgHover = selectObj(group.children, mp);
      transformControler.pointerdown(imgHover, mp);
      updateMouseStyle();
    }
  });

  canvasRef.value?.addEventListener('pointermove', ({ clientX, clientY }) => {
    orbi.pointermove(clientX, clientY);
    const clipMp = scene.clientToClip(clientX, clientY);
    transformControler.pointermove(clipMp);
    imgHover = selectObj(group.children, clipMp);

    updateMouseStyle();
  });

  canvasRef.value?.addEventListener('pointerup', ({ button }) => {
    switch (button) {
      case 1:
        orbi.pointerup();
        break;
      case 0:
        transformControler.pointerup();
    }
  });

  canvasRef.value?.addEventListener('wheel', ({ deltaY }) => {
    orbi.doScale(deltaY);
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
};

// 鼠标按下　是否选中图形
const imgControlDown = (cx: number, cy: number) => {
  for (let i = group.children.length - 1; i >= 0; i--) {
    const obj = group.children[i];

    // 这里将鼠标点 转为 裁剪坐标系的点 那么矩阵就需要传 带有偏移量的矩阵
    // 这里鼠标点击的坐标系 是裁剪坐标系。我们需要将鼠标的落点 转为真正canvas的裁剪坐标系下的点，
    const clip = scene.clientToClip(cx, cy);
    const isIn = scene.isPointInObj(obj, clip, obj.pvmoMatrix);
    if (isIn) {
      break;
    }
  }
};

// 测试从矩阵中获取旋转分量
const testMatrix = () => {
  const rm = new Matrix3().makeRotation(30);
  const { elements: e } = rm;
  const x = new Vector2(e[0], e[1]).length();
  const y = new Vector2(e[3], e[4]).length();
};
testMatrix();

const updateMouseStyle = () => {
  if (transformControler.mouseState) {
    cursor.value = 'none';
  } else if (imgHover) {
    cursor.value = 'pointer';
  } else {
    cursor.value = 'default';
  }
};

const msg = ref('Sphix');
const text2D = new Text2D({
  text: msg.value,
  maxWidth: 400,
  position: new Vector2(0, 0),
  style: {
    fontSize: 100,
    fillStyle: '#00acec',
    textAlign: 'start',
    textBaseLine: 'top',
  },
});
group.add(text2D);
onMounted(() => {
  // 绘制
  const canvas = canvasRef.value;
  const ctx = canvas?.getContext('2d');
  // ctx?.fillRect(0,0,200,200)
  if (canvas && ctx) {
    scene.setOption({ canvas });
    Promise.all(imgLoadPromises(images)).then((res) => {
      test();
    });
  }
});
const textChange = () => {
  text2D.text = msg.value
    transformControler.updateFrame()
    scene.render()
};
</script>

<template>
  <canvas
    ref="canvasRef"
    :style="{ cursor: cursor }"
    :width="size.width"
    :height="size.height"
  ></canvas>
  <div id="text">
    <label>文字内容：</label>
    <input type="text" v-model="msg" @input="textChange" />
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}

#text{
  position: absolute;
  top: 50px;
  left: 50%;
  z-index: 10;
}
</style>
