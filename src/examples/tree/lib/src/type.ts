// 节点的状态， 没处理 正在处理 处理完成
export enum NodeState {
  none = 'none',
  pedding = 'pedding',
  resolve = 'resolve',
}

// 节点 操作状态
export enum NodeOptState {
  none = 'none',
  active = 'active',
  link = 'link',
}

export interface TreeOptions{
  config?:any,
  data:any,
}