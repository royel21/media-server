import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { config } from "dotenv";
import { fileURLToPath } from "url";

config();
const { VITE_PORT, VITE_HOST, PORT, DEV_PORT, USE_DEV } = process.env;
const host = VITE_HOST;
const port = VITE_PORT;

const serverPort = USE_DEV ? DEV_PORT : PORT;

const warings = [
  "a11y-click-events-have-key-events",
  "a11y-no-noninteractive-element-interactions",
  "a11y-no-static-element-interactions",
];

// https://vitejs.dev/config/
export default defineConfig({
  root: "./src",
  plugins: [
    svelte({
      onwarn(warning, defaultHandler) {
        if (warings.includes(warning.code)) return;

        // handle all other warnings normally
        defaultHandler(warning);
      },
    }),
  ],
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
  resolve: {
    alias: [{ find: "src", replacement: fileURLToPath(new URL("./src", import.meta.url)) }],
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
