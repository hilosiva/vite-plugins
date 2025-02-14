import path from "path";
import { VitePhpHelper } from "./VitePhpHelper";
import type { VitePhpHelperOptions } from "./VitePhpHelper";
import type { Plugin, ResolvedConfig, ViteDevServer } from "vite";

export function vitePhpLoader(options: VitePhpHelperOptions = {}): Plugin[] {
  let devServer: ViteDevServer | null = null;
  let config: ResolvedConfig | null = null;

  let vitePhpHelper: VitePhpHelper;
  let isSSR = false;

  const settings = {
    entryPoint: options.entryPoint ? options.entryPoint : "assets/scripts/main.js",
  };


  return [
    {
      name: "@hilosiva/php-loader:scan",

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

      // サーバーインスタンスの保存
      configureServer(_server) {
        devServer = _server;
      },

      // 設定
      async configResolved(_config) {
        config = _config;

        isSSR = !!config.build.ssr;
        vitePhpHelper = new VitePhpHelper(options, config);
        vitePhpHelper.init();
      },



    },


    // サーバー
    {
      name: "@hilosiva/php-loader:serve",
      apply: 'serve',

       // サーバーインスタンスの保存
      handleHotUpdate({file, server }) {

        if (file.endsWith('.php')) {
          server.ws.send({ type: 'full-reload', path: '*' })

          config?.logger.info(`page reload ${file.replace(config.root, "")}`, {
            clear: true,
            timestamp: true,
          })
          return []
        }
      }

    },
    {
      name: "@hilosiva/php-loader:listen",
      apply: 'serve',
      enforce: 'post',

      buildStart() {
        if (devServer && options.useWpEnv) {
          config?.logger.info(`WordPress is running\n→ Local: http://localhost:8080\n→ NetWork: http://${vitePhpHelper.getLocalIPAddress()}:8080`, {
            clear: false,
            timestamp: false,
          })
        }

      },

    },

    // ビルド時
    {
      name: "@hilosiva/php-loader:build",
      apply: 'build',
      enforce: 'post',

      async writeBundle() {
        await vitePhpHelper.build();
      }
    },

  ] satisfies Plugin[];
}
