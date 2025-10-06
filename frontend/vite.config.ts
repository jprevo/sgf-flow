import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import commonjs from "vite-plugin-commonjs";

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "preact/hooks": "react",
      preact: "react",
    },
    extensions: ["*", ".js", ".jsx", ".ts", ".tsx"],
  },
  plugins: [
    react({
      babel: {
        plugins: [["module:@preact/signals-react-transform"]],
      },
    }),
    tailwindcss(),
    commonjs(),
  ],
  build: {
    outDir: "../backend/public",
    emptyOutDir: true,
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3012",
        changeOrigin: true,
      },
    },
  },
});
