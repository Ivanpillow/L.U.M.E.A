import { defineConfig } from "vite";

// base relativo => funciona en GitHub Pages bajo /<repo>/ sin configuración extra
export default defineConfig({
  base: "./",
  build: { target: "es2022", chunkSizeWarningLimit: 1500 },
});
