import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { config } from "dotenv";
import { fileURLToPath } from "url";

config();
const { IS_DEV, IP, DEV_PORT, PORT, HOME_IP } = process.env;
const host = IS_DEV ? HOME_IP : IP;
const port = DEV_PORT;
const serverPort = PORT;

// https://vitejs.dev/config/
export default defineConfig({
  root: "./src",
  plugins: [svelte()],
  build: {
    outDir: "../server/public/static",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        login: fileURLToPath(new URL("./src/login/index.html", import.meta.url)),
        admin: fileURLToPath(new URL("./src/admin/index.html", import.meta.url)),
        user: fileURLToPath(new URL("./src/user/index.html", import.meta.url)),
      },
    },
  },
  server: {
    host,
    port,
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
