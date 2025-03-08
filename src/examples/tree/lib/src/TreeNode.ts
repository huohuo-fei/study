import { NodeState,NodeOptState } from './type';
// 定义一个子树节点，
// 里面包含着需要绘制画布上的必要数据和方法
/**
 * config: 绘制节点所需要的配置
 * data: 节点数据
 */
const configBase = {
  // 节点宽度
  width: 100,
  // 节点高度
  height: 50,
  // 相邻两个节点之间的横向间距
  gapW: 20,
  // 相邻两个节点之间的竖向间距
  gapH: 10,
  // 线宽
  lineWidth: 1,
  // 线颜色
  lineColor: '#000000',
  // 字体大小
  fontSize: 20,
  // 字体颜色
  fontColor: '#ffffff',
  // 字体左边距
  leftPedding: 10,
};
export class TreeNode {
  // 父节点
  parent: TreeNode | null;
  // 子元素
  children: TreeNode[];
  // 配置参数，--考虑是否要移到上一层
  config: any;
  // 原始数据
  originData: any;
  // 每个节点的状态  -- 用于在构造节点时区分状态
  state: NodeState = NodeState.none;
  // 节点的显示状态
  optState:NodeOptState = NodeOptState.none
  // 节点的中心坐标，已节点的左上角为参考
  x: number = 0;
  y: number = 0;
  // 节点相对于画布原点的偏移量
  offsetX: number = 0;
  offsetY: number = 0;
  // 节点的层级
  depth: number;
  constructor(parent: TreeNode | null, data: any, config: any) {
    this.parent = parent;
    this.children = [];
    this.config = Object.assign({}, configBase, config);
    this.originData = data;
    this.x = this.config.width / 2;
    this.y = this.config.height / 2;
    this.offsetX = 0;
    this.offsetY = 1;
    this.depth = 0;
  }

  setState(state: NodeState) {
    this.state = state;
  }

  setDepth(depth: number) {
    this.depth = depth;
  }

  get absY() {
    return this.offsetY - this.y;
  }

  calcPosAndSize(ctx: CanvasRenderingContext2D) {
    if (this.state === NodeState.none) {
      // 当前节点没有做任何处理
      // 此时的节点是在链条的最下方
      // Y 值就是 0
      const level = this.originData.level;
      this.offsetX = (this.config.gapW + this.config.width) * (level - 1);
      this.offsetY = 0;
    } else if (this.parent && this.state === NodeState.pedding) {
      // 此时节点处于等待状态，需要计算节点的位置
      // 并且要依据当前节点的深度值，设置父元素的深度值
      const level = this.originData.level;
      this.offsetX = (this.config.gapW + this.config.width) * (level - 1);
      this.offsetY = (this.config.gapH + this.config.height) * this.depth;
      this.parent.setDepth(this.depth);
    } else {
      // const level = this.originData.level;
      // this.offsetX = (this.config.gapW + this.config.width)* (level - 1)
      // this.offsetY = (this.config.gapH + this.config.height)* this.depth
    }
  }
  render(ctx: CanvasRenderingContext2D) {
    // 绘制节点
    ctx.save();
    ctx.translate(this.offsetX, -this.offsetY);
    // 绘制文本
    this.renderText(ctx);
    // 先绘制矩形框
    this.renderRect(ctx);
    // 再绘制连接线
    this.renderLink(ctx);
    ctx.restore();
  }

  renderText(ctx: CanvasRenderingContext2D) {
    // 计算字体左上角相对于节点左上角的偏移量
    const x = this.config.leftPedding;
    const y = (this.config.height - this.config.fontSize) / 2;
    ctx.fillText(this.originData.title, x, y);
  }
  renderRect(ctx: CanvasRenderingContext2D) {
    ctx.save()
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(this.config.width, 0);
    ctx.lineTo(this.config.width, this.config.height);
    ctx.lineTo(0, this.config.height);
    ctx.closePath();
    ctx.stroke();
    ctx.restore()
    
  }

  renderLink(ctx: CanvasRenderingContext2D) {
    // 没有子节点不需要绘制
    if (!this.children.length) return;

    if (this.children.length === 1) {
      // 只有一个子节点，直接连接
      ctx.beginPath();
      ctx.moveTo(this.config.width, this.config.height / 2);
      ctx.lineTo(this.config.width + this.config.gapW, this.config.height / 2);
      ctx.stroke();
    } else {
      // 有多个子节点,需要考虑子节点的不同状态,
      // 所以涉及到子节点的那一段线段，需要子节点自己实现
      let maxHeight = -Infinity;
      for (let i = 0; i < this.children.length; i++) {
        const child = this.children[i];
        child.renderPerLine(ctx);
        maxHeight = Math.max(maxHeight, child.absY);
      }
      ctx.beginPath();
      ctx.moveTo(this.config.width, this.config.height / 2);
      ctx.lineTo(
        this.config.width + this.config.gapW / 2,
        this.config.height / 2
      );
      ctx.lineTo(this.config.width + this.config.gapW / 2, -maxHeight);
      ctx.stroke();
    }
  }

  // 针对多个子节点的情况，需要当前子节点自己绘制自己的一小半连接线
  renderPerLine(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.beginPath();
    ctx.translate(this.config.width + this.config.gapW, -this.offsetY);
    ctx.moveTo(0, this.config.height / 2);
    ctx.lineTo(-this.config.gapW / 2, this.config.height / 2);
    ctx.stroke();
    ctx.restore();
  }

  renderLine(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.offsetX, -this.offsetY);
    // 先绘制矩形框
    this.renderRect(ctx);
    // 再绘制连接线
    this.renderLink(ctx);
    ctx.restore();
  }

  // 依据状态修改样式
  changeStyle(ctx: CanvasRenderingContext2D) {

  }
}
