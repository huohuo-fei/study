# canvas 2d 项目
- 尝试threeJS里的矩阵 乘法  和 Matrix().rotate().scale()的执行顺序
- s.mutiply(r).mutiply(t) => Matrix().t().r().s()  这两个返回的矩阵一样吗
- 看math工具类里面  mutiply() 和 Matrix().r().s() 的源代码，检测乘法的顺序 -- 也就是文章里面说的 绝对变换和相对变换
- a.multiply(b)  => a*b 

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
- group 里面不能有Img对象吗:可以，group的children是Object2D类型。Img继承子Object2D,
- canvas 中的裁剪坐标系 还是不太明白 -- 裁剪坐标，就是在canvas坐标的基础上，将相机加了进去。相机默认的位置或者说看向的就是画布的中点，这个是规定，所以需要将画布的原点变为中点

### 一些前端问题
* vue 的router-view 标签  可以传属性，是直接传入到组件的props里面吗？