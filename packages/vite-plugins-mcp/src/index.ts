#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// =====================
// Guides
// =====================

const PHP_LOADER_SETUP_GUIDE = `
# vite-plugin-php-loader セットアップガイド

WordPress テーマ開発で Vite を使うためのプラグインです。

## インストール

\`\`\`bash
pnpm add @hilosiva/vite-plugin-php-loader -D
\`\`\`

## vite.config.ts の設定

\`\`\`ts
import { defineConfig } from "vite";
import { vitePhpLoader } from "@hilosiva/vite-plugin-php-loader";

export default defineConfig({
  root: "src",
  base: "./",
  plugins: [
    vitePhpLoader({
      useWpEnv: true, // @wordpress/env 使用時
    }),
  ],
  build: {
    outDir: "../dist",
    rollupOptions: {
      output: {
        entryFileNames: "scripts/[name]-[hash].js",
        chunkFileNames: "scripts/[name]-[hash].js",
        assetFileNames: ({ names }) => {
          if (/\\.(gif|jpeg|jpg|png|svg|webp)$/.test(names?.[0] ?? "")) {
            return "images/[name]-[hash][extname]";
          }
          if (/\\.css$/.test(names?.[0] ?? "")) {
            return "styles/[name]-[hash][extname]";
          }
          return "[name]-[hash][extname]";
        },
      },
    },
  },
  server: {
    open: "http://localhost:8080",
  },
});
\`\`\`

## ディレクトリ構成

\`\`\`
src/
├── lib/
│   └── ViteHelper.php   ← プラグインが自動書き換えする
├── scripts/
│   └── main.js          ← エントリーポイント
├── styles/
│   └── global.css
├── functions.php
├── header.php
└── index.php
\`\`\`

## ViteHelper.php の仕組み

\`lib/ViteHelper.php\` に以下の定数を定義してください。プラグインが自動で書き換えます。

\`\`\`php
class ViteHelper
{
  const IS_DEVELOPMENT = true;        // build 時に false に書き換わる
  const VITE_SERVER = 'http://localhost:5555'; // dev 時にローカルIPで書き換わる
  const ENTRY_POINT = 'scripts/main.js';       // dev 時に自動設定
  const DIST_URL = DIST_THEME_URL;
  const PUBLIC_URL = self::IS_DEVELOPMENT ? self::VITE_SERVER : DIST_THEME_URL;
}
\`\`\`

### 定数の役割

| 定数 | dev 時 | build 後 (dist) |
|------|--------|----------------|
| IS_DEVELOPMENT | true | false |
| VITE_SERVER | http://192.168.x.x:5555 (ローカルIP) | '' (空文字) |
| ENTRY_POINT | scripts/main.js | scripts/main.js |
| PUBLIC_URL | VITE_SERVER の値 | DIST_THEME_URL の値 |

## functions.php での使い方

\`\`\`php
require get_template_directory() . '/lib/ViteHelper.php';
\`\`\`

## header.php での PUBLIC_URL 使用例

\`\`\`php
<link rel="shortcut icon" href="<?php echo esc_url(ViteHelper::PUBLIC_URL); ?>/favicon.svg">
\`\`\`

## wp-env の構成例（.wp-env.json）

\`\`\`json
{
  "core": null,
  "themes": [
    "./src",
    "./dist"
  ]
}
\`\`\`

- **dev 時**: WordPress は \`src/\` テーマを使用（IS_DEVELOPMENT = true）
- **build 後**: WordPress は \`dist/\` テーマを使用（IS_DEVELOPMENT = false）
`;

const PHP_LOADER_OPTIONS_GUIDE = `
# vite-plugin-php-loader オプションリファレンス

## entryPoint

- **型**: \`string\`
- **デフォルト**: \`'scripts/main.js'\`

Vite dev サーバーから読み込む JS エントリーポイントのパス（\`root\` からの相対パス）。

\`\`\`ts
vitePhpLoader({
  entryPoint: "scripts/main.js", // src/scripts/main.js を指す
})
\`\`\`

## viteHelperFile

- **型**: \`string\`
- **デフォルト**: \`'lib/ViteHelper.php'\`

自動書き換え対象の ViteHelper.php のパス（\`root\` からの相対パス）。

\`\`\`ts
vitePhpLoader({
  viteHelperFile: "lib/ViteHelper.php",
})
\`\`\`

## useWpEnv

- **型**: \`boolean\`
- **デフォルト**: \`false\`

\`@wordpress/env\` 使用時に \`true\` にすると、dev 起動時のターミナルに wp-env の URL（localhost:8080 とネットワークIP）を表示します。

\`\`\`ts
vitePhpLoader({
  useWpEnv: true,
})
\`\`\`

## プラグインが自動でやること

### dev 起動時（pnpm dev）
1. \`host: true\` で Vite サーバーをネットワーク公開（スマホ確認・Docker対応）
2. \`ViteHelper.php\` の \`VITE_SERVER\` にローカルIPを書き込む
3. \`ViteHelper.php\` の \`ENTRY_POINT\` を更新
4. PHP ファイルの変更を検知してライブリロード

### build 時（pnpm build）
1. \`dist/lib/ViteHelper.php\` を生成（IS_DEVELOPMENT = false、VITE_SERVER = ''）
2. PHP ファイル内の画像パスをハッシュ付きパスに置換
`;

const IMAGE_OPTIMIZER_SETUP_GUIDE = `
# vite-plugin-image-optimizer セットアップガイド

ビルド時に sharp を使って画像を最適化・WebP/AVIF 変換するプラグインです。

## インストール

\`\`\`bash
pnpm add @hilosiva/vite-plugin-image-optimizer -D
\`\`\`

## vite.config.ts の設定

\`\`\`ts
import { defineConfig } from "vite";
import { viteImageOptimazer } from "@hilosiva/vite-plugin-image-optimizer";

export default defineConfig({
  plugins: [
    viteImageOptimazer({
      generate: {
        preserveExt: true, // logo.png → logo.png.webp, logo.png.avif
      },
    }),
  ],
});
\`\`\`

## 動作

- ビルド後の出力ディレクトリ内の画像を自動スキャン
- JPG/PNG → WebP・AVIF に変換して並列生成
- オリジナルファイルも保持したまま追加生成
- ターミナルに最適化結果（削減率）を表示
`;

const IMAGE_OPTIMIZER_OPTIONS_GUIDE = `
# vite-plugin-image-optimizer オプションリファレンス

## supportedExts

- **型**: \`string[]\`
- **デフォルト**: \`['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif']\`

最適化対象の拡張子一覧。

## generate.inputExts

- **型**: \`string[]\`
- **デフォルト**: \`['.jpg', '.jpeg', '.png']\`

WebP/AVIF 変換の変換元フォーマット。

## generate.outputExts

- **型**: \`string[]\`
- **デフォルト**: \`['.webp', '.avif']\`

生成する変換先フォーマット。

## generate.preserveExt

- **型**: \`boolean\`
- **デフォルト**: \`false\`

\`true\` にすると元の拡張子をファイル名に残します。

\`\`\`
false: logo.png → logo.webp
true:  logo.png → logo.png.webp
\`\`\`

## 形式別オプション

sharp のオプションをそのまま渡せます。

\`\`\`ts
viteImageOptimazer({
  jpg: { quality: 80, progressive: true },
  png: { quality: 80, compressionLevel: 9 },
  webp: { quality: 85 },
  avif: { quality: 80 },
  gif: { colors: 256 },
})
\`\`\`
`;

const HTML_LOADER_SETUP_GUIDE = `
# vite-plugin-html-loader セットアップガイド

\`root\` 配下の全 HTML ファイルを自動検出して Rollup の input に追加するプラグインです。
マルチページ構成のサイトで \`input\` を手書きする必要がなくなります。

## インストール

\`\`\`bash
pnpm add @hilosiva/vite-plugin-html-loader -D
\`\`\`

## vite.config.ts の設定

\`\`\`ts
import { defineConfig } from "vite";
import { viteHtmlLoader } from "@hilosiva/vite-plugin-html-loader";

export default defineConfig({
  root: "src",
  plugins: [
    viteHtmlLoader(),
  ],
  build: {
    outDir: "../dist",
  },
});
\`\`\`

## 動作

\`root\` 配下の \`.html\` ファイルを glob で自動検出し、すべてを Rollup の \`input\` に追加します。

\`\`\`
src/
├── index.html          → dist/index.html
├── about/
│   └── index.html      → dist/about/index.html
└── contact/
    └── index.html      → dist/contact/index.html
\`\`\`

**オプションはありません**。\`viteHtmlLoader()\` とプラグインに追加するだけで動作します。
`;

// =====================
// Helpers
// =====================

function detectInstalledPackages(cwd: string): {
  hasPhpLoader: boolean;
  hasImageOptimizer: boolean;
  hasHtmlLoader: boolean;
} {
  const packageJsonPath = path.join(cwd, "package.json");
  try {
    const content = fs.readFileSync(packageJsonPath, "utf-8");
    const pkg = JSON.parse(content);
    const deps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
    };
    return {
      hasPhpLoader: "@hilosiva/vite-plugin-php-loader" in deps,
      hasImageOptimizer: "@hilosiva/vite-plugin-image-optimizer" in deps,
      hasHtmlLoader: "@hilosiva/vite-plugin-html-loader" in deps,
    };
  } catch {
    // package.json が読めない場合は全ツール登録
    return {
      hasPhpLoader: true,
      hasImageOptimizer: true,
      hasHtmlLoader: true,
    };
  }
}

// =====================
// MCP Server
// =====================

const server = new McpServer({
  name: "vite-plugins-mcp",
  version: "0.1.0",
});

const cwd = process.cwd();
const { hasPhpLoader, hasImageOptimizer, hasHtmlLoader } = detectInstalledPackages(cwd);

// php-loader ツール
if (hasPhpLoader) {
  server.registerTool(
    "get_php_loader_setup",
    {
      description: "vite-plugin-php-loader のセットアップ手順・ViteHelper.php の仕組み・wp-env 連携方法を返す",
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async () => ({
      content: [{ type: "text", text: PHP_LOADER_SETUP_GUIDE }],
    })
  );

  server.registerTool(
    "get_php_loader_options",
    {
      description: "vite-plugin-php-loader の全オプション（entryPoint・viteHelperFile・useWpEnv）の詳細を返す",
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async () => ({
      content: [{ type: "text", text: PHP_LOADER_OPTIONS_GUIDE }],
    })
  );
}

// image-optimizer ツール
if (hasImageOptimizer) {
  server.registerTool(
    "get_image_optimizer_setup",
    {
      description: "vite-plugin-image-optimizer のセットアップ手順・動作説明を返す",
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async () => ({
      content: [{ type: "text", text: IMAGE_OPTIMIZER_SETUP_GUIDE }],
    })
  );

  server.registerTool(
    "get_image_optimizer_options",
    {
      description: "vite-plugin-image-optimizer の全オプション（supportedExts・generate・形式別オプション）の詳細を返す",
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async () => ({
      content: [{ type: "text", text: IMAGE_OPTIMIZER_OPTIONS_GUIDE }],
    })
  );
}

// html-loader ツール
if (hasHtmlLoader) {
  server.registerTool(
    "get_html_loader_setup",
    {
      description: "vite-plugin-html-loader のセットアップ手順・マルチページ自動検出の仕組みを返す",
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async () => ({
      content: [{ type: "text", text: HTML_LOADER_SETUP_GUIDE }],
    })
  );
}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("vite-plugins-mcp server running on stdio");
}

main().catch(console.error);
