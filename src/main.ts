/**
 * 应用入口文件
 * 用于初始化Vue应用并配置相关插件
 */

import { createApp } from "vue";
import "element-plus/dist/index.css";
import "./assets/main.css";
import App from "./App.vue";
import { createPinia } from "pinia";
import { router } from "./router";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

/**
 * 创建Vue应用实例
 * @returns {App} Vue应用实例
 */

const app = createApp(App);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

// 注册状态管理
app.use(createPinia());

// 注册路由
app.use(router);

// 挂载应用
app.mount("#app");
