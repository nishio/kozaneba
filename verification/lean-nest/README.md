# Lean で入れ子（group）の不変条件を確かめる

Kozaneba の itemStore / drawOrder / group.items が作る木が、操作の後も崩れないことを Lean 4 で確かめた記録です。2 つのことをしています。

- **証明**：盤面の大きさを問わず、各操作が不変条件を保つことを示す（`Nest/Proofs.lean`、`Nest/ProofsFixed.lean`。`sorry` はありません）。
- **全数検査**：id が 4 個以下のすべての正しい盤面で、コードの手順どおりに各操作を走らせ、崩れるかを数える（`Nest/Check.lean`）。

写したコードは main の f531c54 と、それを直す 3 つの PR です。

- [#135](https://github.com/nishio/kozaneba/pull/135) `ai/replace-multiple-kozane-orphan`（03c5591）：kozane を複数行に編集すると、元の kozane が itemStore に孤児として残る
- [#136](https://github.com/nishio/kozaneba/pull/136) `ai/drop-descendant-guard`（8467dd1）：group を自分自身や子孫に drop すると循環ができる
- [#137](https://github.com/nishio/kozaneba/pull/137) `ai/empty-untitled-group-cleanup`（bd45a9b）：空で題の無い group が、1 段上より上や削除の後に残る

この directory は CI では走りません。確かめ直すときは手元で走らせてください（下の「走らせ方」）。

## 何をモデルにしたか

`Nest/Model.lean` にあります。

| コード | モデル |
|---|---|
| `itemStore` | `store : ItemId → Option Node`（`none` は itemStore に無い） |
| `drawOrder` | `roots : List ItemId` |
| `TGroupItem.items` | `Node.items`（kozane・scrapbox・gyazo は `isGroup = false`） |
| `group.text !== ""` | `Node.titled` |
| `remove_item_from(l, x)` | `removeFrom l x`（`filter`） |
| `xs.push(x)` | `xs ++ [x]` |
| id | 自然数。`n` はその上界 |

次のものは捨てました。

- 位置（`position`）・`scale`・`custom`。`normalize_group_position` や `get_position_after_parent_change` は木の形を変えないので、モデルには出てきません。そのため、#137 で避けた「drop 先を target の位置を入れる前に normalize すると target がずれる」問題（K2）は、この検証では確かめていません。
- 線（annotations）。`update_annotation_after_deletion` は木を変えません。
- 全数検査では、子の並びを id 順のものだけにしました。証明は並びを問いません。
- 選択は drawOrder の空でない部分列だけにしました（選択の矩形は最上位のアイテムだけを選ぶため）。

コードとの対応で気をつけたことは次のとおりです。

- `find_parent(id)` に state を渡さないと `getGlobal()`、つまり `updateGlobal` の前の盤面を見ます。main の `remove_item` はそうなので、全数検査では前の盤面で親を引きます。#137 は `remove_item` の親を draft で引くように変えたので、修正後の版は今の盤面で引きます。
- `drag_drop_item_into_group` が自分で弾くのは、main では `target === group` だけです。子孫への drop を弾くのは呼び出し元の `onCanvasMouseUp`（`is_self_or_descendant_group`）で、`onGroupMouseUp` にはありません。どちらの呼び出し元も、先に `move_front(group_id)` を呼びます。
- `move_front(id)` は、id がどこにも無いと drawOrder に push します。#137 が、消えた group を `move_front` に渡さないようにしたのはこのためです。モデルでも同じく push します。

## 不変条件

`Board.WF`（`Nest/Model.lean`）。全数検査では、同じものを計算で確かめる `wfB` を使います。

1. `bounded`：itemStore にある id は `n` 未満
2. `placedOnce`：itemStore の各アイテムは、drawOrder か、どれか 1 つの group.items に、ちょうど 1 回だけ現れる（0 回なら見えない孤児、2 回以上なら重複）
3. `noDangling`：itemStore に無い id はどこからも指されない
4. `leaf`：group 以外は子を持たない
5. `acyclic`：循環が無い（子の rank が親より大きくなる rank がある）

`placedOnce` が成り立つ盤面では、「すべて drawOrder から届く」と「循環が無い」は同じことです。

全数検査では、もう 1 つ「空の無題 group が新しくできた」を数えます。操作の前には空で無題の group が 1 つも無く、操作の後に 1 つ以上あった件数です。不変条件ではありませんが、#137 が直すものです。

## 証明した定理

すべて `Axioms.lean` で `#print axioms` を確かめました。使っている公理は `propext`・`Classical.choice`・`Quot.sound` だけです（`replace_breaks` は `propext`・`Quot.sound` だけ）。

### main のコード（`Nest/Proofs.lean`）

| 定理 | 対応するコード | 前提 |
|---|---|---|
| `moveTo_wf` | アイテムの付け替え 1 回（下の全部の土台） | 行き先が group なら、それが group であり、`x` 自身でも子孫でもない |
| `moveFront_wf` | `move_front` の 1 段 | `x` がその居場所にいる |
| `cleanup_wf` | `if (p.items.length === 0 && p.text === "") remove_item(g, p)` | `p` がその居場所にいる |
| `dropIntoGroup_wf` | `drag_drop_item_into_group` | `onCanvasMouseUp` のガードが通ったこと（`¬ Desc x g`） |
| `dropOut_wf` | `drag_drop_item`（入れ子から drawOrder へ出す） | |
| `selectionIntoGroup_wf` | `drag_drop_selection_into_group` | `get_valid_selection_drop_group_id` が null でないこと |
| `ungroup_wf` | `ungroup` | |
| `makeGroup_wf` | `make_items_into_new_group` | 新しい id が itemStore に無い |

### 修正後のコード（`Nest/ProofsFixed.lean`）

| 定理 | 対応するコード | 前提 |
|---|---|---|
| `replaceFixed_wf` | #135 の後の `replace_multiple_kozane`（2 行以上）：新しい kozane `ks` を入れた新しい group `gid` に差し替え、`delete g.itemStore[target_id]` | target は kozane。`ks` と `gid` は itemStore に無く、重複しない。行の数は問わない |
| `cleanupChain_wf` | #137 の `remove_empty_untitled_groups`：空で無題なら `remove_item` して親へ、を繰り返す | 列の各項 `(p, 居場所)` で `p` はそこにいる。後ろの項は、前の項の id でもその中でもない（祖先の道なら成り立つ） |
| `dropOutChain_wf` | #137 の後の `drag_drop_item` | 同上 |
| `dropIntoGroupChain_wf` | #136 + #137 の後の `drag_drop_item_into_group` | #136 のガードが通ったこと（`¬ Desc x g`）と同上 |

`cleanupChain` は「(group, その居場所) の列」を受け取る形でモデルにしました。コードは `find_parent(current, g)` で親を引きながら上へたどります。全数検査で、コードを写した `removeEmptyUntitledGroups` と、祖先の道を渡した `cleanupChain` の結果が一致すること、その道が `cleanupChain_wf` の前提を満たすことを確かめています（12,720 通りで不一致 0 件、前提を満たさないもの 0 件）。

#137 の `delete_item_from_world`（部分木を 1 回の update で消す）の一般の証明はありません。全数検査だけです。

## 反例（`Nest/Counterexamples.lean`）

| 定理 | 内容 | 直す PR |
|---|---|---|
| `drop_into_own_child_breaks` | `drawOrder=[0]`、`0` = 題のある group `[1]`、`1` = 題のある group `[]`。`drag_drop_item_into_group(1, _, 0)` の付け替えで `drawOrder=[]`、`0.items=[1]`、`1.items=[0]` になり、循環ができる | #136 |
| `drop_into_own_child_still_placed_once` | そのとき、どちらも 1 回ずつ置かれたまま（重複も孤児も無い）なのに drawOrder から届かない | #136 |
| `replace_leaves_orphan` / `replace_breaks` | `drawOrder=[0]`、`0` = kozane。2 行に編集すると、`0` が itemStore に残ったままどこにも置かれない | #135 |

## 全数検査の結果

id が 4 個以下の正しい盤面 6,311 個で、`check 4` の結果です。各欄は「不変条件が崩れた件数 / 空の無題 group が新しくできた件数」です。

| 操作 | 通り | 修正前（f531c54） | #135 のみ | #136 のみ | #137 のみ | #135 + #136 + #137 |
|---|---:|---:|---:|---:|---:|---:|
| move_front | 23,409 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| onCanvasMouseUp: 1 アイテムを drop（ガードあり） | 95,445 | 0 / 762 | 0 / 762 | 0 / 762 | 0 / 0 | 0 / 0 |
| onCanvasMouseUp: 選択を drop（ガードあり） | 50,560 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| make_items_into_new_group | 17,286 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| ungroup | 18,964 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| delete_item_from_world | 23,409 | 0 / 1,936 | 0 / 1,936 | 0 / 1,936 | 0 / 0 | 0 / 0 |
| 選択を削除（delete_item_from_world を順に） | 17,286 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| onGroupMouseUp: 1 アイテムを drop（呼び出し元にガードなし） | 72,036 | 13,016 / 414 | 13,016 / 414 | 0 / 414 | 13,016 / 0 | 0 / 0 |
| onGroupMouseUp: 選択を drop（呼び出し元にガードなし） | 50,560 | 34,762 / 0 | 34,762 / 0 | 0 / 0 | 34,762 / 0 | 0 / 0 |
| replace_multiple_kozane（kozane を 2 行に編集） | 4,445 | 4,445 / 0 | 0 / 0 | 4,445 / 0 | 4,445 / 0 | 0 / 0 |

読み方は次のとおりです。

- 3 つとも入れると、すべての操作で 0 / 0 になります。
- それぞれの PR は、自分が直す欄だけを 0 にし、ほかの欄は変えません。
- #136 だけでは、`onGroupMouseUp` の drop で空の無題 group が残ります（414）。#137 だけでは、`onGroupMouseUp` の drop の循環が残ります。
- 「選択を削除」が修正前から 0 / 0 なのは、選択が最上位のアイテムだけで、親の片付けが起きないためです。

ほかに次の 2 つも確かめています（どれも 0 件）。

- `is_self_or_descendant_group(g, t)` の計算と「`g` は `t` 自身か子孫」（`Desc`）が一致するか
- `remove_empty_untitled_groups` の写しと `cleanupChain` が一致するか（上の「証明した定理」を参照）

検査が間違いを見分けられることも確かめました。#137 の `delete_item_from_world` を、生き残った group ではなく元の親に `move_front` を呼ぶように崩すと、23,409 通りのうち 3,822 通りで「無い id を指す」（drawOrder に消えた group の id が入る）が出ます。この崩した版は commit していません。

## 走らせ方

Lean は elan で入れます。toolchain は `lean-toolchain` に書いた `leanprover/lean4:v4.36.0` が自動で入ります。

```sh
curl https://raw.githubusercontent.com/leanprover/elan/master/elan-init.sh -sSf | sh -s -- -y --default-toolchain none
export PATH=$HOME/.elan/bin:$PATH
```

この directory で次を走らせます。

```sh
cd verification/lean-nest
lake build                    # 証明・反例・検査のプログラムを build する。証明が崩れていればここで失敗する
.lake/build/bin/check 4       # 全数検査（id 4 個以下。手元の aarch64 で約 1 分）
.lake/build/bin/check 3       # 小さく試すとき（約 1 秒）
lake env lean Axioms.lean     # 各定理が使う公理を表示する
```

`check 5` は盤面の数が急に増えるので、試していません。

## ファイル

| ファイル | 中身 |
|---|---|
| `Nest/Model.lean` | 盤面・不変条件・操作のモデル |
| `Nest/Proofs.lean` | main のコードの操作が不変条件を保つ証明 |
| `Nest/ProofsFixed.lean` | 修正後（#135・#137、#136 のガードを前提にしたもの）の証明 |
| `Nest/Counterexamples.lean` | 反例の定理 |
| `Nest/Check.lean` | コードの手順どおりの全数検査（修正前と修正後を並べる） |
| `Main.lean` | `check` の入口 |
| `Axioms.lean` | `#print axioms` |
