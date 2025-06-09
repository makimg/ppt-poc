<!--
  应用主组件
  包含路由出口和全局样式
-->
<template>
  <div id="app">
    <!-- 路由出口 -->
    <router-view />
  </div>
</template>

<script setup lang="ts">
/**
 * 应用主组件
 * 提供路由视图容器和全局配置
 */

// 这里可以添加全局组件注册、全局配置等
</script>

<style>

/* 自定义滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
