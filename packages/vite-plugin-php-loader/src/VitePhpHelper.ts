import fs from "fs";
import { glob } from "glob";

import path from "path";
import os from "os";

interface Replace {
  search: RegExp;
  new: string;
}

interface Manifest {
  [key: string]: {
    file: string;
    src: string;
  };
}

interface ReplaceFunc {
  (content: string, replaces: Replace[] | Manifest): string;
}
// type ReplaceFunc = (content: string, replaces: Replace[] | Manifest) => string;
export interface VitePhpHelperOptions {
  entryPoint?: string;
  proxy?: string;
  viteHelperFile?: string;
  useWpEnv?: boolean;
}

export class VitePhpHelper {
  private files: string[];
  private rollupOptions: any;
  private path: {
    root: string;
    relativeDist: string;
    absoluteDist: string;
  };

  private mode: string;
  private protocol: {
    development: string;
    production: string;
    [key: string]: string;
  };
  private hosts: {
    development: string;
    production: string;
    [key: string]: string;
  };
  private ports: {
    development: number;
    production: number;
    [key: string]: number;
  };

  private defaultHost: string;
  private localServer: URL;
  private entryPoint: URL;
  private defaultOptions: VitePhpHelperOptions;
  private options: any; // オプションの型を適宜設定する


  constructor(options: any = {}, config: any) {
    this.files = glob.sync(`${config.root}/**/*.php`);
    this.rollupOptions = config.build.rollupOptions;

    this.defaultOptions = {
      viteHelperFile: `lib/ViteHelper.php`,
      useWpEnv: false,
    };

    this.path = {
      root: config.root,
      relativeDist: config.build.outDir,
      absoluteDist: path.resolve(config.root, config.build.outDir),
    };

    this.mode = config.mode;

    this.protocol = {
      development: config.server.https || config.inlineConfig.https ? "https" : "http",
      production: config.preview.https || (config.inlineConfig.preview && config.inlineConfig.preview.https) ? "https" : "http",
    };
    this.defaultHost = "localhost";

    this.hosts = {
      development: config.server.host || config.inlineConfig.host ? this.getLocalIPAddress() : this.defaultHost,
      production: config.preview.host || (config.inlineConfig.preview && config.inlineConfig.preview.host) ? this.getLocalIPAddress() : this.defaultHost,
    };
    this.ports = {
      development: config.inlineConfig.port ? config.inlineConfig.port : config.server.port ? config.server.port : 5173,
      production: config.inlineConfig.preview && config.inlineConfig.preview.port ? config.inlineConfig.preview.port : config.preview.port ? config.preview.port : 4173,
    };


    this.localServer = new URL(`${this.protocol[this.mode]}://${this.hosts[this.mode]}:${this.ports[this.mode]}`);

    this.entryPoint = new URL(this.rollupOptions.input && this.rollupOptions.input.main ? this.rollupOptions.input.main.replace(config.root, "") : "assets/scripts/main.ts", this.localServer);

    this.options = this.deepMerge(this.defaultOptions, options);

    this._setup();
  }

  private _setup() {
    try {
      if (!this.rollupOptions || !this.rollupOptions.input || !this.rollupOptions.input.main) {
        throw new Error("[vite-plugin-php] - rollupOptionsに「main」のエントリーポイントを指定してください");
      }
    } catch (e: any) {
      console.error(e.message);
    }
  }

  getLocalIPAddress() {
    const interfaces = os.networkInterfaces();
    for (const interfaceName in interfaces) {
      const addresses = interfaces[interfaceName];
      if (addresses) {
        for (const address of addresses) {
          if (address.family === "IPv4" && !address.internal) {
            return address.address;
          }
        }
      }
    }
    return "localhost";
  }



  private async modifiedFile(file: string, replaceFunc: ReplaceFunc, replaces: Replace[] | Manifest, output: string) {
    try {
      const content = fs.readFileSync(file, "utf-8");
      const modifiedContent = replaceFunc(content, replaces);

      const distFileDirectory = output.split("/").slice(0, -1).join("/");
      fs.mkdirSync(distFileDirectory, { recursive: true });
      fs.writeFileSync(output, modifiedContent);
    } catch (error) {
      return;
    }
  }

  private replaceStrings: ReplaceFunc = (content, replaces) => {
    let modifiedContent = content;

    (replaces as Replace[]).forEach((replace) => {
      modifiedContent = modifiedContent.replace(replace.search, replace.new);
    });

    return modifiedContent;
  };

  private replaceImagePaths: ReplaceFunc = (content, replaces) => {
    let modifiedContent = content;

    Object.keys(replaces as Manifest).forEach((key) => {
      const { file, src } = (replaces as Manifest)[key];
      modifiedContent = modifiedContent.replaceAll(new RegExp(src, "g"), file);
    });

    return modifiedContent;
  };

  public async init(): Promise<void> {


    const file = `${this.path.root}/${this.options.viteHelperFile}`;

    const replaces: Replace[] = [
      {
        search: /const VITE_SERVER = '([^']*)';/,
        new: `const VITE_SERVER = '${this.localServer.origin}';`,
      },
      {
        search: /const ENTRY_POINT = '([^']*)';/,
        new: `const ENTRY_POINT = '${this.entryPoint.pathname.slice(1)}';`,
      },
    ];

    await this.modifiedFile(file, this.replaceStrings, replaces, file);
  }

  public async build(): Promise<void> {
    await this.changeManifestAssets();
    await this.changeDevelpmentMode();
  }

  private async changeManifestAssets(): Promise<void> {
    const manifestPath = `${this.path.absoluteDist}/.vite/manifest.json`;

    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
      this.files.forEach(async (file) => {
        const output = file.replace(this.path.root, this.path.absoluteDist);
        await this.modifiedFile(file, this.replaceImagePaths, manifest, output);
      });
    } catch (e: any) {
      return;
    }
  }

  private async changeDevelpmentMode(): Promise<void> {
    const replaces = [
      {
        search: /const IS_DEVELOPMENT = true;/,
        new: "const IS_DEVELOPMENT = false;",
      },
      {
        search: /const VITE_SERVER = '([^']*)';/,
        new: "const VITE_SERVER = '';",
      },
    ];

    const distFilePath = `${this.path.absoluteDist}/${this.options.viteHelperFile}`;
    await this.modifiedFile(`${this.path.root}/${this.options.viteHelperFile}`, this.replaceStrings, replaces, distFilePath);
  }



  private deepMerge(target: any, source: any) {
    if (typeof target !== "object" || typeof source !== "object") {
      return source;
    }

    const keys = Object.keys(source);

    for (const key of keys) {
      if (!(key in target)) {
        target[key] = source[key];
      } else if (typeof target[key] === "object" && typeof source[key] === "object") {
        target[key] = this.deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }

    return target;
  }
}
