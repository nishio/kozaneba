/-
`select_thinned` の本体（`newest_first.forEach`）を、bucket の決め方を問わない形で写し、
一般に成り立つことを証明する。

```ts
newest_first.forEach((m, i) => {
  const bucket = bucket_of(m.saved_at, now);
  const is_first_of_bucket = !seen.has(bucket);
  seen.add(bucket);
  if (i < BACKUP_POLICY.keep_recent || is_first_of_bucket) return;
  to_delete.push(m.id);
});
```

`thinKeep bucket k seen xs` は、新しい順の列 `xs` のうち残すものを返す。
`k` は keep_recent の残り（`i < keep_recent` を、1 つ進むごとに 1 減らして写す）、
`seen` はそれまでに見た bucket。bucket は `seen` に、残すときも消すときも足す。
-/
namespace BP

variable {α β : Type} [DecidableEq β]

def thinKeep (bucket : α → β) : Nat → List β → List α → List α
  | _, _, [] => []
  | k + 1, seen, x :: xs => x :: thinKeep bucket k (bucket x :: seen) xs
  | 0, seen, x :: xs =>
    if bucket x ∈ seen then thinKeep bucket 0 (bucket x :: seen) xs
    else x :: thinKeep bucket 0 (bucket x :: seen) xs

section
variable (bucket : α → β)

/-- 残すものは元の列の部分列（順も保つ）。 -/
theorem thinKeep_sublist : ∀ (k : Nat) (seen : List β) (xs : List α),
    (thinKeep bucket k seen xs).Sublist xs
  | _, _, [] => by simp [thinKeep]
  | k + 1, seen, x :: xs => by
    simp only [thinKeep]
    exact (thinKeep_sublist k _ xs).cons_cons x
  | 0, seen, x :: xs => by
    simp only [thinKeep]
    split
    · exact (thinKeep_sublist 0 _ xs).cons x
    · exact (thinKeep_sublist 0 _ xs).cons_cons x

/-- 新しい k 件は、そのまま先頭に残る（keep_recent）。 -/
theorem take_prefix_thinKeep : ∀ (k : Nat) (seen : List β) (xs : List α),
    xs.take k <+: thinKeep bucket k seen xs
  | _, _, [] => by simp [thinKeep]
  | 0, seen, x :: xs => by simp
  | k + 1, seen, x :: xs => by
    simp only [thinKeep, List.take_succ_cons]
    exact (List.prefix_cons_inj x).mpr (take_prefix_thinKeep k _ xs)

/-- いちばん新しいものは必ず残る（seen が空なら、k = 0 でも）。 -/
theorem head_mem_thinKeep (k : Nat) (x : α) (xs : List α) :
    x ∈ thinKeep bucket k [] (x :: xs) := by
  cases k <;> simp [thinKeep]

/-- 各 bucket のいちばん新しいもの（列で最初に現れるもの）は残る。
`xs = l₁ ++ x :: l₂` で、`l₁` に `x` と同じ bucket が無く、`seen` にも無ければ、`x` は残る。 -/
theorem first_of_bucket_kept : ∀ (k : Nat) (seen : List β) (l₁ : List α) (x : α) (l₂ : List α),
    (∀ y ∈ l₁, bucket y ≠ bucket x) → bucket x ∉ seen →
    x ∈ thinKeep bucket k seen (l₁ ++ x :: l₂)
  | k, seen, [], x, l₂, _, hs => by
    cases k with
    | zero => simp [thinKeep, hs]
    | succ k => simp [thinKeep]
  | k, seen, y :: l₁, x, l₂, h1, hs => by
    have hy : bucket y ≠ bucket x := h1 y (by simp)
    have h1' : ∀ z ∈ l₁, bucket z ≠ bucket x := fun z hz => h1 z (by simp [hz])
    have hs' : bucket x ∉ bucket y :: seen := by
      simp only [List.mem_cons, not_or]; exact ⟨fun e => hy e.symm, hs⟩
    have ih := first_of_bucket_kept (k - 1) (bucket y :: seen) l₁ x l₂ h1' hs'
    have ih0 := first_of_bucket_kept 0 (bucket y :: seen) l₁ x l₂ h1' hs'
    cases k with
    | succ k => simp only [List.cons_append, thinKeep]; exact List.mem_cons_of_mem _ ih
    | zero =>
      simp only [List.cons_append, thinKeep]
      split
      · exact ih0
      · exact List.mem_cons_of_mem _ ih0

/-- どの backup についても、同じ bucket のものが 1 つは残る（seen に無い bucket について）。 -/
theorem bucket_covered (k : Nat) (seen : List β) (xs : List α) (x : α) (hx : x ∈ xs)
    (hs : bucket x ∉ seen) : ∃ y ∈ thinKeep bucket k seen xs, bucket y = bucket x := by
  -- x と同じ bucket で最初に現れるものを取る
  induction xs generalizing k seen with
  | nil => simp at hx
  | cons z zs ih =>
    by_cases hz : bucket z = bucket x
    · refine ⟨z, ?_, hz⟩
      have := first_of_bucket_kept bucket k seen [] z zs (by simp) (by rw [hz]; exact hs)
      simpa using this
    · have hx' : x ∈ zs := by
        rcases List.mem_cons.mp hx with e | h
        · exact absurd (by rw [e]) hz
        · exact h
      have hs' : bucket x ∉ bucket z :: seen := by
        simp only [List.mem_cons, not_or]; exact ⟨fun e => hz e.symm, hs⟩
      cases k with
      | succ k =>
        obtain ⟨y, hy, e⟩ := ih k (bucket z :: seen) hx' hs'
        exact ⟨y, by simp only [thinKeep]; exact List.mem_cons_of_mem _ hy, e⟩
      | zero =>
        obtain ⟨y, hy, e⟩ := ih 0 (bucket z :: seen) hx' hs'
        refine ⟨y, ?_, e⟩
        simp only [thinKeep]
        split
        · exact hy
        · exact List.mem_cons_of_mem _ hy

/-- keep_recent を使い切った後は、seen を同じ集合に取り替えても結果が同じ。 -/
theorem thinKeep_zero_congr : ∀ (s t : List β) (xs : List α), (∀ b, b ∈ s ↔ b ∈ t) →
    thinKeep bucket 0 s xs = thinKeep bucket 0 t xs
  | _, _, [], _ => by simp [thinKeep]
  | s, t, x :: xs, h => by
    have h' : ∀ b, b ∈ bucket x :: s ↔ b ∈ bucket x :: t := by
      intro b; simp only [List.mem_cons]; rw [h b]
    simp only [thinKeep]
    rw [thinKeep_zero_congr _ _ xs h']
    by_cases hx : bucket x ∈ s
    · have : bucket x ∈ t := (h _).mp hx
      simp [hx, this]
    · have : bucket x ∉ t := fun e => hx ((h _).mpr e)
      simp [hx, this]

/-- keep_recent を使い切った後の冪等性。2 回目の seen `t` は、1 回目の seen `s` と同じ集合であればよい。 -/
theorem thinKeep_zero_idem : ∀ (s t : List β) (xs : List α), (∀ b, b ∈ s ↔ b ∈ t) →
    thinKeep bucket 0 t (thinKeep bucket 0 s xs) = thinKeep bucket 0 s xs
  | _, _, [], _ => by simp [thinKeep]
  | s, t, x :: xs, h => by
    by_cases hx : bucket x ∈ s
    · -- 1 回目は x を消す。消した x の bucket はもう s にあるので、s と bucket x :: s は同じ集合
      have h' : ∀ b, b ∈ bucket x :: s ↔ b ∈ t := by
        intro b; simp only [List.mem_cons]
        constructor
        · rintro (e | e)
          · rw [e]; exact (h _).mp hx
          · exact (h _).mp e
        · intro e; exact Or.inr ((h _).mpr e)
      simp only [thinKeep, hx, ite_true]
      exact thinKeep_zero_idem (bucket x :: s) t xs h'
    · have ht : bucket x ∉ t := fun e => hx ((h _).mpr e)
      have h' : ∀ b, b ∈ bucket x :: s ↔ b ∈ bucket x :: t := by
        intro b; simp only [List.mem_cons]; rw [h b]
      simp only [thinKeep, hx, ite_false, ht]
      rw [thinKeep_zero_idem (bucket x :: s) (bucket x :: t) xs h']

/-- 冪等: 間引いた結果をもう一度（同じ時刻で）間引いても変わらない。 -/
theorem thinKeep_idem : ∀ (k : Nat) (s : List β) (xs : List α),
    thinKeep bucket k s (thinKeep bucket k s xs) = thinKeep bucket k s xs
  | 0, s, xs => thinKeep_zero_idem bucket s s xs (fun _ => Iff.rfl)
  | _ + 1, _, [] => by simp [thinKeep]
  | k + 1, s, x :: xs => by
    simp only [thinKeep]
    rw [thinKeep_idem k (bucket x :: s) xs]

/-- 残る数の上限: 新しい k 件と、bucket ごとに 1 件まで。
（`thinKeep` が `k` 件を越えて残すものは、bucket がすべて違い、seen にも無い） -/
theorem thinKeep_drop_nodup : ∀ (k : Nat) (s : List β) (xs : List α),
    (((thinKeep bucket k s xs).drop k).map bucket).Nodup ∧
      (∀ y ∈ (thinKeep bucket k s xs).drop k, bucket y ∉ s)
  | _, _, [] => by simp [thinKeep]
  | k + 1, s, x :: xs => by
    simp only [thinKeep, List.drop_succ_cons]
    obtain ⟨h1, h2⟩ := thinKeep_drop_nodup k (bucket x :: s) xs
    refine ⟨h1, fun y hy => ?_⟩
    have := h2 y hy
    simp only [List.mem_cons, not_or] at this
    exact this.2
  | 0, s, x :: xs => by
    obtain ⟨h1, h2⟩ := thinKeep_drop_nodup 0 (bucket x :: s) xs
    simp only [List.drop_zero] at h1 h2
    simp only [thinKeep, List.drop_zero]
    split
    · refine ⟨h1, fun y hy => ?_⟩
      have := h2 y hy
      simp only [List.mem_cons, not_or] at this
      exact this.2
    · rename_i hx
      refine ⟨?_, ?_⟩
      · simp only [List.map_cons, List.nodup_cons]
        refine ⟨?_, h1⟩
        intro hm
        obtain ⟨y, hy, e⟩ := List.mem_map.mp hm
        have := h2 y hy
        simp only [List.mem_cons, not_or] at this
        exact this.1 e
      · intro y hy
        rcases List.mem_cons.mp hy with e | hy
        · rw [e]; exact hx
        · have := h2 y hy
          simp only [List.mem_cons, not_or] at this
          exact this.2

end
end BP
