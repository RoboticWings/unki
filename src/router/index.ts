import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'NoteList',
    component: () => import('../views/NoteList.vue')
  },
  {
    path: "/component-test/:name",
    name: 'ComponentTest',
    component: () => import('../views/ComponentTest.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
