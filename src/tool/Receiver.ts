
export interface Receiver {
    onPointerdown?:(event: PointerEvent)=>void
    onPointermove?:(event: PointerEvent)=> void
    onPointerup?:(event: PointerEvent)=> void
    render(ctx?:CanvasRenderingContext2D): void
}