// playgrounds/vite/vite.config.ts
import { vitePhpLoader } from "@hilosiva/vite-plugin-php-loader";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { defineConfig } from "vite";


const dir = {
  src: "src",
  publicDir: "public",
  outDir: "dist",
};


export default defineConfig({
  root: dir.src,
  base: "./",
  publicDir: `../${dir.publicDir}`,
  plugins: [
    vitePhpLoader({
       useWpEnv: true,
    }),
    viteStaticCopy({
      targets: [
        {
          src: ["./style.css", "./*.txt", "./screenshot.png"],
          dest: "./",
        },
      ],
      structured: true,
      watch: {
        reloadPageOnChange: true,
      },
    }),
  ],
  build: {
    outDir: `../${dir.outDir}`,
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: "assets/scripts/[name]-[hash].js",
        chunkFileNames: "assets/scripts/[name]-[hash].js",
        assetFileNames: ({ names }) => {
          if (/\.( gif|jpeg|jpg|png|svg|webp| )$/.test(names[0] ?? "")) {
            return "assets/images/[name]-[hash][extname]";
          }
          if (/\.css$/.test(names[0] ?? "")) {
            return "assets/styles/[name]-[hash][extname]";
          }
          return "assets/[name]-[hash][extname]";
        },
      },
    },
    assetsInlineLimit: 0,
    write: true,
  },

  server: {
    open: "http://localhost:8080"
  }

});
