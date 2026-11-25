/-
実際の大きさ（ミリ秒・暦）での `backup_policy.ts` の写しと、TypeScript の出力との突き合わせ。

`src/Cloud/backup_policy.diff.test.ts` が、乱数（seed 固定）の入力と、TS の
`select_thinned` / `select_over_cap` の出力を `diff/cases.json` に書く。
ここではそれを読み、同じ入力を自分の写しに通して比べる。

地方時は、各 backup の時差（JS の `-getTimezoneOffset()`、分）を JSON から受け取り、
暦（年・月・日）は Lean で計算する（Howard Hinnant の civil_from_days）。
時差の表（tz database）だけは JS に頼っている。
-/
import Lean.Data.Json
import BackupPolicy.Thin
import BackupPolicy.OverCap

namespace BP.Real

def HOUR : Nat := 60 * 60 * 1000
def DAY : Nat := 24 * HOUR

structure Policy where
  keepRecent : Nat := 20
  hourlyFor : Nat := 2 * DAY
  dailyFor : Nat := 30 * DAY
  /-- 修正 A: 時間の bucket を地方時の日で切る（`h${hour}-${getDate()}`） -/
  hourInDay : Bool := true
  /-- 修正 B: 最後に取った backup（id が最大）は消さない -/
  keepLastTaken : Bool := true
  /-- 変異（検査が効くことの確かめ用）: 0 はなし -/
  mutant : Nat := 0

/-- 1970-01-01 からの日数 → (年, 月 1..12, 日)。非負の日数だけ。 -/
def civilFromDays (z0 : Nat) : Nat × Nat × Nat :=
  let z := z0 + 719468
  let era := z / 146097
  let doe := z - era * 146097
  let yoe := (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365
  let y := yoe + era * 400
  let doy := doe - (365 * yoe + yoe / 4 - yoe / 100)
  let mp := (5 * doy + 2) / 153
  let d := doy - (153 * mp + 2) / 5 + 1
  let m := if mp < 10 then mp + 3 else mp - 9
  (if m ≤ 2 then y + 1 else y, m, d)

structure M where
  id : Nat
  ba : String
  t : Nat       -- saved_at（ms）
  size : Nat
  off : Int     -- その時刻の地方時の時差（分）
deriving Repr, BEq, Inhabited

def M.local (m : M) : Nat × Nat × Nat :=
  civilFromDays ((((m.t : Int) + m.off * 60000).toNat) / DAY)

/-- `bucket_of(saved_at, now)`。鍵は TS と同じ文字列（月は 0 始まり）。 -/
def bucketOf (p : Policy) (now : Nat) (m : M) : String :=
  let (y, mo, d) := m.local
  -- age < hourly_for。未来の backup（age < 0）も時間の bucket
  if now < m.t + p.hourlyFor then
    if p.mutant == 2 then s!"h{(m.t + 9 * HOUR) / HOUR % 24}"  -- 変異: 日付の無い「何時」
    else if p.hourInDay then s!"h{m.t / HOUR}-{d}" else s!"h{m.t / HOUR}"
  else if now < m.t + p.dailyFor then s!"d{y}-{mo - 1}-{d}"
  else s!"m{y}-{mo - 1}"

def newestFirst (xs : List M) : List M := xs.mergeSort (fun a b => decide (b.t ≤ a.t))

def selectThinned (p : Policy) (now : Nat) (xs : List M) : List Nat :=
  let nf := newestFirst xs
  let keep := if p.mutant == 1 then p.keepRecent + 1 else p.keepRecent  -- 変異: i <= keep_recent
  let kept := (thinKeep (bucketOf p now) keep [] nf).map (·.id)
  let last := xs.foldl (fun a m => max a m.id) 0
  let kept := if p.keepLastTaken && !xs.isEmpty then last :: kept else kept
  (nf.filter (fun m => !kept.contains m.id)).map (·.id)

def selectOverCap (p : Policy) (cap : Int) (ms : List M) : List Nat :=
  let total : Int := (ms.map (fun m => (m.size : Int))).sum
  if total ≤ cap then [] else
  let newest : List (String × M) := ms.foldl (fun acc m =>
    match acc.lookup m.ba with
    | none => acc ++ [(m.ba, m)]
    | some x =>
      let better := if p.mutant == 3 then m.t < x.t else x.t < m.t  -- 変異: いちばん古いものを守る
      if better then acc.map (fun q => if q.1 == m.ba then (m.ba, m) else q) else acc) []
  let prot := newest.map (·.2.id)
  let oldestFirst := ms.mergeSort (fun a b => decide (a.t ≤ b.t))
  let toMeta (m : M) : BP.Meta := ⟨m.id, 0, m.t, m.size⟩
  (overCapGo (fun x => prot.contains x.id) cap total (oldestFirst.map toMeta)).map (·.id)

structure Case where
  tz : String
  now : Nat
  cap : Int
  metas : List M
  thinnedA : List Nat
  overCap : List Nat

open Lean in
def parseCases (s : String) : Except String (List Case) := do
  let j ← Json.parse s
  let cs ← (← j.getObjVal? "cases").getArr?
  cs.toList.mapM fun c => do
    let ms ← (← c.getObjVal? "metas").getArr?
    let metas ← ms.toList.mapM fun m => do
      let a ← m.getArr?
      let g (i : Nat) : Except String Json := match a[i]? with
        | some x => pure x | none => throw "short meta"
      pure ({ id := ← (← g 0).getNat?, ba := ← (← g 1).getStr?, t := ← (← g 2).getNat?,
              size := ← (← g 3).getNat?, off := ← (← g 4).getInt? } : M)
    let ids (k : String) : Except String (List Nat) := do
      (← (← c.getObjVal? k).getArr?).toList.mapM (·.getNat?)
    pure { tz := ← (← c.getObjVal? "tz").getStr?, now := ← (← c.getObjVal? "now").getNat?,
           cap := ← (← c.getObjVal? "cap").getInt?, metas,
           thinnedA := ← ids "thinned_a", overCap := ← ids "over_cap" }

structure DiffResult where
  cases : Nat := 0
  metas : Nat := 0
  thinMismatch : Nat := 0
  capMismatch : Nat := 0
  firstMismatch : Option String := none
deriving Repr

def compare (p : Policy) (cs : List Case) : DiffResult := Id.run do
  let mut r : DiffResult := {}
  for c in cs do
    r := { r with cases := r.cases + 1, metas := r.metas + c.metas.length }
    let ofA := c.metas.filter (·.ba == "a")
    let th := selectThinned p c.now ofA
    if th != c.thinnedA then
      r := { r with thinMismatch := r.thinMismatch + 1,
                    firstMismatch := r.firstMismatch.orElse fun _ =>
                      some s!"select_thinned tz={c.tz} now={c.now}: Lean {th} / TS {c.thinnedA}" }
    let oc := selectOverCap p c.cap c.metas
    if oc != c.overCap then
      r := { r with capMismatch := r.capMismatch + 1,
                    firstMismatch := r.firstMismatch.orElse fun _ =>
                      some s!"select_over_cap tz={c.tz} cap={c.cap}: Lean {oc} / TS {c.overCap}" }
  return r

end BP.Real
