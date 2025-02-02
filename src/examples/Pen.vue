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
const svgRef = ref<SVGSVGElement>()
let bezierPath: ToolPen | null
let imgBitMap: ImageBitmap | null = null


onMounted(async () => {
    // 绘制
    const blob = await loadImg()
    imgBitMap = blob
    initListen()
    render()
});

const loadImg = async () => {
    const res = await  fetch('/resource/test-bg.jpeg')
    const blob = await res.blob()
    return createImageBitmap(blob)
}

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
let myReq = 0
const render = () => {
    const canvas = canvasRef.value;
    const ctx = canvas?.getContext('2d');
    ctx?.clearRect(0, 0, canvas?.width as number, canvas?.height as number)
    if(imgBitMap){
        ctx?.drawImage(imgBitMap,0,0)
    }
    bezierPath?.render()
    myReq = requestAnimationFrame(render)
}


const startPen = () => {
    if (bezierPath) {
        bezierPath.dispose()
    }
    const canvas = canvasRef.value;
    const ctx = canvas?.getContext('2d') as CanvasRenderingContext2D
    bezierPath = new ToolPen(ctx)
}

const download = () => {
    if (!bezierPath) return
    const points = bezierPath.exportPenPoints()
    if(!points.length)return
    let str = ''
    const firstPoint = points[0]
    str += `M ${firstPoint.x} ${firstPoint.y} `

    for (let i = 1, len = points.length; i < len; i++) {
        const perPoint = points[i - 1]
        const point = points[i]
        str += `C ${perPoint.nextControlPoint.x} ${perPoint.nextControlPoint.y} ${point.perControlPoint.x} ${point.perControlPoint.y} ${point.x} ${point.y} `
    }
    if (svgRef.value) {
        const pathBox = svgRef.value.querySelector('path') as SVGPathElement
        pathBox.setAttribute('d', str)
        const pathGroup = pathBox.getBBox();
        bezierPath.clipCanvas(pathGroup,imgBitMap as ImageBitmap).then(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'image.png';
            a.click();
            URL.revokeObjectURL(url);
        })
    }
}
</script>

<template>
    <canvas ref="canvasRef" :width="size.width" :height="size.height"></canvas>
    <div class="operate">
        <button @click="startPen">
            start
        </button>
        <button @click="download">download</button>
    </div>
    <div class="svg-box">
        <svg ref="svgRef" :width="size.width" :height="size.height" xmlns="http://www.w3.org/2000/svg">
            <path stroke="transparent" fill="transparent" />
        </svg>
    </div>
</template>

<style scoped>
.read-the-docs {
    color: #888;
}

.svg-box {
    position: absolute;
    top: 0;
    left: 0;
    z-index: -10;

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
