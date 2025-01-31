<script setup lang="ts">
import { ref, defineProps, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Receiver } from '../tool/Receiver';
import { ToolPen } from '../tool/pen';

const props = defineProps({
    size: {
        type: Object,
        default: { width: 0, height: 0 },
    },
});
const router = useRouter()
const canvasRef = ref<HTMLCanvasElement>();
let bezierPath: ToolPen | null


onMounted(() => {
    // 绘制

    initListen()
    render()
});

const initListen = () => {
    // 监听
    const canvas = canvasRef.value;
    canvas?.addEventListener('pointerdown', (e) => {
        if (e.button === 0) {
            // 左键
            bezierPath?.onPointerdown(e)
        } else if (e.button === 2) {
            bezierPath?.onDrawOver()
        }


    })
    canvas?.addEventListener('pointermove', (e) => {
        bezierPath?.onPointermove(e)
    })
    canvas?.addEventListener('pointerup', (e) => {
        bezierPath?.onPointerup(e)
    })

    canvas?.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        return false

    })

}

const render = () => {
    const canvas = canvasRef.value;
    const ctx = canvas?.getContext('2d');
    ctx?.clearRect(0, 0, canvas?.width as number, canvas?.height as number)
    bezierPath?.render()
    requestAnimationFrame(render)
}


const startPen = () => {
    if (bezierPath) return
    const canvas = canvasRef.value;
    const ctx = canvas?.getContext('2d') as CanvasRenderingContext2D
    bezierPath = new ToolPen(ctx)
}

const clear = () => {
    const canvas = canvasRef.value;
    const ctx = canvas?.getContext('2d');
    ctx?.clearRect(0, 0, canvas?.width as number, canvas?.height as number)
}
</script>

<template>
    <canvas ref="canvasRef" :width="size.width" :height="size.height"></canvas>
    <div class="operate">
        <button @click="startPen">
            钢笔
        </button>
        <button @click="clear">clear</button>
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
