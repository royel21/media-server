import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";
import css from "rollup-plugin-css-only";
import dev from "rollup-plugin-dev";
import dotenv from "dotenv";
import replace from "@rollup/plugin-replace";
dotenv.config();

const production = !process.env.ROLLUP_WATCH;
const { PORT } = process.env;

const values = {};

for (const [k, v] of Object.entries(process.env)) {
  values[`process.env.${k}`] = `'${v}'`;
}

export default {
  input: "src/main.js",
  output: {
    sourcemap: true,
    format: "iife",
    name: "app",
    file: "server/public/bundle.js",
  },
  plugins: [
    svelte(),
    css({ output: "css/extra.css" }),
    resolve({
      browser: true,
      dedupe: ["svelte"],
    }),
    commonjs(),
    replace({
      include: ["src/**/*.ts", "src/**/*.svelte"],
      preventAssignment: true,
      values,
    }),

    // In dev mode, call `npm run express` once
    // the bundle has been generated
    !production && serve(),

    // Watch the `public` directory and refresh the
    // browser on changes when not in production
    !production && livereload("server/public/"),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser(),
    dev({
      port: 5000,
      proxy: [
        {
          from: "/api",
          to: "http://localhost:" + PORT,
        },
      ],
    }),
  ],
  watch: {
    clearScreen: false,
  },
};

function serve() {
  let started = false;

  return {
    writeBundle() {
      console.log("started", started);
      if (!started) {
        started = true;
        require("child_process").spawn("npm", ["run", "express"], {
          stdio: ["ignore", "inherit", "inherit"],
          shell: true,
        });
      }
    },
  };
}
