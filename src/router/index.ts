/* eslint-disable prettier/prettier */
import { createRouter, createWebHistory } from "vue-router";
import routes from "virtual:generated-pages";

// const routes: RouteRecordRaw[] = [
//     {path: '/', component: () => import('@/views/index/index.vue')},
//     {path: '/a', component: () => import('@/views/a/index.vue')},
//     {path: '/b', component: () => import('@/views/b/index.vue')},
//     {path: '/c', component: () => import('@/views/c/index.vue')},
//     {path: '/d', component: () => import('@/views/d/index.vue')},
//     {path: '/e', component: () => import('@/views/e/index.vue')}
// ]

const router = createRouter({
  history: createWebHistory('/three-demo/'),
  routes: routes,
});

export default router;
