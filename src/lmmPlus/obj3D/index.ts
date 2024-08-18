import {driver} from '../driver'
import { RenderLayer } from './renderLayer'

class App {
  // 创建画布
  createDrawCtx(domContainer:HTMLElement){
    const canvas = document.createElement('canvas')
    const bgCanvas = document.createElement('canvas')

    const {width,height} = domContainer.getBoundingClientRect()
    bgCanvas.classList.add('bg-canvas')
    canvas.classList.add('ui-canvas')
    bgCanvas.width = width
    bgCanvas.height = height
    canvas.width = width
    canvas.height = height
    domContainer.appendChild(bgCanvas)
    domContainer.appendChild(canvas)
    const renderlayer =  new RenderLayer(canvas,bgCanvas)
    this.driverOpen(renderlayer)
    return renderlayer
  }

  // 开启驱动监听
  driverOpen(renderLayer:RenderLayer){
    driver.addListener(renderLayer)
  }
}



export const RenderApp = new App()