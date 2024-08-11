import { StandStyle,StandStyleType } from "./StandStyle";

type FontStyle = '' | 'italic'   // 斜体
type FontWeight = '' | 'bold'
export type TextStyleType = {
  fontStyle?:FontStyle
  fontWeight?:FontWeight
  fontSize?:number
  fontFamily?:string
  textAlign?:CanvasTextAlign
  textBaseLine?:CanvasTextBaseline
} & StandStyleType

export class TextStyle extends StandStyle{
  fontStyle: FontStyle = ''
  fontWeight: FontWeight = ''
  fontSize: number = 12
  fontFamily: string = 'arial'
  textAlign: CanvasTextAlign = 'start'
  textBaseline: CanvasTextBaseline = 'alphabetic'

  constructor(attr:TextStyleType = {}){
    super()
    this.setOption(attr)
  }
  setOption(attr:TextStyleType = {}){
    Object.assign(this,attr)
  }

  apply(ctx:CanvasRenderingContext2D){
    super.apply(ctx)
this.setFont(ctx)
    ctx.textAlign = this.textAlign
    ctx.textBaseline = this.textBaseline
  }
  setFont(ctx:CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D){
    ctx.font = `${this.fontStyle} ${this.fontWeight} ${this.fontSize}px ${this.fontFamily}`
  }
}