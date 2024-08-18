/* 全局一些变量的定义 解释 */

// 对于 旋转控制器 和 缩放控制器来说  其 渲染顺序必须高于其他物体
export const TOP_RENDER_ORDER = 100

// 虚线的长度以及间隙
export const DASH_SIZE = 0.02
export const GAP_SIZE = 0.02

// 线框以及虚线的初始颜色
export const LINE_INIT_COLOR = 0xffffff
export const LINE_DASH_INIT_COLOR = 0x687b7c

// 绘制底部线框的最小值 小于这个值 将默认生成一个几何体
export const MIN_BOTTOM_LENGTH = 20

// 当前几何体的底部线框已近绘制好，但是拉伸高度值太小，需要启用默认的高度值
export const ON_DEFAULT_HEIGHT = true

// 拉伸高度不够时 默认的拉伸高度值
export const DEFAULT_STRETCH = 0.08
// 拉伸物体后 更新resizeControl 当前缩放不会反转物体
export const UPDATE_RESIZE_CONTROL = true
// 拉伸物体后，会使物体反转，这里做一个限制，不能让缩放的值 反转物体
export const UN_UPDATE_RESIZE_CONTROL = false 

// reseize控制器 的 控制点 和控制条的尺寸
export const  RESIZE_CYLINDER_R = 0.005
export const  RESIZE_CIRCLE_R = 0.02

// rotate控制器 的半径、带宽、偏移量
export const ROTATE_R = 0.3
export const ROTATE_H = 0.06
export const ROTATE_BAND_OFFSET = 0.005

// 动画系统  -- cube 11中类型
export const Cube_141_1 = 'Cube_141_1'
export const Cube_141_2 = 'Cube_141_2'
export const Cube_141_3 = 'Cube_141_3'
export const Cube_141_4 = 'Cube_141_4'
export const Cube_141_5 = 'Cube_141_5'
export const Cube_141_6 = 'Cube_141_6'
export const Cube_132_1 = 'Cube_132_1'
export const Cube_132_2 = 'Cube_132_2'
export const Cube_132_3 = 'Cube_132_3'
export const Cube_222 = 'Cube_222'
export const Cube_33 = 'Cube_33'

// 展开动画的基准步长
export const ANIMATE_STEP = 0.008

// 定义一个偏移量，在将几何体绘制到 canvas 画布上时 保证几何体的边框可以显示出来
export const OFFSET_LITTLE = 2


