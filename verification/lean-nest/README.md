# Lean で入れ子（group）の不変条件を確かめる

Kozaneba の itemStore / drawOrder / group.items が作る木が、操作の後も崩れないことを Lean 4 で確かめた記録です。3 つのことをしています。

- **証明**：盤面の大きさを問わず、各操作が不変条件を保つことを示す（`Nest/Proofs.lean`、`Nest/ProofsFixed.lean`。`sorry` はありません）。
- **全数検査**：id が 4 個以下のすべての正しい盤面で、コードの手順どおりに各操作を走らせ、崩れるかを数える（`Nest/Check.lean`）。
- **読み込み時の修復の全数検査**：#139 の `repair_nest` を、壊れた盤面（重複・ぶら下がり・孤児・循環）を含むすべての盤面（id 4 個以下、列の長さに上限あり）に当て、結果が必ず不変条件を満たすことなどを確かめる（`Nest/Repair.lean`、`Nest/Check.lean`）。

写したコードは main の f531c54 と、それを直す 3 つの PR、読み込み時に直す PR です。

- [#135](https://github.com/nishio/kozaneba/pull/135) `ai/replace-multiple-kozane-orphan`（03c5591）：kozane を複数行に編集すると、元の kozane が itemStore に孤児として残る
- [#136](https://github.com/nishio/kozaneba/pull/136) `ai/drop-descendant-guard`（8467dd1）：group を自分自身や子孫に drop すると循環ができる
- [#137](https://github.com/nishio/kozaneba/pull/137) `ai/empty-untitled-group-cleanup`（bd45a9b）：空で題の無い group が、1 段上より上や削除の後に残る
- [#139](https://github.com/nishio/kozaneba/pull/139) `ai/repair-nest-on-load`（01aea5f）：Firestore の doc・下書き・backup・貼り付けた JSON を読むときに、壊れた入れ子を直す（`repair_nest`）

#135 は 2026-11-24 に main に入りました（7bba377）。#136 の今の head（aa1f778）は 8467dd1 に main を merge しただけで、写した部分は変わっていません。

CI（`.github/workflows/lean.yml`）で、PR と main への push のたびに build と全数検査が走ります（下の「CI」）。

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

## 読み込み時の修復（#139 の `repair_nest`）

### モデル

`Nest/Repair.lean` の `repairNest` が、`src/utils/repair_nest.ts`（01aea5f）を手順どおりに写したものです。

| コード | モデル |
|---|---|
| 規則 1：`keep_children` と `visit` の深さ優先（`visited` は Set） | 相互再帰の `keepChildren` / `visit`（`visited` は List、深さは燃料で止める） |
| `has(id)`（itemStore の own key） | `present`（`store x ≠ none`） |
| `is_group(item)` | `groupItems`（group のときだけ items を見る） |
| 規則 2：`children`・`contained`・`under_orphan`・`kept`（stack で閉包） | `childrenU`・`contained`・`closure`（集合として同じ） |
| 規則 3：`rest`（`sort()`）・`holder`（最初に見つけた group）・道をたどって循環を見つけ、最小の id を drawOrder に push して `visit` | `rest`（自然数の順）・`holder`（`find?`）・`findCycle`・`foldl min` |
| 何も直さなければ入力と `null` を返す | `report = none` のとき盤面は入力のまま |

捨てたものは次のとおりです。

- 規則 4（線）。線はモデルに無いので、消したアイテムへの線の扱いは #139 の vitest に頼っています。
- `position`。規則 3 で drawOrder に戻したアイテムの位置は確かめていません。
- id の順。コードは文字列の `sort()`、モデルは自然数の順です。全数検査の id は 1 桁なので同じです。
- 型の崩れ（`null` のアイテム、配列でない items、文字列でない id）。コードは group でないものとして扱います。モデルの盤面にはありません。
- group でないものが items を持つ盤面。コードはその items を見ないので、修復しても不変条件の `leaf` は直りません。入力の `leaf` は前提です。

### 確かめたこと

壊れた盤面は、id `0..n-1` の種類（無い・kozane・group）と、drawOrder と各 group の items を「長さ `L` 以下の、`0..n-1` の任意の列」にしたものすべてです。`check 4` では `(n, L)` が `(1, 5)`・`(2, 4)`・`(3, 3)`・`(4, 2)` で、合わせて 8,873,988 個です（1 分程度に収めるため、id 4 個では列を 2 つまでに絞りました）。題の有無は修復に関係しないので、ここの group は無題だけです。題のある group を含む正しい盤面 6,311 個にも、別に当てました。

それぞれの盤面で、修復の結果を次のことと比べます。比べる側は、コードの手順とは別に素直な定義で計算します。

1. 結果は不変条件を満たす（`wfB`）。
2. 入力が正しければ、結果は入力のまま。報告（Sentry）が出ないのは、入力が正しいときに限る。
3. 消えるのは「消してよいもの」のうち「残すもの」でないものちょうど。
   - 孤児の根：itemStore にあるが、drawOrder にもどの group の items にも無いもの。
   - 消してよいもの：孤児の根から、drawOrder から届かないものだけをたどって届くもの。
   - 残すもの：drawOrder から届かず、消してよいものでもないもの（届かない循環とその中身）と、そこから届くもの。孤児の group と残す循環が同じアイテムを持つときは、そのアイテムは残す。
   - drawOrder から届くものは消えない。
4. 消えないものは、種類と題が変わらない（変わるのは items だけ）。
5. 燃料が尽きない。

### 結果

`check 4` の結果です。

| 盤面 | 個数 | 正しい盤面 | 結果が崩れた | 正しい盤面を変えた | 報告が合わない | 消してはいけないものを消した | 消してよいものを残した |
|---|---:|---:|---:|---:|---:|---:|---:|
| 正しい盤面（id ≤ 4、題の有無を含む） | 6,311 | 6,311 | 0 | 0 | 0 | 0 | 0 |
| 壊れた盤面を含む全部（id 1 個、列の長さ ≤ 5） | 48 | 3 | 0 | 0 | 0 | 0 | 0 |
| 壊れた盤面を含む全部（id 2 個、列の長さ ≤ 4） | 33,759 | 17 | 0 | 0 | 0 | 0 | 0 |
| 壊れた盤面を含む全部（id 3 個、列の長さ ≤ 3） | 2,963,520 | 175 | 0 | 0 | 0 | 0 | 0 |
| 壊れた盤面を含む全部（id 4 個、列の長さ ≤ 2） | 5,876,661 | 1,425 | 0 | 0 | 0 | 0 | 0 |

反例はありません。「消えないものの中身が変わった」と「燃料切れ」もすべて 0 件です。

試した壊れ方の内訳です（1 つの盤面が複数に数えられます）。

| 盤面 | ぶら下がり | 重複 | 孤児 | 届かない循環 | 孤児と残す循環が共有 | drawOrder から届く循環 |
|---|---:|---:|---:|---:|---:|---:|
| id 1 個、列の長さ ≤ 5 | 5 | 37 | 2 | 5 | 0 | 25 |
| id 2 個、列の長さ ≤ 4 | 1,954 | 33,402 | 416 | 2,480 | 0 | 31,056 |
| id 3 個、列の長さ ≤ 3 | 195,099 | 2,953,281 | 206,288 | 393,939 | 720 | 2,783,970 |
| id 4 個、列の長さ ≤ 2 | 811,860 | 5,790,912 | 2,243,096 | 1,583,736 | 34,944 | 4,899,920 |

検査が間違いを見分けられることも確かめました（`check 3`。どれも commit していません）。

- 01aea5f の前（a332d67）と同じく、孤児の子孫を、残す循環が持っていても消すように崩すと、id 3 個の 43,875 個のうち 96 個で「無い id を指す」が出ます。例：`drawOrder=[]`、`0` = kozane、`1` = group `[0]`、`2` = group `[0, 2]`。`1` は孤児、`2` は自分を持つ循環。`0` を消すと、戻した `2` の items に `0` が残る。96 個は「孤児と残す循環が共有」の盤面の数とちょうど同じです。
- 規則 3 で drawOrder に戻さないように崩すと、届かない循環のある盤面がすべて崩れます（id 3 個で 11,538 個）。
- 規則 1 で重複を外さないように崩すと、id 3 個で 40,194 個が崩れ、18,138 個で「報告が合わない」が出ます。

### 一般の証明をしなかった理由

「修復の結果は不変条件を満たす」「正しい盤面は修復で変わらない」の、盤面の大きさを問わない証明はしていません。全数検査だけです。

修復は、`visited` を持ち回る相互再帰の深さ優先と、閉包 2 つ、`holder` をたどる循環探しからできています。証明には、深さ優先についての不変条件（どの列も 1 回だけ処理する、`visited` に入れた順が rank になる、`visited` に入れたものはちょうど 1 回だけ残す、燃料が足りる）と、規則 3 の「残ったものには必ず `holder` があり、たどると循環に着き、そこから `visit` すると全部に届く」を、Mathlib 無しで List の上に積む必要があります。見積もりでは今の証明（`Proofs.lean` と `ProofsFixed.lean` で約 1,200 行）より大きくなります。修復は読み込みのときに一度通す安全網で、同じことは上の全数検査（8,873,988 個、そのうち 01aea5f で直した共有の形が 35,664 個）で確かめているので、今回は見送りました。

そのため `Axioms.lean` に足した定理はありません。

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
.lake/build/bin/check 4       # 全数検査（id 4 個以下。手元の 8 コアの aarch64 で約 50 秒）
.lake/build/bin/check 3       # 小さく試すとき（約 2 秒）
lake env lean Axioms.lean     # 各定理が使う公理を表示する
```

`check` は操作ごと・版ごと・drawOrder ごとに thread を分けて並べて走らせます（1 thread なら約 3 分）。修正後の版・修復・突き合わせのどれかで崩れたもの（反例）が 1 つでもあるとき、または修正前の版で出るはずの反例（`onGroupMouseUp` の 2 つと `replace_multiple_kozane`）が出なくなったとき、`FAILED` と出して 1 で終わります。

`check 5` は盤面の数が急に増えるので、試していません。

## CI

`.github/workflows/lean.yml` の `Lean nest invariants` が、すべての PR と main への push で走ります。required check にはしていません（branch protection は repo の設定で決めます）。

1. **モデルとコードのずれ**：`modeled-sources.txt` に、モデルに写したコードのファイルと、写した版の blob を並べてあります。今のファイルの blob がその中に無いと warning を出します。失敗にはしません。
2. elan を入れ（公式の `elan-init.sh`）、`lean-toolchain` の toolchain を使います。`~/.elan` と `.lake` は `actions/cache` で持ち越します。
3. `lake build`。証明が崩れていれば失敗します。`declaration uses 'sorry'` が出ても失敗にします。
4. `lake env lean Axioms.lean`。`sorryAx` が出たら失敗にします。
5. `.lake/build/bin/check 4`。上の「走らせ方」の条件で失敗します。表は job の summary に出ます。

paths は絞っていません。モデルは手で写したものなので、`src` を変えても検査の結果は変わりません。それでも毎回走らせるのは、1 の warning で「写したファイルが変わったので、モデルが古いかもしれない」と PR の上で気づけるようにするためです。木を変えない変更（コメントや位置の計算）でも warning は出ます。そのときは中身を見て、木の形に関係なければ `modeled-sources.txt` に今の blob を足します。

### モデルとコードのずれを直すとき

モデルを写し直したら、その版の blob を `modeled-sources.txt` に足します。

```sh
git rev-parse <commit>:<path>   # その版の blob。「path blob 版」の形で 1 行足す
```

#136 と #137 は、どちらも `drag_drop_item_into_group.ts` を変えます。2 つ目を merge すると、その blob はどちらの版とも違うので warning が出ます。merge した形が「3 つとも」の欄で仮定した形（冒頭は #136 の子孫ガード、前の親の片付けは #137 の helper）なら、その blob を足してください。

## ファイル

| ファイル | 中身 |
|---|---|
| `Nest/Model.lean` | 盤面・不変条件・操作のモデル |
| `Nest/Proofs.lean` | main のコードの操作が不変条件を保つ証明 |
| `Nest/ProofsFixed.lean` | 修正後（#135・#137、#136 のガードを前提にしたもの）の証明 |
| `Nest/Counterexamples.lean` | 反例の定理 |
| `Nest/Repair.lean` | #139 の `repair_nest` の写し |
| `Nest/Check.lean` | コードの手順どおりの全数検査（修正前と修正後を並べる）と、壊れた盤面を含む修復の全数検査 |
| `Main.lean` | `check` の入口 |
| `Axioms.lean` | `#print axioms` |
| `modeled-sources.txt` | モデルに写したコードのファイルと、写した版の blob（CI の warning に使う） |
| `../../.github/workflows/lean.yml` | CI |
