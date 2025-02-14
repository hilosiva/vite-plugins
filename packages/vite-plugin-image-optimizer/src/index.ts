import { ViteSharpOptimazer  } from "./libs/ViteSharpOptimazer";
import type {  ViteSharpOptimazerOptions } from "./libs/ViteSharpOptimazer";

export function viteImageOptimazer(opts: ViteSharpOptimazerOptions = {}): any {
  return {
    name: "@hilosiva/viteImageOptimazer",
    async writeBundle(_options: any, bundle: any) {
      new ViteSharpOptimazer(_options.dir, opts, bundle);
    },
  };
}
