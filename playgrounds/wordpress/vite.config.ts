// playgrounds/vite/vite.config.ts
import { vitePhpLoader } from "@hilosiva/vite-plugin-php-loader";
import { viteImageOptimazer } from "@hilosiva/vite-plugin-image-optimizer";
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
    viteImageOptimazer({
      generate: {
        preserveExt: true,
      },
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
        entryFileNames: "scripts/[name]-[hash].js",
        chunkFileNames: "scripts/[name]-[hash].js",
        assetFileNames: ({ names }) => {
          if (/\.(gif|jpeg|jpg|png|svg|webp)$/.test(names[0] ?? "")) {
            return "images/[name]-[hash][extname]";
          }
          if (/\.css$/.test(names[0] ?? "")) {
            return "styles/[name]-[hash][extname]";
          }
          return "[name]-[hash][extname]";
        },
      },
    },
    assetsInlineLimit: 0,
    write: true,
  },

  server: {
    open: "http://localhost:8080",
  }

});
