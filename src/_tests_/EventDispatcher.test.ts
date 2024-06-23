import { describe, expect, it } from 'vitest'
import { EventDispatcher,CustomEvent } from '../lmm/core/EventDispatcher'

describe('EventDispatcher', () => {
    it.skip('功能测试', () => {
        expect(1 + 1).toBe(2)
    })

    it.skip("事件分发器测试 基本测试",() => {
      const eventDispacher  = new EventDispatcher()

      const fn1 = function(event:CustomEvent){
        console.log('fn1--------');
        console.log(event,);
        console.log('fn1--------end');
      }

      const fn2 = function(event:CustomEvent){
        console.log('fn2--------');
        console.log(event,);
        console.log('fn2--------end');
      }
      eventDispacher.addEventListener('type1',fn1)
      eventDispacher.addEventListener('type2',fn1)
      const isExist = eventDispacher.hasEventListener('type1',fn1)
      eventDispacher.dispatchEvent({type:'type1',target:null})
      eventDispacher.removeEventListener('type1',fn1)
      // eventDispacher.dispatchEvent({type:'type2',target:null})
      console.log(eventDispacher.hasEventListener('type1', fn1))

    })

    it("继承测试",() => {
      class Img extends EventDispatcher{}
      const img = new Img()
      const fn1 = function(event:CustomEvent){
        console.log('继承 img---');
        console.log(event);
        console.log('over----');
      }

      img.addEventListener('type1',fn1)
      img.dispatchEvent({type:'type1',target:null})

    
    })
})
