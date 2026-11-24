/-!
# Kozaneba の入れ子（group / nest）のモデル

本体 `nishio/kozaneba` の f531c54 を写した。末尾の `addKozane`・`replaceFixed`・`cleanupChain` は
修正 PR #135 / #137 の後の形。位置（`position`）・`scale`・`custom` は捨て、
木の形を変える部分だけを残す。

* `itemStore` → `store : ItemId → Option Node`（`none` は itemStore に無い）
* `drawOrder` → `roots`
* `TGroupItem.items` → `Node.items`（kozane・scrapbox・gyazo は `isGroup = false` で items を持たない）
* `group.text !== ""` → `Node.titled`
* `remove_item_from(l, x)` = `l.filter(id => id !== x)` → `removeFrom`
* `xs.push(x)` → `xs ++ [x]`

`n` は id の上界（使っている id はすべて `< n`）。
-/

namespace Nest

abbrev ItemId := Nat

structure Node where
  isGroup : Bool
  titled  : Bool
  items   : List ItemId
deriving Repr, DecidableEq

structure Board where
  n     : Nat
  store : ItemId → Option Node
  roots : List ItemId

/-- `l` の中の `y` の個数 -/
def cnt (y : ItemId) : List ItemId → Nat
  | [] => 0
  | x :: xs => (if x = y then 1 else 0) + cnt y xs

/-- `f 0 + … + f (k-1)` -/
def sumTo (f : Nat → Nat) : Nat → Nat
  | 0 => 0
  | k+1 => sumTo f k + f k

/-- `remove_item_from` -/
def removeFrom (l : List ItemId) (x : ItemId) : List ItemId := l.filter (fun z => z != x)

/-- アイテムの居場所。`none` は drawOrder、`some p` は group `p` の items。 -/
abbrev Loc := Option ItemId

namespace Board

def children (s : Board) (p : ItemId) : List ItemId :=
  match s.store p with
  | some nd => nd.items
  | none => []

def isGrp (s : Board) (p : ItemId) : Bool := (s.store p).any (·.isGroup)

/-- `y` が drawOrder と全 group の items に現れる回数 -/
def occ (s : Board) (y : ItemId) : Nat :=
  cnt y s.roots + sumTo (fun p => cnt y (s.children p)) s.n

/-- `x` から子をたどって `y` に着く（`x` 自身を含む） -/
inductive Desc (s : Board) : ItemId → ItemId → Prop
  | refl (x : ItemId) : Desc s x x
  | step {x y z : ItemId} : Desc s x y → z ∈ s.children y → Desc s x z

/-- 守りたい不変条件 -/
structure WF (s : Board) : Prop where
  /-- 使っている id は `n` 未満 -/
  bounded    : ∀ x, s.store x ≠ none → x < s.n
  /-- itemStore にあるものは、drawOrder か どこか 1 つの group にちょうど 1 回だけ現れる
      （0 回 = 見えない孤児、2 回以上 = 重複） -/
  placedOnce : ∀ x, s.store x ≠ none → s.occ x = 1
  /-- itemStore に無い id はどこからも指されない -/
  noDangling : ∀ x, s.store x = none → s.occ x = 0
  /-- group でないものは子を持たない -/
  leaf       : ∀ p, s.isGrp p = false → s.children p = []
  /-- 循環が無い -/
  acyclic    : ∃ rank : ItemId → Nat, ∀ p c, c ∈ s.children p → rank p < rank c

def slot (s : Board) : Loc → List ItemId
  | none => s.roots
  | some p => s.children p

def setItems (s : Board) (p : ItemId) (l : List ItemId) : Board :=
  { s with store := fun q => if q = p then (s.store p).map (fun nd => { nd with items := l }) else s.store q }

def setSlot (s : Board) : Loc → List ItemId → Board
  | none, l => { s with roots := l }
  | some p, l => s.setItems p l

def erase (s : Board) (p : ItemId) : Board :=
  { s with store := fun q => if q = p then none else s.store q }

def put (s : Board) (p : ItemId) (nd : Node) : Board :=
  { s with store := fun q => if q = p then some nd else s.store q }

/-- `loc` から `x` を外す（`remove_item_from`） -/
def detach (s : Board) (loc : Loc) (x : ItemId) : Board := s.setSlot loc (removeFrom (s.slot loc) x)

/-- `loc` の末尾に `x` を足す（`push`） -/
def pushTo (s : Board) (loc : Loc) (x : ItemId) : Board := s.setSlot loc (s.slot loc ++ [x])

/-- `x` を `src` から外して `dst` の末尾に足す。
* `move_front`（`src = dst`。親への再帰呼び出しも同じ形の 1 段）
* `drag_drop_item_into_group` の付け替え部分（`dst = some group_id`）
* `drag_drop_item` の入れ子から出す部分（`src = some parent`, `dst = none`）
* `drag_drop_selection_into_group` の 1 アイテム分（`src = none`, `dst = some group_id`） -/
def moveTo (s : Board) (x : ItemId) (src dst : Loc) : Board := (s.detach src x).pushTo dst x

/-- `remove_item(g, p)`：居場所 `ploc` から外し、itemStore から消す -/
def removeItem (s : Board) (ploc : Loc) (p : ItemId) : Board := (s.detach ploc p).erase p

def isEmptyUntitled (s : Board) (p : ItemId) : Bool :=
  match s.store p with
  | some nd => nd.items.isEmpty && !nd.titled
  | none => false

/-- `if (p.items.length === 0 && p.text === "") remove_item(g, p)` -/
def cleanup (s : Board) (p : ItemId) (ploc : Loc) : Board :=
  if s.isEmptyUntitled p then s.removeItem ploc p else s

/-- `drag_drop_item_into_group(g, delta, x)`。`x` の居場所が `loc`、その親 group の居場所が `ploc`。 -/
def dropIntoGroup (s : Board) (x : ItemId) (loc ploc : Loc) (g : ItemId) : Board :=
  match loc with
  | none => s.moveTo x none (some g)
  | some p => (s.moveTo x (some p) (some g)).cleanup p ploc

/-- `drag_drop_item` で group `p`（居場所 `ploc`）の中の `x` を drawOrder に出す -/
def dropOut (s : Board) (x p : ItemId) (ploc : Loc) : Board :=
  (s.moveTo x (some p) none).cleanup p ploc

/-- `ungroup(g)`：子を `g` の居場所 `gloc` の末尾に移し、題があれば空にして残し、無ければ消す -/
def ungroup (s : Board) (g : ItemId) (gloc : Loc) : Board :=
  let s1 := s.setSlot gloc (s.slot gloc ++ s.children g)
  match s.store g with
  | some nd => if nd.titled then s1.setItems g [] else s1.removeItem gloc g
  | none => s

/-- `make_items_into_new_group(sel, {})`：drawOrder から `sel` を外し、新しい group `gid` を末尾に足す -/
def makeGroup (s : Board) (sel : List ItemId) (gid : ItemId) : Board :=
  let s1 : Board := { s with roots := s.roots.filter (fun z => cnt z sel == 0) ++ [gid] }
  s1.put gid { isGroup := true, titled := false, items := sel }


/-! ## 修正後（PR #135 / #137）の形 -/

/-- 新しい kozane `ks` を itemStore に足す（`create_squared_group` が作る kozane。この時点ではどこにも置かない） -/
def addKozane (s : Board) (ks : List ItemId) : Board :=
  { s with store := fun q => if q ∈ ks then some ⟨false, false, []⟩ else s.store q }

/-- `replace_multiple_kozane`（PR #135 の後、2 行以上のとき）：居場所 `tloc` にいる kozane `t` を、
新しい kozane `ks` を入れた新しい無題 group `gid` に差し替え（`remove_item_from` して末尾に `push`）、
`delete g.itemStore[target_id]` で `t` を消す。 -/
def replaceFixed (s : Board) (t : ItemId) (tloc : Loc) (ks : List ItemId) (gid : ItemId) : Board :=
  let s1 := (s.addKozane ks).put gid ⟨true, false, ks⟩
  (s1.setSlot tloc (removeFrom (s1.slot tloc) t ++ [gid])).erase t

/-- `remove_empty_untitled_groups(g, gid)`（PR #137）：`(p, p の居場所)` の列を下から順に見て、
空で無題なら `remove_item` して次（ふつうは親）へ、そうでなければそこで止まる。
コードでは列は `gid` から drawOrder までの祖先の道。 -/
def cleanupChain (s : Board) : List (ItemId × Loc) → Board
  | [] => s
  | (p, ploc) :: rest => if s.isEmptyUntitled p then (s.removeItem ploc p).cleanupChain rest else s

end Board
end Nest
