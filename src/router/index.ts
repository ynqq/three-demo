/* eslint-disable prettier/prettier */

import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { useEncodeFullPath } from "./a";
import routes from "virtual:generated-pages";

// const routes: RouteRecordRaw[] = [
//     {path: '/', redirect: '/pa/a/a/2?asc=asdasd123.,'},
//     {path: '/pa/a/:name/:age/:email?',name: 'a', component: () => import('@/views/a/index.vue')},
//     {path: '/b',name: 'b', component: () => import('@/views/b/index.vue')}
// ]

const router = createRouter({
  history: createWebHistory('/three-demo/'),
  routes: routes,
});

export default router;


useEncodeFullPath(router)