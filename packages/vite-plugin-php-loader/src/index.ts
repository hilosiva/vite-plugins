import path from "node:path";
import { VitePhpHelper } from "./VitePhpHelper";
import type { VitePhpHelperOptions } from "./VitePhpHelper";
import type { Plugin, ResolvedConfig, ViteDevServer } from "vite";

export function vitePhpLoader(options: VitePhpHelperOptions = {}): Plugin[] {
  let devServer: ViteDevServer | null = null;
  let config: ResolvedConfig | null = null;

  let vitePhpHelper: VitePhpHelper;
  let isSSR = false;

  const settings = {
    entryPoint: options.entryPoint ? options.entryPoint : "scripts/main.js",
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
            host: true,
            port: 5555,
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

        // dev モード時は ViteHelper.php の定数（VITE_SERVER / ENTRY_POINT）を更新
        if (_config.command === 'serve') {
          await vitePhpHelper.init();
        }
      },

    },


    // サーバー
    {
      name: "@hilosiva/php-loader:serve",
      apply: 'serve',

      hotUpdate({file, server }) {

        if (file.endsWith('.php')) {
          server.hot.send({ type: 'full-reload', path: '*' })

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
          const ip = vitePhpHelper.getLocalIPAddress();

          const b = "\x1b[1m";   // bold
          const r = "\x1b[0m";   // reset
          const g = "\x1b[32m";  // green
          const c = "\x1b[96m";  // bright cyan

          config?.logger.info([
            "",
            `  ${b}${c}🌐  WordPress (wp-env)${r}`,
            `  ${c}${"─".repeat(40)}${r}`,
            `  ${b}${c}▌${r}  ${b}➜${r}  Local:   ${b}${g}http://localhost:8080${r}`,
            `  ${b}${c}▌${r}  ${b}➜${r}  Network: ${b}${g}http://${ip}:8080${r}`,
            `  ${c}${"─".repeat(40)}${r}`,
            "",
          ].join("\n"), {
            clear: false,
            timestamp: false,
          });
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
      },
    },

  ] satisfies Plugin[];
}
