/**
 * Vue Router 路由配置入口文件
 * 用于配置项目的路由规则
 */

import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

/**
 * 路由配置数组
 * @type {RouteRecordRaw[]} 路由记录数组
 */
const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: () => import("../views/Home.vue"),
    meta: {
      title: "首页",
    },
  },
  {
    path: "/file-read-load/:version/:filename",
    name: "FileReadLoad",
    component: () => import("../views/FileReadLoad.vue"),
    meta: {
      title: "文件读取",
    },
  },
  {
    path: "/about",
    name: "About",
    component: () => import("../views/About.vue"),
    meta: {
      title: "关于",
    },
  },
];

/**
 * 创建路由实例
 * @returns {Router} 返回路由实例
 * @example
 * import { router } from '@/router'
 * app.use(router)
 */
export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

/**
 * 路由前置守卫
 * @param {RouteLocationNormalized} to 目标路由
 * @param {RouteLocationNormalized} from 当前路由
 * @param {NavigationGuardNext} next 导航函数
 */
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta?.title) {
    document.title = to.meta.title as string;
  }
  next();
});

export default router;
