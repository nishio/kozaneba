import Nest.Proofs
/-!
# 修正後のコードが不変条件を保つことの証明（盤面の大きさを問わない）

* `replaceFixed_wf`：PR #135 の後の `replace_multiple_kozane`（target を itemStore から消す版）
* `cleanupChain_wf`：PR #137 の `remove_empty_untitled_groups`（空で無題なら消して親へ、を繰り返す）
* `dropOutChain_wf` / `dropIntoGroupChain_wf`：PR #137 の後の `drag_drop_item` /
  `drag_drop_item_into_group`（付け替えの後に連鎖の後片付け）
-/
namespace Nest
namespace Board

/-- 子は itemStore にある -/
theorem present_of_child (s : Board) (hs : s.WF) {q c : ItemId} (h : c ∈ s.children q) :
    s.store c ≠ none := by
  intro e
  have h0 := hs.noDangling c e
  have hq := present_of_mem_children h
  have h1 := cnt_children_le s q c (hs.bounded q hq)
  have h2 := (cnt_pos_iff c _).2 h
  omega

theorem present_of_slot (s : Board) (hs : s.WF) {loc : Loc} (hl : s.ValidLoc loc) {x : ItemId}
    (h : x ∈ s.slot loc) : s.store x ≠ none := by
  intro e
  have := hs.noDangling x e
  have := (cnt_pos_iff x _).2 h
  have := cnt_slot_le s loc hl x
  omega

/-! ## replace_multiple_kozane（PR #135） -/

section replace

theorem addKozane_children (s : Board) (ks : List ItemId) (hks : ∀ k ∈ ks, s.store k = none) :
    (s.addKozane ks).children = s.children := by
  funext q
  unfold children addKozane
  by_cases h : q ∈ ks
  · simp [h, hks q h]
  · simp [h]

theorem addKozane_occ (s : Board) (ks : List ItemId) (hks : ∀ k ∈ ks, s.store k = none) (y : ItemId) :
    (s.addKozane ks).occ y = s.occ y := by
  unfold occ
  rw [addKozane_children s ks hks]
  rfl

/-- 差し替え後の盤面の途中 -/
def rS1 (s : Board) (ks : List ItemId) (gid : ItemId) : Board := (s.addKozane ks).put gid ⟨true, false, ks⟩
def rL (s : Board) (t : ItemId) (tloc : Loc) (ks : List ItemId) (gid : ItemId) : List ItemId :=
  removeFrom ((rS1 s ks gid).slot tloc) t ++ [gid]
def rS2 (s : Board) (t : ItemId) (tloc : Loc) (ks : List ItemId) (gid : ItemId) : Board :=
  (rS1 s ks gid).setSlot tloc (rL s t tloc ks gid)

theorem replaceFixed_eq (s : Board) (t : ItemId) (tloc : Loc) (ks : List ItemId) (gid : ItemId) :
    s.replaceFixed t tloc ks gid = (rS2 s t tloc ks gid).erase t := rfl

theorem rS1_children (s : Board) (ks : List ItemId) (gid : ItemId) (hks : ∀ k ∈ ks, s.store k = none)
    (q : ItemId) : (rS1 s ks gid).children q = if q = gid then ks else s.children q := by
  unfold rS1
  rw [put_children, addKozane_children s ks hks]

theorem rS1_store (s : Board) (ks : List ItemId) (gid : ItemId) (q : ItemId) :
    (rS1 s ks gid).store q =
      if q = gid then some ⟨true, false, ks⟩ else if q ∈ ks then some ⟨false, false, []⟩ else s.store q := rfl

theorem replaceFixed_wf (s : Board) (t : ItemId) (tloc : Loc) (ks : List ItemId) (gid : ItemId)
    (hs : s.WF) (htloc : s.ValidLoc tloc) (ht : t ∈ s.slot tloc)
    (htk : s.isGrp t = false)
    (hks : ∀ k ∈ ks, s.store k = none) (hksn : ∀ k ∈ ks, k < s.n) (hnd : ks.Nodup)
    (hgid : s.store gid = none) (hgn : gid < s.n) (hgk : gid ∉ ks) :
    (s.replaceFixed t tloc ks gid).WF := by
  have htp : s.store t ≠ none := present_of_slot s hs htloc ht
  have hgt : gid ≠ t := by rintro rfl; exact htp hgid
  have htks : t ∉ ks := fun h => htp (hks t h)
  have htc : s.children t = [] := hs.leaf t htk
  -- 居場所の親は itemStore にある（gid でも ks でもない）
  have hloc_ok : ∀ p, tloc = some p → p ≠ gid ∧ p ∉ ks ∧ p ≠ t := by
    intro p e
    subst e
    refine ⟨fun e => htloc.1 (e ▸ hgid), fun h => htloc.1 (hks p h), ?_⟩
    rintro rfl; exact not_mem_own_children s hs _ ht
  have hv1 : (rS1 s ks gid).ValidLoc tloc := by
    cases tloc with
    | none => trivial
    | some p =>
      obtain ⟨h1, h2, _⟩ := hloc_ok p rfl
      refine ⟨?_, htloc.2⟩
      rw [rS1_store]; simp only [h1, h2, ite_false]; exact htloc.1
  have hslot1 : (rS1 s ks gid).slot tloc = s.slot tloc := by
    cases tloc with
    | none => rfl
    | some p =>
      show (rS1 s ks gid).children p = s.children p
      rw [rS1_children s ks gid hks]; simp [(hloc_ok p rfl).1]
  have hct : cnt t (s.slot tloc) = 1 := cnt_slot_eq_one s hs tloc htloc ht
  -- 個数
  have occ1 : ∀ y, (rS1 s ks gid).occ y = s.occ y + cnt y ks := by
    intro y
    have := occ_put (s.addKozane ks) gid ⟨true, false, ks⟩ hgn y
    rw [addKozane_children s ks hks, children_of_none hgid, addKozane_occ s ks hks] at this
    unfold rS1; simpa using this
  have hc2t : (rS2 s t tloc ks gid).children t = [] := by
    show ((rS1 s ks gid).setSlot tloc _).children t = []
    rw [setSlot_children _ tloc _ hv1, rS1_children s ks gid hks]
    have : tloc ≠ some t := by rintro rfl; exact (hloc_ok t rfl).2.2 rfl
    simp [this, hgt.symm, htc]
  have key : ∀ y, (s.replaceFixed t tloc ks gid).occ y + (if y = t then 1 else 0)
      = s.occ y + cnt y ks + (if y = gid then 1 else 0) := by
    intro y
    have htn : t < (rS2 s t tloc ks gid).n := by
      show t < ((rS1 s ks gid).setSlot tloc _).n
      rw [setSlot_n]; exact hs.bounded t htp
    have h3 := occ_erase (rS2 s t tloc ks gid) t htn y
    rw [hc2t] at h3
    have h2 := occ_setSlot (rS1 s ks gid) tloc (rL s t tloc ks gid) hv1 y
    have e2 : (rS1 s ks gid).setSlot tloc (rL s t tloc ks gid) = rS2 s t tloc ks gid := rfl
    rw [e2, hslot1] at h2
    have hL : cnt y (rL s t tloc ks gid)
        = (if y = t then 0 else cnt y (s.slot tloc)) + (if gid = y then 1 else 0) := by
      unfold rL; rw [hslot1, cnt_append, cnt_removeFrom]; simp
    rw [hL] at h2
    simp only [cnt_nil, Nat.add_zero] at h3
    rw [replaceFixed_eq s t tloc ks gid]
    have h1 := occ1 y
    by_cases hy : y = t
    · have hgy : ¬ gid = y := fun e => hgt (e.trans hy)
      have hyg : ¬ y = gid := fun e => hgy e.symm
      have hct' : cnt y (s.slot tloc) = 1 := hy ▸ hct
      rw [ite_eq_left hy, ite_eq_right hgy] at h2
      rw [ite_eq_left hy, ite_eq_right hyg]
      omega
    · rw [ite_eq_right hy] at h2
      rw [ite_eq_right hy]
      by_cases hg : y = gid
      · rw [ite_eq_left hg.symm] at h2
        rw [ite_eq_left hg]
        omega
      · rw [ite_eq_right (fun e => hg e.symm)] at h2
        rw [ite_eq_right hg]
        omega
  have store3 : ∀ q, (s.replaceFixed t tloc ks gid).store q = none ↔
      q = t ∨ (q ≠ gid ∧ q ∉ ks ∧ s.store q = none) := by
    intro q
    rw [replaceFixed_eq s t tloc ks gid]
    by_cases hq : q = t
    · subst hq; simp [erase]
    · have : ((rS2 s t tloc ks gid).erase t).store q = (rS2 s t tloc ks gid).store q := by
        simp [erase, hq]
      rw [this]
      show ((rS1 s ks gid).setSlot tloc _).store q = none ↔ _
      rw [setSlot_store_none, rS1_store]
      by_cases h1 : q = gid <;> by_cases h2 : q ∈ ks <;> simp [h1, h2, hq, hgt]
  have isGrp3 : ∀ q, q ≠ t → q ≠ gid → q ∉ ks →
      (s.replaceFixed t tloc ks gid).isGrp q = s.isGrp q := by
    intro q h1 h2 h3
    rw [replaceFixed_eq s t tloc ks gid]
    have : ((rS2 s t tloc ks gid).erase t).isGrp q = (rS2 s t tloc ks gid).isGrp q := by
      simp [erase, isGrp, h1]
    rw [this]
    show ((rS1 s ks gid).setSlot tloc _).isGrp q = _
    rw [setSlot_isGrp]
    simp [isGrp, rS1_store, h2, h3]
  have isGrpG : (s.replaceFixed t tloc ks gid).isGrp gid = true := by
    rw [replaceFixed_eq s t tloc ks gid]
    have : ((rS2 s t tloc ks gid).erase t).isGrp gid = (rS2 s t tloc ks gid).isGrp gid := by
      simp [erase, isGrp, hgt]
    rw [this]
    show ((rS1 s ks gid).setSlot tloc _).isGrp gid = _
    rw [setSlot_isGrp]
    simp [isGrp, rS1_store]
  have children3 : ∀ q, (s.replaceFixed t tloc ks gid).children q =
      if q = t then [] else if tloc = some q then rL s t tloc ks gid
      else if q = gid then ks else s.children q := by
    intro q
    rw [replaceFixed_eq s t tloc ks gid, erase_children]
    split
    · rfl
    · unfold rS2
      rw [setSlot_children _ tloc _ hv1, rS1_children s ks gid hks]
  have n3 : (s.replaceFixed t tloc ks gid).n = s.n := by
    rw [replaceFixed_eq s t tloc ks gid]
    show (rS2 s t tloc ks gid).n = s.n
    unfold rS2; rw [setSlot_n]; rfl
  refine ⟨?_, ?_, ?_, ?_, ?_⟩
  · intro q hq
    rw [n3]
    have := mt (store3 q).2 hq
    simp only [not_or, not_and] at this
    obtain ⟨_, h⟩ := this
    by_cases e1 : q = gid
    · rw [e1]; exact hgn
    · by_cases e2 : q ∈ ks
      · exact hksn q e2
      · exact hs.bounded q (fun e => h e1 e2 e)
  · intro q hq
    have hq' := mt (store3 q).2 hq
    simp only [not_or, not_and] at hq'
    obtain ⟨hqt, h⟩ := hq'
    have k := key q
    simp only [hqt, ite_false, Nat.add_zero] at k
    by_cases e1 : q = gid
    · subst e1
      have := hs.noDangling q hgid
      have := (cnt_eq_zero_iff q ks).2 hgk
      simp at k; omega
    · by_cases e2 : q ∈ ks
      · have := hs.noDangling q (hks q e2)
        have := cnt_le_one_of_nodup q ks hnd
        have := (cnt_pos_iff q ks).2 e2
        simp [e1] at k; omega
      · have hp : s.store q ≠ none := fun e => h e1 e2 e
        have := hs.placedOnce q hp
        have := (cnt_eq_zero_iff q ks).2 e2
        simp [e1] at k; omega
  · intro q hq
    have k := key q
    rcases (store3 q).1 hq with e | ⟨e1, e2, e3⟩
    · subst e
      have := hs.placedOnce q htp
      have := (cnt_eq_zero_iff q ks).2 htks
      have : ¬ q = gid := fun e => hgt e.symm
      simp [this] at k; omega
    · have hqt : q ≠ t := by rintro rfl; exact htp e3
      have := hs.noDangling q e3
      have := (cnt_eq_zero_iff q ks).2 e2
      simp [hqt, e1] at k; omega
  · intro q hq
    rw [children3]
    split
    · rfl
    · rename_i hqt
      split
      · rename_i e
        exfalso
        obtain ⟨h1, h2, _⟩ := hloc_ok q e
        rw [isGrp3 q hqt h1 h2] at hq
        subst e
        have : t ∈ s.children q := ht
        rw [hs.leaf q hq] at this; simp at this
      · split
        · rename_i e; subst e; rw [isGrpG] at hq; contradiction
        · rename_i _ hqg
          by_cases hqk : q ∈ ks
          · exact children_of_none (hks q hqk)
          · rw [isGrp3 q hqt hqg hqk] at hq; exact hs.leaf q hq
  · obtain ⟨rank, hr⟩ := hs.acyclic
    classical
    refine ⟨fun y => if y = gid then rank t else if y ∈ ks then rank t + 1 else rank y, ?_⟩
    -- s にある id の rank はそのまま
    have keep : ∀ y, s.store y ≠ none →
        (if y = gid then rank t else if y ∈ ks then rank t + 1 else rank y) = rank y := by
      intro y hy
      have : y ≠ gid := by rintro rfl; exact hy hgid
      have : y ∉ ks := fun h => hy (hks y h)
      simp [*]
    intro q c hc
    show (if q = gid then rank t else if q ∈ ks then rank t + 1 else rank q)
      < (if c = gid then rank t else if c ∈ ks then rank t + 1 else rank c)
    rw [children3] at hc
    split at hc
    · simp at hc
    · rename_i hqt
      split at hc
      · rename_i e
        have hqp : s.store q ≠ none := by rw [e] at htloc; exact htloc.1
        rw [keep q hqp]
        have hq' : t ∈ s.children q := by rw [e] at ht; exact ht
        rcases List.mem_append.1 hc with h | h
        · rw [hslot1, e] at h
          have hcs : c ∈ s.children q := (mem_removeFrom.1 h).1
          rw [keep c (present_of_child s hs hcs)]
          exact hr q c hcs
        · have hcg : c = gid := by simpa using h
          rw [hcg]; simp only [ite_true]
          exact hr q t hq'
      · split at hc
        · rename_i e
          have : c ≠ gid := fun h => hgk (h ▸ hc)
          simp [e, this, hc]
        · rename_i _ hqg
          have hqp : s.store q ≠ none := present_of_mem_children hc
          rw [keep q hqp, keep c (present_of_child s hs hc)]
          exact hr q c hc

end replace

/-! ## 空で無題の group の連鎖の後片付け（PR #137） -/

theorem erase_slot (s : Board) (p : ItemId) (loc : Loc) :
    (s.erase p).slot loc = if loc = some p then [] else s.slot loc := by
  cases loc with
  | none => simp [slot, erase]
  | some q =>
    show (s.erase p).children q = _
    rw [erase_children]
    by_cases h : q = p
    · simp [h]
    · have : ¬ (some q = some p) := fun e => h (Option.some.inj e)
      simp [h, this, slot]

theorem removeItem_validLoc (s : Board) (ploc : Loc) (p : ItemId) (loc : Loc) (h : s.ValidLoc loc)
    (hne : loc ≠ some p) : (s.removeItem ploc p).ValidLoc loc := by
  cases loc with
  | none => trivial
  | some q =>
    have hqp : q ≠ p := fun e => hne (e ▸ rfl)
    refine ⟨fun e => ?_, ?_⟩
    · rcases (removeItem_store_none s ploc p q).1 e with e | e
      · exact hqp e
      · exact h.1 e
    · show q < ((s.detach ploc p).erase p).n
      show q < (s.detach ploc p).n
      unfold detach; rw [setSlot_n]; exact h.2

theorem removeItem_keeps_mem (s : Board) (ploc : Loc) (p : ItemId) (hploc : s.ValidLoc ploc)
    {y : ItemId} (hy : y ≠ p) {loc : Loc} (hloc : loc ≠ some p) (h : y ∈ s.slot loc) :
    y ∈ (s.removeItem ploc p).slot loc := by
  unfold removeItem
  rw [erase_slot]
  simp only [hloc, ite_false]
  unfold detach
  rw [setSlot_slot s ploc _ hploc]
  split
  · rename_i e; subst e; exact mem_removeFrom.2 ⟨h, hy⟩
  · exact h

/-- 連鎖の後片付けは不変条件を保つ。列の各 `(p, ploc)` は「`p` は `ploc` にいる」を満たし、
後ろの項は前の項の `p` そのものでも、その中にいるものでもない（祖先の道なら循環が無いので成り立つ）。 -/
theorem cleanupChain_wf : ∀ (l : List (ItemId × Loc)) (s : Board), s.WF →
    (∀ e ∈ l, s.ValidLoc e.2 ∧ e.1 ∈ s.slot e.2) →
    l.Pairwise (fun a b => b.1 ≠ a.1 ∧ b.2 ≠ some a.1) →
    (s.cleanupChain l).WF
  | [], s, hs, _, _ => hs
  | (p, ploc) :: rest, s, hs, hv, hpw => by
    obtain ⟨hpv, hpm⟩ := hv (p, ploc) (by simp)
    rw [List.pairwise_cons] at hpw
    unfold cleanupChain
    split
    · rename_i he
      have h1 : (s.removeItem ploc p).WF := by
        have := cleanup_wf s hs p ploc hpv hpm
        unfold cleanup at this; rw [ite_eq_left he] at this; exact this
      apply cleanupChain_wf rest _ h1 _ hpw.2
      intro e he'
      obtain ⟨hne1, hne2⟩ := hpw.1 e he'
      obtain ⟨ev, em⟩ := hv e (List.mem_cons_of_mem _ he')
      exact ⟨removeItem_validLoc s ploc p e.2 ev hne2, removeItem_keeps_mem s ploc p hpv hne1 hne2 em⟩
    · exact hs

/-- 付け替えの後も、`x` 以外の居場所の条件はそのまま -/
theorem chain_after_moveTo (s : Board) (x : ItemId) (src dst : Loc) (hsrc : s.ValidLoc src)
    (hdst : s.ValidLoc dst) (l : List (ItemId × Loc))
    (hl : ∀ e ∈ l, s.ValidLoc e.2 ∧ e.1 ∈ s.slot e.2 ∧ e.1 ≠ x) :
    ∀ e ∈ l, (s.moveTo x src dst).ValidLoc e.2 ∧ e.1 ∈ (s.moveTo x src dst).slot e.2 := by
  intro e he
  obtain ⟨h1, h2, h3⟩ := hl e he
  exact ⟨moveTo_validLoc s x src dst e.2 h1, moveTo_keeps_mem s x src dst hsrc hdst h3 h2⟩

/-- PR #137 の後の `drag_drop_item`：入れ子の `x` を drawOrder に出し、前の親から連鎖で片付ける -/
theorem dropOutChain_wf (s : Board) (hs : s.WF) (x p : ItemId)
    (hp : s.ValidLoc (some p)) (hx : x ∈ s.children p) (l : List (ItemId × Loc))
    (hl : ∀ e ∈ l, s.ValidLoc e.2 ∧ e.1 ∈ s.slot e.2 ∧ e.1 ≠ x)
    (hpw : l.Pairwise (fun a b => b.1 ≠ a.1 ∧ b.2 ≠ some a.1)) :
    ((s.moveTo x (some p) none).cleanupChain l).WF :=
  cleanupChain_wf l _ (moveTo_wf s hs x (some p) none hp hx trivial)
    (chain_after_moveTo s x (some p) none hp trivial l hl) hpw

/-- PR #137 の後の `drag_drop_item_into_group`：`x` を group `g` に入れ、前の居場所から連鎖で片付ける。
    前提 `¬ Desc x g` は PR #136 のガード（`is_self_or_descendant_group(g, x)` が false）。 -/
theorem dropIntoGroupChain_wf (s : Board) (hs : s.WF) (x g : ItemId) (loc : Loc)
    (hloc : s.ValidLoc loc) (hx : x ∈ s.slot loc)
    (hg : s.isGrp g = true) (hdesc : ¬ s.Desc x g) (l : List (ItemId × Loc))
    (hl : ∀ e ∈ l, s.ValidLoc e.2 ∧ e.1 ∈ s.slot e.2 ∧ e.1 ≠ x)
    (hpw : l.Pairwise (fun a b => b.1 ≠ a.1 ∧ b.2 ≠ some a.1)) :
    ((s.moveTo x loc (some g)).cleanupChain l).WF := by
  have hdst : s.DstOK x (some g) := ⟨hg, hdesc⟩
  exact cleanupChain_wf l _ (moveTo_wf s hs x loc (some g) hloc hx hdst)
    (chain_after_moveTo s x loc (some g) hloc (hdst.valid hs) l hl) hpw

end Board
end Nest
