/** 事件调度器 */

// 自定义事件类型
export type CustomEvent = {
  type: string; // 对象的某个状态
  target?: any; // 目标对象
  [attachment: string]: any; // 自定义参数
};

// 事件监听器 / 观察者
export type EventListener = (event: CustomEvent) => void;

export class EventDispatcher {
  // 监听器的集合
  protected _listeners: Map<string, Set<EventListener>> = new Map();

  addEventListener(type: string, listener: EventListener) {
    const listens = this._listeners;

    if (!listens.get(type)) {
      listens.set(type, new Set([listener]));
    }
    listens.get(type)?.add(listener);
  }

  // 判断目标对象的某个状态是否被某个监听器监听
  hasEventListener(type: string, listener: EventListener) {
    return (
      this._listeners.get(type) && this._listeners.get(type)?.has(listener)
    );
  }

  // 取消事件监听
  removeEventListener(type: string, listener: EventListener) {
    if (this.hasEventListener(type, listener)) {
      this._listeners.get(type)?.delete(listener);
    }
  }

  // 触发事件
  dispatchEvent(event: CustomEvent) {
    const listeners = this._listeners;
    const sets = listeners.get(event.type);
    if (sets) {
      event.target = this;
      // 复制一份侦听器集合 防止再迭代时删除
      const activeLister = new Set(sets);
      for (const listen of activeLister) {
        // 不明白传递this的操作？
        listen.call(this, event);
      }
      event.target = null;
    }
  }
}
