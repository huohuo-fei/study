import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path:'/',
    component:() => import('../examples/HelloWorld.vue')
  },{
    path:'/test-matrix',
    component:() => import('../examples/MatrixOfCanvas.vue')
  },{
    path:'/test-camera',
    component:() => import('../examples/Camera.vue')
  },{
    path:'/test-img',
    component:() => import('../examples/Img.vue')
  }
]

const router = createRouter({
  routes,
  history:createWebHistory()
})

export default router