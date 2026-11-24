import Nest.Model
/-!
# 読み込み時の修復（PR #139 `repair_nest`）

PR #139（`ai/repair-nest-on-load` 01aea5f）の `src/utils/repair_nest.ts` を、手順どおりに写した。
Firestore の doc・手元の下書き・手元の backup・貼り付けた JSON を読むときに、壊れた入れ子を直す。

* 規則 1：drawOrder から深さ優先でたどる。itemStore に無い id は外す（dangling）。前に見た id は
  2 回目以降の場所から外す（重複と、drawOrder から届く循環）。最初の場所は残す。group でないものの
  items は見ない。
* 規則 2：届かなかったもののうち、届かなかった group のどれの items にも無いもの（孤児の根）を、
  その届かなかった子孫ごと itemStore から消す。ただし、規則 3 の group（届かず、孤児の根の下でも
  ないもの）からも届くものは消さない。
* 規則 3：残った届かないものは、drawOrder から届かない循環の中かその下にある。`holder`（それを
  items に持つ、id が最小の group）を上へたどって循環を見つけ、その中で id が最小のものを
  drawOrder の末尾に足し、そこから規則 1 を続ける。
* 規則 4（線）はモデルに無い（線は捨てている）。

id はコードでは文字列で、`rest` を `sort()`（文字列の順）で並べる。ここでは自然数の順にした。
全数検査の id は 1 桁なので、2 つの順は同じ。

再帰は燃料で止める。燃料が尽きたら `fuelOut` を立てる（全数検査で 0 件であることを確かめる）。
-/
namespace Nest.Repair
open Board

def present (s : Board) (x : ItemId) : Bool := (s.store x).isSome

/-- `is_group(store[id])` のときの items -/
def groupItems (s : Board) (x : ItemId) : Option (List ItemId) :=
  match s.store x with
  | some nd => if nd.isGroup then some nd.items else none
  | none => none

structure St where
  visited  : List ItemId := []
  /-- `new_items`：中身を変えた group と、その新しい items -/
  newItems : List (ItemId × List ItemId) := []
  dangling : Nat := 0
  dup      : Nat := 0
  fuelOut  : Bool := false

mutual
/-- `keep_children(list)`：残す子の列 -/
def keepChildren (s : Board) : Nat → List ItemId → St → List ItemId × St
  | _, [], st => ([], st)
  | f, x :: xs, st =>
    if !present s x then keepChildren s f xs { st with dangling := st.dangling + 1 }
    else if st.visited.contains x then keepChildren s f xs { st with dup := st.dup + 1 }
    else
      let st := visit s f x { st with visited := x :: st.visited }
      let (r, st) := keepChildren s f xs st
      (x :: r, st)
termination_by f l _ => (f, 1, l.length)
/-- `visit(id)`：group なら items を `keep_children` にかけ、変わったら `new_items` に入れる -/
def visit (s : Board) : Nat → ItemId → St → St
  | 0, _, st => { st with fuelOut := true }
  | f+1, x, st =>
    match groupItems s x with
    | some items =>
      let (kept, st) := keepChildren s f items st
      if kept == items then st else { st with newItems := (x, kept) :: st.newItems }
    | none => st
termination_by f _ _ => (f, 0, 0)
end

/-- 集合 `seeds` から `next` で閉じたもの（コードの stack による走査と、集合として同じ） -/
def closure (next : ItemId → List ItemId) : Nat → List ItemId → List ItemId → List ItemId
  | 0, acc, _ => acc
  | _+1, acc, [] => acc
  | f+1, acc, x :: stack =>
    if acc.contains x then closure next (f+1) acc stack
    else closure next f (x :: acc) (next x ++ stack)
termination_by f _ stack => (f, stack.length)

/-- `holder` をたどる：`cur` が道 `path`（逆順）に出たら、その循環を返す -/
def findCycle (holder : ItemId → Option ItemId) : Nat → List ItemId → ItemId → List ItemId
  | 0, path, _ => path
  | f+1, path, cur =>
    if path.contains cur then
      -- path は新しいものが先。cur まで（cur を含む）が循環
      (path.takeWhile (· != cur)) ++ [cur]
    else match holder cur with
      | none => [cur]   -- コードの「理屈が違っていたら holder の無いものを戻す」
      | some h => findCycle holder f (cur :: path) h

structure Report where
  orphans  : Nat
  deleted  : Nat
  dangling : Nat
  dup      : Nat
  cycles   : Nat
  fuelOut  : Bool
deriving Repr, BEq

structure Out where
  board   : Board
  /-- `report`。何も直さなかったときは `none`（コードは入力そのものと null を返す） -/
  report  : Option Report
  deleted : List ItemId

/-- `repair_nest` -/
def repairNest (s : Board) : Out :=
  let fuel := s.n + 1
  let ids := (List.range s.n).filter (present s)
  -- 規則 1
  let (roots1, st) := keepChildren s fuel s.roots {}
  let unreached := ids.filter fun x => !st.visited.contains x
  -- 規則 2
  let childrenU (x : ItemId) : List ItemId :=
    ((groupItems s x).getD []).filter (unreached.contains ·)
  let contained := unreached.flatMap childrenU
  let orphanRoots := unreached.filter fun x => !contained.contains x
  let underOrphan := closure childrenU (fuel * fuel) [] orphanRoots
  let kept := closure childrenU (fuel * fuel) [] (unreached.filter fun x => !underOrphan.contains x)
  let deleted := underOrphan.filter fun x => !kept.contains x
  -- 規則 3（rest は id の順。コードは sort() した文字列の順）
  let rest := unreached.filter fun x => !deleted.contains x
  let holder (c : ItemId) : Option ItemId :=
    rest.find? fun g => ((groupItems s g).getD []).contains c
  let (roots2, st, cycles) := rest.foldl (fun (acc : List ItemId × St × Nat) start =>
    let (roots, st, cycles) := acc
    if st.visited.contains start then acc else
    let cycle := findCycle holder fuel [] start
    let pick := cycle.foldl min (cycle.headD start)
    let st := visit s fuel pick { st with visited := pick :: st.visited }
    (roots ++ [pick], st, cycles + 1)) (roots1, st, 0)
  let changed := roots2 != s.roots || !st.newItems.isEmpty || !deleted.isEmpty
  let store' := fun x =>
    if deleted.contains x then none else
    match st.newItems.find? (·.1 == x) with
    | some (_, items) => (s.store x).map fun nd => { nd with items := items }
    | none => s.store x
  { board := if changed then { s with store := store', roots := roots2 } else s
    report := if changed then
      some { orphans := orphanRoots.length, deleted := deleted.length, dangling := st.dangling,
             dup := st.dup, cycles, fuelOut := st.fuelOut }
      else none
    deleted }

end Nest.Repair
