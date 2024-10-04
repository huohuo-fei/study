import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path:'/',
    component:() => import("../home/Home.vue")
  },
  {
    path:'/test-path',
    component:() => import("../examples/Path.vue")
  },
  {
    path:'/test-three',
    component:() => import('../examples/Three.vue')
  },
  {
    path:'/blog-canvas-01',
    component:() => import('../blog/Canvas_01.vue')
  },

]

const router = createRouter({
  routes,
  history:createWebHistory()
})

export default router