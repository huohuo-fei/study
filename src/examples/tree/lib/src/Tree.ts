import { TreeNode } from './TreeNode';
import { TreeOptions, NodeState, NodeOptState } from './type';
export class TreeList {
  // 要挂载的dom元素
  dom: HTMLElement;
  // 树形结构数据 以及配置参数
  options: TreeOptions;
  // 每个层级的节点数据
  levelArray: TreeNode[][] = [];
  // 树形结构
  treeGraph!: TreeNode;
  // 最长的节点等级
  listMaxLevel: number = 0;
  // 最长路劲下的节点
  listMaxLevelNode!: TreeNode;
  cacheCanvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  constructor(dom: HTMLElement, options: TreeOptions) {
    this.dom = dom;
    this.options = options;
    this.cacheCanvas = document.createElement('canvas');
    this.cacheCanvas.width = this.dom.clientWidth;
    this.cacheCanvas.height = this.dom.clientHeight;
    this.ctx = this.cacheCanvas.getContext('2d') as CanvasRenderingContext2D;
    this.dom.appendChild(this.cacheCanvas);
  }
  start() {
    // 构建树形结构
    this.treeGraph = this.buildTree(null, this.options.data);

    // 获取最长节点
    this.findLastNode(this.treeGraph, this.listMaxLevel);
    this.resetCanvasSize();
    // 计算每个节点的位置
    this.calculateNodePosition(this.listMaxLevelNode);
    // 渲染
    this.draw();
  }

  // 构建树形结构
  buildTree(parent: TreeNode | null, data: any) {
    const node = new TreeNode(parent, data, this.options.config);
    for (let i = 0; i < data.children.length; i++) {
      const subTree = this.buildTree(node, data.children[i]);
      node.children.push(subTree);
    }
    return node;
  }

  resetCanvasSize() {
    const ops = {
      width: 100,
      height: 50,
      gapW: 20,
      gapH: 10,
      canvasOfX: 200,
      canvasOfY: 300,
    };
    const maxWidth =
      1500 ||
      this.listMaxLevelNode.originData.level * (ops.width + ops.gapW) +
        ops.canvasOfX;
    this.cacheCanvas.width = maxWidth;
    // 预先偏移画布
    this.ctx.translate(ops.canvasOfX / 2, 400);
    this.ctx.strokeStyle = 'red';
    // this.ctx.scale(0.8, 0.8);

    this.ctx.font = '20px serif';
    this.ctx.textBaseline = 'top';
    this.ctx.fillStyle = '#ffffff';
    this.registerEvent();
  }

  // 寻找最找路径的最后节点
  findLastNode(node: TreeNode, level: number) {
    if (node.children.length === 0) {
      if (level > this.listMaxLevel) {
        this.listMaxLevelNode = node;
        this.listMaxLevel = level;
      }
      return 1;
    }
    let max = 0;
    for (let i = 0; i < node.children.length; i++) {
      const len = this.findLastNode(node.children[i], level + 1);
      max = Math.max(max, len);
    }
    max += 1;
    return max;
  }
  /**
   * 从最长路径下的最后一个节点开始处理
   * @param node 处理的主节点，也就是最长路径下的节点
   * @returns
   * 大致思路是，没过一个主节点，就遍历当前主节点下的所有子节点
   * 然后，先是正序遍历，
   * 确保每个子节点的 Y 值都是依据当前level 以及父节点的Y值  => Max(level,ParentY)
   * 之后，倒序遍历，确保每个父节点的Y 基于Level 和子节点 => Max(level,ChildY)
   */
  calculateNodePosition(node: TreeNode) {
    // 倒序循环 处理main tree
    const ind = node.originData.level - 1;
    if (!this.levelArray[ind]) {
      this.levelArray[ind] = [];
    }
    // 先计算位置 再压入栈中
    node.calcPosAndSize(this.ctx);
    node.setState(NodeState.resolve);
    this.levelArray[ind].push(node);

    // 正向循环，计算其余子节点
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      // 过滤掉main tree
      if (child.state === NodeState.resolve) continue;
      this.calcSub(child);
    }

    if (!node.parent) return;
    this.calculateNodePosition(node.parent);
  }

  /**
   * 计算每个子节点的深度值，并压入levelArray中
   * @param node 要处理的子节点
   */
  calcSub(node: TreeNode) {
    const ind = node.originData.level - 1;
    const targetArr = this.levelArray[ind];
    // 获取当前level 下的最大深度
    const len = targetArr.length;
    // 获取父节点的深度
    const depth = node!.parent!.depth;
    // 取最大
    const resDepth = Math.max(depth, len);
    // 设置节点状态为等待状态，此时主要为了设置节点的深度值
    node.setState(NodeState.pedding);
    // 设置子节点的深度值
    node.setDepth(resDepth);
    // 压入栈中
    targetArr.push(node);

    // 深度优先遍历，先处理当前节点的所有后代节点
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      this.calcSub(child);
    }

    // 函数 出栈，相当于主节点的最后一个子节点处理，可以理解为逆序渲染
    node.calcPosAndSize(this.ctx);
    // node.setState(NodeState.resolve);
  }

  // 正序绘制线框
  draw() {
    for (let i = 0; i < this.levelArray.length; i++) {
      const levelArr = this.levelArray[i];
      for (let j = 0; j < levelArr.length; j++) {
        const node = levelArr[j];
        node.render(this.ctx);
      }
    }
  }

  registerEvent() {
    this.cacheCanvas.addEventListener('pointerdown', (event) => {
      this.highLine(event.offsetX, event.offsetY);
    });
  }

  highLine(x: number, y: number) {
    // console.log(x, y);
    this.updateCanvas();
  }

  updateCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = this.cacheCanvas.width;
    canvas.height = this.cacheCanvas.height;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    // const { e, f } = this.ctx.getTransform();
    // ctx.translate(e, f);
    ctx.strokeStyle = 'green'
    const node = this.listMaxLevelNode
    node.renderLine(ctx)
    this.ctx.drawImage(canvas, 0, 0);
  }
}
