/* eslint-disable prettier/prettier */

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useEncodeFullPath } from './a';
// import routes from "virtual:generated-pages";

const routes: RouteRecordRaw[] = [{ path: '', name: 'index', component: () => import('@/views/index/index.vue') }];

const router = createRouter({
  history: createWebHistory('/three-demo/'),
  routes: routes,
});

export default router;

useEncodeFullPath(router);
