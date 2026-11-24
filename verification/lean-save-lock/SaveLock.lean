import Std.Data.HashMap
/-!
# 保存の楽観ロック（#98）のモデル検査

本体 `nishio/kozaneba` の 4ff6400 を写した。2 つのクライアント（端末・タブ）が同じ ba を
編集・保存し、互いの保存を snapshot で受け取る。すべての手順の並び（interleaving）を
幅優先で調べ、性質が崩れる最短の手順を出す。

写したもの:
* `mark_local_changed`：`is_local_change = true`、`last_updated = Date.now()`。内容は「編集の集合」で表す。
* `LocalChangeWatcher`：`is_local_change` なら false にして `save()`。
* `save()`（src/Cloud/save.ts）：ログインしていなければ dialog を出して戻る。`save_conflict` なら書かない。
  そうでなければ `note_own_write(version)`、`begin_write`、transaction を出す。
* transaction（`write_if_not_changed`）：サーバの版が `may_overwrite`（base か own）でなければ conflict、
  own でかつ自分の版より大きければ書かずに終わる（順序が入れ替わった古い保存）、それ以外は書く。
  Firestore の transaction は、読んだ doc が変わると関数ごとやり直すので、「commit の時点で
  クライアントの今の base / own を見て、原子的に判定して書く」1 手として写す。
* 完了（then / catch）：`end_write`。成功で、版が今の `last_updated` と同じなら done。
  conflict → `save_conflict`。一時的なエラー → retry。それ以外のエラー → `save_error`。
* snapshot（src/Cloud/set_up_read_subscription.tsx）：版が今の `last_updated` と同じなら base を更新、
  own なら無視、保存していない変更（`is_local_change`・書き込み中・retry 待ち・`save_error`・conflict）が
  あれば conflict、なければサーバの版に置き換える。snapshot は順に届き、途中を飛ばしてよい。
* `SaveErrorAlert` を閉じる：`save_error = ""`。
* conflict で「再読み込み」：サーバの版を開き直す（そのタブの書き込み中の保存は捨てる）。

性質:
* P1（サーバで上書きして失う）：書き込むとき、サーバにあった編集がすべて書く内容に含まれる。
* P2（手元で置き換えて失う）：snapshot で置き換えるとき、手元の編集がすべてサーバの版に含まれる。
* P3（保存済みと表示して失う）：done にするとき、手元の編集がサーバに載っているか、まだ保存が続く。
* P4（黙って保存されない）：どの状態でも、手元にサーバに無い編集があるなら、保存か印
  （`is_local_change`・書き込み中・retry・`save_error`・conflict・届いていない snapshot）が残っている。
-/
namespace SaveLock

def ins (x : Nat) : List Nat → List Nat
  | [] => [x]
  | y :: ys => if x < y then x :: y :: ys else if x == y then y :: ys else y :: ins x ys

def sub (a b : List Nat) : Bool := a.all (b.contains ·)

structure Txn where
  c : Nat
  v : Nat
  d : List Nat
  /-- 0 未実行、1 書いた、2 書かずに終わった、3 conflict、4 一時的なエラー、5 恒久的なエラー -/
  st : Nat
  /-- 実行した直後のサーバの内容 -/
  after : List Nat
deriving BEq, Hashable, Repr, Inhabited

structure Client where
  C : List Nat
  L : Nat
  base : Option Nat
  own : List Nat
  inflight : Nat
  localChange : Bool
  conflict : Bool
  saveError : Bool
  retry : Bool
  loggedIn : Bool
  /-- このクライアントの時計の最後の値 -/
  clk : Nat
  q : List (Nat × List Nat)
deriving BEq, Hashable, Repr, Inhabited

structure St where
  sv : Nat
  S : List Nat
  cs : List Client
  txns : List Txn
  nextEdit : Nat
  clock : Nat
  transient : Nat
  permanent : Nat
  reloads : Nat
deriving BEq, Hashable, Repr, Inhabited

structure Cfg where
  name : String
  /-- 0: 全体で一意に増える時計、1: クライアントごとに増える（クライアント間で同じ値がありうる）、2: 任意（戻りうる） -/
  clockMode : Nat := 0
  K : Nat := 4
  maxEdits : Nat := 3
  transient : Nat := 0
  permanent : Nat := 0
  dismiss : Bool := false
  loggedOut1 : Bool := false
  reloads : Nat := 1
  mutAlwaysAdopt : Bool := false
  mutAlwaysOverwrite : Bool := false
  mutNoSkip : Bool := false
  mutNoOwnAck : Bool := false
  /-- 修正案 1: transaction で、サーバが自分の同じ版なら書かない（`>` を `>=` に） -/
  fixSkipEq : Bool := false
  /-- 修正案 2: エラーの表示を閉じても「保存できていない」印は残す -/
  fixKeepError : Bool := false
  /-- 修正案 3: ログインしていなければ、watcher は `is_local_change` を下ろさない -/
  fixWatcherLogin : Bool := false
  /-- ログインしていないクライアントが、途中でログインできる -/
  canLogin : Bool := false

def freshClient (S : List Nat) (sv : Nat) (logged : Bool) : Client :=
  { C := S, L := sv, base := some sv, own := [], inflight := 0, localChange := false,
    conflict := false, saveError := false, retry := false, loggedIn := logged, clk := sv, q := [] }

def init (cfg : Cfg) : St :=
  { sv := 0, S := [], cs := [freshClient [] 0 true, freshClient [] 0 !cfg.loggedOut1],
    txns := [], nextEdit := 1, clock := 0, transient := cfg.transient, permanent := cfg.permanent,
    reloads := cfg.reloads }

def setC (s : St) (i : Nat) (c : Client) : St := { s with cs := s.cs.set i c }

/-- `save()` -/
def save (s : St) (i : Nat) : St :=
  let c := s.cs[i]!
  if !c.loggedIn then s
  else if c.conflict then s
  else
    let s := setC s i { c with own := ins c.L c.own, inflight := c.inflight + 1 }
    { s with txns := s.txns ++ [{ c := i, v := c.L, d := c.C, st := 0, after := [] }] }

def unsaved (c : Client) : Bool :=
  c.localChange || c.inflight > 0 || c.retry || c.saveError || c.conflict

abbrev Step := String × St × Option String

def edits (cfg : Cfg) (s : St) (i : Nat) : List Step :=
  if s.nextEdit > cfg.maxEdits then [] else
  let c := s.cs[i]!
  let vers : List Nat := match cfg.clockMode with
    | 0 => [s.clock + 1]
    | 1 => (List.range (cfg.K + 1)).filter (· > c.clk)
    | _ => (List.range (cfg.K + 1)).filter (· ≥ 1)
  vers.map fun v =>
    (s!"c{i}: 編集 e{s.nextEdit}（last_updated={v}）",
     { setC s i { c with C := ins s.nextEdit c.C, L := v, localChange := true, clk := max c.clk v }
       with nextEdit := s.nextEdit + 1, clock := max s.clock v }, none)

def watch (cfg : Cfg) (s : St) (i : Nat) : List Step :=
  let c := s.cs[i]!
  if !c.localChange then [] else
  if cfg.fixWatcherLogin && !c.loggedIn then [] else
  let s := setC s i { c with localChange := false }
  let label := if !c.loggedIn then s!"c{i}: watcher → save()（ログインしていないので dialog だけ）"
    else if c.conflict then s!"c{i}: watcher → save()（conflict 中なので書かない）"
    else s!"c{i}: watcher → save() v={c.L} 内容={c.C}"
  [(label, save s i, none)]

def runTxn (cfg : Cfg) (s : St) (j : Nat) : List Step :=
  let t := s.txns[j]!
  if t.st != 0 then [] else
  let c := s.cs[t.c]!
  let setT (s : St) (t' : Txn) : St := { s with txns := s.txns.set j t' }
  let errs : List Step :=
    (if s.transient > 0 then
      [(s!"c{t.c} の保存 v={t.v}: 一時的なエラー", { setT s { t with st := 4 } with transient := s.transient - 1 }, none)]
     else []) ++
    (if s.permanent > 0 then
      [(s!"c{t.c} の保存 v={t.v}: 恒久的なエラー", { setT s { t with st := 5 } with permanent := s.permanent - 1 }, none)]
     else [])
  let may := cfg.mutAlwaysOverwrite || c.base == some s.sv || c.own.contains s.sv
  let main : Step :=
    if !may then (s!"c{t.c} の保存 v={t.v}: サーバは {s.sv} → conflict", setT s { t with st := 3 }, none)
    else if !cfg.mutNoSkip && c.own.contains s.sv && (s.sv > t.v || (cfg.fixSkipEq && s.sv == t.v)) then
      (s!"c{t.c} の保存 v={t.v}: サーバは自分の新しい版 {s.sv} → 書かない", setT s { t with st := 2, after := s.S }, none)
    else
      let viol := if sub s.S t.d then none
        else some s!"P1 サーバで上書きして失う: サーバの {s.S}（v={s.sv}）を c{t.c} の {t.d}（v={t.v}）で上書き"
      let s' := setT s { t with st := 1, after := t.d }
      let s' := { s' with sv := t.v, S := t.d, cs := s'.cs.map fun cl => { cl with q := cl.q ++ [(t.v, t.d)] } }
      (s!"c{t.c} の保存 v={t.v}: サーバ {s.sv} に書く 内容={t.d}", s', viol)
  main :: errs

def finishTxn (s : St) (j : Nat) : List Step :=
  let t := s.txns[j]!
  if t.st == 0 then [] else
  let s0 := { s with txns := s.txns.eraseIdx j }
  let c := s.cs[t.c]!
  let c := { c with inflight := c.inflight - 1 }
  match t.st with
  | 1 | 2 =>
    if t.v == c.L then
      let c' := { c with saveError := false }
      let viol := if sub c.C t.after || c'.localChange || c'.inflight > 0 || c'.retry then none
        else some s!"P3 保存済みと表示して失う: c{t.c} の手元 {c.C} のうち、サーバ {t.after} に無いものがあるのに done"
      [(s!"c{t.c} の保存 v={t.v} が完了 → done", setC s0 t.c c', viol)]
    else [(s!"c{t.c} の保存 v={t.v} が完了（新しい編集があるので done にしない）", setC s0 t.c c, none)]
  | 3 => [(s!"c{t.c} の保存 v={t.v} が conflict で終わる", setC s0 t.c { c with conflict := true }, none)]
  | 4 => [(s!"c{t.c} の保存 v={t.v} が一時的なエラーで終わる → retry 待ち", setC s0 t.c { c with retry := true }, none)]
  | _ => [(s!"c{t.c} の保存 v={t.v} が失敗 → save_error", setC s0 t.c { c with saveError := true }, none)]

def deliver (cfg : Cfg) (s : St) (i : Nat) : List Step :=
  let c := s.cs[i]!
  (List.range c.q.length).map fun k =>
    let (v, D) := c.q[k]!
    let c := { c with q := c.q.drop (k + 1) }
    if v == c.L then (s!"c{i}: snapshot v={v}（今の版と同じ）", setC s i { c with base := some v }, none)
    else if !cfg.mutNoOwnAck && c.own.contains v then (s!"c{i}: snapshot v={v}（自分の古い保存）", setC s i c, none)
    else if !cfg.mutAlwaysAdopt && unsaved c then
      (s!"c{i}: snapshot v={v}（保存していない変更があるので conflict）", setC s i { c with conflict := true }, none)
    else
      let viol := if sub c.C D then none
        else some s!"P2 手元で置き換えて失う: c{i} の手元 {c.C} を、サーバの版 {D}（v={v}）で置き換えた"
      (s!"c{i}: snapshot v={v} → サーバの版 {D} に置き換える", setC s i { c with C := D, L := v, base := some v }, viol)

def others (cfg : Cfg) (s : St) (i : Nat) : List Step :=
  let c := s.cs[i]!
  (if c.retry then [(s!"c{i}: retry → save()", save (setC s i { c with retry := false }) i, none)] else []) ++
  (if !c.loggedIn && cfg.canLogin then [(s!"c{i}: ログインする", setC s i { c with loggedIn := true }, none)] else []) ++
  (if cfg.dismiss && !cfg.fixKeepError && c.saveError then [(s!"c{i}: エラーの表示を閉じる", setC s i { c with saveError := false }, none)] else []) ++
  (if c.conflict && s.reloads > 0 then
    [(s!"c{i}: 再読み込み", { setC s i (freshClient s.S s.sv c.loggedIn) with
        txns := s.txns.filter (·.c != i), reloads := s.reloads - 1 }, none)] else [])

def steps (cfg : Cfg) (s : St) : List Step :=
  let per := (List.range s.cs.length).flatMap fun i =>
    edits cfg s i ++ watch cfg s i ++ deliver cfg s i ++ others cfg s i
  let tx := (List.range s.txns.length).flatMap fun j => runTxn cfg s j ++ finishTxn s j
  per ++ tx

/-- P4：状態ごとに調べる -/
def p4 (s : St) : Option String :=
  let bad := (List.range s.cs.length).filter fun i =>
    let c := s.cs[i]!
    !sub c.C s.S && !unsaved c && c.q.isEmpty && !(s.txns.any (·.c == i))
  match bad.head? with
  | some i => some s!"P4 黙って保存されない: c{i} の手元 {s.cs[i]!.C} にサーバ {s.S} に無いものがあり、保存も印も残っていない"
  | none => none

structure Found where
  kind : String
  trace : List String
  detail : String

def traceOf (parent : Std.HashMap St (St × String)) (s : St) : List String := Id.run do
  let mut out : List String := []
  let mut cur := s
  for _ in [0:200] do
    match parent.get? cur with
    | some (p, l) => out := l :: out; cur := p
    | none => break
  return out

def explore (cfg : Cfg) (limit : Nat := 3000000) : Nat × List Found := Id.run do
  let s0 := init cfg
  let mut parent : Std.HashMap St (St × String) := {}
  let mut seen : Std.HashSet St := ({} : Std.HashSet St).insert s0
  let mut frontier : Array St := #[s0]
  let mut found : List Found := []
  let kindOf (v : String) := (v.splitOn " ").head!
  while frontier.size > 0 && seen.size < limit do
    let mut next : Array St := #[]
    for s in frontier do
      for (l, s', viol) in steps cfg s do
        let viol := viol.orElse fun _ => p4 s'
        -- 崩れた後も調べ続ける（崩れた先で、さらに別の性質が崩れる連鎖を見るため）
        if let some v := viol then
          if !(found.any (·.kind == kindOf v)) then
            found := found ++ [{ kind := kindOf v, trace := traceOf parent s ++ [l], detail := v }]
        if !seen.contains s' then
          seen := seen.insert s'
          parent := parent.insert s' (s, l)
          next := next.push s'
    frontier := next
  return (seen.size, found)

def configs : List (Cfg × List String) := [
  ({ name := "A. 時計は全体で一意に増える・エラーなし" }, []),
  ({ name := "B. A + 一時的なエラー 1 回", transient := 1 }, ["P2"]),
  ({ name := "B4. B で編集を 4 回まで", transient := 1, maxEdits := 4 }, ["P1", "P2"]),
  ({ name := "C. A + 恒久的なエラー 1 回（表示は閉じない）", permanent := 1 }, []),
  ({ name := "D. C + エラーの表示を閉じる", permanent := 1, dismiss := true }, ["P2", "P4"]),
  ({ name := "E. A + c1 がログインしていない（anyone_writable）、途中でログインできる", loggedOut1 := true, canLogin := true }, ["P2", "P4"]),
  ({ name := "F. 時計はクライアントごとに増える（端末どうしで同じ値がありうる）", clockMode := 1 }, ["P1"]),
  ({ name := "G. 時計が戻りうる・同じ値がありうる", clockMode := 2, K := 3 }, ["P1", "P3", "P4", "P2"]),
  ({ name := "B4'. B4 + 修正案 1", transient := 1, maxEdits := 4, fixSkipEq := true }, []),
  ({ name := "D'. D + 修正案 2", permanent := 1, dismiss := true, fixKeepError := true }, []),
  ({ name := "E'. E + 修正案 3", loggedOut1 := true, canLogin := true, fixWatcherLogin := true }, []),
  ({ name := "ALL'. 時計は一意・一時的と恒久的なエラー・表示を閉じる・未ログインからログイン、と修正案 1〜3 すべて",
      transient := 1, permanent := 1, dismiss := true, loggedOut1 := true, canLogin := true,
      fixSkipEq := true, fixKeepError := true, fixWatcherLogin := true }, []),
  ({ name := "M1. 変異: snapshot を常に採用", mutAlwaysAdopt := true }, ["P2", "P1"]),
  ({ name := "M2. 変異: may_overwrite を常に true", mutAlwaysOverwrite := true }, ["P1"]),
  ({ name := "M3. 変異: 自分の古い保存の ack を見分けない", mutNoOwnAck := true }, ["P2"])
]

def run : IO UInt32 := do
  let mut bad := false
  for (cfg, expected) in configs do
    let (n, found) := explore cfg
    let kinds := found.map (·.kind)
    IO.println s!"\n■ {cfg.name}: 状態 {n} 個、崩れた性質 {kinds}（期待 {expected}）"
    for f in found do
      IO.println s!"  {f.detail}"
      for (l, k) in f.trace.zipIdx do IO.println s!"    {k+1}. {l}"
    let missing := expected.filter (!kinds.contains ·)
    -- 崩れる想定の構成では、期待した性質が崩れていれば、連鎖で他も崩れてよい
    let extra := if expected.isEmpty then kinds else []
    if !missing.isEmpty || !extra.isEmpty then
      IO.println s!"  !! 期待と違う: 足りない {missing}、余計 {extra}"
      bad := true
  return if bad then 1 else 0

end SaveLock
