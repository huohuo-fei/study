<script setup lang="ts">
import { ref, defineProps, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Receiver } from '../tool/Receiver';
import { BitMapInfo, ToolPen } from '../tool/pen';



const props = defineProps({
    size: {
        type: Object,
        default: { width: 0, height: 0 },
    },
});
const canvasRef = ref<HTMLCanvasElement>();
const svgRef = ref<SVGSVGElement>()
let bezierPath: ToolPen | null
const bitmapInfo: BitMapInfo = {
    bitmap: null,
    offsetX: 0,
    offsetY: 0,
    scale: 0

}

onMounted(async () => {
    // 绘制
    const bitmap = await loadImg()
    createInfo(bitmap)
    initListen()
    render()
});

const loadImg = async () => {
    // const res = await fetch('/resource/bg2.jpg')
    const res = await fetch('/resource/test-bg.jpeg')
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
const render = () => {
    const canvas = canvasRef.value;
    const ctx = canvas?.getContext('2d');
    ctx?.clearRect(0, 0, canvas?.width as number, canvas?.height as number)
    if (bitmapInfo.bitmap) {
        const { bitmap, offsetX, offsetY, scale } = bitmapInfo
        ctx?.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height, offsetX, offsetY, bitmap.width * scale, bitmap.height * scale)
    }
    bezierPath?.render()
    requestAnimationFrame(render)
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
    if (!points.length) return
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
        bezierPath.clipCanvas(pathGroup, bitmapInfo).then(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'image.png';
            a.click();
            URL.revokeObjectURL(url);
        })
    }
}

const createInfo =(bitmap: ImageBitmap) => {
    const { width, height } = bitmap
    const ratioWH = width / height
    let scale = 1
    if (ratioWH <= 1) {
        // 图片高，需要保证高度完全显示出来
        scale = props.size.height / height
    } else {
        // 图片宽，需要保证宽度完全显示出来
        scale = props.size.width / width
    }
    // 计算绘制图片时的偏移量
    const offsetX = (props.size.width - width * scale) / 2;
    const offsetY = (props.size.height - height * scale) / 2;
    bitmapInfo.bitmap = bitmap
    bitmapInfo.offsetX = offsetX
    bitmapInfo.offsetY = offsetY
    bitmapInfo.scale = scale
}

const uploadFile = (e: Event) => {
    if(bezierPath){
        bezierPath.dispose()
        bezierPath = null
    }
    if (e.target) {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                if (event.target?.result) {
                    const img = new Image();
                    img.src = event.target.result as string;

                    img.onload = function () {
                        createImageBitmap(img).then(bitmap => {
                            createInfo(bitmap)
                        });
                    };
                }
            };
            reader.readAsDataURL(file);
        }

    }

}
</script>

<template>
    <canvas ref="canvasRef" :width="size.width" :height="size.height"></canvas>
    <div class="operate">
        <button @click="startPen">start</button>
        <button @click="download">download</button>
        <input type="file" accept="image/png, image/jpeg" @input="uploadFile">
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
