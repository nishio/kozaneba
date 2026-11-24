import Nest.Model
/-!
# 不変条件が保たれることの証明（盤面の大きさを問わない）

* `moveTo_wf`：1 アイテムの付け替え。`dst = some g` のときは「`g` は group」「`g` は `x` の子孫でも `x` 自身でもない」が前提
* `moveFront_wf`：`move_front` の 1 段
* `cleanup_wf`：空で題の無い親 group を消す
* `dropIntoGroup_wf` / `dropOut_wf`：`drag_drop_item_into_group` / `drag_drop_item`
* `selectionIntoGroup_wf`：`drag_drop_selection_into_group`
* `ungroup_wf`：`ungroup`
* `makeGroup_wf`：`make_items_into_new_group`
-/
namespace Nest
open Board

/-! ## cnt と sumTo -/

@[simp] theorem cnt_nil (y : ItemId) : cnt y [] = 0 := rfl
@[simp] theorem cnt_cons (y x : ItemId) (l : List ItemId) :
    cnt y (x :: l) = (if x = y then 1 else 0) + cnt y l := rfl

theorem cnt_append (y : ItemId) (l₁ l₂ : List ItemId) :
    cnt y (l₁ ++ l₂) = cnt y l₁ + cnt y l₂ := by
  induction l₁ with
  | nil => simp
  | cons x xs ih => simp only [List.cons_append, cnt_cons, ih]; omega

theorem cnt_pos_iff (y : ItemId) (l : List ItemId) : 0 < cnt y l ↔ y ∈ l := by
  induction l with
  | nil => simp
  | cons x xs ih =>
    by_cases h : x = y
    · subst h; simp; omega
    · have h' : y ≠ x := fun e => h e.symm
      simp [h, h', ih]

theorem cnt_eq_zero_iff (y : ItemId) (l : List ItemId) : cnt y l = 0 ↔ y ∉ l := by
  rw [← cnt_pos_iff]; omega

theorem cnt_filter (y : ItemId) (l : List ItemId) (P : ItemId → Bool) :
    cnt y (l.filter P) = if P y then cnt y l else 0 := by
  induction l with
  | nil => simp
  | cons z zs ih =>
    rw [List.filter_cons]
    by_cases hz : z = y
    · subst hz; split <;> simp_all
    · split <;> simp_all

theorem cnt_removeFrom (y x : ItemId) (l : List ItemId) :
    cnt y (removeFrom l x) = if y = x then 0 else cnt y l := by
  unfold removeFrom; rw [cnt_filter]; by_cases h : y = x <;> simp [h]

theorem mem_removeFrom {y x : ItemId} {l : List ItemId} : y ∈ removeFrom l x ↔ y ∈ l ∧ y ≠ x := by
  unfold removeFrom; simp [List.mem_filter]

theorem cnt_le_one_of_nodup (y : ItemId) : ∀ l : List ItemId, l.Nodup → cnt y l ≤ 1
  | [], _ => by simp
  | x :: xs, h => by
    rw [List.nodup_cons] at h
    have ih := cnt_le_one_of_nodup y xs h.2
    by_cases hx : x = y
    · subst hx; have := (cnt_eq_zero_iff x xs).2 h.1; simp; omega
    · simp [hx]; omega

theorem sumTo_congr (f g : Nat → Nat) : ∀ n, (∀ q, q < n → f q = g q) → sumTo f n = sumTo g n
  | 0, _ => rfl
  | k+1, h => by
    simp only [sumTo]
    rw [sumTo_congr f g k (fun q hq => h q (by omega)), h k (by omega)]

theorem sumTo_update (f g : Nat → Nat) (p : Nat) (hfg : ∀ q, q ≠ p → f q = g q) :
    ∀ n, p < n → sumTo f n + g p = sumTo g n + f p
  | 0, h => absurd h (Nat.not_lt_zero _)
  | k+1, h => by
    simp only [sumTo]
    by_cases hk : k = p
    · subst hk
      have := sumTo_congr f g k (fun q hq => hfg q (by omega))
      omega
    · have ih := sumTo_update f g p hfg k (by omega)
      have := hfg k hk
      omega

theorem le_sumTo (f : Nat → Nat) (p : Nat) : ∀ n, p < n → f p ≤ sumTo f n
  | 0, h => absurd h (Nat.not_lt_zero _)
  | k+1, h => by
    simp only [sumTo]
    by_cases hk : k = p
    · subst hk; omega
    · have := le_sumTo f p k (by omega); omega

namespace Board

/-! ## 基本の補題 -/

def ValidLoc (s : Board) : Loc → Prop
  | none => True
  | some p => s.store p ≠ none ∧ p < s.n

theorem children_of_none {s : Board} {p : ItemId} (h : s.store p = none) : s.children p = [] := by
  simp [children, h]

theorem present_of_mem_children {s : Board} {p c : ItemId} (h : c ∈ s.children p) : s.store p ≠ none := by
  intro hp; rw [children_of_none hp] at h; simp at h

/-- `occ` は「drawOrder の個数 + 各 group の items の個数」なので、1 つの group を変えたらその差だけ変わる -/
theorem occ_of_children (s s' : Board) (p : ItemId) (hn : s'.n = s.n) (hr : s'.roots = s.roots)
    (hc : ∀ q, q ≠ p → s'.children q = s.children q) (hp : p < s.n) (y : ItemId) :
    s'.occ y + cnt y (s.children p) = s.occ y + cnt y (s'.children p) := by
  unfold occ
  rw [hn, hr]
  have := sumTo_update (fun q => cnt y (s'.children q)) (fun q => cnt y (s.children q)) p
    (fun q hq => by simp only [hc q hq]) s.n hp
  omega

theorem cnt_children_le (s : Board) (p y : ItemId) (hp : p < s.n) : cnt y (s.children p) ≤ s.occ y := by
  unfold occ
  have := le_sumTo (fun q => cnt y (s.children q)) p s.n hp
  omega

theorem cnt_roots_le (s : Board) (y : ItemId) : cnt y s.roots ≤ s.occ y := by
  unfold occ; omega

theorem cnt_slot_le (s : Board) (loc : Loc) (h : s.ValidLoc loc) (y : ItemId) :
    cnt y (s.slot loc) ≤ s.occ y := by
  cases loc with
  | none => exact cnt_roots_le s y
  | some p => exact cnt_children_le s p y h.2

/-! ### setItems / setSlot -/

theorem setItems_store_none (s : Board) (p q : ItemId) (l : List ItemId) :
    (s.setItems p l).store q = none ↔ s.store q = none := by
  unfold setItems
  by_cases h : q = p
  · subst h; simp
  · simp [h]

theorem setItems_isGrp (s : Board) (p q : ItemId) (l : List ItemId) :
    (s.setItems p l).isGrp q = s.isGrp q := by
  unfold setItems isGrp
  by_cases h : q = p
  · subst h; cases s.store q <;> simp
  · simp [h]

theorem setItems_children (s : Board) (p q : ItemId) (l : List ItemId) (hp : s.store p ≠ none) :
    (s.setItems p l).children q = if q = p then l else s.children q := by
  unfold children setItems
  by_cases h : q = p
  · subst h
    cases hs : s.store q with
    | none => exact absurd hs hp
    | some nd => simp [hs]
  · simp [h]

theorem setSlot_n (s : Board) (loc : Loc) (l : List ItemId) : (s.setSlot loc l).n = s.n := by
  cases loc <;> rfl

theorem setSlot_store_none (s : Board) (loc : Loc) (l : List ItemId) (q : ItemId) :
    (s.setSlot loc l).store q = none ↔ s.store q = none := by
  cases loc with
  | none => exact Iff.rfl
  | some p => exact setItems_store_none s p q l

theorem setSlot_isGrp (s : Board) (loc : Loc) (l : List ItemId) (q : ItemId) :
    (s.setSlot loc l).isGrp q = s.isGrp q := by
  cases loc with
  | none => rfl
  | some p => exact setItems_isGrp s p q l

theorem setSlot_children (s : Board) (loc : Loc) (l : List ItemId) (h : s.ValidLoc loc) (q : ItemId) :
    (s.setSlot loc l).children q = if loc = some q then l else s.children q := by
  cases loc with
  | none => simp [setSlot, children]
  | some p =>
    rw [show (s.setSlot (some p) l) = s.setItems p l from rfl, setItems_children s p q l h.1]
    by_cases hq : q = p
    · subst hq; simp
    · have : ¬ (some p = some q) := fun e => hq (Option.some.inj e).symm
      simp [hq, this]

theorem setSlot_slot (s : Board) (loc : Loc) (l : List ItemId) (h : s.ValidLoc loc) (loc' : Loc) :
    (s.setSlot loc l).slot loc' = if loc' = loc then l else s.slot loc' := by
  cases loc' with
  | none =>
    cases loc with
    | none => simp [setSlot, slot]
    | some p => simp [setSlot, slot, setItems]
  | some q =>
    show (s.setSlot loc l).children q = _
    rw [setSlot_children s loc l h q]
    by_cases hq : loc = some q
    · subst hq; simp [slot]
    · have : ¬ (some q = loc) := fun e => hq e.symm
      simp [hq, this, slot]

theorem setSlot_validLoc (s : Board) (loc : Loc) (l : List ItemId) (loc' : Loc) (h : s.ValidLoc loc') :
    (s.setSlot loc l).ValidLoc loc' := by
  cases loc' with
  | none => trivial
  | some q => exact ⟨fun e => h.1 ((setSlot_store_none s loc l q).1 e), by rw [setSlot_n]; exact h.2⟩

theorem occ_setSlot (s : Board) (loc : Loc) (l : List ItemId) (h : s.ValidLoc loc) (y : ItemId) :
    (s.setSlot loc l).occ y + cnt y (s.slot loc) = s.occ y + cnt y l := by
  cases loc with
  | none =>
    show cnt y l + sumTo (fun p => cnt y (s.children p)) s.n + cnt y s.roots
      = cnt y s.roots + sumTo (fun p => cnt y (s.children p)) s.n + cnt y l
    omega
  | some p =>
    have := occ_of_children s (s.setSlot (some p) l) p rfl rfl
      (fun q hq => by
        rw [setSlot_children s (some p) l h q]
        have : ¬ (some p = some q) := fun e => hq (Option.some.inj e).symm
        simp [this]) h.2 y
    rw [setSlot_children s (some p) l h p] at this
    simpa [slot] using this

/-! ### erase / put -/

theorem erase_children (s : Board) (p q : ItemId) :
    (s.erase p).children q = if q = p then [] else s.children q := by
  unfold children erase; by_cases h : q = p <;> simp [h]

theorem occ_erase (s : Board) (p : ItemId) (hp : p < s.n) (y : ItemId) :
    (s.erase p).occ y + cnt y (s.children p) = s.occ y := by
  have := occ_of_children s (s.erase p) p rfl rfl
    (fun q hq => by rw [erase_children]; simp [hq]) hp y
  rw [erase_children] at this; simpa using this

theorem put_children (s : Board) (p q : ItemId) (nd : Node) :
    (s.put p nd).children q = if q = p then nd.items else s.children q := by
  unfold children put; by_cases h : q = p <;> simp [h]

theorem occ_put (s : Board) (p : ItemId) (nd : Node) (hp : p < s.n) (y : ItemId) :
    (s.put p nd).occ y + cnt y (s.children p) = s.occ y + cnt y nd.items := by
  have := occ_of_children s (s.put p nd) p rfl rfl
    (fun q hq => by rw [put_children]; simp [hq]) hp y
  rw [put_children] at this; simpa using this

/-! ### detach / pushTo -/

theorem occ_detach (s : Board) (loc : Loc) (x : ItemId) (h : s.ValidLoc loc)
    (hx : cnt x (s.slot loc) = 1) (y : ItemId) :
    (s.detach loc x).occ y + (if y = x then 1 else 0) = s.occ y := by
  have := occ_setSlot s loc (removeFrom (s.slot loc) x) h y
  rw [cnt_removeFrom] at this
  unfold detach
  by_cases hy : y = x
  · subst hy; simp only [ite_true] at this ⊢; omega
  · simp only [hy, ite_false] at this ⊢; omega

theorem occ_pushTo (s : Board) (loc : Loc) (x : ItemId) (h : s.ValidLoc loc) (y : ItemId) :
    (s.pushTo loc x).occ y = s.occ y + (if x = y then 1 else 0) := by
  have := occ_setSlot s loc (s.slot loc ++ [x]) h y
  rw [cnt_append] at this
  unfold pushTo
  simp only [cnt_cons, cnt_nil, Nat.add_zero] at this
  omega

theorem detach_children_sub (s : Board) (loc : Loc) (x : ItemId) (h : s.ValidLoc loc) {q c : ItemId}
    (hc : c ∈ (s.detach loc x).children q) : c ∈ s.children q := by
  unfold detach at hc
  rw [setSlot_children s loc _ h] at hc
  split at hc
  · rename_i e; subst e; exact (mem_removeFrom.1 hc).1
  · exact hc

/-- 唯一の居場所にいる `x` の個数は 1 -/
theorem cnt_slot_eq_one (s : Board) (hs : s.WF) (loc : Loc) (h : s.ValidLoc loc) {x : ItemId}
    (hx : x ∈ s.slot loc) : cnt x (s.slot loc) = 1 := by
  have h1 := (cnt_pos_iff x _).2 hx
  have h2 := cnt_slot_le s loc h x
  have hpres : s.store x ≠ none := by
    intro e; have := hs.noDangling x e; omega
  have := hs.placedOnce x hpres
  omega

theorem rank_le_of_desc {s : Board} {rank : ItemId → Nat}
    (hr : ∀ p c, c ∈ s.children p → rank p < rank c) {a b : ItemId} (h : s.Desc a b) : rank a ≤ rank b := by
  induction h with
  | refl => exact Nat.le_refl _
  | step _ hc ih => have := hr _ _ hc; omega

/-- 親は子の子孫ではない -/
theorem not_desc_parent (s : Board) (hs : s.WF) {p x : ItemId} (hx : x ∈ s.children p) : ¬ s.Desc x p := by
  intro hd
  obtain ⟨rank, hr⟩ := hs.acyclic
  have := rank_le_of_desc hr hd
  have := hr p x hx
  omega

theorem not_mem_own_children (s : Board) (hs : s.WF) (p : ItemId) : p ∉ s.children p := by
  intro h; exact not_desc_parent s hs h (Desc.refl p)

/-! ## moveTo -/

def DstOK (s : Board) (x : ItemId) : Loc → Prop
  | none => True
  | some g => s.isGrp g = true ∧ ¬ s.Desc x g

theorem isGrp_present {s : Board} {g : ItemId} (h : s.isGrp g = true) : s.store g ≠ none := by
  intro e; simp [isGrp, e] at h

theorem DstOK.valid {s : Board} (hs : s.WF) {x : ItemId} {dst : Loc} (h : s.DstOK x dst) : s.ValidLoc dst := by
  cases dst with
  | none => trivial
  | some g => exact ⟨isGrp_present h.1, hs.bounded g (isGrp_present h.1)⟩

theorem moveTo_store_none (s : Board) (x : ItemId) (src dst : Loc) (q : ItemId) :
    (s.moveTo x src dst).store q = none ↔ s.store q = none := by
  unfold moveTo pushTo detach
  rw [setSlot_store_none, setSlot_store_none]

theorem moveTo_isGrp (s : Board) (x : ItemId) (src dst : Loc) (q : ItemId) :
    (s.moveTo x src dst).isGrp q = s.isGrp q := by
  unfold moveTo pushTo detach; rw [setSlot_isGrp, setSlot_isGrp]

theorem moveTo_n (s : Board) (x : ItemId) (src dst : Loc) : (s.moveTo x src dst).n = s.n := by
  unfold moveTo pushTo detach; rw [setSlot_n, setSlot_n]

theorem moveTo_validLoc (s : Board) (x : ItemId) (src dst loc : Loc) (h : s.ValidLoc loc) :
    (s.moveTo x src dst).ValidLoc loc := by
  cases loc with
  | none => trivial
  | some q => exact ⟨fun e => h.1 ((moveTo_store_none s x src dst q).1 e), by rw [moveTo_n]; exact h.2⟩

/-- 付け替えでできる辺は `dst → x` だけ -/
theorem moveTo_edge (s : Board) (x : ItemId) (src dst : Loc) (hsrc : s.ValidLoc src)
    (hdst : s.ValidLoc dst) {q c : ItemId} (hc : c ∈ (s.moveTo x src dst).children q) :
    c ∈ s.children q ∨ (dst = some q ∧ c = x) := by
  unfold moveTo pushTo at hc
  have hv : (s.detach src x).ValidLoc dst := setSlot_validLoc s src _ dst hdst
  rw [setSlot_children _ dst _ hv] at hc
  split at hc
  · rename_i e
    subst e
    rcases List.mem_append.1 hc with h | h
    · exact Or.inl (detach_children_sub s src x hsrc h)
    · exact Or.inr ⟨rfl, by simpa using h⟩
  · exact Or.inl (detach_children_sub s src x hsrc hc)

theorem moveTo_occ (s : Board) (hs : s.WF) (x : ItemId) (src dst : Loc) (hsrc : s.ValidLoc src)
    (hx : x ∈ s.slot src) (hdst : s.ValidLoc dst) (y : ItemId) :
    (s.moveTo x src dst).occ y = s.occ y := by
  have h1 := occ_detach s src x hsrc (cnt_slot_eq_one s hs src hsrc hx) y
  have h2 := occ_pushTo (s.detach src x) dst x (setSlot_validLoc s src _ dst hdst) y
  unfold moveTo
  by_cases hy : y = x
  · subst hy; simp at h1 h2; omega
  · have : ¬ (x = y) := fun e => hy e.symm
    simp [hy, this] at h1 h2; omega

theorem moveTo_wf (s : Board) (hs : s.WF) (x : ItemId) (src dst : Loc)
    (hsrc : s.ValidLoc src) (hx : x ∈ s.slot src) (hdst : s.DstOK x dst) :
    (s.moveTo x src dst).WF := by
  have hdv := hdst.valid hs
  refine ⟨?_, ?_, ?_, ?_, ?_⟩
  · intro q hq
    rw [moveTo_n]
    exact hs.bounded q (fun e => hq ((moveTo_store_none s x src dst q).2 e))
  · intro q hq
    rw [moveTo_occ s hs x src dst hsrc hx hdv]
    exact hs.placedOnce q (fun e => hq ((moveTo_store_none s x src dst q).2 e))
  · intro q hq
    rw [moveTo_occ s hs x src dst hsrc hx hdv]
    exact hs.noDangling q ((moveTo_store_none s x src dst q).1 hq)
  · intro p hp
    rw [moveTo_isGrp] at hp
    have hleaf := hs.leaf p hp
    cases hcs : (s.moveTo x src dst).children p with
    | nil => rfl
    | cons c _ =>
      have hc : c ∈ (s.moveTo x src dst).children p := by rw [hcs]; simp
      rcases moveTo_edge s x src dst hsrc hdv hc with h | ⟨e, _⟩
      · rw [hleaf] at h; simp at h
      · subst e
        have := hdst.1
        rw [hp] at this; contradiction
  · obtain ⟨rank, hr⟩ := hs.acyclic
    cases dst with
    | none =>
      refine ⟨rank, fun p c hc => ?_⟩
      rcases moveTo_edge s x src none hsrc hdv hc with h | ⟨e, _⟩
      · exact hr p c h
      · cases e
    | some g =>
      classical
      refine ⟨fun y => if s.Desc x y then rank y + rank g + 1 else rank y, fun p c hc => ?_⟩
      rcases moveTo_edge s x src (some g) hsrc hdv hc with h | ⟨e, ec⟩
      · have := hr p c h
        by_cases hp : s.Desc x p
        · have hcd : s.Desc x c := Desc.step hp h
          simp only [hp, hcd, ite_true]; omega
        · simp only [hp, ite_false]; split <;> omega
      · cases e; subst ec
        have hng := hdst.2
        simp only [hng, ite_false, Desc.refl, ite_true]; omega

/-- `move_front` の 1 段（親の中で末尾へ。親が無ければ drawOrder の末尾へ） -/
theorem moveFront_wf (s : Board) (hs : s.WF) (x : ItemId) (loc : Loc)
    (hloc : s.ValidLoc loc) (hx : x ∈ s.slot loc) : (s.moveTo x loc loc).WF := by
  apply moveTo_wf s hs x loc loc hloc hx
  cases loc with
  | none => trivial
  | some p =>
    refine ⟨?_, not_desc_parent s hs hx⟩
    cases h : s.isGrp p with
    | true => rfl
    | false => have := hs.leaf p h; simp [slot, this] at hx

/-! ## 親の後片付け（空で題の無い group を消す） -/

theorem removeItem_occ (s : Board) (hs : s.WF) (ploc : Loc) (p : ItemId) (hploc : s.ValidLoc ploc)
    (hp : p ∈ s.slot ploc) (y : ItemId) :
    (s.removeItem ploc p).occ y + (if y = p then 1 else 0) + cnt y (s.children p) = s.occ y := by
  have hne : ploc ≠ some p := by
    rintro rfl; exact not_mem_own_children s hs p hp
  have h1 := occ_detach s ploc p hploc (cnt_slot_eq_one s hs ploc hploc hp) y
  have hpres : s.store p ≠ none := by
    intro e; have := hs.noDangling p e
    have := (cnt_pos_iff p _).2 hp; have := cnt_slot_le s ploc hploc p; omega
  have hpn : p < (s.detach ploc p).n := by unfold detach; rw [setSlot_n]; exact hs.bounded p hpres
  have h2 := occ_erase (s.detach ploc p) p hpn y
  have hc : (s.detach ploc p).children p = s.children p := by
    unfold detach; rw [setSlot_children s ploc _ hploc]; simp [Ne.symm hne, hne]
  rw [hc] at h2
  unfold removeItem
  omega

theorem removeItem_store_none (s : Board) (ploc : Loc) (p q : ItemId) :
    (s.removeItem ploc p).store q = none ↔ q = p ∨ s.store q = none := by
  unfold removeItem erase detach
  by_cases h : q = p
  · simp [h]
  · simp only [h, ite_false, false_or]; exact setSlot_store_none s ploc _ q

theorem removeItem_isGrp (s : Board) (ploc : Loc) (p q : ItemId) (hq : q ≠ p) :
    (s.removeItem ploc p).isGrp q = s.isGrp q := by
  unfold removeItem erase detach isGrp
  simp only [hq, ite_false]
  exact setSlot_isGrp s ploc _ q

theorem removeItem_edge (s : Board) (ploc : Loc) (p : ItemId) (hploc : s.ValidLoc ploc) {q c : ItemId}
    (hc : c ∈ (s.removeItem ploc p).children q) : c ∈ s.children q ∧ q ≠ p := by
  unfold removeItem at hc
  rw [erase_children] at hc
  split at hc
  · simp at hc
  · rename_i hq; exact ⟨detach_children_sub s ploc p hploc hc, hq⟩

/-- `remove_item` を、子が `s.children p` の居場所 ... に移った後の盤面に使う一般形：
    `p` の子がすべてほかに 1 回ずつ置かれていれば、`p` を消しても不変条件は保たれる -/
theorem removeItem_wf (s : Board) (ploc : Loc) (p : ItemId) (hploc : s.ValidLoc ploc)
    (hp : p ∈ s.slot ploc)
    (hbounded : ∀ x, s.store x ≠ none → x < s.n)
    (hocc : ∀ y, s.occ y = (if s.store y = none then 0 else 1) + (if y = p then 0 else cnt y (s.children p)))
    (hpres : s.store p ≠ none)
    (hcp : cnt p (s.slot ploc) = 1) (hne : ploc ≠ some p)
    (hleaf : ∀ q, q ≠ p → s.isGrp q = false → s.children q = [])
    (hacyc : ∃ rank : ItemId → Nat, ∀ q c, c ∈ s.children q → q ≠ p → rank q < rank c) :
    (s.removeItem ploc p).WF := by
  have hpn : p < (s.detach ploc p).n := by unfold detach; rw [setSlot_n]; exact hbounded p hpres
  have key : ∀ y, (s.removeItem ploc p).occ y + (if y = p then 1 else 0) + cnt y (s.children p) = s.occ y := by
    intro y
    have h1 := occ_detach s ploc p hploc hcp y
    have h2 := occ_erase (s.detach ploc p) p hpn y
    have hc : (s.detach ploc p).children p = s.children p := by
      unfold detach; rw [setSlot_children s ploc _ hploc]; simp [Ne.symm hne, hne]
    rw [hc] at h2
    unfold removeItem; omega
  have hpp : cnt p (s.children p) = 0 := by
    have := hocc p; have := key p; simp [hpres] at *; omega
  refine ⟨?_, ?_, ?_, ?_, ?_⟩
  · intro q hq
    have : (s.removeItem ploc p).n = s.n := by unfold removeItem erase detach; simp [setSlot_n]
    rw [this]
    exact hbounded q (fun e => hq ((removeItem_store_none s ploc p q).2 (Or.inr e)))
  · intro q hq
    have hq' := mt (removeItem_store_none s ploc p q).2 hq
    simp only [not_or] at hq'
    have := key q; have := hocc q
    simp [hq'.1, hq'.2] at *; omega
  · intro q hq
    have k := key q; have h := hocc q
    rcases (removeItem_store_none s ploc p q).1 hq with e | e
    · rw [e] at k h ⊢; simp [hpres, hpp] at k h; omega
    · have hqp : q ≠ p := by rintro rfl; exact hpres e
      simp [e, hqp] at k h; omega
  · intro q hq
    by_cases e : q = p
    · subst e; unfold removeItem; rw [erase_children]; simp
    · rw [removeItem_isGrp s ploc p q e] at hq
      have := hleaf q e hq
      cases hcs : (s.removeItem ploc p).children q with
      | nil => rfl
      | cons c _ =>
        have hc : c ∈ (s.removeItem ploc p).children q := by rw [hcs]; simp
        have := (removeItem_edge s ploc p hploc hc).1
        simp_all
  · obtain ⟨rank, hr⟩ := hacyc
    exact ⟨rank, fun q c hc => let h := removeItem_edge s ploc p hploc hc; hr q c h.1 h.2⟩

theorem cleanup_wf (s : Board) (hs : s.WF) (p : ItemId) (ploc : Loc) (hploc : s.ValidLoc ploc)
    (hp : p ∈ s.slot ploc) : (s.cleanup p ploc).WF := by
  unfold cleanup
  split
  · rename_i he
    have hpres : s.store p ≠ none := by intro e; simp [isEmptyUntitled, e] at he
    have hcp : s.children p = [] := by
      unfold isEmptyUntitled at he; unfold children
      cases h : s.store p with
      | none => rfl
      | some nd => rw [h] at he; simp at he; exact he.1
    apply removeItem_wf s ploc p hploc hp hs.bounded _ hpres (cnt_slot_eq_one s hs ploc hploc hp)
    · rintro rfl; exact not_mem_own_children s hs p hp
    · exact fun q _ h => hs.leaf q h
    · obtain ⟨rank, hr⟩ := hs.acyclic; exact ⟨rank, fun q c hc _ => hr q c hc⟩
    · intro y
      rw [hcp]
      by_cases e : s.store y = none
      · simp [e, hs.noDangling y e]
      · simp [e, hs.placedOnce y e]
  · exact hs

/-! ## drag & drop -/

theorem moveTo_keeps_mem (s : Board) (x : ItemId) (src dst : Loc) (hsrc : s.ValidLoc src)
    (hdst : s.ValidLoc dst) {y : ItemId} (hy : y ≠ x) {loc : Loc} (h : y ∈ s.slot loc) :
    y ∈ (s.moveTo x src dst).slot loc := by
  unfold moveTo pushTo
  have hv : (s.detach src x).ValidLoc dst := setSlot_validLoc s src _ dst hdst
  rw [setSlot_slot _ dst _ hv]
  have h1 : y ∈ (s.detach src x).slot loc := by
    unfold detach; rw [setSlot_slot s src _ hsrc]
    split
    · rename_i e; subst e; exact mem_removeFrom.2 ⟨h, hy⟩
    · exact h
  split
  · rename_i e; subst e; exact List.mem_append_left _ h1
  · exact h1

/-- `drag_drop_item_into_group(g, _, x)`。`x` は `loc` にいて、`loc = some p` なら `p` は `ploc` にいる。
    前提 `¬ Desc x g` は `onCanvasMouseUp` の `is_self_or_descendant_group(g, x)` が false であること。 -/
theorem dropIntoGroup_wf (s : Board) (hs : s.WF) (x g : ItemId) (loc ploc : Loc)
    (hloc : s.ValidLoc loc) (hx : x ∈ s.slot loc)
    (hploc : ∀ p, loc = some p → s.ValidLoc ploc ∧ p ∈ s.slot ploc)
    (hg : s.isGrp g = true) (hdesc : ¬ s.Desc x g) :
    (s.dropIntoGroup x loc ploc g).WF := by
  have hdst : s.DstOK x (some g) := ⟨hg, hdesc⟩
  have h1 := moveTo_wf s hs x loc (some g) hloc hx hdst
  cases loc with
  | none => exact h1
  | some p =>
    obtain ⟨hpv, hpm⟩ := hploc p rfl
    have hpx : p ≠ x := by rintro rfl; exact not_mem_own_children s hs p hx
    exact cleanup_wf _ h1 p ploc (moveTo_validLoc s x _ _ ploc hpv)
      (moveTo_keeps_mem s x _ _ hloc (hdst.valid hs) hpx hpm)

/-- `drag_drop_item` で入れ子の `x` を drawOrder に出す -/
theorem dropOut_wf (s : Board) (hs : s.WF) (x p : ItemId) (ploc : Loc)
    (hp : s.ValidLoc (some p)) (hx : x ∈ s.children p) (hpv : s.ValidLoc ploc) (hpm : p ∈ s.slot ploc) :
    (s.dropOut x p ploc).WF := by
  have h1 := moveTo_wf s hs x (some p) none hp hx trivial
  have hpx : p ≠ x := by rintro rfl; exact not_mem_own_children s hs p hx
  exact cleanup_wf _ h1 p ploc (moveTo_validLoc s x _ _ ploc hpv)
    (moveTo_keeps_mem s x (some p) none hp trivial hpx hpm)

/-- 付け替えの後の子孫関係：新しい道は `g → x` を通るものだけ -/
theorem desc_moveTo (s : Board) (x g : ItemId) (src : Loc) (hsrc : s.ValidLoc src)
    (hg : s.ValidLoc (some g)) {a b : ItemId} (h : (s.moveTo x src (some g)).Desc a b) :
    s.Desc a b ∨ (s.Desc a g ∧ s.Desc x b) := by
  induction h with
  | refl => exact Or.inl (Desc.refl _)
  | step _ hc ih =>
    rcases moveTo_edge s x src (some g) hsrc hg hc with he | ⟨e, ec⟩
    · rcases ih with ih | ⟨ih1, ih2⟩
      · exact Or.inl (Desc.step ih he)
      · exact Or.inr ⟨ih1, Desc.step ih2 he⟩
    · cases e; subst ec
      rcases ih with ih | ⟨ih1, _⟩
      · exact Or.inr ⟨ih, Desc.refl _⟩
      · exact Or.inr ⟨ih1, Desc.refl _⟩

/-- `drag_drop_selection_into_group(g, _)`。選択は drawOrder の重複の無い部分。
    前提は `get_valid_selection_drop_group_id` が null を返さないこと。 -/
theorem selectionIntoGroup_wf (g : ItemId) :
    ∀ (sel : List ItemId) (s : Board), s.WF → sel.Nodup → (∀ i ∈ sel, i ∈ s.roots) →
    s.isGrp g = true → (∀ i ∈ sel, ¬ s.Desc i g) →
    (sel.foldl (fun s id => s.moveTo id none (some g)) s).WF
  | [], s, hs, _, _, _, _ => hs
  | i :: rest, s, hs, hnd, hsel, hg, hdesc => by
    rw [List.nodup_cons] at hnd
    have hi : i ∈ s.roots := hsel i (by simp)
    have hdst : s.DstOK i (some g) := ⟨hg, hdesc i (by simp)⟩
    have hgv := hdst.valid hs
    have h1 := moveTo_wf s hs i none (some g) trivial hi hdst
    apply selectionIntoGroup_wf g rest _ h1 hnd.2
    · intro j hj
      have hji : j ≠ i := by rintro rfl; exact hnd.1 hj
      exact moveTo_keeps_mem s i none (some g) trivial hgv hji (hsel j (by simp [hj])) (loc := none)
    · rw [moveTo_isGrp]; exact hg
    · intro j hj hd
      rcases desc_moveTo s i g none trivial hgv hd with h | ⟨h, _⟩
      · exact hdesc j (by simp [hj]) h
      · exact hdesc j (by simp [hj]) h

/-! ## ungroup -/

theorem ungroup_wf (s : Board) (hs : s.WF) (g : ItemId) (gloc : Loc)
    (hgloc : s.ValidLoc gloc) (hg : g ∈ s.slot gloc) : (s.ungroup g gloc).WF := by
  have hne : gloc ≠ some g := by rintro rfl; exact not_mem_own_children s hs g hg
  have hgpres : s.store g ≠ none := by
    intro e; have := hs.noDangling g e
    have := (cnt_pos_iff g _).2 hg; have := cnt_slot_le s gloc hgloc g; omega
  have hgg : cnt g (s.children g) = 0 := (cnt_eq_zero_iff _ _).2 (not_mem_own_children s hs g)
  -- s1：子を g の居場所の末尾へ
  let s1 := s.setSlot gloc (s.slot gloc ++ s.children g)
  have s1_occ : ∀ y, s1.occ y = s.occ y + cnt y (s.children g) := by
    intro y; have := occ_setSlot s gloc (s.slot gloc ++ s.children g) hgloc y
    rw [cnt_append] at this
    show (s.setSlot gloc (s.slot gloc ++ s.children g)).occ y = _
    omega
  have s1_store : ∀ q, s1.store q = none ↔ s.store q = none := setSlot_store_none s gloc _
  have s1_isGrp : ∀ q, s1.isGrp q = s.isGrp q := setSlot_isGrp s gloc _
  have s1_children : ∀ q, s1.children q = if gloc = some q then s.children q ++ s.children g else s.children q := by
    intro q; rw [setSlot_children s gloc _ hgloc q]
    split
    · rename_i e; subst e; rfl
    · rfl
  have s1_g : s1.children g = s.children g := by rw [s1_children]; simp [hne]
  obtain ⟨rank, hr⟩ := hs.acyclic
  -- 辺：古い辺か、g の居場所 → g の子
  have s1_edge : ∀ q c, c ∈ s1.children q → rank q < rank c := by
    intro q c hc
    rw [s1_children] at hc
    split at hc
    · rename_i e
      rcases List.mem_append.1 hc with h | h
      · exact hr q c h
      · have hq : g ∈ s.children q := by subst e; exact hg
        have := hr q g hq; have := hr g c h; omega
    · exact hr q c hc
  have s1_leaf : ∀ q, s1.isGrp q = false → s1.children q = [] := by
    intro q hq
    rw [s1_isGrp] at hq
    rw [s1_children]
    split
    · rename_i e; subst e
      have hg' : g ∈ s.children q := hg
      rw [hs.leaf q hq] at hg'; simp at hg'
    · exact hs.leaf q hq
  have hgpres1 : s1.store g ≠ none := fun e => hgpres ((s1_store g).1 e)
  unfold ungroup
  cases hst : s.store g with
  | none => exact absurd hst hgpres
  | some nd =>
    simp only
    split
    · -- 題あり：空にして残す
      have hgn : g < s1.n := by rw [setSlot_n]; exact hs.bounded g hgpres
      have occ2 : ∀ y, (s1.setItems g []).occ y = s.occ y := by
        intro y
        have := occ_setSlot s1 (some g) [] ⟨hgpres1, hgn⟩ y
        simp only [slot, cnt_nil, Nat.add_zero, s1_g] at this
        have := s1_occ y
        show (s1.setSlot (some g) []).occ y = _
        omega
      refine ⟨?_, ?_, ?_, ?_, ?_⟩
      · intro q hq
        have : (s1.setItems g []).n = s.n := by show (s1.setSlot (some g) []).n = _; rw [setSlot_n, setSlot_n]
        rw [this]; exact hs.bounded q (fun e => hq ((setItems_store_none s1 g q []).2 ((s1_store q).2 e)))
      · intro q hq; rw [occ2]
        exact hs.placedOnce q (fun e => hq ((setItems_store_none s1 g q []).2 ((s1_store q).2 e)))
      · intro q hq; rw [occ2]
        exact hs.noDangling q ((s1_store q).1 ((setItems_store_none s1 g q []).1 hq))
      · intro q hq
        rw [setItems_isGrp] at hq
        rw [setItems_children s1 g q [] hgpres1]
        split
        · rfl
        · exact s1_leaf q hq
      · refine ⟨rank, fun q c hc => ?_⟩
        rw [setItems_children s1 g q [] hgpres1] at hc
        split at hc
        · simp at hc
        · exact s1_edge q c hc
    · -- 題なし：remove_item(g)
      have hg1 : g ∈ s1.slot gloc := by
        rw [setSlot_slot s gloc _ hgloc]; simp [hg]
      have hcp : cnt g (s1.slot gloc) = 1 := by
        have h1 := (cnt_pos_iff g _).2 hg1
        have h2 := cnt_slot_le s1 gloc (setSlot_validLoc s gloc _ gloc hgloc) g
        rw [s1_occ, hs.placedOnce g hgpres, hgg] at h2
        omega
      apply removeItem_wf s1 gloc g (setSlot_validLoc s gloc _ gloc hgloc) hg1
        (fun x hx => by rw [setSlot_n]; exact hs.bounded x (fun e => hx ((s1_store x).2 e)))
        _ hgpres1 hcp hne
      · intro q _ hq; exact s1_leaf q hq
      · exact ⟨rank, fun q c hc _ => s1_edge q c hc⟩
      · intro y
        rw [s1_occ, s1_g]
        by_cases e : s.store y = none
        · have := hs.noDangling y e
          have hy : y ≠ g := by rintro rfl; exact hgpres e
          simp [s1_store, e, this, hy]
        · have := hs.placedOnce y e
          have hs1 : ¬ s1.store y = none := fun e' => e ((s1_store y).1 e')
          by_cases hy : y = g
          · subst hy; simp [hs1, this, hgg]
          · simp [hs1, this, hy]

/-! ## make_items_into_new_group -/

theorem makeGroup_wf (s : Board) (hs : s.WF) (sel : List ItemId) (gid : ItemId)
    (hnd : sel.Nodup) (hsel : ∀ i ∈ sel, i ∈ s.roots)
    (hfresh : s.store gid = none) (hgn : gid < s.n) :
    (s.makeGroup sel gid).WF := by
  have hgid_occ := hs.noDangling gid hfresh
  have hsel_pres : ∀ i ∈ sel, s.store i ≠ none := by
    intro i hi e; have := hs.noDangling i e
    have := (cnt_pos_iff i _).2 (hsel i hi); have := cnt_roots_le s i; omega
  have occ2 : ∀ y, (s.makeGroup sel gid).occ y = s.occ y + (if y = gid then 1 else 0) := by
    intro y
    have h1 := occ_put (s.setSlot none (s.roots.filter (fun z => cnt z sel == 0) ++ [gid])) gid
      ⟨true, false, sel⟩ hgn y
    have hc : (s.setSlot none (s.roots.filter (fun z => cnt z sel == 0) ++ [gid])).children gid = [] :=
      children_of_none hfresh
    rw [hc] at h1
    have h0 := occ_setSlot s none (s.roots.filter (fun z => cnt z sel == 0) ++ [gid]) trivial y
    simp only [slot] at h0
    rw [cnt_append, cnt_filter] at h0
    simp only [cnt_cons, cnt_nil, Nat.add_zero] at h0 h1
    show ((s.setSlot none (s.roots.filter (fun z => cnt z sel == 0) ++ [gid])).put gid _).occ y = _
    have hle := cnt_le_one_of_nodup y sel hnd
    by_cases hy : cnt y sel = 0
    · simp only [hy, beq_self_eq_true, ite_true, Nat.add_zero] at h0 h1
      by_cases e : y = gid
      · subst e; simp at h0 ⊢; omega
      · have : ¬ gid = y := fun e' => e e'.symm
        simp [e, this] at h0 ⊢; omega
    · have hy1 : cnt y sel = 1 := by omega
      have hmem : y ∈ sel := (cnt_pos_iff y sel).1 (by omega)
      have hpres := hsel_pres y hmem
      have hocc := hs.placedOnce y hpres
      have hr := (cnt_pos_iff y _).2 (hsel y hmem)
      have hrl := cnt_roots_le s y
      have e : ¬ gid = y := by rintro rfl; exact hpres hfresh
      have e' : ¬ y = gid := fun x => e x.symm
      simp [hy1, e, e'] at h0 h1 ⊢
      omega
  have store2 : ∀ q, (s.makeGroup sel gid).store q = if q = gid then some ⟨true, false, sel⟩ else s.store q := by
    intro q; rfl
  have children2 : ∀ q, (s.makeGroup sel gid).children q = if q = gid then sel else s.children q := by
    intro q; exact put_children (s.setSlot none (s.roots.filter (fun z => cnt z sel == 0) ++ [gid])) gid q _
  refine ⟨?_, ?_, ?_, ?_, ?_⟩
  · intro q hq
    show q < s.n
    rw [store2] at hq
    split at hq
    · rename_i e; subst e; exact hgn
    · exact hs.bounded q hq
  · intro q hq
    rw [occ2]
    rw [store2] at hq
    split at hq
    · rename_i e; subst e; simp; omega
    · rename_i e; simp [e, hs.placedOnce q hq]
  · intro q hq
    rw [occ2]
    rw [store2] at hq
    split at hq
    · simp at hq
    · rename_i e; simp [e, hs.noDangling q hq]
  · intro q hq
    rw [children2]
    unfold isGrp at hq; rw [store2] at hq
    split at hq
    · simp at hq
    · rename_i e; simp only [e, ite_false]; exact hs.leaf q hq
  · obtain ⟨rank, hr⟩ := hs.acyclic
    refine ⟨fun y => if y = gid then 0 else rank y + 1, fun q c hc => ?_⟩
    rw [children2] at hc
    have hc_ne : c ≠ gid := by
      intro e
      split at hc
      · exact hsel_pres c hc (by rw [e]; exact hfresh)
      · have hq := present_of_mem_children hc
        have h1 := cnt_children_le s q c (hs.bounded q hq)
        have h2 := (cnt_pos_iff c _).2 hc
        rw [e] at h1 h2; omega
    split at hc
    · rename_i e; subst e; simp [hc_ne]
    · rename_i e; simp only [e, hc_ne, ite_false]; have := hr q c hc; omega

end Board
end Nest
