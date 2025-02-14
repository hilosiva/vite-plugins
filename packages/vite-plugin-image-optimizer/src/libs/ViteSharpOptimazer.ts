import sharp from "sharp";
import path from "path";

interface SharpImage {
  file: string;
  sharpImage: sharp.Sharp;
}

interface Options {
  supportedExts: string[]; // サポートする拡張子の配列
  generate: {
    inputExts: string[]; // 作成するフォーマットの元となるフォーマットの拡張子の配列
    outputExts: string[]; // 作成するフォーマットの拡張子の配列
    preserveExt: boolean; // 新しいフォーマットのファイル名に元の拡張子を追加するかどうか
  };
  jpg?: sharp.JpegOptions; // JPG形式のオプション
  jpeg?: sharp.JpegOptions; // JPEG形式のオプション
  png?: sharp.PngOptions; // PNG形式のオプション
  gif?: sharp.GifOptions; // GIF形式のオプション
  webp?: sharp.WebpOptions; // WebP形式のオプション
  avif?: sharp.AvifOptions; // AVIF形式のオプション
  [key: string]: any; // その他のオプション項目
}

export interface ViteSharpOptimazerOptions {
  supportedExts?: string[]; // サポートする拡張子の配列
  generate?: {
    inputExts?: string[]; // 作成するフォーマットの元となるフォーマットの拡張子の配列
    outputExts?: string[]; // 作成するフォーマットの拡張子の配列
    preserveExt?: boolean; // 新しいフォーマットのファイル名に元の拡張子を追加するかどうか
  };
  jpg?: sharp.JpegOptions; // JPG形式のオプション
  jpeg?: sharp.JpegOptions; // JPEG形式のオプション
  png?: sharp.PngOptions; // PNG形式のオプション
  gif?: sharp.GifOptions; // GIF形式のオプション
  webp?: sharp.WebpOptions; // WebP形式のオプション
  avif?: sharp.AvifOptions; // AVIF形式のオプション
  [key: string]: any; // その他のオプション項目
}

export class ViteSharpOptimazer {
  private outputDir: string;
  private sharpImageLists: SharpImage[];
  private originalSize: number;
  private optimizeSize: number;
  private extFunctions: { [key: string]: string };
  private defaultOptions: Options;
  private options: Options;

  constructor(outputDir: string, _options: object = {}, bundle: any) {
    this.outputDir = outputDir;
    this.sharpImageLists = [];
    this.originalSize = 0;
    this.optimizeSize = 0;

    this.extFunctions = {
      ".jpg": "jpeg",
      ".jpeg": "jpeg",
      ".png": "png",
      ".gif": "gif",
      ".webp": "webp",
      ".avif": "avif",
    };

    this.defaultOptions = {
      supportedExts: [".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"],
      generate: {
        inputExts: [".jpg", ".jpeg", ".png"],
        outputExts: [".webp", ".avif"],
        preserveExt: false,
      },
      jpg: {},
      jpeg: {},
      png: {},
      gif: {},
      webp: {},
      avif: {},
    };

    this.options = this.deepMerge(this.defaultOptions, _options);

    this._init(bundle);
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

  private async _init(bundle: any) {
    const imageFileList = Object.keys(bundle).filter((key) => {
      const extName = path.extname(key);
      return this.options.supportedExts.includes(extName);
    });

    this.sharpImageLists = imageFileList.map((file) => {
      const sharpImage = sharp(bundle[file].source);
      return { file, sharpImage };
    });

    if (this.sharpImageLists.length > 0) await this._run();
  }

  private async _run() {
    await Promise.all(
      this.sharpImageLists.map(async (item, index) => {
        await this._optimaze(item, index);

        if (this.isGenerateFormat(item.file)) {
          for (let i = 0; i < this.options.generate.outputExts.length; i++) {
            await this._createImage(item, this.options.generate.outputExts[i]);
          }
        }
      })
    );

    console.log(`\n✨ Total \x1b[30m${this.formatBytes(this.optimizeSize)} / ${this.formatBytes(this.originalSize)} ${this.getRatio(this.originalSize, this.optimizeSize)}`);
  }

  private async _optimaze(item: SharpImage, index: number) {
    const { sharpImage, file } = item;
    const extName = path.extname(file);
    const sfunc = this.extFunctions[extName];

    const metadate = await sharpImage.metadata();
    const info = await (sharpImage as any)[sfunc](this.options[extName.replace(".", "")])
      .toFile(`${this.outputDir}/${file}`)
      .catch((err: any) => console.log(err));

    if (index === 0) console.log(`\n✨ \x1b[36m[vite-plugin-image-optimizer] \x1b[39m- optimized images successfully:`);
    this.setInfo(file, metadate, info);
  }

  private async _createImage(item: SharpImage, ext: string) {
    const { sharpImage, file } = item;
    const sfunc = this.extFunctions[ext];

    const metadate = await sharpImage.metadata();
    const info = await (sharpImage as any)[sfunc](this.options[ext.replace(".", "")])
      .toFile(`${this.outputDir}/${this.changeExtension(file, ext)}`)
      .catch((err: any) => console.log(err));

    this.setInfo(this.changeExtension(file, ext), metadate, info);
  }

  private getRatio(originalSize: number, compressedSize: number): string {
    if (originalSize <= 0 || compressedSize <= 0) return "N/A";

    const ratio = ((originalSize - compressedSize) / originalSize) * 100;
    const absoluteRatio = Math.abs(ratio);
    const sign = absoluteRatio > 100 ? "+" : "-";
    return `${sign + absoluteRatio.toFixed(2)}%`;
  }

  private getLastDirName(path: string): string {
    const parts = path.split("/");
    return parts[parts.length - 1];
  }

  formatBytes(bytes: number): string {
    const units = ["bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    let index = 0;

    while (bytes >= 1024 && index < units.length - 1) {
      bytes /= 1024;
      index++;
    }

    return `${bytes.toFixed(2)} ${units[index]}`;
  }

  isGenerateFormat(file: string): boolean {
    const extName = path.extname(file);

    return this.options.generate.inputExts && this.options.generate.inputExts.includes(extName.toLowerCase());
  }

  changeExtension(file: string, ext: string): string {
    if (this.options.generate.preserveExt) {
      return file + ext;
    } else {
      return file.substring(0, file.lastIndexOf(".")) + ext;
    }
  }

  setInfo(file: string, metadate: any, info: any) {
    this.originalSize += metadate.size;
    this.optimizeSize += info.size;

    console.log(
      `\x1b[30m${this.getLastDirName(this.outputDir)}/\x1b[34m${file}  \x1b[32m${this.getRatio(metadate.size, info.size)}   \x1b[30m${this.formatBytes(metadate.size)} → ${this.formatBytes(info.size)}`
    );
  }
}
