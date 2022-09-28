import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { config } from "dotenv";
config();

// https://vitejs.dev/config/
export default defineConfig({
  root: "./src",
  plugins: [svelte()],
  build: {
    outDir: "../server/public/",
    emptyOutDir: true,
  },
  server: {
    host: "10.0.0.12",
    port: 3005,
    proxy: {
      "^/(api|Folder|Manga|Video|css|webfonts)/": {
        target: `http://10.0.0.12:${process.env.PORT}`,
      },
      "^/(serviceWorker.js|manifest.json|home.png|favicon.png)": {
        target: `http://10.0.0.12:${process.env.PORT}`,
      },
      "/socket.io": {
        target: `ws://10.0.0.12:${process.env.PORT}`,
        ws: true,
      },
    },
  },
});
