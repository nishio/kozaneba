/-
`check` の本体。各構成を走らせ、期待と違えば 0 以外で終わる。
- 安全なはずの構成: 性質が 1 件でも崩れたら失敗。
- 崩れるはずの構成（直す前のコード・わざと壊した版）: 期待した反例が出なければ失敗。
-/
import BackupPolicy.Small
import BackupPolicy.Real

namespace BP.Checks
open BP.Small

inductive Expect
  | zero      -- 0 件でなければ失敗
  | some      -- 1 件以上でなければ失敗（反例が出ることを期待）
  | info      -- 数えるだけ

def Expect.ok : Expect → Nat → Bool
  | .zero, n => n == 0
  | .some, n => n > 0
  | .info, _ => true

def Expect.mark : Expect → String
  | .zero => "=0"
  | .some => ">0"
  | .info => ""

structure Row where
  name : String
  items : List (String × Nat × Expect)

def showRow (r : Row) : IO Bool := do
  let mut ok := true
  let mut parts : List String := []
  for (k, n, e) in r.items do
    let good := e.ok n
    ok := ok && good
    parts := parts ++ [s!"{k} {n}{if e matches .info then "" else s!" (期待 {e.mark}{if good then "" else " ← 違う"})"}"]
  IO.println s!"{if ok then "ok  " else "FAIL"} {r.name}: {", ".intercalate parts}"
  return ok

/-- 保存のたびの間引きの全数検査の 1 行。 -/
def seqRow (label : String) (c : Cal) (tMax n : Nat) (minStep : Int)
    (newest uncovered : Expect) (others : Expect := .zero) : IO (Row × Stats) := do
  let st := explore c tMax n minStep
  let r : Row := { name := s!"{label}（{c.name}、keep_recent={c.keep}、保存 {n} 回まで、時刻 0..{tMax}）"
                   items := [("状態", st.nodes, .info),
                             ("今取ったものが消えた", st.newestLost, newest),
                             ("新しい keep 件が消えた", st.recentLost, others),
                             ("冪等でない", st.notIdem, .zero),
                             ("鍵ごとに 1 件を越えた", st.tooMany, .zero),
                             ("暦の区切りの代表が無い", st.uncovered, uncovered),
                             ("戻った時刻で見ると代表が無い（参考）", st.uncoveredRewound, .info),
                             ("鍵の代表が無い（参考）", st.keyUncovered, .info)] }
  return (r, st)

def run (args : List String) : IO UInt32 := do
  -- `check diff`: TypeScript との突き合わせだけ。`check <n>`: 全数検査の保存の回数（既定 4）
  let onlyDiff := args.contains "diff"
  let n := (args.head?.bind String.toNat?).getD 4
  let tMax := 40
  let mut ok := true
  let t0 ← IO.monoMsNow
  if !onlyDiff then
    IO.println s!"== 保存のたびに間引く流れの全数検査（tick = 30 分、1 日 = 6 tick、「2 日」= 12、「30 日」= 24）"
    let fixed (c : Cal) : Cal := { c with fixHourInDay := true, keepLastTaken := true }
    let mut examples : List String := []
    for k in [1, 2] do
      let rows : List (String × Cal × Int × Expect × Expect × Expect) := [
        ("main・時計は真に増える", {calWhole with keep := k}, 1, .zero, .zero, .zero),
        ("main・時計は真に増える", {calDst with keep := k}, 1, .zero, .zero, .zero),
        ("main・同じ時刻がある", {calWhole with keep := k}, 0, .some, .zero, .zero),
        ("main・時計が 3 tick まで戻る", {calWhole with keep := k}, -3, .some, .zero, .zero),
        ("main・時計は真に増える", {calHalf with keep := k}, 1, .zero, .some, .zero),
        ("修正後・同じ時刻がある", fixed {calWhole with keep := k}, 0, .zero, .zero, .zero),
        ("修正後・時計が 3 tick まで戻る", fixed {calWhole with keep := k}, -3, .zero, .zero, .zero),
        ("修正後・時計が 3 tick まで戻る", fixed {calDst with keep := k}, -3, .zero, .zero, .zero),
        ("修正後・時計が 3 tick まで戻る", fixed {calHalf with keep := k}, -3, .zero, .zero, .zero)]
      for (label, c, step, newest, unc, others) in rows do
        let (r, st) ← seqRow label c tMax n step newest unc others
        ok := (← showRow r) && ok
        if newest matches .some then
          if let some ex := st.newestLostEx then examples := examples ++ [s!"{label}・{c.name}・keep={k}: 今取ったものが消える最短の例 保存の時刻 {ex}"]
        if !(unc matches .zero) || st.uncovered > 0 then
          if let some (ex, q) := st.uncoveredEx then examples := examples ++ [s!"{label}・{c.name}・keep={k}: 代表が無くなる最短の例 保存の時刻 {ex}、時刻 {q} に見ると"]
    for e in examples do IO.println s!"  例: {e}"

    IO.println s!"  （{(← IO.monoMsNow) - t0} ms）"
    IO.println "== わざと壊した版（検査が効くことの確かめ）"
    let mrows : List (String × Cal × (Stats → Nat)) := [
      ("変異 1: `i < keep_recent && is_first_of_bucket`", {calWhole with keep := 2, mutant := 1}, (·.recentLost)),
      ("変異 2: 時間の鍵が日付の無い「何時」", {calWhole with keep := 2, mutant := 2}, (·.uncovered)),
      ("変異 3: 日の鍵が衝突する", {calWhole with keep := 2, mutant := 3}, (·.uncovered))]
    for (label, c, f) in mrows do
      let st := explore c tMax 3 1
      ok := (← showRow { name := label, items := [("期待した反例", f st, .some)] }) && ok

    IO.println "== select_over_cap と prune（場 2 つ、saved_at 0..3、size 1..3、上限 0..8、backup 4 個まで、変異は 3 個まで）"
    let capRow (label : String) (m : Nat) (exp : CapStats → List (String × Nat × Expect)) : IO Bool := do
      let st := exploreCap (if m == 0 then 4 else 3) calWhole m
      showRow { name := label, items := ("場合", st.cases, .info) :: exp st }
    ok := (← capRow "main" 0 fun st => [
      ("場のいちばん新しいものを消した", st.protLost, .zero),
      ("上限を越えたまま守らないものが残った", st.overCap, .zero),
      ("古い順でない", st.notOldest, .zero),
      ("消しすぎ", st.excess, .zero),
      ("冪等でない", st.notIdem, .zero),
      ("prune の後に場のいちばん新しいものが無い", st.pruneNewestLost, .zero),
      ("prune の間引きが他の場を消した", st.pruneOtherThinned, .zero)]) && ok
    ok := (← capRow "変異 3: いちばん古いものを守る" 3 fun st => [("場のいちばん新しいものを消した", st.protLost, .some)]) && ok
    ok := (← capRow "変異 4: 上限の内側に入っても止めない" 4 fun st => [("消しすぎ", st.excess, .some)]) && ok
    ok := (← capRow "変異 5: 新しい順に消す" 5 fun st => [("古い順でない", st.notOldest, .some)]) && ok

    IO.println s!"  （{(← IO.monoMsNow) - t0} ms）"
  IO.println "== TypeScript との突き合わせ（diff/cases.json、src/Cloud/backup_policy.diff.test.ts が書く）"
  let text ← try IO.FS.readFile "diff/cases.json" catch _ => pure ""
  match BP.Real.parseCases text with
  | .error e =>
    IO.println s!"FAIL diff/cases.json を読めない: {e}"
    ok := false
  | .ok cs =>
    let drow (label : String) (p : BP.Real.Policy) (thinE capE : Expect) : IO Bool := do
      let r := BP.Real.compare p cs
      let good ← showRow { name := label, items := [("場合", r.cases, .info), ("backup", r.metas, .info),
        ("select_thinned が違う", r.thinMismatch, thinE), ("select_over_cap が違う", r.capMismatch, capE)] }
      if let some m := r.firstMismatch then
        if !(thinE matches .some) && !(capE matches .some) then IO.println s!"  最初の違い: {m}"
      return good
    ok := (← drow "今のコード（修正 A・B の後）の写し" {} .zero .zero) && ok
    ok := (← drow "修正 A の前の写し（時間の鍵に日付が無い）" { hourInDay := false } .some .zero) && ok
    ok := (← drow "修正 B の前の写し（最後に取ったものを守らない）" { keepLastTaken := false } .some .zero) && ok
    ok := (← drow "変異 1: `i <= keep_recent`" { mutant := 1 } .some .zero) && ok
    ok := (← drow "変異 2: 時間の鍵が日付の無い「何時」" { mutant := 2 } .some .zero) && ok
    ok := (← drow "変異 3: いちばん古いものを守る" { mutant := 3 } .zero .some) && ok
  IO.println (if ok then "すべて期待どおり" else "期待と違う結果がある")
  return if ok then 0 else 1

end BP.Checks
