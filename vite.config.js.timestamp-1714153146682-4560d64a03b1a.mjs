// vite.config.js
import { defineConfig } from "file:///C:/vs-project/remote/media-server/node_modules/vite/dist/node/index.js";
import { svelte } from "file:///C:/vs-project/remote/media-server/node_modules/@sveltejs/vite-plugin-svelte/src/index.js";
import { config } from "file:///C:/vs-project/remote/media-server/node_modules/dotenv/lib/main.js";
import { fileURLToPath } from "url";
var __vite_injected_original_import_meta_url = "file:///C:/vs-project/remote/media-server/vite.config.js";
config();
var { VITE_PORT, VITE_HOST, PORT, DEV_PORT, USE_DEV } = process.env;
var host = VITE_HOST;
var port = VITE_PORT;
var serverPort = USE_DEV ? DEV_PORT : PORT;
var warings = [
  "a11y-click-events-have-key-events",
  "a11y-no-noninteractive-element-interactions",
  "a11y-no-static-element-interactions"
];
var vite_config_default = defineConfig({
  root: "./src",
  plugins: [
    svelte({
      onwarn(warning, defaultHandler) {
        if (warings.includes(warning.code))
          return;
        defaultHandler(warning);
      }
    })
  ],
  build: {
    outDir: "../server/public/static",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        login: fileURLToPath(new URL("./src/login/index.html", __vite_injected_original_import_meta_url)),
        admin: fileURLToPath(new URL("./src/admin/index.html", __vite_injected_original_import_meta_url)),
        user: fileURLToPath(new URL("./src/user/index.html", __vite_injected_original_import_meta_url))
      }
    }
  },
  resolve: {
    alias: [{ find: "src", replacement: fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url)) }]
  },
  server: {
    host,
    port,
    proxy: {
      "^/(api|Folder|Manga|Video|css|webfonts)/": {
        target: `http://${host}:${serverPort}`
      },
      "^/(serviceWorker.js|manifest.json|home.png|favicon.png)": {
        target: `http://${host}:${serverPort}`
      },
      "/socket.io": {
        target: `ws://${host}:${serverPort}`,
        ws: true
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFx2cy1wcm9qZWN0XFxcXHJlbW90ZVxcXFxtZWRpYS1zZXJ2ZXJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXHZzLXByb2plY3RcXFxccmVtb3RlXFxcXG1lZGlhLXNlcnZlclxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovdnMtcHJvamVjdC9yZW1vdGUvbWVkaWEtc2VydmVyL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHsgc3ZlbHRlIH0gZnJvbSBcIkBzdmVsdGVqcy92aXRlLXBsdWdpbi1zdmVsdGVcIjtcclxuaW1wb3J0IHsgY29uZmlnIH0gZnJvbSBcImRvdGVudlwiO1xyXG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSBcInVybFwiO1xyXG5cclxuY29uZmlnKCk7XHJcbmNvbnN0IHsgVklURV9QT1JULCBWSVRFX0hPU1QsIFBPUlQsIERFVl9QT1JULCBVU0VfREVWIH0gPSBwcm9jZXNzLmVudjtcclxuY29uc3QgaG9zdCA9IFZJVEVfSE9TVDtcclxuY29uc3QgcG9ydCA9IFZJVEVfUE9SVDtcclxuXHJcbmNvbnN0IHNlcnZlclBvcnQgPSBVU0VfREVWID8gREVWX1BPUlQgOiBQT1JUO1xyXG5cclxuY29uc3Qgd2FyaW5ncyA9IFtcclxuICBcImExMXktY2xpY2stZXZlbnRzLWhhdmUta2V5LWV2ZW50c1wiLFxyXG4gIFwiYTExeS1uby1ub25pbnRlcmFjdGl2ZS1lbGVtZW50LWludGVyYWN0aW9uc1wiLFxyXG4gIFwiYTExeS1uby1zdGF0aWMtZWxlbWVudC1pbnRlcmFjdGlvbnNcIixcclxuXTtcclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgcm9vdDogXCIuL3NyY1wiLFxyXG4gIHBsdWdpbnM6IFtcclxuICAgIHN2ZWx0ZSh7XHJcbiAgICAgIG9ud2Fybih3YXJuaW5nLCBkZWZhdWx0SGFuZGxlcikge1xyXG4gICAgICAgIGlmICh3YXJpbmdzLmluY2x1ZGVzKHdhcm5pbmcuY29kZSkpIHJldHVybjtcclxuXHJcbiAgICAgICAgLy8gaGFuZGxlIGFsbCBvdGhlciB3YXJuaW5ncyBub3JtYWxseVxyXG4gICAgICAgIGRlZmF1bHRIYW5kbGVyKHdhcm5pbmcpO1xyXG4gICAgICB9LFxyXG4gICAgfSksXHJcbiAgXSxcclxuICBidWlsZDoge1xyXG4gICAgb3V0RGlyOiBcIi4uL3NlcnZlci9wdWJsaWMvc3RhdGljXCIsXHJcbiAgICBlbXB0eU91dERpcjogdHJ1ZSxcclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgaW5wdXQ6IHtcclxuICAgICAgICBsb2dpbjogZmlsZVVSTFRvUGF0aChuZXcgVVJMKFwiLi9zcmMvbG9naW4vaW5kZXguaHRtbFwiLCBpbXBvcnQubWV0YS51cmwpKSxcclxuICAgICAgICBhZG1pbjogZmlsZVVSTFRvUGF0aChuZXcgVVJMKFwiLi9zcmMvYWRtaW4vaW5kZXguaHRtbFwiLCBpbXBvcnQubWV0YS51cmwpKSxcclxuICAgICAgICB1c2VyOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoXCIuL3NyYy91c2VyL2luZGV4Lmh0bWxcIiwgaW1wb3J0Lm1ldGEudXJsKSksXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IFt7IGZpbmQ6IFwic3JjXCIsIHJlcGxhY2VtZW50OiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoXCIuL3NyY1wiLCBpbXBvcnQubWV0YS51cmwpKSB9XSxcclxuICB9LFxyXG4gIHNlcnZlcjoge1xyXG4gICAgaG9zdCxcclxuICAgIHBvcnQsXHJcbiAgICBwcm94eToge1xyXG4gICAgICBcIl4vKGFwaXxGb2xkZXJ8TWFuZ2F8VmlkZW98Y3NzfHdlYmZvbnRzKS9cIjoge1xyXG4gICAgICAgIHRhcmdldDogYGh0dHA6Ly8ke2hvc3R9OiR7c2VydmVyUG9ydH1gLFxyXG4gICAgICB9LFxyXG4gICAgICBcIl4vKHNlcnZpY2VXb3JrZXIuanN8bWFuaWZlc3QuanNvbnxob21lLnBuZ3xmYXZpY29uLnBuZylcIjoge1xyXG4gICAgICAgIHRhcmdldDogYGh0dHA6Ly8ke2hvc3R9OiR7c2VydmVyUG9ydH1gLFxyXG4gICAgICB9LFxyXG4gICAgICBcIi9zb2NrZXQuaW9cIjoge1xyXG4gICAgICAgIHRhcmdldDogYHdzOi8vJHtob3N0fToke3NlcnZlclBvcnR9YCxcclxuICAgICAgICB3czogdHJ1ZSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSxcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNlIsU0FBUyxvQkFBb0I7QUFDMVQsU0FBUyxjQUFjO0FBQ3ZCLFNBQVMsY0FBYztBQUN2QixTQUFTLHFCQUFxQjtBQUhtSixJQUFNLDJDQUEyQztBQUtsTyxPQUFPO0FBQ1AsSUFBTSxFQUFFLFdBQVcsV0FBVyxNQUFNLFVBQVUsUUFBUSxJQUFJLFFBQVE7QUFDbEUsSUFBTSxPQUFPO0FBQ2IsSUFBTSxPQUFPO0FBRWIsSUFBTSxhQUFhLFVBQVUsV0FBVztBQUV4QyxJQUFNLFVBQVU7QUFBQSxFQUNkO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDRjtBQUdBLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLE1BQU07QUFBQSxFQUNOLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLE9BQU8sU0FBUyxnQkFBZ0I7QUFDOUIsWUFBSSxRQUFRLFNBQVMsUUFBUSxJQUFJO0FBQUc7QUFHcEMsdUJBQWUsT0FBTztBQUFBLE1BQ3hCO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsYUFBYTtBQUFBLElBQ2IsZUFBZTtBQUFBLE1BQ2IsT0FBTztBQUFBLFFBQ0wsT0FBTyxjQUFjLElBQUksSUFBSSwwQkFBMEIsd0NBQWUsQ0FBQztBQUFBLFFBQ3ZFLE9BQU8sY0FBYyxJQUFJLElBQUksMEJBQTBCLHdDQUFlLENBQUM7QUFBQSxRQUN2RSxNQUFNLGNBQWMsSUFBSSxJQUFJLHlCQUF5Qix3Q0FBZSxDQUFDO0FBQUEsTUFDdkU7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTyxDQUFDLEVBQUUsTUFBTSxPQUFPLGFBQWEsY0FBYyxJQUFJLElBQUksU0FBUyx3Q0FBZSxDQUFDLEVBQUUsQ0FBQztBQUFBLEVBQ3hGO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTjtBQUFBLElBQ0E7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNMLDRDQUE0QztBQUFBLFFBQzFDLFFBQVEsVUFBVSxJQUFJLElBQUksVUFBVTtBQUFBLE1BQ3RDO0FBQUEsTUFDQSwyREFBMkQ7QUFBQSxRQUN6RCxRQUFRLFVBQVUsSUFBSSxJQUFJLFVBQVU7QUFBQSxNQUN0QztBQUFBLE1BQ0EsY0FBYztBQUFBLFFBQ1osUUFBUSxRQUFRLElBQUksSUFBSSxVQUFVO0FBQUEsUUFDbEMsSUFBSTtBQUFBLE1BQ047QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
