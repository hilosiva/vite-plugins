import { ViteSharpOptimizer } from "./libs/ViteSharpOptimizer";
import type { ViteSharpOptimizerOptions } from "./libs/ViteSharpOptimizer";

export function viteImageOptimizer(opts: ViteSharpOptimizerOptions = {}): any {
  return {
    name: "@hilosiva/viteImageOptimizer",
    async writeBundle(_options: any, bundle: any) {
      new ViteSharpOptimizer(_options.dir, opts, bundle);
    },
  };
}
