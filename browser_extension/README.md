# browser_extension

kintone のレコード一覧から Kozaneba のボードを作る **Tampermonkey ユーザースクリプト**。

- ファイル: [`kintone_tampermonkey.js`](./kintone_tampermonkey.js)
- これは「ビルドして配布する拡張機能（Chrome MV3 など）」ではなく、ブラウザの
  ユーザースクリプトマネージャに貼り付けて使う 1 ファイルのスクリプト。**ビルド手順は無い。**
  （リポジトリ直下の `public/manifest.json` は Kozaneba 本体 Web アプリの PWA manifest で、
  拡張機能の manifest ではない。）

## 何をするか

kintone のレコード一覧ページに Kozaneba アイコンのボタンを足し、押すと一覧の各レコードを
こざね（付箋）にしたボードを作って開く。

1. 一覧ページの「集計」ボタン（`.gaia-argoui-app-subtotalbutton`）の隣に、Kozaneba アイコンの
   ボタンを挿入する。
2. ボタンを押すと、一覧テーブルの各行 `tr` を走査して:
   - 1 列目のリンク `href` から `record=<数字>` を取り、こざねの `id` にする。
   - 2 列目の `span` のテキストを、こざねの本文にする。
   - 10 列グリッドに並ぶ座標を振り、`custom.url` に元レコードの URL を持たせる。
3. 作った `itemStore` / `drawOrder` を Cloud Function `create_ba`
   (`https://us-central1-regroup-d4932.cloudfunctions.net/create_ba`) に POST し、
   返ってきたボード id で `https://kozaneba.netlify.app/#edit=<id>` を新しいタブで開く。

## 使い方

### 前提

- Chrome / Edge / Firefox などに **Tampermonkey**（または Violentmonkey / Greasemonkey）を入れる。

### インストール

1. Tampermonkey のダッシュボードで「新規スクリプトを作成」。
2. [`kintone_tampermonkey.js`](./kintone_tampermonkey.js) の中身を貼り付けて保存。
3. `@match https://*.cybozu.com/k/*/*` により、kintone のアプリ画面で自動的に有効になる。

### 操作

1. kintone のレコード**一覧**ページを開く（1 列目にレコードへのリンク、2 列目にタイトル相当の
   `span` がある一覧ビュー）。
2. 「集計」ボタンの隣に出る Kozaneba アイコンのボタンを押す。
3. ボード生成後、Kozaneba が新しいタブで開く。

## 制約・注意

- **kintone の DOM 構造に強く依存する。** `.gaia-argoui-app-subtotalbutton` の存在、
  一覧テーブルの「1 列目にリンク（`record=<数字>` を含む）」「2 列目に `span`」を前提にしている。
  kintone 側の UI 変更や、列構成の違う一覧ビューでは動かない（エラーハンドリングも無いため、
  構造が合わないと例外で止まる）。
- **レコードの内容が外部に送られる。** 一覧のテキストと URL が Cloud Function `create_ba` と
  `kozaneba.netlify.app` に送信される。機微な情報を含む一覧では扱いに注意。
- バックエンド依存: `create_ba`（`regroup-d4932` プロジェクトの Cloud Function）と
  `kozaneba.netlify.app` が稼働している必要がある。
- `@grant none` / `mode: "cors"`。認証は持たず、公開エンドポイントに投げる。
- メタデータがテンプレートの初期値のまま（`@author You`、`@version 0.1`、
  `@description try to take over the world!`）。整備候補。

## 関連（別経路）

Kozaneba 本体にも kintone 連携のデモがある: `window.debug.kintone_demo(baseUrl, app, apiToken)`
（`src/Global/kintone_demo.ts`）。これは kintone REST API を API トークンで叩いて取り込む
開発用の経路で、ローカルの Cloud Functions エミュレータ（`localhost:5001`）前提。本ユーザー
スクリプト（一覧 DOM をスクレイプする経路）とは別物。

## ビルド確認

ユーザースクリプトにビルド工程は無い。構文が壊れていないことは次で確認できる:

```sh
node --check browser_extension/kintone_tampermonkey.js
```
