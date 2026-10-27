# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリで作業する際のガイダンスを提供します。

## プロジェクト概要

Kozanebaは思考整理のためのデジタル付箋紙ツールです。ユーザーは「kozane（小片）」と呼ばれる付箋を作成し、それらをドラッグ＆ドロップで配置したり、グループ化したり、矢印で接続したりできます。

- **技術スタック**: React 17, TypeScript, Firebase (Firestore, Auth), Material-UI
- **状態管理**: ReactN（Reactのグローバルステート管理ライブラリ）
- **デプロイ**: Netlify
- **型チェック**: runtypes（ランタイム型検証）

## 開発コマンド

### フロントエンド（メインアプリ）
```bash
# 開発サーバーを起動（ポート3000）
npm start

# プロダクションビルド
npm run build

# テストを実行
npm test
```

### Firebase Emulator
```bash
# Firebase Emulatorを起動（Firestore: 8080, Auth: 9099, Functions: 5001）
firebase emulators:start
```

### Cypress E2Eテスト
```bash
# Cypressテストを実行（http://localhost:3000が起動している必要あり）
npx cypress open
```

### Firebase Functions
```bash
cd functions
yarn build    # TypeScriptをビルド
yarn deploy   # Functionsをデプロイ
```

### Python API（kozaneba.py）
```bash
cd python
python kozaneba.py  # Kozanebaデータ構造を操作するためのPython API
```

## アーキテクチャ

### グローバル状態管理（ReactN）

アプリ全体の状態は `src/Global/initializeGlobalState.ts` で定義された `INITIAL_GLOBAL_STATE` で管理されます。

**重要な状態:**
- `itemStore: { [id: string]: TItem }` - すべてのアイテム（kozane、グループ、Gyazo画像、Scrapboxリンク）のマップ
- `drawOrder: TItemId[]` - トップレベルに表示されるアイテムのID配列（描画順序）
- `selected_items: TItemId[]` - 現在選択されているアイテムのID配列
- `annotations: TAnnotation[]` - アイテム間の矢印や線
- `scale, trans_x, trans_y` - キャンバスのズーム・パン状態
- `user: TUser` - Firebase認証ユーザー情報
- `cloud_ba: string` - 現在開いているFirestoreドキュメントID

状態の更新には `updateGlobal()` (immerベース)または `setGlobal()` を使用します。

### データ構造：TItem型システム

`src/Global/TItem.ts` で定義された4種類のアイテムがあります：

1. **TKozaneItem** (`type: "kozane"`) - テキスト付箋
2. **TGroupItem** (`type: "group"`) - 子アイテムを含むグループ
3. **TScrapboxItem** (`type: "scrapbox"`) - Scrapboxページへのリンク
4. **TGyazoItem** (`type: "gyazo"`) - Gyazo画像

すべてのアイテムは `position: [x, y]`, `id: string`, `scale: number` を持ちます。

### ディレクトリ構造とモジュールの役割

- **`src/API/`** - ユーザースクリプト用の公開API（`add_kozane`, `add_arrow`, `get_selected_ids`など）
- **`src/App/`** - ルーティングとメインアプリコンポーネント（URLハッシュベース）
  - `#blank` - テスト用空白キャンバス
  - `#edit=<ba_id>` - 既存のbaを編集
  - `#new` - 新規baを作成
- **`src/Canvas/`** - アイテムのレンダリングとキャンバス描画
- **`src/Cloud/`** - Firestore連携、保存・読み込み処理
  - `FirestoreIO.ts` - Firestoreとの同期ロジック
  - `save.ts` - 状態をFirestoreに保存
  - `set_up_read_subscription.tsx` - リアルタイム同期の購読設定
- **`src/Event/`** - マウスイベント処理、ドラッグ＆ドロップロジック
  - `mouseEventMamager.ts` - グローバルマウスイベント管理
  - `drag_drop_*.ts` - アイテムとグループへのドラッグ＆ドロップ
  - `onKozaneMouseDown.ts`, `onGroupMouseDown.ts` - アイテムごとのマウスハンドラ
- **`src/Global/`** - 型定義とグローバル状態
- **`src/Group/`** - グループの作成・操作
- **`src/Kozane/`** - Kozaneアイテムのコンポーネント
- **`src/Menu/`** - コンテキストメニュー（コピー、削除、グループ化など）
- **`src/Physics/`** - アイテムの物理シミュレーション（反発、ピン留め）
- **`src/dimension/`** - 座標変換、境界ボックス計算（ワールド座標⇔スクリーン座標）
- **`src/Dialog/`** - UIダイアログ（チュートリアル、サインイン、設定など）

### Firebaseデータモデル

**Firestoreコレクション:**
- `map` - 各baのデータ（`itemStore`, `drawOrder`, `annotations`, `title`, `writers`, `anyone_writable`など）
- `key_to_map` - ba IDへのマッピング（レガシー）

**認証:** Firebase Authenticationを使用。匿名ログインとGoogle認証をサポート。

**権限管理:**
- `writers: string[]` - 編集可能なユーザーUID配列
- `anyone_writable: boolean` - 誰でも編集可能かどうか

### 座標系

- **ワールド座標**: アイテムの実際の配置位置（`position: [x, y]`）
- **スクリーン座標**: ブラウザ上のピクセル座標
- 変換関数: `world_to_screen()`, `screen_to_world()` (`src/dimension/world_to_screen.ts`)

### カスタムスタイリング

アイテムには `custom.style: CSSProperties` を設定可能。これにより背景色、枠線、透明度などをカスタマイズできます。

## テスト

### E2Eテスト（Cypress）

- `cypress/e2e/` にテストファイルを配置
- `cy.visit("/#blank")` でテスト用の空白キャンバスを開く
- Fixtureは `cypress/fixtures/` に配置（JSONデータ）

### 単体テスト

- `src/**/*.test.tsx` に配置
- React Testing Libraryを使用

## Annotation（辺）機能

### ラベル表示

辺にテキストラベルを付けることができます：
- `TAnnotation.label` - 辺のラベルテキスト（optional、トップレベル。`custom` の中ではない）
- ラベルは辺の中点に `AnnotationLabel` で表示され、半透明の背景で囲まれます
- 複数行のラベルもサポート（改行で区切る）

### 辺の編集

辺の上に透明な当たり判定用の線（`line-label-hit-*`）が重なっており、操作はそこで受けます：
- **ダブルクリック**: その場でラベルを1行編集（`editing_line_label`、Enterで確定・Escで取消・空にすると削除）
- **右クリック**: `clicked_annotation_index` を設定して `EditAnnotationDialog` を開く

`EditAnnotationDialog` で編集できるもの：
- ラベルテキスト（複数行可）
- 線の太さ（`stroke_width`）
- 透明度（`opacity`）
- 矢印サイズ（`arrow_head_size`、矢印がある時のみ）
- 矢印の向きを反転
- 接続先アイテムの表示
- 辺の削除

## 注意事項

- **状態の不変性**: `updateGlobal()` はimmerを使用するため、直接ミューテート可能。`setGlobal()` は新しいオブジェクトを渡す必要あり。
- **アイテムID**: `create_new_itemid()` で一意なIDを生成。タイムスタンプベース。
- **TypeScriptの厳格モード**: `noUncheckedIndexedAccess: true` が有効なため、配列・オブジェクトアクセス時は必ず存在チェックが必要。
- **ユーザースクリプトAPI**: `src/API/` の関数は `(window as any).API` でブラウザから直接呼び出し可能。ユーザーがカスタムスクリプトを作成するための公開API。
