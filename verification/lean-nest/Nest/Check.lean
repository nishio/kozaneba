import Nest.Model
import Nest.Repair
/-!
# 全数検査

id が `N` 個以下のすべての正しい盤面で、各操作をコードの手順どおりに走らせ、
不変条件（`wfB`。`Board.WF` の計算版）が崩れるかを調べる。

コードとの対応で気をつけたこと:
* `find_parent(id)` は state を渡さないと `getGlobal()`、つまり `updateGlobal` の前の盤面を見る。
  `remove_item` の中の `find_parent` もそう。だから「前の盤面」で親を引く。
* `drag_drop_item_into_group` は `target === group` だけを自分で弾く。子孫への drop を弾くのは
  呼び出し元 `onCanvasMouseUp` の `is_self_or_descendant_group` で、`onGroupMouseUp` には無い。
-/
namespace Nest.Check
open Board

def present (s : Board) (x : ItemId) : Bool := (s.store x).isSome
def isGroupB (s : Board) (x : ItemId) : Bool := (s.store x).any (·.isGroup)
def ids (s : Board) : List ItemId := (List.range s.n).filter (present s)

/-- `find_parent`：drawOrder から group をたどり、`items` に `x` を含む group を返す（最後に見つけたもの） -/
def visitFP (s : Board) (x : ItemId) : Nat → ItemId → Loc → Loc
  | 0, _, r => r
  | f+1, id, r =>
    let r := if isGroupB s id && (s.children id).contains x then some id else r
    (s.children id).foldl (fun r c => visitFP s x f c r) r

def findParent (s : Board) (x : ItemId) : Loc :=
  s.roots.foldl (fun r id => visitFP s x (s.n + 1) id r) none

/-- `is_self_or_descendant_group(group_id, target_id)`（`while` の代わりに燃料 n+1） -/
def isSelfOrDescendantGroup (s : Board) (g t : ItemId) : Bool :=
  g == t || go (s.n + 1) (findParent s g)
where go : Nat → Loc → Bool
  | 0, _ => false
  | _, none => false
  | f+1, some p => p == t || go f (findParent s p)

/-- `t` から子をたどって `g` に着くか（`Desc s t g` の計算版） -/
def descB (s : Board) (t g : ItemId) : Bool := go (s.n + 1) [t]
where go : Nat → List ItemId → Bool
  | 0, fr => fr.contains g
  | f+1, fr => fr.contains g || go f (fr.flatMap s.children)

def reach (s : Board) : List ItemId := go (s.n + 1) s.roots
where go : Nat → List ItemId → List ItemId
  | 0, fr => fr
  | f+1, fr => fr ++ go f (fr.flatMap s.children)

/-- `Board.WF` の計算版。`occ = 1` のもとでは「全部 drawOrder から届く」と「循環が無い」は同じ。 -/
def wfB (s : Board) : Bool :=
  let all := s.roots ++ (List.range s.n).flatMap s.children
  let r := reach s
  all.all (· < s.n) &&
  ((List.range (s.n + 4)).all fun x => x < s.n || !present s x) &&
  ((List.range s.n).all fun x => if present s x then s.occ x == 1 else s.occ x == 0) &&
  ((List.range s.n).all fun p => match s.store p with
      | some nd => nd.isGroup || nd.items.isEmpty
      | none => true) &&
  ((List.range s.n).all fun x => !present s x || r.contains x)

/-- 何が崩れたか -/
def diagnose (s : Board) : String :=
  let r := reach s
  let orphans := (ids s).filter fun x => s.occ x == 0
  let dups := (ids s).filter fun x => s.occ x > 1
  let dangling := (List.range s.n).filter fun x => !present s x && s.occ x > 0
  let unreach := (ids s).filter fun x => s.occ x == 1 && !r.contains x
  s!"orphan(itemStore にあるがどこにも置かれていない)={orphans} dup={dups} dangling={dangling} cycle(drawOrder から届かない)={unreach}"

def emptyUntitledGroups (s : Board) : List ItemId :=
  (ids s).filter fun x => isGroupB s x && s.isEmptyUntitled x

def showBoard (s : Board) : String :=
  let item (x : ItemId) : String := match s.store x with
    | some nd => if nd.isGroup then s!"{x}:G{if nd.titled then "t" else "u"}{nd.items}" else s!"{x}:K"
    | none => ""
  s!"drawOrder={s.roots} " ++ " ".intercalate ((ids s).map item)

/-! ## コードの手順どおりの操作 -/

/-- `move_front(id)`（親へ再帰） -/
def moveFront (s : Board) (x : ItemId) : Nat → Board
  | 0 => s
  | f+1 =>
    let parent := findParent s x
    let s' := s.moveTo x parent parent
    match parent with
    | none => s'
    | some p => moveFront s' p f

/-- `remove_item(g, id)`。親は前の盤面 `pre` で引く。 -/
def removeItemC (pre s : Board) (id : ItemId) : Board := s.removeItem (findParent pre id) id

/-- `drag_drop_item(g, delta, x)` -/
def dragDropItem (s : Board) (x : ItemId) : Board :=
  match findParent s x with
  | some p =>
    let s1 := (s.detach (some p) x).pushTo none x
    if s1.isEmptyUntitled p then removeItemC s s1 p else s1
  | none => moveFront s x (s.n + 1)

/-- `drag_drop_item_into_group(g, delta, x)` -/
def dragDropItemIntoGroup (s : Board) (g x : ItemId) : Board :=
  if x == g then dragDropItem s x else
  match findParent s x with
  | some p =>
    let s1 := (s.detach (some p) x).pushTo (some g) x
    if s1.isEmptyUntitled p then removeItemC s s1 p else s1
  | none => (s.detach none x).pushTo (some g) x

/-- `drag_drop_selection_into_group(g, delta)`（選択は drawOrder の部分列） -/
def dragDropSelectionIntoGroup (s : Board) (g : ItemId) (sel : List ItemId) : Board :=
  sel.foldl (fun s id => (s.detach none id).pushTo (some g) id) s

/-- `onCanvasMouseUp` の 1 アイテムの drop：`get_valid_drop_group_id` で弾いてから -/
def canvasDropItem (s : Board) (target : Option ItemId) (x : ItemId) : Board :=
  match target with
  | some g =>
    if isSelfOrDescendantGroup s g x then dragDropItem s x
    else dragDropItemIntoGroup (moveFront s g (s.n + 1)) g x
  | none => dragDropItem s x

/-- `onGroupMouseUp` の 1 アイテムの drop：子孫かどうかを見ない -/
def groupMouseUpDropItem (s : Board) (g x : ItemId) : Board :=
  dragDropItemIntoGroup (moveFront s g (s.n + 1)) g x

/-- `onCanvasMouseUp` の選択の drop：`get_valid_selection_drop_group_id` で弾いてから -/
def canvasDropSelection (s : Board) (g : ItemId) (sel : List ItemId) : Board :=
  if sel.any (fun id => isSelfOrDescendantGroup s g id) then s
  else dragDropSelectionIntoGroup (moveFront s g (s.n + 1)) g sel

/-- `onGroupMouseUp` の選択の drop：弾かない -/
def groupMouseUpDropSelection (s : Board) (g : ItemId) (sel : List ItemId) : Board :=
  dragDropSelectionIntoGroup (moveFront s g (s.n + 1)) g sel

/-- `make_items_into_new_group(selected_items, {})`。新しい id は `n`。 -/
def makeGroupC (s : Board) (sel : List ItemId) : Board :=
  let s := { s with n := s.n + 1 }
  s.makeGroup sel (s.n - 1)

/-- `ungroup(gid)` -/
def ungroupC (s : Board) (g : ItemId) : Board :=
  let parent := findParent s g
  let s1 := s.setSlot parent (s.slot parent ++ s.children g)
  match s.store g with
  | some nd => if nd.titled then s1.setItems g [] else removeItemC s s1 g
  | none => s

/-- `delete_item_from_world(id)`：子を先に消し（子ごとに別の updateGlobal）、自分を消し、親を move_front -/
def deleteItem (s : Board) (x : ItemId) : Nat → Board
  | 0 => s
  | f+1 =>
    let s := (s.children x).foldl (fun s c => deleteItem s c f) s
    let parent := findParent s x
    let s := (s.detach parent x).erase x
    match parent with
    | some p => moveFront s p (s.n + 1)
    | none => s

/-- `replace_multiple_kozane`：対象 `t` を、新しい kozane 2 つを入れた新しい group に差し替える。
`t` を itemStore から消さない（コードのまま）。 -/
def replaceMultipleKozane (s : Board) (t : ItemId) : Board :=
  let k1 := s.n; let k2 := s.n + 1; let gid := s.n + 2
  let s0 : Board := { s with n := s.n + 3 }
  let s1 := ((s0.put k1 ⟨false, false, []⟩).put k2 ⟨false, false, []⟩).put gid ⟨true, false, [k1, k2]⟩
  let parent := findParent s t
  s1.setSlot parent (removeFrom (s1.slot parent) t ++ [gid])

/-- 同じく、`delete g.itemStore[target_id]` を足したもの（PR #135） -/
def replaceMultipleKozaneFixed (s : Board) (t : ItemId) : Board :=
  (replaceMultipleKozane s t).erase t

/-! ## 修正後のコード（PR #135 / #136 / #137）

上の「コードのまま」の定義は残し、修正ごとのフラグで切り替える。フラグがすべて false なら
上の定義そのものを呼ぶ。

* `a`（#135 `ai/replace-multiple-kozane-orphan` 03c5591）：`replace_multiple_kozane` で
  `delete g.itemStore[target_id]`。`clicked_target = ""` と `EditKozaneDialog` の早期 return は木を変えない。
* `b`（#136 `ai/drop-descendant-guard` 8467dd1）：`drag_drop_item_into_group` の冒頭の判定を
  `is_self_or_descendant_group(group_id, target_id)` に広げ、当てはまれば `drag_drop_item` に落とす。
  `drag_drop_selection_into_group` は `get_valid_selection_drop_group_id` が null なら
  `drag_drop_selection`（木を変えない）に落とす。判定は `getGlobal()` なので、`onGroupMouseUp` が
  先に呼ぶ `move_front(group_id)` の後の盤面で引く。
* `c`（#137 `ai/empty-untitled-group-cleanup` bd45a9b）：`remove_empty_untitled_groups(g, gid)` で
  空で無題の group を親へたどって消す。`remove_item` は親を draft で引く。`delete_item_from_world` は
  1 回の update で部分木を消し、親から外した後に helper を呼び、生き残った一番近い group にだけ
  `move_front` を呼ぶ。
-/

structure Fix where
  a : Bool := false
  b : Bool := false
  c : Bool := false
deriving DecidableEq

/-- #137 `remove_empty_untitled_groups(g, gid)`。`g` は draft なので、親も `remove_item` の親も
今の盤面で引く。返り値の 2 つめは生き残った一番近い group（全部消えたら `none`）。 -/
def removeEmptyUntitledGroups (s : Board) (gid : ItemId) : Nat → Board × Option ItemId
  | 0 => (s, some gid)
  | f+1 =>
    match s.store gid with
    | none => (s, none)
    | some nd =>
      if !nd.isGroup || !nd.items.isEmpty || nd.titled then (s, some gid) else
      let parent := findParent s gid
      let s := removeItemC s s gid
      match parent with
      | none => (s, none)
      | some p => removeEmptyUntitledGroups s p f

/-- 前の親 `p` の片付け。`s1` は外した後の draft、`pre` は update の前の盤面。 -/
def cleanupParent (fx : Fix) (pre s1 : Board) (p : ItemId) : Board :=
  if fx.c then (removeEmptyUntitledGroups s1 p (pre.n + 1)).1
  else if s1.isEmptyUntitled p then removeItemC pre s1 p else s1

/-- `drag_drop_item`（#137 で片付けを helper に） -/
def dragDropItemF (fx : Fix) (s : Board) (x : ItemId) : Board :=
  if !fx.c then dragDropItem s x else
  match findParent s x with
  | some p => cleanupParent fx s ((s.detach (some p) x).pushTo none x) p
  | none => moveFront s x (s.n + 1)

/-- `drag_drop_item_into_group`（#136 で子孫ガード、#137 で片付けを helper に） -/
def dragDropItemIntoGroupF (fx : Fix) (s : Board) (g x : ItemId) : Board :=
  if !fx.b && !fx.c then dragDropItemIntoGroup s g x else
  if (if fx.b then isSelfOrDescendantGroup s g x else x == g) then dragDropItemF fx s x else
  match findParent s x with
  | some p => cleanupParent fx s ((s.detach (some p) x).pushTo (some g) x) p
  | none => (s.detach none x).pushTo (some g) x

/-- `drag_drop_selection_into_group`（#136 で、弾くときは `drag_drop_selection`：木は変わらない） -/
def dragDropSelectionIntoGroupF (fx : Fix) (s : Board) (g : ItemId) (sel : List ItemId) : Board :=
  if fx.b && sel.any (fun id => isSelfOrDescendantGroup s g id) then s
  else dragDropSelectionIntoGroup s g sel

def canvasDropItemF (fx : Fix) (s : Board) (target : Option ItemId) (x : ItemId) : Board :=
  match target with
  | some g =>
    if isSelfOrDescendantGroup s g x then dragDropItemF fx s x
    else dragDropItemIntoGroupF fx (moveFront s g (s.n + 1)) g x
  | none => dragDropItemF fx s x

def groupMouseUpDropItemF (fx : Fix) (s : Board) (g x : ItemId) : Board :=
  dragDropItemIntoGroupF fx (moveFront s g (s.n + 1)) g x

def canvasDropSelectionF (fx : Fix) (s : Board) (g : ItemId) (sel : List ItemId) : Board :=
  if sel.any (fun id => isSelfOrDescendantGroup s g id) then s
  else dragDropSelectionIntoGroupF fx (moveFront s g (s.n + 1)) g sel

def groupMouseUpDropSelectionF (fx : Fix) (s : Board) (g : ItemId) (sel : List ItemId) : Board :=
  dragDropSelectionIntoGroupF fx (moveFront s g (s.n + 1)) g sel

/-- `ungroup`（#137 で `remove_item` の親を draft で引く） -/
def ungroupF (fx : Fix) (s : Board) (g : ItemId) : Board :=
  if !fx.c then ungroupC s g else
  let parent := findParent s g
  let s1 := s.setSlot parent (s.slot parent ++ s.children g)
  match s.store g with
  | some nd => if nd.titled then s1.setItems g [] else removeItemC s1 s1 g
  | none => s

/-- #137 `delete_subtree(g, id)`：`id` と中身を itemStore から消す -/
def deleteSubtree (s : Board) (x : ItemId) : Nat → Board
  | 0 => s
  | f+1 =>
    match s.store x with
    | none => s
    | some nd =>
      let s := if nd.isGroup then nd.items.foldl (fun s c => deleteSubtree s c f) s else s
      s.erase x

/-- `delete_item_from_world(id)`（#137：1 回の update、親から外して部分木を消し、helper、
生き残った group にだけ `move_front`） -/
def deleteItemF (fx : Fix) (s : Board) (x : ItemId) : Board :=
  if !fx.c then deleteItem s x (s.n + 1) else
  let parent := findParent s x
  let s1 := deleteSubtree (s.detach parent x) x (s.n + 1)
  match parent with
  | none => s1
  | some p =>
    match removeEmptyUntitledGroups s1 p (s.n + 1) with
    | (s2, some q) => moveFront s2 q (s.n + 1)
    | (s2, none) => s2

def replaceF (fx : Fix) (s : Board) (t : ItemId) : Board :=
  if fx.a then replaceMultipleKozaneFixed s t else replaceMultipleKozane s t

/-! ## 盤面の全列挙 -/

inductive Kind | absent | kozane | groupT | groupU
deriving DecidableEq, Repr

def allLists {α} (opts : List α) : Nat → List (List α)
  | 0 => [[]]
  | k+1 => (allLists opts k).flatMap fun l => opts.map fun o => l ++ [o]

def mkBoard (n : Nat) (ks : List Kind) (ps : List (Option ItemId)) : Board :=
  let kindOf (x : ItemId) := ks.getD x .absent
  let parentOf (x : ItemId) := ps.getD x none
  let kids (p : ItemId) := (List.range n).filter fun c => kindOf c != .absent && parentOf c == some p
  { n := n
    roots := (List.range n).filter fun c => kindOf c != .absent && parentOf c == none
    store := fun x => if x < n then
      match kindOf x with
      | .absent => none
      | .kozane => some ⟨false, false, kids x⟩
      | .groupT => some ⟨true, true, kids x⟩
      | .groupU => some ⟨true, false, kids x⟩
      else none }

/-- id が `n` 個の、正しい盤面すべて（子の並びは id 順） -/
def boards (n : Nat) : List Board :=
  let kss := allLists [Kind.absent, .kozane, .groupT, .groupU] n
  let pss := allLists (none :: (List.range n).map some) n
  kss.flatMap fun ks => pss.filterMap fun ps =>
    -- absent の親は none に揃えて重複を減らす
    if (List.range n).any (fun x => ks.getD x .absent == .absent && ps.getD x none != none) then none
    else
      let b := mkBoard n ks ps
      if wfB b then some b else none

def sublists {α} : List α → List (List α)
  | [] => [[]]
  | x :: xs => let r := sublists xs; r.map (x :: ·) ++ r


/-! ## コードの写しと証明のモデルの突き合わせ -/

def eqB (a b : Board) : Bool :=
  a.n == b.n && a.roots == b.roots && (List.range (a.n + 1)).all fun x => a.store x == b.store x

/-- `p` から drawOrder までの祖先の道 `[(p, p の居場所), (親, 親の居場所), …]`（`find_parent` で引く） -/
def ancestorChain (s : Board) (p : ItemId) : Nat → List (ItemId × Loc)
  | 0 => []
  | f+1 =>
    let loc := findParent s p
    (p, loc) :: match loc with
      | none => []
      | some q => ancestorChain s q f

/-- `cleanupChain_wf` の前提：各項は居場所にいる、後ろの項は前の項の id でもその中でもない -/
def chainOK (s : Board) (l : List (ItemId × Loc)) : Bool :=
  (l.all fun (p, loc) => (match loc with
      | none => true
      | some q => present s q && q < s.n) && (s.slot loc).contains p) &&
  go l
where go : List (ItemId × Loc) → Bool
  | [] => true
  | (p, _) :: rest => rest.all (fun (b, bl) => b != p && bl != some p) && go rest

/-! ## 読み込み時の修復（PR #139 `repair_nest`）を、壊れた盤面にも当てる

壊れた盤面は、id `0..n-1` の種類（無い・kozane・group）と、drawOrder と各 group の items を
「長さ `L` 以下の、id の任意の列」にしたものすべて。重複・ぶら下がり（無い id）・孤児・循環を含む。
題の有無は修復に関係しないので、group は無題だけにした（正しい盤面に対する「変えない」は、
題のある group も含む上の `boards` で別に確かめる）。kozane は items を持たない（`leaf` は前提）。

修復の結果に求めること（コードとは別に、素直な定義で計算して比べる）:
* 結果は不変条件を満たす（`wfB`）
* 入力が正しければ結果は入力のまま、そのときに限り報告（Sentry）が出ない
* 孤児の根：itemStore にあるが drawOrder にもどの group の items にも無いもの
* 消してよいもの：孤児の根から、drawOrder から届かないものだけをたどって届くもの
* 残すもの：drawOrder から届かず、消してよいものでもないもの（循環とその中身）と、そこから届くもの
* 消えるのは「消してよいもの」のうち「残すもの」でないものちょうど。drawOrder から届くものは消えない
* 消えないものは、itemStore の中身（種類・題）が変わらない（変わるのは items だけ）
-/

/-- `seeds` から `next` で届くもの（`n + 1` 回まわす素直な不動点） -/
def reachSet (n : Nat) (next : ItemId → List ItemId) (seeds : List ItemId) : List ItemId :=
  go (n + 1) seeds.eraseDups
where go : Nat → List ItemId → List ItemId
  | 0, acc => acc
  | f+1, acc => go f (acc ++ (acc.flatMap next).filter (!acc.contains ·)).eraseDups

def itemsOf (s : Board) (x : ItemId) : List ItemId := (Repair.groupItems s x).getD []

/-- 修復の検査で数えるもの -/
structure RStat where
  tried : Nat := 0
  inputWF : Nat := 0
  /-- 結果が不変条件を満たさない -/
  notWF : Nat := 0
  /-- 正しい盤面を変えた -/
  changedWF : Nat := 0
  /-- 報告の有無が「入力が壊れているか」と合わない -/
  reportMismatch : Nat := 0
  /-- 消してよいもの以外を消した（drawOrder から届くもの、残す循環とその中身を含む） -/
  deletedProtected : Nat := 0
  /-- 消してよいものを残した -/
  keptDeletable : Nat := 0
  /-- 消えないものの種類・題が変わった -/
  nodeChanged : Nat := 0
  fuelOut : Nat := 0
  example? : Option String := none
  -- 壊れ方の内訳（どの壊れ方を試したか）
  withDangling : Nat := 0
  withDup : Nat := 0
  withOrphan : Nat := 0
  withUnreachedCycle : Nat := 0
  withShared : Nat := 0
  withReachedCycle : Nat := 0

def RStat.merge (a b : RStat) : RStat :=
  { tried := a.tried + b.tried, inputWF := a.inputWF + b.inputWF, notWF := a.notWF + b.notWF,
    changedWF := a.changedWF + b.changedWF, reportMismatch := a.reportMismatch + b.reportMismatch,
    deletedProtected := a.deletedProtected + b.deletedProtected,
    keptDeletable := a.keptDeletable + b.keptDeletable, nodeChanged := a.nodeChanged + b.nodeChanged,
    fuelOut := a.fuelOut + b.fuelOut, example? := a.example?.orElse fun _ => b.example?,
    withDangling := a.withDangling + b.withDangling, withDup := a.withDup + b.withDup,
    withOrphan := a.withOrphan + b.withOrphan, withUnreachedCycle := a.withUnreachedCycle + b.withUnreachedCycle,
    withShared := a.withShared + b.withShared, withReachedCycle := a.withReachedCycle + b.withReachedCycle }

def RStat.failures (r : RStat) : Nat :=
  r.notWF + r.changedWF + r.reportMismatch + r.deletedProtected + r.keptDeletable + r.nodeChanged + r.fuelOut

def showAny (s : Board) : String :=
  let item (x : ItemId) : String := match s.store x with
    | some nd => if nd.isGroup then s!"{x}:G{if nd.titled then "t" else "u"}{nd.items}" else s!"{x}:K"
    | none => ""
  s!"drawOrder={s.roots} " ++ " ".intercalate ((ids s).map item)

/-- 1 つの盤面に修復を当てて数える -/
def RStat.add (r : RStat) (s : Board) : RStat :=
  let out := Repair.repairNest s
  let s' := out.board
  let wfIn := wfB s
  let all := ids s
  let reached := reachSet s.n (itemsOf s) (s.roots.filter (present s))
  let unreached := all.filter (!reached.contains ·)
  let withinU (x : ItemId) := (itemsOf s x).filter (unreached.contains ·)
  let placed := s.roots ++ all.flatMap (itemsOf s)
  let orphanRoots := all.filter (!placed.contains ·)
  let deletable := reachSet s.n withinU orphanRoots
  let keepSeeds := unreached.filter (!deletable.contains ·)
  let keep := reachSet s.n withinU keepSeeds
  let gone := all.filter (!present s' ·)
  let shouldGo := deletable.filter (!keep.contains ·)
  let fails : List String :=
    (if wfB s' then [] else ["結果が不変条件を満たさない: " ++ diagnose s']) ++
    (if wfIn && !eqB s s' then ["正しい盤面を変えた"] else []) ++
    (if wfIn != out.report.isNone then ["報告の有無が入力の壊れ方と合わない"] else []) ++
    (if gone.all (shouldGo.contains ·) then [] else [s!"消してよいもの以外を消した: 消えた={gone} 消してよい={shouldGo}"]) ++
    (if shouldGo.all (gone.contains ·) then [] else [s!"消してよいものを残した: 消えた={gone} 消してよい={shouldGo}"]) ++
    (if all.all (fun x => gone.contains x || ((s.store x).map (fun nd => (nd.isGroup, nd.titled)) ==
        (s'.store x).map (fun nd => (nd.isGroup, nd.titled)))) then [] else ["消えないものの種類・題が変わった"]) ++
    (if (out.report.map (·.fuelOut)).getD false then ["燃料が尽きた"] else [])
  let occAll (x : ItemId) := cnt x placed
  let r := { r with
    tried := r.tried + 1
    inputWF := r.inputWF + (if wfIn then 1 else 0)
    notWF := r.notWF + (if wfB s' then 0 else 1)
    changedWF := r.changedWF + (if wfIn && !eqB s s' then 1 else 0)
    reportMismatch := r.reportMismatch + (if wfIn != out.report.isNone then 1 else 0)
    deletedProtected := r.deletedProtected + (if gone.all (shouldGo.contains ·) then 0 else 1)
    keptDeletable := r.keptDeletable + (if shouldGo.all (gone.contains ·) then 0 else 1)
    nodeChanged := r.nodeChanged + (if fails.any (·.startsWith "消えないもの") then 1 else 0)
    fuelOut := r.fuelOut + (if fails.contains "燃料が尽きた" then 1 else 0)
    withDangling := r.withDangling + (if placed.any (!present s ·) then 1 else 0)
    withDup := r.withDup + (if all.any (occAll · > 1) then 1 else 0)
    withOrphan := r.withOrphan + (if orphanRoots.isEmpty then 0 else 1)
    withUnreachedCycle := r.withUnreachedCycle + (if keepSeeds.isEmpty then 0 else 1)
    withShared := r.withShared + (if deletable.any (keep.contains ·) then 1 else 0)
    withReachedCycle := r.withReachedCycle +
      (if reached.any (fun x => (itemsOf s x).any fun c => descB s c x) then 1 else 0) }
  if fails.isEmpty then r else
  { r with
    example? := r.example?.orElse fun _ =>
      some s!"前: {showAny s}\n      後: {showAny s'}\n      {fails}" }

/-- 長さ `L` 以下の、`0..n-1` の任意の列 -/
def listsUpTo (n L : Nat) : List (List ItemId) :=
  (List.range (L + 1)).flatMap (allLists (List.range n))

/-- id `0..n-1` の種類と items のすべての組（drawOrder は別）。`none` は itemStore に無い。 -/
def storesOf (n L : Nat) : List (List (Option Node)) :=
  let opts : List (Option Node) :=
    none :: some ⟨false, false, []⟩ :: (listsUpTo n L).map fun l => some ⟨true, false, l⟩
  allLists opts n

def boardOf (n : Nat) (roots : List ItemId) (nodes : Array (Option Node)) : Board :=
  { n, roots, store := fun x => nodes.getD x none }

/-- 壊れた盤面を含むすべてに修復を当てる。drawOrder ごとに Task に分ける。 -/
def checkRepairBroken (n L : Nat) : IO RStat := do
  -- `Task.spawn` に関数で渡す（`IO.asTask (return …)` だと計算が外に出され、並ばない）。
  -- 盤面の列は Task ごとに作る（Task の間で共有すると参照カウントが atomic になって遅い）。
  let tasks := (listsUpTo n L).map fun roots => Task.spawn (prio := .dedicated) fun _ =>
    (storesOf n L).foldl (fun r nodes => r.add (boardOf n roots nodes.toArray)) ({} : RStat)
  return tasks.foldl (fun acc t => acc.merge t.get) {}

/-! ## 実行 -/

structure Result where
  name : String
  tried : Nat := 0
  broken : Nat := 0
  example? : Option String := none
  newEmptyUntitled : Nat := 0

def Result.add (r : Result) (before after : Board) (label : String) : Result :=
  let r := { r with tried := r.tried + 1 }
  let r := if emptyUntitledGroups before == [] && emptyUntitledGroups after != [] then
    { r with newEmptyUntitled := r.newEmptyUntitled + 1 } else r
  if wfB after then r else
  { r with broken := r.broken + 1,
           example? := r.example?.orElse fun _ =>
             some s!"{label}\n      前: {showBoard before}\n      後: {showBoard after}\n      {diagnose after}" }

def checkOp (name : String) (bs : List Board)
    (cases : Board → List (String × Board)) : Result :=
  bs.foldl (fun r b => (cases b).foldl (fun r (l, a) => r.add b a l) r) { name }

/-- 操作の一覧。`fx` が全部 false のときは「コードのまま」の定義を呼ぶ。 -/
def ops (fx : Fix) : List (String × (Board → List (String × Board))) :=
  let groupsOf (s : Board) := (ids s).filter (isGroupB s)
  let selsOf (s : Board) := (sublists s.roots).filter (· ≠ [])
  [ ("move_front", fun s => (ids s).map fun x =>
      (s!"move_front({x})", moveFront s x (s.n + 1))),
    ("onCanvasMouseUp: 1 アイテムを drop（ガードあり）", fun s =>
      (ids s).flatMap fun x => (none :: (groupsOf s).map some).map fun t =>
        (s!"drop {x} on {t}", if fx == {} then canvasDropItem s t x else canvasDropItemF fx s t x)),
    ("onCanvasMouseUp: 選択を drop（ガードあり）", fun s =>
      (groupsOf s).flatMap fun g => (selsOf s).map fun sel =>
        (s!"drop selection {sel} on {g}",
          if fx == {} then canvasDropSelection s g sel else canvasDropSelectionF fx s g sel)),
    ("make_items_into_new_group", fun s => (selsOf s).map fun sel =>
      (s!"make group of {sel}", makeGroupC s sel)),
    ("ungroup", fun s => (groupsOf s).map fun g =>
      (s!"ungroup({g})", ungroupF fx s g)),
    ("delete_item_from_world", fun s => (ids s).map fun x =>
      (s!"delete({x})", deleteItemF fx s x)),
    ("選択を削除（delete_item_from_world を順に）", fun s => (selsOf s).map fun sel =>
      (s!"delete selection {sel}", sel.foldl (fun s x => deleteItemF fx s x) s)),
    ("onGroupMouseUp: 1 アイテムを drop（呼び出し元にガードなし）", fun s =>
      (ids s).flatMap fun x => (groupsOf s).map fun g =>
        (s!"drop {x} on {g}", if fx == {} then groupMouseUpDropItem s g x else groupMouseUpDropItemF fx s g x)),
    ("onGroupMouseUp: 選択を drop（呼び出し元にガードなし）", fun s =>
      (groupsOf s).flatMap fun g => (selsOf s).map fun sel =>
        (s!"drop selection {sel} on {g}",
          if fx == {} then groupMouseUpDropSelection s g sel else groupMouseUpDropSelectionF fx s g sel)),
    ("replace_multiple_kozane（kozane を 2 行に編集）", fun s =>
      ((ids s).filter (fun x => !isGroupB s x)).map fun t =>
        (s!"edit {t} into 2 lines", replaceF fx s t)) ]

def configs : List (String × Fix) :=
  [ ("修正前（f531c54 のまま）", {}),
    ("#135 のみ（replace で target を消す）", { a := true }),
    ("#136 のみ（drop の関数に子孫ガード）", { b := true }),
    ("#137 のみ（空の無題 group を連鎖で片付け）", { c := true }),
    ("#135 + #136 + #137", { a := true, b := true, c := true }) ]

/-- 修復を当てる壊れた盤面の範囲 `(id の個数, 列の長さの上限)`。`check 4` で
`(1,5) (2,4) (3,3) (4,2)`。 -/
def repairRanges (maxN : Nat) : List (Nat × Nat) :=
  (List.range maxN).map fun k => (k + 1, maxN + 1 - k)

/-- 修正前の版で、反例が出るはずの操作（出なくなったら検査が鈍ったので失敗にする） -/
def expectedBroken : List String :=
  [ "onGroupMouseUp: 1 アイテムを drop（呼び出し元にガードなし）",
    "onGroupMouseUp: 選択を drop（呼び出し元にガードなし）",
    "replace_multiple_kozane（kozane を 2 行に編集）" ]

def printRStat (label : String) (r : RStat) : IO Unit := do
  IO.println s!"\n■ {label}: {r.tried} 個（うち正しい盤面 {r.inputWF}）"
  IO.println s!"    結果が不変条件を満たさない {r.notWF}、正しい盤面を変えた {r.changedWF}、報告の有無が合わない {r.reportMismatch}"
  IO.println s!"    消してよいもの以外を消した {r.deletedProtected}、消してよいものを残した {r.keptDeletable}、消えないものの中身が変わった {r.nodeChanged}、燃料切れ {r.fuelOut}"
  IO.println s!"    試した壊れ方: ぶら下がり {r.withDangling}、重複 {r.withDup}、孤児 {r.withOrphan}、届かない循環 {r.withUnreachedCycle}、孤児と残す循環が共有 {r.withShared}、drawOrder から届く循環 {r.withReachedCycle}"
  if let some e := r.example? then IO.println s!"    例: {e}"

/-- 全数検査。修正後の版・修復・突き合わせで 1 件でも崩れたら 1 を返す。 -/
def run (maxN : Nat) : IO UInt32 := do
  let mut failed : List String := []
  let bs := (List.range (maxN + 1)).flatMap boards
  IO.println s!"正しい盤面: {bs.length} 個（id ≤ {maxN} 個）"
  -- ガードの計算が Desc と一致するか
  let guardMismatch := bs.foldl (fun acc s =>
    acc ++ ((ids s).flatMap fun g => (ids s).filterMap fun t =>
      if isSelfOrDescendantGroup s g t == descB s t g then none
      else some s!"g={g} t={t}: {showBoard s}")) []
  IO.println s!"is_self_or_descendant_group(g,t) と「g は t の子孫か自身」の不一致: {guardMismatch.length} 件"
  for m in guardMismatch.take 3 do IO.println s!"  {m}"
  if guardMismatch.length > 0 then failed := failed ++ ["is_self_or_descendant_group"]
  -- remove_empty_untitled_groups の写しと、証明で使う cleanupChain（祖先の道）の突き合わせ。
  -- x を親 p から外した直後の盤面（片付けを呼ぶ時点）で比べる。
  let (chainTried, chainMismatch, chainBad) := bs.foldl (fun (acc : Nat × Nat × Nat) s =>
    (ids s).foldl (fun (t, m, bad) x => match findParent s x with
      | none => (t, m, bad)
      | some p =>
        let s1 := (s.detach (some p) x).pushTo none x
        let l := ancestorChain s1 p (s1.n + 1)
        let m := if eqB (removeEmptyUntitledGroups s1 p (s1.n + 1)).1 (s1.cleanupChain l) then m else m + 1
        let bad := if chainOK s1 l then bad else bad + 1
        (t + 1, m, bad)) acc) (0, 0, 0)
  IO.println s!"remove_empty_untitled_groups の写しと cleanupChain(祖先の道) の不一致: {chainMismatch} 件 / {chainTried} 通り、道が cleanupChain_wf の前提を満たさない: {chainBad} 件"
  if chainMismatch + chainBad > 0 then failed := failed ++ ["cleanupChain の突き合わせ"]
  -- 操作ごと・版ごとに Task に分ける
  let tasks := configs.map fun (_, fx) => (ops fx).map fun (name, cases) =>
    Task.spawn (prio := .dedicated) fun _ =>
      checkOp name ((List.range (maxN + 1)).flatMap boards) cases
  let mut table : List (List Result) := []
  for ((cname, _), ts) in configs.zip tasks do
    IO.println s!"\n========== {cname} =========="
    let rs := ts.map Task.get
    for r in rs do
      IO.println s!"\n■ {r.name}: {r.tried} 通り、崩れた {r.broken}、空の無題 group が新しくできた {r.newEmptyUntitled}"
      if let some e := r.example? then IO.println s!"    例: {e}"
    table := table ++ [rs]
  -- まとめの表（各欄は「崩れた / 空の無題 group が新しくできた」）
  IO.println "\n========== まとめ（崩れた / 空の無題 group が新しくできた） =========="
  IO.println ("| 操作 | 通り | " ++ " | ".intercalate (configs.map (·.1)) ++ " |")
  IO.println ("|---|---:|" ++ String.join (configs.map fun _ => "---:|"))
  let names := (ops {}).map (·.1)
  for (name, i) in names.zipIdx do
    let cells := table.map fun rs => match rs[i]? with
      | some r => s!"{r.broken} / {r.newEmptyUntitled}"
      | none => "?"
    let tried := match table.head? >>= (·[i]?) with
      | some r => toString r.tried
      | none => "?"
    IO.println ("| " ++ name ++ " | " ++ tried ++ " | " ++ " | ".intercalate cells ++ " |")
  -- 修正後（3 つとも）の版で崩れたら失敗。修正前の反例は期待どおり（出なくなったら失敗）。
  for r in (table.getLast?.getD []) do
    if r.broken > 0 then failed := failed ++ [s!"修正後の {r.name} が崩れた"]
  if maxN ≥ 2 then
    for r in (table.head?.getD []) do
      if expectedBroken.contains r.name && r.broken == 0 then
        failed := failed ++ [s!"修正前の {r.name} で反例が出なくなった"]
  -- 読み込み時の修復（PR #139）
  IO.println "\n========== 読み込み時の修復（PR #139 repair_nest） =========="
  let rWF := bs.foldl RStat.add {}
  printRStat s!"正しい盤面（題の有無を含む、id ≤ {maxN} 個）" rWF
  let mut rrows : List (String × RStat) := [(s!"正しい盤面（id ≤ {maxN}）", rWF)]
  for (n, L) in repairRanges maxN do
    let r ← checkRepairBroken n L
    printRStat s!"壊れた盤面を含む全部（id {n} 個、列の長さ ≤ {L}）" r
    rrows := rrows ++ [(s!"壊れた盤面を含む全部（id {n} 個、列の長さ ≤ {L}）", r)]
  IO.println "\n| 盤面 | 個数 | 正しい盤面 | 結果が崩れた | 正しい盤面を変えた | 報告が合わない | 消してはいけないものを消した | 消してよいものを残した |"
  IO.println "|---|---:|---:|---:|---:|---:|---:|---:|"
  for (label, r) in rrows do
    IO.println s!"| {label} | {r.tried} | {r.inputWF} | {r.notWF} | {r.changedWF} | {r.reportMismatch} | {r.deletedProtected} | {r.keptDeletable} |"
    if r.failures > 0 then failed := failed ++ [s!"修復: {label}"]
  IO.println "\n| 盤面 | ぶら下がり | 重複 | 孤児 | 届かない循環 | 孤児と残す循環が共有 | drawOrder から届く循環 |"
  IO.println "|---|---:|---:|---:|---:|---:|---:|"
  for (label, r) in rrows do
    IO.println s!"| {label} | {r.withDangling} | {r.withDup} | {r.withOrphan} | {r.withUnreachedCycle} | {r.withShared} | {r.withReachedCycle} |"
  if failed.isEmpty then
    IO.println "\nOK: 修正後の版と修復で、崩れたものはありません"
    return 0
  else
    IO.println s!"\nFAILED: {failed}"
    return 1

end Nest.Check
