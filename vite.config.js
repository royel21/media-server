import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { config } from "dotenv";
import { fileURLToPath } from "url";

config();

const host = process.env.IP;
const port = process.env.DEV_PORT;
const serverPort = process.env.PORT;

// https://vitejs.dev/config/
export default defineConfig({
  root: "./src",
  plugins: [svelte()],
  build: {
    outDir: "../server/public/",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        login: fileURLToPath(new URL("./src/Login/index.html", import.meta.url)),
        admin: fileURLToPath(new URL("./src/Admin/index.html", import.meta.url)),
        user: fileURLToPath(new URL("./src/User/index.html", import.meta.url)),
      },
    },
  },
  server: {
    host,
    port,
    optimizeDeps: {
      include: ["esm-dep > cjs-dep"],
      exclude: ["src/Admin/index.html", "src/Admin/App.svelte"],
    },
    proxy: {
      "^/(api|Folder|Manga|Video|css|webfonts)/": {
        target: `http://${host}:${serverPort}`,
      },
      "^/(serviceWorker.js|manifest.json|home.png|favicon.png)": {
        target: `http://${host}:${serverPort}`,
      },
      "/socket.io": {
        target: `ws://${host}:${serverPort}`,
        ws: true,
      },
    },
  },
});
