/-
`select_over_cap` のループを写し、一般に成り立つことを証明する。

```ts
for (const m of oldest_first) {
  if (total <= cap) break;
  if (protected_ids.has(m.id)) continue;
  to_delete.push(m.id);
  total -= m.size;
}
```

`prot` は「その場のいちばん新しい backup」か。`total` は今の総量。
-/
namespace BP

structure Meta where
  id : Nat
  ba : Nat
  t : Int      -- saved_at
  size : Nat
deriving Repr, DecidableEq, BEq, Inhabited

def overCapGo (prot : Meta → Bool) (cap : Int) : Int → List Meta → List Meta
  | _, [] => []
  | total, m :: ms =>
    if total ≤ cap then []
    else if prot m then overCapGo prot cap total ms
    else m :: overCapGo prot cap (total - m.size) ms

def sizeSum (ms : List Meta) : Int := (ms.map (fun m => (m.size : Int))).sum

section
variable (prot : Meta → Bool) (cap : Int)

/-- 守るもの（その場のいちばん新しい backup）は消さない。 -/
theorem overCapGo_not_prot : ∀ (total : Int) (ms : List Meta),
    ∀ m ∈ overCapGo prot cap total ms, prot m = false
  | _, [] => by simp [overCapGo]
  | total, x :: ms => by
    intro m hm
    simp only [overCapGo] at hm
    split at hm
    · simp at hm
    · split at hm
      · exact overCapGo_not_prot total ms m hm
      · rename_i hp
        rcases List.mem_cons.mp hm with e | hm
        · rw [e]; simpa using hp
        · exact overCapGo_not_prot _ ms m hm

/-- 消すのは、守らないものを古い順に並べた列の、先頭の一部（古いものから消す）。 -/
theorem overCapGo_prefix : ∀ (total : Int) (ms : List Meta),
    overCapGo prot cap total ms <+: ms.filter (fun m => !prot m)
  | _, [] => by simp [overCapGo]
  | total, x :: ms => by
    simp only [overCapGo]
    split
    · exact List.nil_prefix
    · by_cases hp : prot x = true
      · simp only [hp, ite_true, List.filter_cons, Bool.not_true]
        exact overCapGo_prefix total ms
      · have hp' : prot x = false := by simpa using hp
        simp only [hp', List.filter_cons, Bool.not_false, ite_true]
        exact (List.prefix_cons_inj x).mpr (overCapGo_prefix _ ms)

/-- 消した後の総量が上限を越えているなら、守らないものはすべて消している。
つまり、上限を越えたまま残るのは、各場のいちばん新しい backup だけのとき。 -/
theorem overCapGo_under_cap : ∀ (total : Int) (ms : List Meta),
    total - sizeSum (overCapGo prot cap total ms) > cap →
    ∀ m ∈ ms, prot m = false → m ∈ overCapGo prot cap total ms
  | _, [], _ => by simp
  | total, x :: ms, h => by
    intro m hm hpm
    simp only [overCapGo] at h ⊢
    by_cases hc : total ≤ cap
    · simp only [hc, ite_true, sizeSum, List.map_nil, List.sum_nil] at h
      omega
    · simp only [hc, ite_false] at h ⊢
      by_cases hp : prot x = true
      · simp only [hp, ite_true] at h ⊢
        rcases List.mem_cons.mp hm with e | hm
        · rw [e] at hpm; rw [hpm] at hp; cases hp
        · exact overCapGo_under_cap total ms h m hm hpm
      · have hp' : prot x = false := by simpa using hp
        simp only [hp', Bool.false_eq_true, ite_false] at h ⊢
        have h' : total - x.size - sizeSum (overCapGo prot cap (total - x.size) ms) > cap := by
          simp only [sizeSum, List.map_cons, List.sum_cons] at h
          simp only [sizeSum]; omega
        rcases List.mem_cons.mp hm with e | hm
        · rw [e]; exact List.mem_cons_self
        · exact List.mem_cons_of_mem _ (overCapGo_under_cap _ ms h' m hm hpm)

/-- 消しすぎない: 1 つ消す直前には、総量が上限を越えている。 -/
theorem overCapGo_needed : ∀ (total : Int) (ms : List Meta) (i : Nat),
    i < (overCapGo prot cap total ms).length →
    total - sizeSum ((overCapGo prot cap total ms).take i) > cap
  | _, [], i, h => by simp [overCapGo] at h
  | total, x :: ms, i, h => by
    simp only [overCapGo] at h ⊢
    by_cases hc : total ≤ cap
    · simp [hc] at h
    · simp only [hc, ite_false] at h ⊢
      by_cases hp : prot x = true
      · simp only [hp, ite_true] at h ⊢
        exact overCapGo_needed total ms i h
      · have hp' : prot x = false := by simpa using hp
        simp only [hp', Bool.false_eq_true, ite_false] at h ⊢
        cases i with
        | zero => simp [sizeSum]; omega
        | succ i =>
          simp only [List.length_cons] at h
          have := overCapGo_needed (total - x.size) ms i (by omega)
          simp only [List.take_succ_cons, sizeSum, List.map_cons, List.sum_cons] at this ⊢
          omega

end
end BP
