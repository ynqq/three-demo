import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import Pages from "vite-plugin-pages";
import Unocss from "unocss/vite";
import ViteComponents, { AntDesignVueResolver } from "vite-plugin-components";

// https://vitejs.dev/config/
export default defineConfig({
  base: '/three-demo/',
  server: {
    port: 4003,
    host: true,
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  plugins: [
    vue(),
    vueJsx(),
    Pages({
      pagesDir: "src/views",
      extensions: ["vue"],
      exclude: ["**/components/*.vue"],
      replaceSquareBrackets: true,
    }),
    Unocss(),
    ViteComponents({
      customComponentResolvers: [
        AntDesignVueResolver({
          importStyle: false,
        }),
      ],
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
