import { glob } from "glob";
import type { ResolvedConfig } from "vite";


export function viteHtmlLoader() {
  let config: ResolvedConfig;

  return {
    name: "@hilosiva/viteHtmlLoader",

    async configResolved(_config: ResolvedConfig) {
      config = _config;

      const inputs: {[key: string]: string} = {};

      const documents: string[] = glob.sync(`${config.root}/**/*.html`, { ignore: "node_modules/**" });

      const rollupOptions = config.build.rollupOptions;

      documents.forEach((document) => {
        const fileName = document.replaceAll("\\", "/").replace(`${config.root}/`, "");
        const key = fileName.replace(".html", "").replace("/index", "").replaceAll("/", "-");

        inputs[key] = document;

        rollupOptions.input = { ...inputs };
      });
    },
  };
}
