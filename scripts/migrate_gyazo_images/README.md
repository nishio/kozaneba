# Gyazo 画像の移行(一回限り)

自分が writer の場にある Gyazo の画像こざねについて、画像を Firebase Storage にコピーし、こざねの `url` と `text` をコピー先に書き換える。

- 対象: `writers` に `--uid`(既定は nishio)を含む場の、`type: "gyazo"` で url が `gyazo.com` / `i.gyazo.com` のこざね。他人の場、Scrapbox カードの画像、テキストのこざねの中の URL は触らない。
- コピー先: `images/<uid>/gyazo-<Gyazo の id>.<拡張子>`。Gyazo の `/raw` から元画像をそのまま取る。同じ画像は 1 ファイルにまとめ、再実行しても作り直さない。
- 書き換えは transaction で行う。読み直した時点で url が変わっていないこざねだけを書き換え、`last_updated` を進める。開いているクライアントは、それを見てサーバの状態を読み直す。
- Gyazo の画像サーバは `gyazo.com` 以外のページからの読み取りを許さない(CORS)。そのためブラウザでは移行できず、このスクリプトで行う。

## 準備

```sh
cd scripts/migrate_gyazo_images
npm install
gcloud auth application-default login   # または GOOGLE_APPLICATION_CREDENTIALS にサービスアカウントの鍵
```

Storage の bucket が有効になっていること(#78 を参照)。bucket 名が `regroup-d4932.firebasestorage.app` でなければ `--bucket` で渡す。

## 実行

```sh
node migrate.mjs                          # dry run: 対象の場と枚数を表示するだけ
node migrate.mjs --apply --ba <場の ID>   # まず 1 つの場で試す
node migrate.mjs --apply                  # 全部
```

- 実行中は、対象の場を開いているタブを閉じておく。クライアントは場を丸ごと上書き保存するので、古い状態のタブで編集すると URL が Gyazo に戻ることがある。戻っても、もう一度流せば直る。
- 出力は `out/<日時>/` に書く:
  - `backup/<場の ID>.json`: 書き換える前の文書
  - `report.json`: 場ごとの件数と失敗の一覧
- Gyazo 側で消えた画像などは失敗として記録し、元の URL のまま残す。

## テスト

```sh
npm test   # URL の解釈などの単体テスト(Firebase は要らない)。ファイル名に .test. を付けないのは、アプリの vitest に拾わせないため
```

emulator で試すときは、`FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 FIREBASE_STORAGE_EMULATOR_HOST=127.0.0.1:9199` を付けて実行する。
