# @hilosiva/vite-plugins

Qlio / hilosiva 製の Vite プラグイン集。

## パッケージ

| パッケージ | バージョン | 説明 |
|-----------|-----------|------|
| [`@hilosiva/vite-plugin-html-loader`](./packages/vite-plugin-html-loader/) | 0.2.0 | ルート配下の HTML ファイルを自動検出してマルチページビルドに対応 |
| [`@hilosiva/vite-plugin-image-optimizer`](./packages/vite-plugin-image-optimizer/) | 0.2.0 | ビルド時に sharp で画像を最適化・WebP/AVIF 自動生成 |
| [`@hilosiva/vite-plugin-php-loader`](./packages/vite-plugin-php-loader/) | 0.2.0 | WordPress テーマ開発用 PHP ローダー |

## 動作環境

- **Node.js**: 20.19.0 以上（22.12.0 以上推奨）
- **Vite**: 6.x または 7.x
- **パッケージマネージャー**: pnpm 推奨

## 開発

```bash
# 依存関係インストール
pnpm install

# 全パッケージビルド
pnpm build

# Vite 7 動作確認（playground ビルド）
pnpm check:vite7

# 全パッケージ publish
pnpm publish:main
```

## ライセンス

MIT
