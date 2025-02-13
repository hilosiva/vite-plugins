import path from "path";
import { VitePhpHelper } from "./VitePhpHelper";
import type { VitePhpHelperOptions } from "./VitePhpHelper";
import type { Plugin, ResolvedConfig } from "vite";

export default function php(options: VitePhpHelperOptions = {}): Plugin[] {

  let config: ResolvedConfig | null = null;

  let vitePhpHelper: VitePhpHelper;
  let isSSR = false;

  const settings = {
    entryPoint: options.entryPoint ? options.entryPoint : "assets/scripts/main.js",
  };


  return [
    {
      name: "@hilosiva/php:scan",
      enforce: 'pre',

      config: (config) => (
        {
          build: {
            emptyOutDir: true,
            manifest: true,
            rollupOptions: {
              input: {
                main: path.resolve(`${config.root}/${settings.entryPoint}`),
              },
            },
          },
          server: {
            strictPort: true,
            cors: true,
            port: 5555,
            origin: 'http://localhost:5555',
          }
        }
      ),



      // 設定
      async configResolved(_config) {
        config = _config;

        isSSR = !!config.build.ssr;
        vitePhpHelper = new VitePhpHelper(options, config);
        vitePhpHelper.init();
      },

      configureServer(server) {

        if (options.useWpEnv) {
          server.httpServer?.on("listening", () => {
          console.log("\nWordPress is running at: http://localhost:8080\n");
        });
        }

      },

    },

    // サーバー
    {
      name: "@hilosiva/php:serve",
      apply: 'serve',

       // サーバーインスタンスの保存
      configureServer({ws}) {
        vitePhpHelper.liveReload(ws);
      },


    },
    // ビルド時
    {
      name: "@hilosiva/php:build",
      apply: 'build',
      enforce: 'post',

      async writeBundle() {
        await vitePhpHelper.build();
      }
    },

  ] satisfies Plugin[];
}
