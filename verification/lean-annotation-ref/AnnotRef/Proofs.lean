import AnnotRef.Model
/-!
# 一般の証明（配列の長さ・items の形を問わない）

* `resolve_hasItems`・`resolveF_hasItems`：どちらの解決も、返す位置の線は参照と同じ items を持つ。
* `resolve_safe`：items が参照と同じ線が、開いた線だけなら（他に無ければ）、今のコードは別の線を返さない。
* `resolve_live`：開いた線が items を変えずに残り、同じ items の線が他に無ければ、今のコードはその位置を返す。
* `resolveF_eq_resolve`：同じ items の線が 1 本以下なら、修正案は今のコードと同じ答えを返す。
* `resolveF_correct`：同じ items の線の顔ぶれ（id の並び）が変わらなければ、修正案は開いた線を返す。
* `no_resolver_without_id`：線に id が無い限り、どんな解決の規則でも、「何も変わらなければ同じ線を
  返す」と「別の線を返さない」は両立しない（線を消して同じ items の線を足す 1 回の保存で崩れる）。
-/
namespace AnnotRef

theorem hasAt_iff {ls : List Line} {xs : List ItemId} {j : Nat} :
    hasAt ls xs j = true ↔ ∃ l, ls[j]? = some l ∧ l.items = xs := by
  unfold hasAt
  cases h : ls[j]? with
  | none => simp
  | some l => simp [hasItems]

theorem mem_sameIdx {ls : List Line} {xs : List ItemId} {j : Nat} :
    j ∈ sameIdx ls xs ↔ ∃ l, ls[j]? = some l ∧ l.items = xs := by
  unfold sameIdx
  rw [List.mem_filter, List.mem_range, hasAt_iff]
  constructor
  · exact fun h => h.2
  · rintro ⟨l, hl, hx⟩
    refine ⟨?_, l, hl, hx⟩
    exact (List.getElem?_eq_some_iff.mp hl).1

/-! ## 今のコード -/

theorem resolve_hasItems {ls : List Line} {r : Ref} {j : Nat} (h : resolve ls r = some j) :
    ∃ l, ls[j]? = some l ∧ l.items = r.items := by
  unfold resolve at h
  split at h
  · rename_i hc
    have hj : r.index = j := Option.some.inj h
    subst hj
    cases hl : ls[r.index]? with
    | none => simp [hl] at hc
    | some l => exact ⟨l, rfl, by simpa [hl, hasItems] using hc⟩
  · obtain ⟨hj, hp, _⟩ := List.findIdx?_eq_some_iff_getElem.mp h
    exact ⟨ls[j], by simp [hj], by simpa [hasItems] using hp⟩

/-- 同じ items の線が開いた線（id `t`）だけなら、今のコードは別の線を返さない -/
theorem resolve_safe {ls : List Line} {r : Ref} {t j : Nat}
    (hu : ∀ l ∈ ls, l.items = r.items → l.id = t) (h : resolve ls r = some j) :
    ∃ l, ls[j]? = some l ∧ l.id = t := by
  obtain ⟨l, hl, hx⟩ := resolve_hasItems h
  exact ⟨l, hl, hu l (List.mem_of_getElem? hl) hx⟩

/-- 位置 `p` の線が参照と同じ items を持ち、そういう線が他に無ければ、今のコードは `p` を返す -/
theorem resolve_live {ls : List Line} {r : Ref} {p : Nat} {l : Line}
    (hp : ls[p]? = some l) (hx : l.items = r.items)
    (hu : ∀ j l', ls[j]? = some l' → l'.items = r.items → j = p) :
    resolve ls r = some p := by
  cases h : resolve ls r with
  | some j =>
    obtain ⟨l', hl', hx'⟩ := resolve_hasItems h
    rw [hu j l' hl' hx']
  | none =>
    unfold resolve at h
    split at h
    · simp at h
    · rw [List.findIdx?_eq_none_iff] at h
      have := h l (List.mem_of_getElem? hp)
      simp [hasItems, hx] at this

/-! ## 修正案 -/

theorem resolveF_hasItems {ls : List Line} {r : RefF} {j : Nat} (h : resolveF ls r = some j) :
    ∃ l, ls[j]? = some l ∧ l.items = r.items := by
  simp only [resolveF] at h
  split at h
  · exact mem_sameIdx.mp (List.mem_of_getElem? h)
  · simp at h

/-- 同じ items の線が 1 本以下なら、修正案（開いた時に 1 本だった参照）は今のコードと同じ答え -/
theorem resolveF_eq_resolve {ls : List Line} {r : Ref} {rf : RefF}
    (hx : rf.items = r.items) (hc : rf.count = 1) (hn : rf.nth = 0)
    (h1 : (sameIdx ls r.items).length ≤ 1) :
    resolveF ls rf = resolve ls r := by
  simp only [resolveF]
  rw [hx, hc, hn]
  match hm : sameIdx ls r.items, h1 with
  | [], _ =>
    simp only [List.length_nil]
    -- どの位置も同じ items を持たないので、今のコードも null
    cases h : resolve ls r with
    | none => simp
    | some j =>
      obtain ⟨l, hl, hl'⟩ := resolve_hasItems h
      have : j ∈ sameIdx ls r.items := mem_sameIdx.mpr ⟨l, hl, hl'⟩
      rw [hm] at this
      simp at this
  | [p], _ =>
    simp only [List.length_singleton, ite_true]
    have hpm : p ∈ sameIdx ls r.items := by rw [hm]; simp
    obtain ⟨l, hl, hl'⟩ := mem_sameIdx.mp hpm
    symm
    simp only [List.getElem?_cons_zero]
    apply resolve_live hl hl'
    intro j l' hj hj'
    have : j ∈ sameIdx ls r.items := mem_sameIdx.mpr ⟨l', hj, hj'⟩
    rw [hm] at this
    simpa using this
  | _ :: _ :: _, h => simp at h

/-- 開いた線の items が他の線と重ならなければ、修正案の参照は「1 本のうちの最初」 -/
theorem refOfF_unique {ls : List Line} {i : Nat} {l : Line} (hi : ls[i]? = some l)
    (hu : ∀ j l', ls[j]? = some l' → l'.items = l.items → j = i) :
    (refOfF ls i).count = 1 ∧ (refOfF ls i).nth = 0 ∧ (refOfF ls i).items = l.items := by
  have hm : sameIdx ls l.items = [i] := by
    have hmem : ∀ j, j ∈ sameIdx ls l.items ↔ j = i := by
      intro j
      rw [mem_sameIdx]
      constructor
      · rintro ⟨l', hl', hx⟩; exact hu j l' hl' hx
      · rintro rfl; exact ⟨l, hi, rfl⟩
    -- range の filter なので重複が無い
    have hnd : (sameIdx ls l.items).Nodup := (List.nodup_range).filter _
    match hs : sameIdx ls l.items with
    | [] => have := (hmem i).mpr rfl; rw [hs] at this; simp at this
    | [a] => have := (hmem a).mp (by rw [hs]; simp); rw [this]
    | a :: b :: rest =>
      have ha := (hmem a).mp (by rw [hs]; simp)
      have hb := (hmem b).mp (by rw [hs]; simp)
      rw [hs] at hnd
      simp [ha, hb] at hnd
  simp [refOfF, hi, hm]

/-- 同じ items の線の id の並び -/
def sameIds (ls : List Line) (xs : List ItemId) : List Nat :=
  (sameIdx ls xs).map fun j => ((ls[j]?).map (·.id)).getD 0

/-- 開いた時と今とで、同じ items の線の顔ぶれ（id の並び）が同じなら、修正案は開いた線を返す -/
theorem resolveF_correct {ls ls' : List Line} {i : Nat} {l : Line} (hi : ls[i]? = some l)
    (hs : sameIds ls' l.items = sameIds ls l.items) :
    ∃ j l', resolveF ls' (refOfF ls i) = some j ∧ ls'[j]? = some l' ∧ l'.id = l.id := by
  have href : refOfF ls i =
      { items := l.items, nth := (sameIdx ls l.items).idxOf i,
        count := (sameIdx ls l.items).length } := by
    simp [refOfF, hi]
  rw [href]
  have hlen : (sameIdx ls' l.items).length = (sameIdx ls l.items).length := by
    have := congrArg List.length hs
    simpa [sameIds] using this
  have hmem : i ∈ sameIdx ls l.items := mem_sameIdx.mpr ⟨l, hi, rfl⟩
  have hn : (sameIdx ls l.items).idxOf i < (sameIdx ls l.items).length :=
    List.idxOf_lt_length_of_mem hmem
  have hget : (sameIdx ls l.items)[(sameIdx ls l.items).idxOf i] = i := List.getElem_idxOf hn
  have hn' : (sameIdx ls l.items).idxOf i < (sameIdx ls' l.items).length := by rw [hlen]; exact hn
  let n := (sameIdx ls l.items).idxOf i
  let j := (sameIdx ls' l.items)[n]
  have hj : j ∈ sameIdx ls' l.items := List.getElem_mem hn'
  obtain ⟨l', hl', _⟩ := mem_sameIdx.mp hj
  refine ⟨j, l', ?_, hl', ?_⟩
  · simp only [resolveF, hlen, ite_true]
    exact List.getElem?_eq_getElem hn'
  · -- 並びの n 番目の id を、両側で比べる
    have h1 := congrArg (·[n]?) hs
    simp only [sameIds, List.getElem?_map] at h1
    rw [List.getElem?_eq_getElem hn', List.getElem?_eq_getElem hn] at h1
    simp only [Option.map_some, Option.some.injEq] at h1
    have hg : (sameIdx ls l.items)[n] = i := hget
    rw [hg, hi] at h1
    show l'.id = l.id
    have : (sameIdx ls' l.items)[n] = j := rfl
    rw [this, hl'] at h1
    simpa using h1

/-! ## id が無い限り避けられない -/

/-- 線の、コードから見える中身（items と属性）。`id` は見えない。 -/
def view (ls : List Line) : List (List ItemId × Nat) := ls.map fun l => (l.items, l.attr)

/-- どんな解決の規則 `g`（開いた時の中身・位置、今の中身 → 位置）でも、
「何も変わらなければ開いた位置を返す」なら、「線 0 を消して、同じ items の線を末尾に足す」
1 回の保存の後で、開いた線（id 1）ではなく新しい線（id 2）を返す。 -/
theorem no_resolver_without_id
    (g : List (List ItemId × Nat) → Nat → List (List ItemId × Nat) → Option Nat)
    (live : ∀ ls i, i < ls.length → g (view ls) i (view ls) = some i) :
    let ls : List Line := [{ id := 0, items := [0, 1] }, { id := 1, items := [0, 1] }]
    let ls' := append 2 [0, 1] (deleteLine 0 ls)
    g (view ls) 1 (view ls') = some 1 ∧
      (ls'[1]?).map (·.id) = some 2 ∧ (ls[1]?).map (·.id) = some 1 := by
  intro ls ls'
  have hv : view ls' = view ls := by decide
  refine ⟨?_, by decide, by decide⟩
  rw [hv]
  exact live ls 1 (by decide)

end AnnotRef
