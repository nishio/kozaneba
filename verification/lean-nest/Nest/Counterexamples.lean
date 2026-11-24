import Nest.Model
/-!
# 反例（定理として）

1. ガードなしで group を自分の子に drop すると循環ができる（`drag_drop_item_into_group` 自身は
   `target === group` しか弾かない）。
2. `replace_multiple_kozane` は差し替えた kozane を itemStore に残す（孤児）。
-/
namespace Nest
open Board

/-- drawOrder = [0]、0 は題のある group で中に group 1 -/
def boardA : Board where
  n := 2
  roots := [0]
  store := fun x => if x = 0 then some ⟨true, true, [1]⟩ else if x = 1 then some ⟨true, true, []⟩ else none

theorem boardA_wf_occ : boardA.occ 0 = 1 ∧ boardA.occ 1 = 1 := by decide

/-- group 0 を、その子 1 に入れる（`drag_drop_item_into_group(1, _, 0)` の付け替え） -/
theorem drop_into_own_child_breaks : ¬ (boardA.moveTo 0 none (some 1)).WF := by
  intro h
  obtain ⟨rank, hr⟩ := h.acyclic
  have h1 := hr 1 0 (by decide)
  have h2 := hr 0 1 (by decide)
  omega

/-- 置き場所は 1 回ずつのまま（重複も孤児もない）なのに、drawOrder から届かなくなる -/
theorem drop_into_own_child_still_placed_once :
    (boardA.moveTo 0 none (some 1)).occ 0 = 1 ∧ (boardA.moveTo 0 none (some 1)).occ 1 = 1 ∧
    (boardA.moveTo 0 none (some 1)).roots = [] := by decide

/-- drawOrder = [0]、0 は kozane -/
def boardB : Board where
  n := 1
  roots := [0]
  store := fun x => if x = 0 then some ⟨false, false, []⟩ else none

/-- `replace_multiple_kozane` の木の部分：新しい kozane 1, 2 と group 3 を作り、drawOrder の 0 を 3 に差し替える -/
def replaceB : Board :=
  let s0 : Board := { boardB with n := 4 }
  let s1 := ((s0.put 1 ⟨false, false, []⟩).put 2 ⟨false, false, []⟩).put 3 ⟨true, false, [1, 2]⟩
  s1.setSlot none (removeFrom s1.roots 0 ++ [3])

theorem replace_leaves_orphan : (replaceB.store 0).isSome ∧ replaceB.occ 0 = 0 := by decide

theorem replace_breaks : ¬ replaceB.WF := by
  intro h
  have := h.placedOnce 0 (by decide)
  have : replaceB.occ 0 = 0 := replace_leaves_orphan.2
  omega

end Nest
