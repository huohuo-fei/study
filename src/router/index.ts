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
  },{
    path:'/test-group',
    component:() => import('../examples/Group.vue')
  },{
    path:'/test-scene',
    component:() => import('../examples/Scene.vue')
  },
  {
    path:'/test-controler',
    component:() => import('../examples/OrbitControler.vue')
  },
  {
    path:'/test-imgcontroler',
    component:() => import('../examples/ImgControler.vue')
  },
  {
    path:'/test-origin',
    component:() => import('../examples/OriginChange.vue')
  }, 
  {
    path:'/test-transform',
    component:() => import('../examples/TransformControler.vue')
  },
  {
    path:'/test-text2D',
    component:() => import('../examples/Text2D.vue')
  },
  {
    path:'/test-path',
    component:() => import('../examples/Path.vue')
  },
]

const router = createRouter({
  routes,
  history:createWebHistory()
})

export default router