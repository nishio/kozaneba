import Nest.Model
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

def run (maxN : Nat) : IO Unit := do
  let bs := (List.range (maxN + 1)).flatMap boards
  IO.println s!"正しい盤面: {bs.length} 個（id ≤ {maxN} 個）"
  -- ガードの計算が Desc と一致するか
  let guardMismatch := bs.foldl (fun acc s =>
    acc ++ ((ids s).flatMap fun g => (ids s).filterMap fun t =>
      if isSelfOrDescendantGroup s g t == descB s t g then none
      else some s!"g={g} t={t}: {showBoard s}")) []
  IO.println s!"is_self_or_descendant_group(g,t) と「g は t の子孫か自身」の不一致: {guardMismatch.length} 件"
  for m in guardMismatch.take 3 do IO.println s!"  {m}"
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
  let mut table : List (List Result) := []
  for (cname, fx) in configs do
    IO.println s!"\n========== {cname} =========="
    let rs := (ops fx).map fun (name, cases) => checkOp name bs cases
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

end Nest.Check
