/-
時刻を小さな整数に縮めたモデルで、`select_thinned` を「保存のたびに間引く」流れのまま
全数で走らせる（`add_backup` → `prune(cloud_ba, now)`）。

時刻の単位は 30 分（tick）。UTC の 1 時間は 2 tick。
地方時の日の始まりは `dayStarts`（UTC の tick）で与える。
- 日の始まりがすべて偶数 tick: 時差が整数時間の地域（日本・UTC・夏時間のある欧米など）。
- 日の始まりが奇数 tick: 時差に 30 分の端数がある地域（インド +5:30 など）。
月の始まりは日の始まりの一部。
-/
import BackupPolicy.Thin
import BackupPolicy.OverCap

namespace BP.Small

/-- bucket の鍵。TS の `h…` / `d…` / `m…`（接頭辞が違うので、種類どうしは衝突しない）。
`h` の 2 つ目は修正案で足す「その時間の地方時の日」（修正前は常に 0）。 -/
inductive Bucket
  | h (hour : Nat) (day : Nat)
  | d (day : Nat)
  | m (month : Nat)
deriving DecidableEq, Repr

structure Cal where
  name : String
  dayStarts : List Nat     -- 地方時の日が始まる UTC の tick（昇順）
  monthStarts : List Nat   -- 月が始まる tick（dayStarts の一部）
  hourlyFor : Nat := 12    -- 「2 日」= 1 日 6 tick × 2
  dailyFor : Nat := 24     -- 「30 日」の代わり（月の長さと同じくらい）
  keep : Nat := 1          -- keep_recent
  fixHourInDay : Bool := false  -- 修正 A: 時間の bucket を地方時の日で切る
  keepLastTaken : Bool := false -- 修正 B: 最後に取った backup（id が最大）は消さない
  mutant : Nat := 0             -- わざと壊した版（0 はなし）

def hourOf (t : Nat) : Nat := t / 2
def Cal.dayOf (c : Cal) (t : Nat) : Nat := (c.dayStarts.filter (· ≤ t)).length
def Cal.monthOf (c : Cal) (t : Nat) : Nat := (c.monthStarts.filter (· ≤ t)).length

/-- `bucket_of(saved_at, now)`。`age < hourly_for` を `now < t + hourlyFor` と書く（未来の backup は age < 0 で時間の bucket）。 -/
def Cal.bucket (c : Cal) (now t : Nat) : Bucket :=
  if now < t + c.hourlyFor then
    if c.mutant == 2 then .h (hourOf t % 3) 0  -- 変異 2: 日付の無い「何時」
    else .h (hourOf t) (if c.fixHourInDay then c.dayOf t else 0)
  else if now < t + c.dailyFor then
    if c.mutant == 3 then .d (c.dayOf t % 2) else .d (c.dayOf t)  -- 変異 3: 日の鍵が衝突する
  else .m (c.monthOf t)

/-- 時刻 now での b の粒度（0 = 時間、1 = 日、2 = 月）。 -/
def Cal.gran (c : Cal) (now t : Nat) : Nat :=
  if now < t + c.hourlyFor then 0 else if now < t + c.dailyFor then 1 else 2

/-- 粒度 g の暦の区切りで、t を含むもの（時間は UTC の時間、日・月は地方時）。 -/
def Cal.period (c : Cal) (g t : Nat) : Nat :=
  match g with
  | 0 => hourOf t
  | 1 => c.dayOf t
  | _ => c.monthOf t

structure B where
  id : Nat
  t : Nat
deriving DecidableEq, Repr

/-- `[...metas].sort((a, b) => b.saved_at - a.saved_at)`（安定）。 -/
def newestFirst (xs : List B) : List B :=
  xs.mergeSort (fun a b => decide (b.t ≤ a.t))

/-- `select_thinned(metas, now)`: 消す id（newest_first の順）。 -/
def selectThinned (c : Cal) (now : Nat) (xs : List B) : List Nat :=
  let nf := newestFirst xs
  let kept := (thinKeep (fun b => c.bucket now b.t) c.keep [] nf).map (·.id)
  -- 変異 1: `i < keep_recent && is_first_of_bucket`（|| を && に）
  let kept := if c.mutant == 1 then
      let first := (thinKeep (fun b => c.bucket now b.t) 0 [] nf).map (·.id)
      ((nf.take c.keep).filter (fun b => first.contains b.id)).map (·.id)
    else kept
  let kept := if c.keepLastTaken then xs.foldl (fun a b => max a b.id) 0 :: kept else kept
  (nf.filter (fun b => !kept.contains b.id)).map (·.id)

def prune (c : Cal) (now : Nat) (xs : List B) : List B :=
  let del := selectThinned c now xs
  xs.filter (fun b => !del.contains b.id)

/-- 間引く前のすべての backup の、時刻 q での代表が、残したものの中にあるか。
（b の粒度の区切りに、残したものが 1 つ以上ある） -/
def covered (c : Cal) (q : Nat) (hist kept : List B) : Bool :=
  hist.all fun b =>
    let g := c.gran q b.t
    kept.any fun k => c.period g k.t == c.period g b.t

/-- 一度に間引いたときと同じ鍵の代表があるか（bucket の鍵で比べる。弱めない版）。 -/
def keyCovered (c : Cal) (q : Nat) (hist kept : List B) : Bool :=
  hist.all fun b => kept.any fun k => c.bucket q k.t == c.bucket q b.t

structure Stats where
  nodes : Nat := 0
  newestLost : Nat := 0       -- 今足した backup が、その場の間引きで消えた
  newestLostEx : Option (List Nat) := none
  recentLost : Nat := 0       -- 新しい keep 件（saved_at の順）のどれかが消えた
  notIdem : Nat := 0          -- もう一度間引くと変わる
  uncovered : Nat := 0        -- 暦の区切りの代表が無い（それまでの間引きのどの時刻よりも後の時刻で）
  uncoveredEx : Option (List Nat × Nat) := none
  uncoveredRewound : Nat := 0 -- 時計が戻った後の、戻った時刻で見ると代表が無い（参考）
  keyUncovered : Nat := 0     -- bucket の鍵の代表が無い（参考。一度に間引くのとの違い）
  keyUncoveredEx : Option (List Nat × Nat) := none
  tooMany : Nat := 0          -- keep 件より後に、同じ鍵のものが 2 つ残った
deriving Repr

/-- 保存の時刻の列をすべてたどる（深さ優先）。次の保存の時刻は「前の時刻 + `minStep`」以上（1 なら真に増える、0 なら同じ時刻もある、負なら時計が戻る）。
各保存の後に `prune` し、性質を数える。代表は、それまでに間引いた時刻のうち最も遅いもの以後の
すべての時刻 q（間引かずに時間だけ進む）で確かめる。`covered` が q で変わるのは、どれかの backup の粒度が
変わる時刻（`t + hourlyFor`・`t + dailyFor`）だけなので、その時刻だけを見ればよい。 -/
partial def explore (c : Cal) (tMax maxN : Nat) (minStep : Int) : Stats := Id.run do
  let mut st : Stats := {}
  -- stack: (保存の時刻の列（逆順）, 今の backup, 次の id, 間引いた時刻の最大)
  let mut stack : List (List Nat × List B × Nat × Nat) := [([], [], 0, 0)]
  while true do
    match stack with
    | [] => break
    | (ts, xs, n, maxNow) :: rest =>
      stack := rest
      if n ≥ maxN then continue
      let last := ts.head?.getD 0
      let lo := if ts.isEmpty then 0 else ((last : Int) + minStep).toNat
      for t in List.range' lo (tMax + 1 - lo) do
        let nb : B := ⟨n, t⟩
        let ys := xs ++ [nb]
        let zs := prune c t ys
        let ts' := t :: ts
        let hist := (ts'.reverse.zipIdx).map fun (t, i) => (⟨i, t⟩ : B)
        st := { st with nodes := st.nodes + 1 }
        if !zs.contains nb then
          st := { st with newestLost := st.newestLost + 1,
                          newestLostEx := st.newestLostEx.orElse fun _ => some ts'.reverse }
        let nf := newestFirst ys
        if !(nf.take c.keep).all (zs.contains ·) then
          st := { st with recentLost := st.recentLost + 1 }
        if prune c t zs != zs then
          st := { st with notIdem := st.notIdem + 1 }
        -- 修正 B で残す「最後に取ったもの」は、この上限の外
        let beyond := (newestFirst zs).drop c.keep
          |>.filter (fun b => !(c.keepLastTaken && b.id == n))
          |>.map (fun b => c.bucket t b.t)
        if beyond.eraseDups.length != beyond.length then
          st := { st with tooMany := st.tooMany + 1 }
        -- 代表: それまでに間引いた最も遅い時刻と、その後に粒度が変わる時刻
        let mx := max maxNow t
        let qs := mx :: (hist.flatMap fun b => [b.t + c.hourlyFor, b.t + c.dailyFor]).filter (mx ≤ ·)
        if t < mx && !covered c t hist zs then
          st := { st with uncoveredRewound := st.uncoveredRewound + 1 }
        for q in qs do
          if !covered c q hist zs then
            st := { st with uncovered := st.uncovered + 1,
                            uncoveredEx := st.uncoveredEx.orElse fun _ => some (ts'.reverse, q) }
            break
        if !keyCovered c t hist zs then
          st := { st with keyUncovered := st.keyUncovered + 1,
                          keyUncoveredEx := st.keyUncoveredEx.orElse fun _ => some (ts'.reverse, t) }
        stack := (ts', zs, n + 1, mx) :: stack
  return st

/-! ### 暦 -/

/-- 1 日 6 tick（3 時間）、月は 3 日と 4 日の繰り返し。日の始まりは偶数 tick（整数時間の時差）。 -/
def calWhole : Cal :=
  { name := "整数時間の時差（1 日 6 tick）"
    dayStarts := (List.range 40).map (· * 6)
    monthStarts := [0, 18, 42, 60, 84, 102, 126, 144, 168, 186, 210, 228] }

/-- 日の長さが 4・6・8 tick と変わる（夏時間の切り替えで 23・25 時間の日があるのと同じ形）。日の始まりは偶数 tick。 -/
def calDst : Cal :=
  { name := "日の長さが変わる（夏時間）"
    dayStarts := [0, 6, 10, 16, 24, 30, 36, 40, 46, 54, 60, 66, 70, 76, 84, 90, 96, 100, 106, 114, 120]
    monthStarts := [0, 16, 36, 54, 70, 90, 106, 120] }

/-- 日の始まりが奇数 tick（時差に 30 分の端数がある地域）。 -/
def calHalf : Cal :=
  { name := "30 分の端数のある時差（日の始まりが奇数 tick）"
    dayStarts := (List.range 40).map (fun i => i * 6 + 1)
    monthStarts := [1, 19, 43, 61, 85, 103, 127, 145, 169, 187, 211, 229] }

/-! ### `select_over_cap` -/

/-- `select_over_cap(metas, cap)` の写し。 -/
def selectOverCap (cap : Int) (ms : List Meta) (mutant : Nat := 0) : List Nat :=
  let total := sizeSum ms
  if total ≤ cap then [] else
  -- newest_of_ba: 配列の順に見て、saved_at が真に大きいときだけ取り替える
  let newest : List (Nat × Meta) := ms.foldl (fun acc m =>
    match acc.lookup m.ba with
    | none => acc ++ [(m.ba, m)]
    | some x => if (if mutant == 3 then m.t < x.t else x.t < m.t) then acc.map (fun p => if p.1 == m.ba then (m.ba, m) else p) else acc) []
  let prot := newest.map (·.2.id)
  let oldestFirst := ms.mergeSort (fun a b => decide (a.t ≤ b.t))
  let oldestFirst := if mutant == 5 then oldestFirst.reverse else oldestFirst  -- 変異 5: 新しい順に消す
  let cap' := if mutant == 4 then -1 else cap  -- 変異 4: 上限の内側に入っても止めない
  (overCapGo (fun m => prot.contains m.id) cap' total oldestFirst).map (·.id)

def newestOfBa (ms : List Meta) (ba : Nat) : Option Meta :=
  (ms.filter (·.ba == ba)).foldl (fun acc m => match acc with
    | none => some m
    | some x => if x.t < m.t then some m else some x) none

structure CapStats where
  cases : Nat := 0
  protLost : Nat := 0     -- 場のいちばん新しい backup を消した
  overCap : Nat := 0      -- 上限を越えたまま、守らないものが残った
  notOldest : Nat := 0    -- 消したものより古い、守らないものが残った
  excess : Nat := 0       -- 消しすぎ（最後の 1 つを消さなくても上限の内側だった）
  notIdem : Nat := 0      -- もう一度呼ぶと、まだ消す
  pruneNewestLost : Nat := 0  -- prune（間引き → 上限）の後で、どれかの場のいちばん新しいものが消えた
  pruneOtherThinned : Nat := 0  -- prune の間引きが、他の場の backup を消した
deriving Repr

/-- id 0..n-1、場は 2 つ、saved_at は 0..3、size は 1..3、上限は 0..8 のすべて。 -/
def exploreCap (maxN : Nat) (c : Cal) (mutant : Nat := 0) : CapStats := Id.run do
  let mut st : CapStats := {}
  let opts : List (Nat × Nat × Nat) :=
    [0, 1].flatMap fun ba => [0, 1, 2, 3].flatMap fun t => [1, 2, 3].map fun s => (ba, t, s)
  let mut lists : List (List Meta) := [[]]
  for n in List.range maxN do
    lists := lists.flatMap fun ms => opts.map fun (ba, t, s) => ms ++ [⟨n, ba, t, s⟩]
    for ms in lists do
      for cap in List.range 9 do
        let capI : Int := cap
        st := { st with cases := st.cases + 1 }
        let del := selectOverCap capI ms mutant
        let rest := ms.filter (fun m => !del.contains m.id)
        for ba in [0, 1] do
          match newestOfBa ms ba with
          | some x => if !rest.contains x then st := { st with protLost := st.protLost + 1 }
          | none => pure ()
        let prot := [0, 1].filterMap (newestOfBa ms) |>.map (·.id)
        let nonProtRest := rest.filter (fun m => !prot.contains m.id)
        if sizeSum rest > capI && !nonProtRest.isEmpty then
          st := { st with overCap := st.overCap + 1 }
        let oldestFirst := ms.mergeSort (fun a b => decide (a.t ≤ b.t))
        let delSet := oldestFirst.filter (fun m => del.contains m.id)
        let npOrder := oldestFirst.filter (fun m => !prot.contains m.id)
        if npOrder.take delSet.length != delSet then
          st := { st with notOldest := st.notOldest + 1 }
        match delSet.getLast? with
        | some l => if sizeSum rest + l.size ≤ capI then st := { st with excess := st.excess + 1 }
        | none => pure ()
        if selectOverCap capI rest mutant != [] then
          st := { st with notIdem := st.notIdem + 1 }
        -- prune(cloud_ba = 0): 場 0 だけを間引き、全体で上限
        let of0 := ms.filter (·.ba == 0)
        let now := 3 + 12  -- 全部が「日」の粒度になる時刻
        let bs := of0.map (fun m => (⟨m.id, m.t.toNat⟩ : B))
        let thinned := selectThinned c now bs
        if (ms.filter (·.ba != 0)).any (fun m => thinned.contains m.id) then
          st := { st with pruneOtherThinned := st.pruneOtherThinned + 1 }
        let afterThin := ms.filter (fun m => !thinned.contains m.id)
        let del2 := selectOverCap capI afterThin mutant
        let afterCap := afterThin.filter (fun m => !del2.contains m.id)
        for ba in [0, 1] do
          match newestOfBa ms ba with
          | some x => if !afterCap.contains x then st := { st with pruneNewestLost := st.pruneNewestLost + 1 }
          | none => pure ()
  return st

end BP.Small
