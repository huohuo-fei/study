# canvas 2d 项目
- 尝试threeJS里的矩阵 乘法  和 Matrix().rotate().scale()的执行顺序

### 一些项目问题：
* 裁剪空间系中 为何要对 坐标系进行变换，让原点在中心？
```javascript
canvastoClip({ x, y }: Vector2) {
    const {
        canvas: { width, height },
    } = this
    return new Vector2(x - width / 2, y - height / 2)
}
```

### 一些前端问题
* vue 的router-view 标签  可以传属性，是直接传入到组件的props里面吗？