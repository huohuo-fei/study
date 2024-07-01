import { describe, expect, it } from 'vitest';
import { EventDispatcher, CustomEvent } from '../lmm/core/EventDispatcher';
import { Group } from '../lmm/objects/Group';
import { Object2D } from '../lmm/objects/Object2D';

describe('EventDispatcher', () => {
    const group1 = new Group();
    group1.addEventListener('add', (event) => {
      console.log('add obj', event.target.name);
    });

    const obj1 = new Object2D();
    obj1.name = 'obj1';
    group1.add(obj1);

    const group2 = new Group();
    group2.name = 'group2';
    group2.addEventListener('remove', (event) => {
      console.log('remove obj', event.target.name);
    });

    const obj2 = new Object2D();
    obj2.name = 'obj2';
    group2.add(obj2);
    group1.add(group2);

    it('增删改查',() => {
      expect(group1.children.length).toBe(2)
      expect(group1.children[0].uuid).toBe(obj1.uuid)
      expect(group1.getObjByName('obj2')?.uuid).toBe(obj2.uuid)
      expect(group1.getObjByProperty('uuid',obj1.uuid)?.uuid).toBe(obj1.uuid)

      let i = 0
      group1.traverse((obj) =>{
        expect(obj.name).toBe(['','obj1','group2','obj2'][i])
        i++
      })
    })
});
