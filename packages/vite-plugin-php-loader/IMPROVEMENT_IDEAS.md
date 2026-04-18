# vite-plugin-php-loader 改善メモ

`@kucrut/vite-for-wp` の実装から取り込めるアイデア。

---

## 🎯 目指す姿：PHP と Node.js の完全な疎結合

### 現状（密結合）
```
vite-plugin-php-loader
    ↓ ビルド時に PHP ファイルを書き換える
ViteHelper.php（IS_DEVELOPMENT, VITE_SERVER 定数）
```
Node.js が PHP の中身を知っていて、直接書き換えている。

### 目標（疎結合）
```
vite-plugin-php-loader
    ↓ vite-dev-server.json を生成するだけ
ViteHelper.php（ファイルの存在だけ見る）
```
PHP は「このファイルがあるか」しか知らない。Node.js 側が何をしてるか完全に無関係。

---

## ① dev/prod 判断をファイル存在ベースに変える【最重要】

### Node.js 側の変更（`index.ts`）

**dev 起動時** に `dist/vite-dev-server.json` を生成する：
```ts
// configureServer フックで生成
configureServer(server) {
  devServer = server;

  // dev server が起動したら JSON を書き出す
  server.httpServer?.once('listening', () => {
    const address = server.httpServer?.address();
    const port = typeof address === 'object' ? address?.port : 5555;
    const url = `http://localhost:${port}`;
    const outDir = path.resolve(config.root, config.build.outDir);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(
      path.join(outDir, 'vite-dev-server.json'),
      JSON.stringify({ url }, null, 2)
    );
  });

  // dev server 終了時に削除（ベストエフォート）
  server.httpServer?.once('close', () => {
    const jsonPath = path.join(path.resolve(config.root, config.build.outDir), 'vite-dev-server.json');
    if (fs.existsSync(jsonPath)) fs.unlinkSync(jsonPath);
  });
}
```

**`closeBundle` フックで必ず削除する（本番ビルドに絶対残さない）：**
```ts
closeBundle() {
  const jsonPath = path.join(outDir, 'vite-dev-server.json');
  if (fs.existsSync(jsonPath)) fs.unlinkSync(jsonPath);
}
```

**orelop-wp テンプレートの `.gitignore` に追加：**
```
dist/vite-dev-server.json
```

> ※ `@kucrut/vite-for-wp` も同じ対策（closeBundle 削除 + .gitignore 推奨）を採用している。業界標準のアプローチ。

**`VitePhpHelper.ts` の `init()` メソッドを削除**（PHP 定数の書き換えが不要になる）。

---

### PHP 側の変更（`ViteHelper.php`）

定数をやめてファイル読み込みベースに：

```php
class ViteHelper
{
  // ↓ 定数を全部やめる（IS_DEVELOPMENT, VITE_SERVER, ENTRY_POINT）
  private bool $isDev;
  private string $viteUrl;
  private string $entryPoint;
  private array $manifest;

  function __construct(string $entryPoint = 'scripts/main.js', array $jsDeps = [])
  {
    $this->entryPoint = $entryPoint;
    $this->jsDeps = $jsDeps;

    $devFile = get_template_directory() . '/dist/vite-dev-server.json';
    $this->isDev = is_file($devFile);

    if ($this->isDev) {
      $server = json_decode(file_get_contents($devFile), true);
      $this->viteUrl = $server['url'];
    } else {
      $manifestPath = get_template_directory() . '/dist/.vite/manifest.json';
      $this->manifest = json_decode(file_get_contents($manifestPath), true);
    }

    $this->setAction();
    $this->setFilter();
  }
  // ... 以下 enqueue ロジック
}
```

**効果：**
- `vite-plugin-php-loader` が PHP の中身を一切知らなくていい
- IP アドレスが変わっても自動対応（JSON から取得するので）
- `init()` メソッド削除 → `VitePhpHelper.ts` が大幅シンプルに

---

## ② `WP_HTML_Tag_Processor` で `type="module"` を付与【優先度: 中】

### 現状の問題
```php
// 文字列置換（壊れやすい）
return str_replace(' src=', ' type="module" crossorigin src=', $tag);
```

### 改善案
```php
// WordPress 6.2+ の HTML パーサーを使う
$processor = new WP_HTML_Tag_Processor($tag);
if ($processor->next_tag('script')) {
  $processor->set_attribute('type', 'module');
  $processor->set_attribute('crossorigin', true);
}
return (string) $processor;
```

**注意：** WordPress 6.2 以上が必要。

---

## ③ CORS を Vite 側に移す【優先度: 低】

### 現状
```php
// PHP 側で CORS 設定（不要になる）
add_action('send_headers', array($this, 'corsHttpHeader'));
```

### 改善案
```ts
// vite.config.ts に任せる
server: { cors: true }
```

---

## 実装順序

```
Step 1: index.ts に vite-dev-server.json の生成・削除を追加
Step 2: VitePhpHelper.ts の init() を削除
Step 3: ViteHelper.php を定数なしに書き直し
Step 4: ② WP_HTML_Tag_Processor 対応（任意）
Step 5: ③ CORS を vite.config.ts に移動（任意）
```

Step 1〜3 で PHP と Node.js が完全に疎結合になる。工数は合計 2〜3h。

---

## 変更後のファイル構成イメージ

```
vite-plugin-php-loader（Node.js）
  → dev 起動時: dist/vite-dev-server.json を生成
  → build 時: PHP の img パスを manifest で書き換え（現行維持）
  → PHP の中身には一切触らない ✅

ViteHelper.php（PHP）
  → vite-dev-server.json があれば dev モード
  → なければ manifest.json を読んで prod モード
  → Node.js が何をしてるか知らなくていい ✅
```

---

*参考：`@kucrut/vite-for-wp` https://github.com/kucrut/vite-for-wp*
