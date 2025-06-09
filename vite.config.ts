import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";

/**
 * Vite 配置文件
 * 包含插件配置、路径别名、构建选项等
 */
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [
      tailwindcss(),
      vue(),

      // 自动导入API
      AutoImport({
        resolvers: [ElementPlusResolver()],
        imports: ["vue", "vue-router", "pinia"],
        dts: "src/auto-imports.d.ts",
      }),
      // 自动导入组件
      Components({
        resolvers: [ElementPlusResolver()],
        dts: "src/components.d.ts",
      }),
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          // 如果需要全局SCSS变量，请先创建 src/styles/variables.scss 文件
          // additionalData: `@use "@/styles/variables.scss" as *;`,
        },
      },
    },
    base: env.BASE_URL,
    server: {
      port: 8080,
      open: true,
      allowedHosts: true,
      hmr: true,
    },
    build: {
      rollupOptions: {
        output: {
          chunkFileNames: "js/[name].[hash].js",
          entryFileNames: "js/[name].[hash].js",
          assetFileNames: "assets/[name].[hash].[ext]",
        },
      },
    },
  };
});
