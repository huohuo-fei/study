import { Object2D, Object2DType } from './Object2D';

// 管理所有的 img
export class Group extends Object2D {
  children: Object2D[] = [];
  // readonly isGroup = true

  constructor(attr: Object2DType = {}) {
    super();
    this.setOption(attr);
  }

  // 设置属性
  setOption(attr: Object2DType) {
    Object.assign(this, attr);
  }

  // 添加元素  深度添加 会将group里的每个元素 添加到group
  add(...objs: Object2D[]) {
    for (let obj of objs) {
      if (obj === this) {
        // 防止重复引用
        return this;
      }
      obj.parent && obj.parent.remove();
      obj.parent = this;
      this.children.push(obj);
      this.dispatchEvent({ type: 'add', target: obj });
    }
    this.sort();
    return this;
  }

  // 删除元素
  remove(...objs: Object2D[]) {
    const { children } = this;
    for (let obj of objs) {
      const index = children.indexOf(obj);
      if (index !== -1) {
        obj.parent = undefined;
        this.children.splice(index, 1);
        this.dispatchEvent({ type: 'remove', target: obj });
      } else {
        // 深层寻找 group 嵌套情况寻找
        for (let child of children) {
          if (child instanceof Group) {
            child.remove(obj);
          }
        }
      }
    }
  }

  // 清空
  clear() {
    for (let child of this.children) {
      child.parent = undefined;
      // child.remove()
      this.dispatchEvent({ type: 'removed', target: child });
    }
    this.children = [];
    return this;
  }

  // 排序 根据 index 值
  sort() {
    const { children } = this;
    for (let child of children) {
      if (child instanceof Group) {
        child.sort();
      } else {
        children.sort((a, b) => {
          return a.index - b.index;
        });
      }
    }
  }

  // 根据某个key value 获取元素
  getObjByProperty<T>(name: string, value: T): Object2D | undefined {
    const { children } = this;
    for (let i = 0, l = children.length; i < l; i++) {
      const child = children[i];
      if (child[name] === value) {
        return child;
      } else if (child instanceof Group) {
        const obj = child.getObjByProperty<T>(name, value);
        if (obj) {
          return obj;
        }
      }
    }

    return undefined;
  }

  // 根据名称 获取元素
  getObjByName(name: string) {
    return this.getObjByProperty('name', name);
  }

  // 遍历元素
  traverse(callback: (obj: Object2D) => void) {
    callback(this)  // -- 有必要将group 传递出去么
    const { children } = this;
    for (let child of children) {
      if (child instanceof Group) {
        child.traverse(callback);
      } else {
        // 已经是最深层了
        callback(child);
      }
    }
  }

  // 遍历可见元素
  traverseVisible(callback: (obj: Object2D) => void) {
    if (!this.visible) return;
    callback(this);

    const { children } = this;
    for (let child of children) {
      if (!child.visible) {
        continue;
      }
      if (child instanceof Group) {
        child.traverseVisible(callback);
      } else {
        callback(child);
      }
    }
  }

  // 绘图 
  draw(ctx: CanvasRenderingContext2D): void {
      const { children } = this
      for(let child of children){
        child.draw(ctx)
      }
  }
}
