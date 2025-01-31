import { Receiver } from "../../Receiver";

export interface IPenHelper extends Receiver{
    centerPoint:{x:number,y:number}
    perPoint:{x:number,y:number}
    nextPoint:{x:number,y:number}
    link:boolean
}