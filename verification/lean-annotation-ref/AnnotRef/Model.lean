/-!
# モデル：線（annotation）と、それを指す参照

コードの線（`TLineAnnot`）には id が無い。配列の位置は、別のクライアントの保存が届くたびに
ずれる。そこで `src/utils/annotation_ref.ts` は、位置と `items` の組を参照として持ち、
使うたびに解き直す。

モデルの線には `id` を付ける。これはコードには無い「本当はどの線か」の印で、解決の結果が
正しいかを判定するためだけに使う。解決の関数（`resolve` など）は `id` を見ない。
-/
namespace AnnotRef

abbrev ItemId := Nat

/-- 線。`attr` は heads・label・is_doubled・custom をまとめて 1 つの数で表す
（解決は `items` しか見ないので、属性は「変わったかどうか」だけが大事）。 -/
structure Line where
  id : Nat
  items : List ItemId
  attr : Nat := 0
deriving DecidableEq, Repr

def hasItems (xs : List ItemId) (l : Line) : Bool := l.items == xs

/-! ## 今のコード（4ff6400 の `src/utils/annotation_ref.ts`） -/

/-- `TAnnotationRef = { index, items }` -/
structure Ref where
  index : Nat
  items : List ItemId
deriving DecidableEq, Repr

/-- `ref_of_annotation(a, index)`：`a` は `annotations[index]` -/
def refOf (ls : List Line) (i : Nat) : Ref :=
  { index := i, items := ((ls[i]?).map (·.items)).getD [] }

/-- `resolve_annotation_ref`：同じ位置の線の items が同じならその位置、
そうでなければ items が同じ最初の線、無ければ null。 -/
def resolve (ls : List Line) (r : Ref) : Option Nat :=
  if (ls[r.index]?).any (hasItems r.items) then some r.index
  else ls.findIdx? (hasItems r.items)

/-! ## 修正案

参照に「同じ items の線のうち何番目か（`nth`）」と「同じ items の線が何本あったか（`count`）」を
持たせる。解決のときに同じ items の線が `count` 本のままなら `nth` 番目を返し、本数が変わって
いたら、どれだったか分からないので null（ダイアログ・editor を閉じる）。

アプリの操作は線の並びを入れ替えない（足すのは末尾、消すのは filter）。だから、同じ items の
線の顔ぶれが変わらなければ、その中での順番も変わらない。 -/

/-- 位置 `i` の線が items `xs` を持つか -/
def hasAt (ls : List Line) (xs : List ItemId) (i : Nat) : Bool := (ls[i]?).any (hasItems xs)

/-- items が `xs` の線の位置（前から順に） -/
def sameIdx (ls : List Line) (xs : List ItemId) : List Nat :=
  (List.range ls.length).filter (hasAt ls xs)

structure RefF where
  items : List ItemId
  nth : Nat
  count : Nat
deriving DecidableEq, Repr

def refOfF (ls : List Line) (i : Nat) : RefF :=
  let xs := ((ls[i]?).map (·.items)).getD []
  let m := sameIdx ls xs
  { items := xs, nth := m.idxOf i, count := m.length }

def resolveF (ls : List Line) (r : RefF) : Option Nat :=
  let m := sameIdx ls r.items
  if m.length = r.count then m[r.nth]? else none

/-! ## 別のクライアントの保存（線の配列を丸ごと置き換える）

相手のクライアントが行う操作を、そのまま配列の変換として写す。新しい線の `id` は `fresh`。 -/

/-- `add_arrow`：末尾に足す -/
def append (fresh : Nat) (c : List ItemId) (ls : List Line) : List Line :=
  ls ++ [{ id := fresh, items := c }]

/-- `EditAnnotationDialog` の Delete：`annotations.filter((_, i) => i !== index)` -/
def deleteLine (k : Nat) (ls : List Line) : List Line := ls.eraseIdx k

/-- ダイアログ・行内 editor での label・太さ・不透明度・矢印の向きの変更（`heads` だけ）。
`items` は変えない。 -/
def setAttr (k : Nat) (ls : List Line) : List Line :=
  ls.modify k fun l => { l with attr := l.attr + 1 }

/-- `update_annotation_after_deletion(g, d)`：アイテム `d` を消すと、`d` を含む線の items から
最初の `d` を取り除き（heads も同じ位置を取り除く）、items が 2 未満になった線を消す
（`d` を含まない線も、2 未満なら消える）。 -/
def deleteItem (d : ItemId) (ls : List Line) : List Line :=
  ls.filterMap fun l =>
    let it := if l.items.contains d then l.items.erase d else l.items
    if it.length < 2 then none else some { l with items := it }

/-- `handle_making_line` の "delete"：2 点の線のうち、`s`–`e` をどちら向きにでも結ぶものを全部消す -/
def deletePair (s e : ItemId) (ls : List Line) : List Line :=
  ls.filter fun l => !(l.items == [s, e] || l.items == [e, s])

/-- （アプリはしない）先頭に足す -/
def prepend (fresh : Nat) (c : List ItemId) (ls : List Line) : List Line :=
  { id := fresh, items := c } :: ls

/-- （アプリはしない）`k` と `k+1` を入れ替える -/
def swap (k : Nat) (ls : List Line) : List Line :=
  match ls[k]?, ls[k+1]? with
  | some a, some b => (ls.set k b).set (k+1) a
  | _, _ => ls

end AnnotRef
