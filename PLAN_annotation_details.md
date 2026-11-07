# 実装プラン：辺ラベルとアイテム/辺の詳細表示機能

## 現状分析
- TAnnotationには`custom`フィールドがあり、`is_clickable`をサポート済み
- LineAnnotには`onClick`ハンドラがありますが、現在`is_clickable = false`で無効化されている（LineAnnot.tsx:186-187）
- アイテムの編集は`EditKozaneDialog`で実装済み（`clicked_target`を使用）

## Phase 1: 辺（Annotation）へのラベル表示機能
**目的**: 辺にテキストラベルを表示できるようにする

### 1. TAnnotationの型定義拡張
**ファイル**: `src/Global/TAnnotation.ts`
- `label: String.optional()`を`custom`フィールドに追加

### 2. ラベル表示コンポーネント作成
**ファイル**: `src/Canvas/Annotation/AnnotationLabel.tsx`
- SVG `<text>`エレメントでラベルを線の中央に表示
- 背景を半透明の矩形で囲む（可読性向上）

### 3. LineAnnotにラベル表示を統合
**ファイル**: `src/Canvas/Annotation/LineAnnot.tsx`
- `a.custom?.label`が存在する場合、中点にラベルを配置
- ラベルのフォントサイズ、色をカスタマイズ可能にする

---

## Phase 2: 辺の詳細表示ダイアログ
**目的**: 辺をクリックして詳細情報を表示・編集できるようにする

### 4. グローバルステート拡張
**ファイル**: `src/Global/initializeGlobalState.ts`
- `clicked_annotation_index: number | null`を追加（どの辺がクリックされたかを追跡）

### 5. TDialog拡張
**ファイル**: `src/Global/TDialog.ts`
- `"EditAnnotation"`ダイアログタイプを追加

### 6. EditAnnotationDialogコンポーネント作成
**ファイル**: `src/Dialog/EditAnnotationDialog.tsx`
- ラベルテキストの編集
- 線のスタイル変更（太さ、透明度、矢印サイズ）
- 接続先アイテムの表示（クリックでジャンプ）
- 線の削除ボタン

### 7. LineAnnotのクリックハンドラ有効化
**ファイル**: `src/Canvas/Annotation/LineAnnot.tsx`
- `is_clickable`を`true`に変更
- `onClick`で`clicked_annotation_index`を設定し、`EditAnnotation`ダイアログを開く

### 8. App.tsxにダイアログを追加
**ファイル**: `src/App/Edit.tsx`
- EditAnnotationDialogをレンダリング

---

## Phase 3: 辺のコンテキストメニュー
**目的**: 右クリックで辺の操作メニューを表示

### 9. TMenu拡張
**ファイル**: `src/Global/TMenu.ts`
- `"Annotation"`メニュータイプを追加

### 10. AnnotationMenuコンポーネント作成
**ファイル**: `src/Menu/AnnotationMenu.tsx`
- 「ラベル編集」
- 「詳細表示」
- 「スタイル変更」（太くする/細くする、透明度調整）
- 「線を削除」
- 「矢印の向きを反転」

### 11. LineAnnotに右クリックハンドラ追加
**ファイル**: `src/Canvas/Annotation/LineAnnot.tsx`
- `onContextMenu`でAnnotationMenuを開く

---

## Phase 4: アイテム詳細表示の改善
**目的**: Kozane/Groupの詳細情報を表示できるようにする

### 12. ItemDetailDialogコンポーネント作成
**ファイル**: `src/Dialog/ItemDetailDialog.tsx`
- アイテムの種類（kozane/group/scrapbox/gyazo）
- 位置情報（x, y座標）
- スケール
- カスタムスタイル
- 所属グループの階層パス
- 接続されている線の一覧（クリックで該当線にフォーカス）
- 編集ボタン（既存のEditKozaneDialog等を開く）

### 13. TDialog拡張
**ファイル**: `src/Global/TDialog.ts`
- `"ItemDetail"`ダイアログタイプを追加

### 14. 各メニューに「詳細表示」項目を追加
**ファイル**:
- `src/Menu/KozaneMenu.tsx`
- `src/Menu/GroupMenu.tsx`
- `src/Menu/ScrapboxMenu.tsx`
- `src/Menu/GyazoMenu.tsx`

### 15. API関数の追加
**ファイル**: `src/API/`
- `get_annotation.ts` - 辺情報を取得
- `update_annotation.ts` - 辺を更新
- `add_annotation_label.ts` - ラベルを追加

---

## Phase 5: テストとドキュメント

### 16. Cypressテスト追加
**ファイル**: `cypress/e2e/annotation_label.cy.ts`
- ラベル付き辺の作成
- 辺のクリック→ダイアログ表示
- ラベル編集

### 17. CLAUDE.md更新
- 新機能の説明を追加

---

## 実装順序の推奨

1. **Phase 1** → 基礎となるラベル表示機能
2. **Phase 2** → 辺の詳細表示（最重要機能）
3. **Phase 4** → アイテム詳細表示（並行して実装可能）
4. **Phase 3** → コンテキストメニュー（UX向上）
5. **Phase 5** → テストとドキュメント

---

## 技術的な考慮事項

### ラベルの配置
- 2点間の線：中点に配置
- 多点間の線（star型）：中心点の近くに配置（重ならないように）

### クリック可能領域の拡大
- 線の実際の太さより広いクリック領域を設定（UX向上）
- 透明な太い線を背後に配置してクリック判定に使用

### パフォーマンス
- ラベルが多数ある場合、viewport外のラベルは非表示にする最適化を検討

### データ互換性
- `label`フィールドはoptionalなので、既存データとの後方互換性あり
- Python APIでもラベル付き辺を作成できるように`kozaneba.py`も更新

### FEEDBACK by nishio

- BUG: ラベルの後ろの半透明バックグラウンドが日本語の場合実際のラベルより小さい、英語の場合実際より大きい
- FEATURE: 矢印のサイズがダイアログで編集できるがそもそもlineに矢印がない、arrow headの編集が先にあり、arrow headがある時のみにするべきだ
- "辺を右クリックしてメニューが表示されるか" 左クリックと右クリック両方あるのは混乱する、edit annotation dialogにまとめていいと思う
- ダイアログから線の太さが変更できない(arrow sizeとstroke widthを混同？)
