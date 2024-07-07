<script setup lang="ts">
import { ref, defineProps, onMounted, withCtx } from 'vue';
import { Camera } from '../lmm/core/Camera';
import { Img } from '../lmm/objects/Img';
import { Vector2 } from '../lmm/math/Vector2';
import { Scene } from '../lmm/core/Scene';
import { ImgControler } from '../lmm/controler/ImgControler';
import { OrbitControler } from '../lmm/controler/OrbitControler';
import { imgLoadPromises } from '../lmm/objects/ObjectUtils';
import { Group } from '../lmm/objects/Group';
import { Object2DType } from '../lmm/objects/Object2D';
import { Object2D } from '../lmm/objects/Object2D';
import { Matrix3 } from '../lmm/math/Matrix3';
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
const imgContr = new ImgControler();
// 鼠标样式
const cursor = ref('default');
let imgHover: Img | null = null;

const images: HTMLImageElement[] = [];
for (let i = 1; i < 5; i++) {
  const image = new Image();
  image.src = `https://yxyy-pandora.oss-cn-beijing.aliyuncs.com/stamp-images/${i}.png`;
  images.push(image);
}

// 测试图案控制器
function test() {
  // 先将所有图形 放到一个group

  for (let i = 0, len = images.length; i < len; i++) {
    const img = new Img({
      image: images[i],
      // 模型矩阵
      position: new Vector2(0, i * 80),
      scale: new Vector2(0.8),
      rotate: 0,
      name: 'img' + i,
      enableCamera: i === 1 ? false : true,

      // 视口参数
      size: new Vector2(300, 200),
      offset: new Vector2(300, 200).multiplyScalar(-0.5),

      // 样式
      style: {
        globalAlpha: 0.8,
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
  scene.camera.position.set(0, 200);
  scene.add(group);
  scene.add(imgContr);
  scene.render();
  enableControl();
}

// 轨道控制器
const enableControl = () => {
  canvasRef.value?.addEventListener('pointerdown', (event) => {
    if (event.button === 1) {
      orbi.pointerdown(event.clientX, event.clientY);
    } else if (event.button === 0) {
      const mp = scene.canvasToClip(new Vector2(event.clientX, event.clientY));

      imgHover = selectObj(group.children, mp);
      imgContr.pointerdown(imgHover, mp);
      updateMouseStyle();
    }
  });

  canvasRef.value?.addEventListener('pointermove', ({ clientX, clientY }) => {
    orbi.pointermove(clientX, clientY);
    const clipMp = scene.clientToClip(clientX, clientY);
    imgContr.pointermove(clipMp);
    updateMouseStyle();
  });

  canvasRef.value?.addEventListener('pointerup', () => {
    orbi.pointerup();
  });

  canvasRef.value?.addEventListener('wheel', ({ deltaY }) => {
    orbi.doScale(deltaY);
  });

  // 按需渲染
  orbi.addEventListener('change', (event) => {
    scene.render();
  });

  imgContr.addEventListener('change', (event) => {
    scene.render();
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
      console.log(obj.name, clip, 'is in');
      break;
    }
  }
};

// 测试从矩阵中获取旋转分量
const testMatrix = () => {
  const rm = new Matrix3().makeRotation(30);
  // console.log(rm);
  const { elements: e } = rm;
  const x = new Vector2(e[0], e[1]).length();
  const y = new Vector2(e[3], e[4]).length();
  console.log(x, y);
};
testMatrix();

/** 选择图案 */
const selectObj = (imgGroup: Object2D[], mp: Vector2): Img | null => {
  for (let img of [...imgGroup].reverse()) {
    // 这里使用倒叙
    if (img instanceof Img && scene.isPointInObj(img, mp, img.pvmoMatrix)) {
      return img;
    }
  }
  return null;
};

const updateMouseStyle = () => {
  if (imgContr.mouseState) {
    cursor.value = 'none';
  } else if (imgHover) {
    cursor.value = 'pointer';
  } else {
    cursor.value = 'default';
  }
};

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
</script>

<template>
  <canvas
    ref="canvasRef"
    :style="{ cursor: cursor }"
    :width="size.width"
    :height="size.height"
  ></canvas>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
