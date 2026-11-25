import AnnotRef.Model
/-!
# 全数検査

小さな線の配列と、ダイアログ（または行内 editor）を開いた線のすべての組で、別のクライアントの
保存（操作）を 1 回・2 回届けて、解決の結果を調べる。

結果の分け方（届くたびに解き直し、`null` になったらダイアログ・editor は閉じて終わる）:
* **別の線**：解決が、開いた線とは別の線の位置を返した。ユーザーは気づかずに別の線を編集・削除する。
* **閉じた（残っていたのに）**：開いた線が items も変わらずに残っているのに `null`。
  ダイアログ・editor が閉じるだけで、何も壊れない。
* **閉じた（消えた・items が変わった）**：開いた線が消えたか、items が変わって `null`。正しい。
* **正しい**：最後まで開いた線を指し続けた。
-/
namespace AnnotRef.Check

/-- 解決の関数。参照は開いた時点の配列と位置から作り、後は変えない（コードと同じ）。 -/
structure Resolver where
  name : String
  /-- 開いた時点の配列・位置から、参照を閉じ込めた「解決」を作る -/
  open_ : List Line → Nat → (List Line → Option Nat)

def cur : Resolver := ⟨"今のコード", fun ls i => let r := refOf ls i; fun ls' => resolve ls' r⟩
def fixed : Resolver := ⟨"修正案", fun ls i => let r := refOfF ls i; fun ls' => resolveF ls' r⟩

/-- 変異 M1：今のコードから、同じ位置の items の確かめを抜く（位置が範囲内ならそれを返す） -/
def mutIndexOnly : Resolver := ⟨"M1. 変異: 位置だけを見る", fun ls i =>
  let r := refOf ls i
  fun ls' => if r.index < ls'.length then some r.index else ls'.findIdx? (hasItems r.items)⟩

/-- 変異 M2：修正案から、本数（count）の確かめを抜く -/
def mutNoCount : Resolver := ⟨"M2. 変異: 修正案で本数を見ない", fun ls i =>
  let r := refOfF ls i
  fun ls' => (sameIdx ls' r.items)[r.nth]?⟩

/-- 変異 M3：修正案で、何番目か（nth）を見ずに最初の線を返す -/
def mutFirst : Resolver := ⟨"M3. 変異: 修正案で何番目かを見ない", fun ls i =>
  let r := refOfF ls i
  fun ls' => let m := sameIdx ls' r.items
    if m.length = r.count then m.head? else none⟩

inductive Outcome where
  | ok | wrong | lostAlive | closedGone
deriving DecidableEq, Repr

/-- 線 `t` が今どこにあり、items が変わっていないか -/
def targetAlive (ls : List Line) (t : Nat) (xs : List ItemId) : Bool :=
  ls.any fun l => l.id == t && l.items == xs

/-- 1 回分の評価：`some o` なら終わり（閉じたか、別の線を指した） -/
def step (res : List Line → Option Nat) (t : Nat) (xs : List ItemId) (ls : List Line) :
    Option Outcome :=
  match res ls with
  | some j => if (ls[j]?).any (·.id == t) then none else some .wrong
  | none => some (if targetAlive ls t xs then .lostAlive else .closedGone)

/-- 操作の列を順に届け、届くたびに解き直す -/
def runHistory (res : List Line → Option Nat) (t : Nat) (xs : List ItemId)
    (ls : List Line) : List (List Line → List Line) → Outcome
  | [] => .ok
  | op :: ops =>
    let ls' := op ls
    match step res t xs ls' with
    | some o => o
    | none => runHistory res t xs ls' ops

/-! ## 盤面と操作の範囲 -/

/-- 線の items の候補：アイテム {0,1,2} のうち 2 つの順序つきの組 6 通りと、3 つの線 2 本 -/
def contents : List (List ItemId) :=
  [[0,1],[1,0],[0,2],[2,0],[1,2],[2,1],[0,1,2],[2,1,0]]

def listsOfLen : Nat → List (List (List ItemId))
  | 0 => [[]]
  | n+1 => (listsOfLen n).flatMap fun l => contents.map fun c => l ++ [c]

/-- 初めの配列：線 1〜3 本。id は 0, 1, 2 …、属性は 0 -/
def initials (maxLen : Nat) : List (List Line) :=
  ((List.range maxLen).flatMap fun n => listsOfLen (n+1)).map fun cs =>
    cs.zipIdx.map fun (c, i) => ({ id := i, items := c } : Line)

/-- アプリの操作（相手のクライアントが 1 回の保存で送るもの）。`fresh` は新しい線の id。 -/
def appOps (fresh : Nat) (ls : List Line) : List (String × (List Line → List Line)) :=
  (contents.map fun c => (s!"末尾に {c} を足す", append fresh c)) ++
  ((List.range ls.length).map fun k => (s!"線 {k} を消す", deleteLine k)) ++
  ((List.range ls.length).map fun k => (s!"線 {k} の属性を変える", setAttr k)) ++
  ([0,1,2].map fun d => (s!"アイテム {d} を消す", deleteItem d)) ++
  ([(0,1),(0,2),(1,2)].map fun (s, e) => (s!"{s}–{e} の線を消す（線の削除モード）", deletePair s e))

/-- アプリはしない操作 -/
def advOps (fresh : Nat) (ls : List Line) : List (String × (List Line → List Line)) :=
  (contents.map fun c => (s!"先頭に {c} を足す", prepend fresh c)) ++
  ((List.range (ls.length - 1)).map fun k => (s!"線 {k} と {k+1} を入れ替える", swap k))

/-- 同じ items の線が 2 本以上あるか -/
def hasDup (ls : List Line) : Bool :=
  ls.zipIdx.any fun (l, i) => ls.zipIdx.any fun (l', j) => i < j && l.items == l'.items

def showLines (ls : List Line) : String :=
  "[" ++ ", ".intercalate (ls.map fun l => s!"#{l.id}{l.items}a{l.attr}") ++ "]"

/-- 1 つの欄（行 × 解決の関数）の集計 -/
structure Stat where
  tried : Nat := 0
  ok : Nat := 0
  wrong : Nat := 0
  lostAlive : Nat := 0
  closedGone : Nat := 0
  example? : Option String := none

def Stat.add (s : Stat) (o : Outcome) (ex : Unit → String) : Stat :=
  let s := { s with tried := s.tried + 1 }
  match o with
  | .ok => { s with ok := s.ok + 1 }
  | .lostAlive => { s with lostAlive := s.lostAlive + 1 }
  | .closedGone => { s with closedGone := s.closedGone + 1 }
  | .wrong => { s with wrong := s.wrong + 1,
                       example? := s.example?.orElse fun _ => some (ex ()) }

/-- 1 つの場合：初めの配列・開いた位置・操作の列（名前つき） -/
structure Case where
  ls : List Line
  i : Nat
  ops : List (String × (List Line → List Line))

def runCase (r : Resolver) (c : Case) : Outcome :=
  match c.ls[c.i]? with
  | none => .ok
  | some l => runHistory (r.open_ c.ls c.i) l.id l.items c.ls (c.ops.map (·.2))

def showCase (c : Case) : String :=
  s!"{showLines c.ls} で線 {c.i} を開く → " ++ " → ".intercalate (c.ops.map (·.1))

/-- 途中の配列すべて（初めも含む） -/
def trace (c : Case) : List (List Line) :=
  c.ops.foldl (fun acc (_, op) => acc ++ [op (acc.getLast?.getD c.ls)]) [c.ls]

/-- 行：場合の集め方 -/
structure Row where
  name : String
  cases : Unit → List Case

def oneStep (maxLen : Nat) (ops : Nat → List Line → List (String × (List Line → List Line)))
    (keep : Case → Bool) : Unit → List Case := fun _ =>
  (initials maxLen).flatMap fun ls => (List.range ls.length).flatMap fun i =>
    ((ops 100 ls).map fun op => ({ ls, i, ops := [op] } : Case)).filter keep

/-- 保存 2 回：1 回ごとに届き、そのたびに解き直す -/
def twoSaves (maxLen : Nat) (ops : Nat → List Line → List (String × (List Line → List Line)))
    : Unit → List Case := fun _ =>
  (initials maxLen).flatMap fun ls => (List.range ls.length).flatMap fun i =>
    (ops 100 ls).flatMap fun op1 =>
      (ops 101 (op1.2 ls)).map fun op2 => ({ ls, i, ops := [op1, op2] } : Case)

/-- 1 回の保存に 2 つの操作：途中の配列は届かない -/
def twoInOne (maxLen : Nat) (ops : Nat → List Line → List (String × (List Line → List Line)))
    : Unit → List Case := fun _ =>
  (initials maxLen).flatMap fun ls => (List.range ls.length).flatMap fun i =>
    (ops 100 ls).flatMap fun op1 =>
      (ops 101 (op1.2 ls)).map fun op2 =>
        ({ ls, i, ops := [(s!"[{op1.1}、{op2.1}]", fun x => op2.2 (op1.2 x))] } : Case)

def noDupThroughout (c : Case) : Bool := (trace c).all (!hasDup ·)

def rows (maxLen : Nat) : List Row :=
  [ ⟨"R1. アプリの操作 1 回・同じ items の線が無い",
      oneStep maxLen appOps noDupThroughout⟩,
    ⟨"R2. アプリの操作 1 回・同じ items の線がある（前か後）",
      oneStep maxLen appOps (!noDupThroughout ·)⟩,
    ⟨"R3. 保存 2 回（1 回に操作 1 つ、届くたびに解き直す）",
      twoSaves maxLen appOps⟩,
    ⟨"R3n. R3 のうち、同じ items の線が無い",
      fun _ => (twoSaves maxLen appOps ()).filter noDupThroughout⟩,
    ⟨"R4. 1 回の保存に操作 2 つ",
      twoInOne maxLen appOps⟩,
    ⟨"R4n. R4 のうち、同じ items の線が無い",
      fun _ => (twoInOne maxLen appOps ()).filter noDupThroughout⟩,
    ⟨"R5. 先頭に足す・隣と入れ替える（アプリはしない）",
      oneStep maxLen advOps fun _ => true⟩,
    ⟨"R5n. R5 のうち、同じ items の線が無い",
      oneStep maxLen advOps noDupThroughout⟩ ]

def resolvers : List Resolver := [cur, fixed, mutIndexOnly, mutNoCount, mutFirst]

def runRow (r : Resolver) (row : Row) : Stat :=
  (row.cases ()).foldl (fun s c => s.add (runCase r c) fun _ => showCase c) {}

/-- 修正案と今のコードが、同じ items の線が一度も無い場合に同じ答えを返すか
（届くたびの解決の結果をすべて比べる） -/
def sameAnswers (c : Case) : Bool :=
  match c.ls[c.i]? with
  | none => true
  | some _ =>
    let a := cur.open_ c.ls c.i
    let b := fixed.open_ c.ls c.i
    (trace c).all fun ls => a ls == b ls

/-- 期待：(行, 解決の関数) → 「別の線」が 0 であるべきか、1 以上であるべきか -/
inductive Expect where
  | none_ | some_ | any
deriving DecidableEq

def expectWrong (row : String) (r : String) : Expect :=
  let isRow (names : List String) := names.any fun n => row.startsWith (n ++ ".")
  if r == cur.name then
    if isRow ["R1", "R3n", "R5n"] then .none_ else .some_
  else if r == fixed.name then
    if isRow ["R1", "R2", "R3", "R3n", "R5n"] then .none_ else .some_
  else if r == mutIndexOnly.name then
    if isRow ["R1"] then .some_ else .any
  else if r == mutNoCount.name || r == mutFirst.name then
    if isRow ["R2"] then .some_ else .any
  else .any

def run (maxLen : Nat) : IO UInt32 := do
  let mut failed : List String := []
  IO.println s!"線は 1〜{maxLen} 本、items の候補 {contents.length} 通り、初めの配列 {(initials maxLen).length} 通り"
  let rs := rows maxLen
  -- 行ごと・関数ごとに Task に分ける
  let tasks := rs.map fun row => resolvers.map fun r =>
    Task.spawn (prio := .dedicated) fun _ => runRow r row
  let mut table : List (Row × List Stat) := []
  for (row, ts) in rs.zip tasks do
    let ss := ts.map Task.get
    IO.println s!"\n■ {row.name}"
    for (r, s) in resolvers.zip ss do
      IO.println s!"  {r.name}: {s.tried} 通り、別の線 {s.wrong}、閉じた（残っていたのに）{s.lostAlive}、閉じた（消えた・items が変わった）{s.closedGone}、正しい {s.ok}"
      if let some e := s.example? then IO.println s!"    例: {e}"
      match expectWrong row.name r.name with
      | .none_ => if s.wrong > 0 then failed := failed ++ [s!"{row.name} / {r.name}: 別の線を指した"]
      | .some_ => if s.wrong == 0 then failed := failed ++ [s!"{row.name} / {r.name}: 期待した反例が出なくなった"]
      | .any => pure ()
    table := table ++ [(row, ss)]
  -- 同じ items の線が無い限り、修正案は今のコードと同じ答え
  let noDup := (rows maxLen).filter fun row =>
    ["R1.", "R3n.", "R4n.", "R5n."].any fun (n : String) => row.name.startsWith n
  let diff := noDup.foldl (fun acc row =>
    acc ++ ((row.cases ()).filter (!sameAnswers ·)).map showCase) []
  IO.println s!"\n同じ items の線が一度も無い場合（R1・R3n・R4n・R5n）で、修正案と今のコードの答えが違う: {diff.length} 件"
  for d in diff.take 3 do IO.println s!"  {d}"
  if diff.length > 0 then failed := failed ++ ["同じ items の線が無いのに、修正案と今のコードの答えが違う"]
  -- まとめの表
  IO.println "\n========== まとめ（別の線 / 閉じた（残っていたのに）） =========="
  IO.println ("| 場合 | 通り | " ++ " | ".intercalate (resolvers.map (·.name)) ++ " |")
  IO.println ("|---|---:|" ++ String.join (resolvers.map fun _ => "---:|"))
  for (row, ss) in table do
    let tried := (ss.head?.map (·.tried)).getD 0
    IO.println ("| " ++ row.name ++ " | " ++ toString tried ++ " | " ++
      " | ".intercalate (ss.map fun s => s!"{s.wrong} / {s.lostAlive}") ++ " |")
  if failed.isEmpty then
    IO.println "\nOK: 安全なはずの場合で別の線を指さず、期待した反例はすべて出ました"
    return 0
  else
    IO.println s!"\nFAILED: {failed}"
    return 1

end AnnotRef.Check
