/-
証明した定理が `sorry` を使っていないこと、使う公理が標準の 3 つ
（`propext`・`Classical.choice`・`Quot.sound`）だけであることを、build の中で確かめる。
崩れていれば `lake build` が失敗する。
-/
import Lean.Util.CollectAxioms
import Lean.Elab.Command
import BackupPolicy.Thin
import BackupPolicy.OverCap

open Lean Elab Command in
elab "#assert_axioms " ids:ident* : command => do
  let allowed := [``propext, ``Classical.choice, ``Quot.sound]
  for id in ids do
    let n ← liftCoreM <| realizeGlobalConstNoOverloadWithInfo id
    let axs ← liftCoreM <| Lean.collectAxioms n
    if axs.contains ``sorryAx then throwError "{n} は sorry を使っている"
    for a in axs do
      unless allowed.contains a do throwError "{n} が想定外の公理 {a} を使っている"
    logInfo m!"{n}: {axs.toList}"

#assert_axioms BP.thinKeep_sublist BP.take_prefix_thinKeep BP.head_mem_thinKeep
  BP.first_of_bucket_kept BP.bucket_covered BP.thinKeep_zero_congr BP.thinKeep_zero_idem
  BP.thinKeep_idem BP.thinKeep_drop_nodup
  BP.overCapGo_not_prot BP.overCapGo_prefix BP.overCapGo_under_cap BP.overCapGo_needed
