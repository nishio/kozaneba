# backup の間引き（#89）を Lean で確かめる

手元の backup（IndexedDB）をどれだけ残すかを決める `src/Cloud/backup_policy.ts` を Lean 4 に写し、次の 3 つのやり方で確かめた記録です。Mathlib は使っていません（core だけ）。

- **一般の証明**：bucket の決め方や入力の長さを問わずに成り立つこと（`BackupPolicy/Thin.lean`、`BackupPolicy/OverCap.lean`。`sorry` はありません）。
- **全数検査**：時刻を 30 分刻みの小さな整数に縮め、「保存のたびに間引く」流れを、保存の時刻の並びすべてについて走らせる（`BackupPolicy/Small.lean`）。
- **TypeScript との突き合わせ**：vitest が乱数（seed 固定）の入力と本物の関数の出力を `diff/cases.json` に書き、Lean の写しの出力と比べる（`BackupPolicy/Real.lean`、`src/Cloud/backup_policy.diff.test.ts`）。

```sh
export PATH=$HOME/.elan/bin:$PATH   # elan は verification/lean-nest/README.md の手順で入れる
lake build && .lake/build/bin/check  # 約 2 分（全数検査は保存 4 回まで）
.lake/build/bin/check diff           # TypeScript との突き合わせだけ（1 秒）
```

`lake build` が失敗するのは、証明が崩れたとき、または証明した定理が `sorry` か標準の 3 つ（`propext`・`Classical.choice`・`Quot.sound`）以外の公理を使ったときです（`BackupPolicy/Axioms.lean` が build の中で確かめます）。

`check` が 0 以外で終わるのは、次のどれかのときです。

- 安全なはずの構成で、性質が 1 件でも崩れた。
- 崩れるはずの構成（直す前のコード、わざと壊した版）で、期待した反例が出なくなった。
- `diff/cases.json` の TypeScript の出力と、Lean の写しの出力が違う。

CI にはまだ組み込んでいません（`.github/workflows/lean.yml` は、他の検証とまとめて後で変えます）。

## 規則（コードを正とする）

場（cloud_ba）ごとに、保存のたび（`add_backup` → `prune(cloud_ba, now)`）に次を行う。

1. `select_thinned`：その場の backup を `saved_at` の新しい順に並べ、次のどれかに当たるものを残し、ほかを消す。
   - 新しい 20 件（`keep_recent`）。
   - 各 bucket で最も新しいもの。bucket は今からの経過時間で決まる。2 日未満は「UTC の 1 時間」、30 日未満は「地方時の 1 日」、それより前は「地方時の 1 か月」。
   - （この PR の修正 B）最後に取った backup（id が最大）。
2. `select_over_cap`：すべての場の backup の総量（JSON の文字数）が 3000 万字を越えていれば、古い順に消す。上限の内側に入ったら止める。各場で最も新しい backup は消さない。

## 写したもの

| コード | モデル |
|---|---|
| `select_thinned` の `forEach`（`i < keep_recent \|\| is_first_of_bucket`、`seen.add` は残すときも消すときも） | `thinKeep bucket k seen xs`（`Thin.lean`）。bucket の決め方は引数 |
| `[...metas].sort((a, b) => b.saved_at - a.saved_at)`（安定） | `List.mergeSort`（安定） |
| `bucket_of` | 全数検査では `Cal.bucket`（時刻は tick）。突き合わせでは `Real.bucketOf`（ミリ秒、鍵は TS と同じ文字列） |
| `select_over_cap` のループ | `overCapGo`（`OverCap.lean`） |
| `newest_of_ba`（配列の順に見て、`saved_at` が真に大きいときだけ取り替える） | `selectOverCap` の `foldl` |
| `prune`（その場だけ間引き、全体で上限） | `exploreCap` の中の prune |
| 保存のたびの間引き | `explore`：保存の時刻の並びをたどり、保存ごとにその時刻で `prune` |

写した版は `modeled-sources.txt` にあります（4ff6400 と、この PR の修正の後）。

捨てたもの:

- IndexedDB（Dexie）の transaction、`pruning` の Promise の鎖（prune を 1 つずつ流す）、v3 への移行。
- `n_items`、JSON の中身。
- 全数検査では、`keep_recent` を 1 と 2 に、時間の長さを縮めた（下）。本当の 20 件・2 日・30 日は、突き合わせで確かめた。
- 地方時の時差の表（tz database）。突き合わせでは、各 backup の時刻での時差を JS の `getTimezoneOffset()` から受け取り、年・月・日は Lean で計算した（Howard Hinnant の `civil_from_days`）。

### 全数検査の時刻

| | 本物 | モデル |
|---|---|---|
| 刻み | 1 ms | 1 tick = 30 分 |
| 時間の bucket | UTC の 1 時間 | 2 tick |
| 日 | 地方時の 0 時から | `dayStarts`（UTC の tick）から。3 種類の暦を用意した |
| 「2 日」（hourly_for） | 48 時間 | 12 tick |
| 「30 日」（daily_for） | 30 日 | 24 tick（月の長さと同じくらい） |
| 月 | 地方時 | `monthStarts`（日の始まりの一部。3〜4 日ごと） |

暦は 3 種類です。

- **整数時間の時差**：日の始まりがすべて偶数 tick（1 日 6 tick）。日本・UTC など。
- **夏時間**：日の長さが 4・6・8 tick と変わるが、日の始まりは偶数 tick。23 時間・25 時間の日がある地域。
- **30 分の端数のある時差**：日の始まりが奇数 tick。インド（+5:30）、ネパール（+5:45）、ニューファンドランド（−3:30）、ロード・ハウ島（夏時間が 30 分）など。

保存の時刻は 0..40 tick、保存は 4 回まで。時計の進み方は 3 通りです：真に増える、同じ時刻がある（同じミリ秒の保存）、前の保存より 3 tick まで戻る（NTP の補正、手で時計を直す、など）。

## 性質と結果

| | 性質 | 確かめ方 | 結果 |
|---|---|---|---|
| T1 | 残すものは元の部分列（ほかの場のもの・知らないものを消さない、順も保つ） | 証明 `thinKeep_sublist` | 成り立つ |
| T2 | 新しい `keep_recent` 件は、そのまま残る | 証明 `take_prefix_thinKeep`、全数検査 | 成り立つ |
| T3 | `saved_at` が最も新しいものは残る（`keep_recent` が 0 でも） | 証明 `head_mem_thinKeep` | 成り立つ |
| T4 | 各 bucket で最も新しいものは残る。どの backup にも、同じ bucket の残るものがある | 証明 `first_of_bucket_kept`・`bucket_covered` | 成り立つ |
| T5 | 冪等：同じ時刻でもう一度間引いても変わらない | 証明 `thinKeep_idem`、全数検査 | 成り立つ |
| T6 | 残る数は「`keep_recent` 件 + bucket ごとに 1 件」まで | 証明 `thinKeep_drop_nodup`、全数検査 | 成り立つ |
| T7 | 今取った backup が、その場の間引きで消えない | 全数検査、vitest | **main では崩れる（下の B）**。修正後は成り立つ |
| T8 | 時間をまたぐ単調性：保存のたびに間引いても、それまでのすべての backup について、その時刻の粒度（時間・日・月）の暦の区切りに、残っているものがある。時間が進むだけで間引かない時刻でも | 全数検査、vitest | **30 分の端数のある時差で崩れる（下の A）**。整数時間の時差・夏時間では成り立つ。修正後はどの暦でも成り立つ |
| C1 | 上限で、各場の最も新しい backup は消さない | 証明 `overCapGo_not_prot`、全数検査 | 成り立つ |
| C2 | 古い順に消す（消すのは、守らないものを古い順に並べた列の先頭） | 証明 `overCapGo_prefix`、全数検査 | 成り立つ |
| C3 | 消した後に上限を越えているなら、守らないものはすべて消えている | 証明 `overCapGo_under_cap`、全数検査 | 成り立つ |
| C4 | 消しすぎない（1 つ消す直前は、上限を越えている） | 証明 `overCapGo_needed`、全数検査 | 成り立つ |
| C5 | 冪等：もう一度呼ぶと何も消さない | 全数検査 | 成り立つ |
| P1 | prune（間引き → 上限）の後に、すべての場で最も新しい backup が残る | 全数検査 | 成り立つ |

上限（C1〜C4）はコードどおり、`keep_recent` も各期間の代表も守りません。総量が 3000 万字を越えると、古い月・日の代表から消え、新しい 20 件も消えることがあります。守るのは各場で最も新しい 1 件だけです。

T8 の「暦の区切り」は bucket の鍵より弱い言い方です。保存のたびに間引くと、一度にまとめて間引いた場合と、残る bucket の鍵は一致しません（全数検査の「鍵の代表が無い（参考）」）。

- 例：同じ UTC の時間 h に 2 つ（古い x と新しい y）があり、x が先に「日」の範囲に入った。
- 一度に間引けば、x がその日の鍵の代表として残る。
- 保存のたびに間引くと、x は時間の範囲にいたときに y に負けて消えている。
- それでもその日には y がある（時間の鍵で残っている）ので、日は覆われている。

T8 はこの「区切りが覆われているか」を見ます。

時計が戻る場合の T8 は、それまでに間引いた時刻のうち最も遅いもの以後で見ます。戻った時刻で見ると代表が無いことがあります（「戻った時刻で見ると代表が無い（参考）」）。

- 時計が進んでいた間の間引きは、その進んだ時刻の粒度で消します。
- 時計を戻しても、消したものは戻りません。
- どの時刻で決める規則にも付いてくる性質なので、バグとして扱っていません。

### 全数検査の結果（`check`、保存 4 回まで）

| 構成 | keep | 状態 | 今取ったものが消えた | 区切りの代表が無い |
|---|---:|---:|---:|---:|
| main・時計は真に増える・整数時間 | 1 / 2 | 112,791 | 0 / 0 | 0 / 0 |
| main・時計は真に増える・夏時間 | 1 / 2 | 112,791 | 0 / 0 | 0 / 0 |
| main・同じ時刻がある・整数時間 | 1 / 2 | 148,994 | **13,243 / 902** | 0 / 0 |
| main・時計が 3 tick まで戻る・整数時間 | 1 / 2 | 294,310 | **37,084 / 11,861** | 0 / 0 |
| main・時計は真に増える・30 分の端数 | 1 / 2 | 112,791 | 0 / 0 | **3,866 / 1,734** |
| 修正後・同じ時刻がある・整数時間 | 1 / 2 | 148,994 | 0 / 0 | 0 / 0 |
| 修正後・時計が 3 tick まで戻る・整数時間 / 夏時間 / 30 分の端数 | 1 / 2 | 294,310 | 0 / 0 | 0 / 0 |

どの構成でも「新しい keep 件が消えた」「冪等でない」「鍵ごとに 1 件を越えた」は 0 件です。「時計が 3 tick まで戻る」は「真に増える」を含みます。

`select_over_cap` と prune は、場 2 つ・`saved_at` 0..3・size 1..3・上限 0..8・backup 4 個までのすべて（3,115,800 通り）で、C1〜C5・P1 と「prune の間引きが他の場を消した」が 0 件です。

## 見つかったこと

本物の関数を呼ぶ vitest（`src/Cloud/backup_policy.sequence.test.ts`）で、A と B を再現しました。この PR で直しています。

### A. 時差に 30 分の端数がある地域で、日の最後の 30 分だけの保存が、日の代表を残さない

- 時間の bucket は UTC の時間（`Math.floor(saved_at / HOUR)`）、日の bucket は地方時の日です。
- 時差が +5:30 なら、UTC の 1 時間（18:00〜19:00）は、ある日の 23:30〜24:00 と次の日の 0:00〜0:30 にまたがります。
- 2 日以内の間引きでは、その時間で最も新しい（次の日の）ものだけが残り、前の日の 23:45 は消えます。
- 前の日の保存がその 30 分だけだったなら、2 日後にその日が「日」の範囲に入ったとき、その日の backup は 1 つもありません。
- 一度にまとめて間引けば、23:45 がその日の代表として残ります。保存のたびに間引くと消えます。
- 全数検査の最短の例は、保存の時刻 [36, 37]（keep=1）です。36 は日の最後の tick、37 は次の日の最初の tick で、同じ UTC の時間です。時刻 48 に見ると、36 の日の代表がありません。
- vitest では、Asia/Kolkata で 10 月 27 日 23:45 に 1 回、28 日 0:05 から 21 回保存すると、27 日の backup が残りません。
- 影響は小さいです。失うのは「その日の終わりの状態」で、数分後の状態（次の日の最初の backup）は残ります。
- **修正 A**：時間の鍵に地方時の日付を足す（`h${hour}-${d.getDate()}`）。UTC の時間を地方時の 0 時で切ります。時差が整数時間の地域では、UTC の時間が 0 時をまたがないので、分け方は変わりません。

### B. 時計が戻ると、今取った backup がその場の間引きで消える

- `keep_recent` も bucket の代表も `saved_at` の順で決まります。
- 時計が戻ると、今取った backup より `saved_at` の大きいもの（時計が進んでいた間の backup）が 20 件以上あることがあります。
- そのうちの 1 つと同じ UTC の時間にいれば、今取った backup は「新しい 20 件」にも「bucket で最も新しいもの」にも入らず、取った直後の prune で消えます。
- 時計が進んでいた間の backup が 20 件以上あると、時計が戻った後、それらと同じ UTC の時間に取った backup は、取った直後にすべて消えます。その間、復元の一覧に直前の状態がありません。
- 同じミリ秒の保存が 21 回あっても同じことが起きます（安定な sort で、先に取ったものが前に来るため）。実際には起きません。
- vitest では、10:40 から 30 秒ごとに 21 回保存した後、時計を 10:36 に戻して保存すると、その backup が消えます。
- **修正 B**：最後に取った backup（id が最大。Dexie の `++id` は取った順に増える）は間引かない。
  - `last_taken` は bucket の代表にも `keep_recent` にも数えません（`seen` への追加は今までどおり）。
  - なので、ほかのものの残り方は変わりません。
  - 冪等性も保たれます（全数検査で確かめました）。

既存のテスト `a save every 10 minutes for 70 days ...` は、id を新しいものほど小さく振っていました（実際とは逆）。修正 B では最大の id（そのテストでは 70 日前のもの）が残るので、id を取った順に振るように直しました。

### バグではないが、書いておくこと

- **上限は、各期間の代表も新しい 20 件も守らない。** 守るのは各場で最も新しい 1 件だけです（コードのコメントどおり）。
- **日の鍵の文字列が衝突しうる。** `d${年}-${月}-${日}` は月が 0 始まりで区切りがあいまいなので、2 月 11〜19 日と 12 月 1〜9 日が同じ鍵になります（`d2026-1-11` と `d2026-11-1`）。日の鍵が使われるのは経過 2〜30 日の 28 日間だけで、この 2 つが同時に入ることはないので、害はありません。月の鍵（`m${年}-${月}`）は衝突しません。突き合わせの Lean の写しは、TS と同じ文字列の鍵を使っています。
- **未来の backup。** 時計が戻った後の、`saved_at` が今より後の backup は、経過時間が負なので時間の bucket に入り、新しい順の先頭に来ます。上限で守る「その場の最も新しいもの」も、この未来の backup になります。上限は古い順に消すので、修正 B の後も、上限が働くと、今取った backup が未来の backup より先に消えうるはずです（コードを読んだだけで、確かめていません）。これは直していません。

## TypeScript との突き合わせ

`src/Cloud/backup_policy.diff.test.ts` が、7 つの時間帯で 30 件ずつ、合わせて 210 の場合を作ります。

- 時間帯：UTC、Asia/Tokyo、Asia/Kolkata（+5:30）、Asia/Kathmandu（+5:45）、America/New_York（夏時間）、America/St_Johns（−3:30、夏時間）、Australia/Lord_Howe（夏時間が 30 分）。
- 時刻は、ちょうど 2 日・30 日とその ±1 ms、地方時の 0 時と月の始まりの前後、同じ時刻の backup、未来（時計が戻った）、などを混ぜます。
- 上限は、総量より上・ちょうど総量・古いものから k 個消すとちょうど収まる値・0、などです。

各場合で、場 "a" の `select_thinned(of_a, now)` と、全体の `select_over_cap(metas, cap)` の出力（消す id の列、順も含む）を書きます。

`diff/cases.json` は commit してあるので、Lean の `check` は node 無しで走ります。vitest は、ファイルが今のコードの出力と違うと失敗します。`backup_policy.ts` を変えたら、次の手順で作り直し、Lean の写しも合わせます。

```sh
UPDATE_BACKUP_POLICY_CASES=1 npx vitest run src/Cloud/backup_policy.diff.test.ts
cd verification/lean-backup-policy && lake build && .lake/build/bin/check diff
```

結果：210 の場合（backup 5,316 個）で、`select_thinned` も `select_over_cap` も、Lean の写しと一致しました。

## 検査が効くことの確かめ（変異）

わざと壊した版で反例が出ることを、`check` が毎回確かめます（出なければ失敗）。

| 変異 | 検査 | 反例 |
|---|---|---|
| `i < keep_recent && is_first_of_bucket`（`\|\|` を `&&` に） | 全数検査（新しい keep 件） | 400 |
| 時間の鍵が日付の無い「何時」 | 全数検査（区切りの代表） | 720 |
| 日の鍵が衝突する（日 mod 2） | 全数検査（区切りの代表） | 105 |
| 上限で、いちばん古いものを守る | 全数検査（最も新しいものを消した） | 62,424 |
| 上限の内側に入っても止めない | 全数検査（消しすぎ） | 6,912 |
| 上限で、新しい順に消す | 全数検査（古い順でない） | 6,912 |
| Lean の写しを修正 A の前に戻す | 突き合わせ | 5 件違う |
| Lean の写しを修正 B の前に戻す | 突き合わせ | 33 件違う |
| Lean の写しを `i <= keep_recent` | 突き合わせ | 51 件違う |
| Lean の写しの時間の鍵を「何時」 | 突き合わせ | 39 件違う |
| Lean の写しの上限で、いちばん古いものを守る | 突き合わせ | 127 件違う |

TypeScript の側を 1 行ずつ壊し、`diff/cases.json` を作り直して `check diff` を走らせました（手で 1 回。`check` には入っていません）。どれも「今のコードの写し」の行で違いが出て、0 以外で終わりました。

| TypeScript の変異 | `select_thinned` が違う | `select_over_cap` が違う |
|---|---:|---:|
| `i <= keep_recent` | 51 | 0 |
| `if (total < cap) break` | 0 | 39 |
| 修正 A を戻す（`h${hour}`） | 5 | 0 |
| 修正 B を戻す | 33 | 0 |
| `newest_of_ba` を `<=`（同じ時刻なら後のもの） | 0 | 6 |
| `age <= daily_for` | 35 | 0 |
| 同じ時刻を id の降順に並べる | 89 | 0 |

証明については、`thinKeep_idem` の証明を `sorry` にすると `lake build` が失敗することを確かめました。

## モデルとコードのずれ

`modeled-sources.txt` に、写したファイルの blob があります。ファイルを変えたら次のようにします。

1. 変更を読み、`Real.lean`（と、規則の形が変わるなら `Thin.lean`・`OverCap.lean`・`Small.lean`）を写し直す。
2. `diff/cases.json` を作り直し、`check` を走らせる。
3. `git hash-object <path>` を `modeled-sources.txt` に足す。

## 調べていないこと

- 本当の `keep_recent`（20）・2 日・30 日での全数検査。これは突き合わせの 210 の場合だけです。全数検査は縮めた時刻と `keep_recent` 1・2 です。
- 保存 5 回以上の並び。
- 時計が 3 tick（1 時間半）より大きく戻る場合の全数検査。vitest の B は 4 分戻る例です。
- `add_backup` が並行に走るとき（`pruning` の鎖は prune を 1 つずつ流すが、`now` の大小と prune の順が逆になりうる）。
- IndexedDB の読み出しの順（モデルは、配列の順 = id の順と仮定。`where("cloud_ba")` と `toArray()` は主キーの順に返す）。
- 場が 3 つ以上の上限。
- 地方時の時差の表そのもの（JS から受け取った）。

## ファイル

| ファイル | 中身 |
|---|---|
| `BackupPolicy/Thin.lean` | `thinKeep` と、その一般の証明 |
| `BackupPolicy/OverCap.lean` | `overCapGo` と、その一般の証明 |
| `BackupPolicy/Axioms.lean` | 証明が `sorry` と想定外の公理を使っていないことを build で確かめる |
| `BackupPolicy/Small.lean` | 縮めた時刻のモデル、保存のたびの間引きの全数検査、上限の全数検査、変異 |
| `BackupPolicy/Real.lean` | 本物の大きさの写し、`diff/cases.json` の読み込みと比較 |
| `BackupPolicy/Checks.lean` | `check` の本体（期待と結果の表） |
| `diff/cases.json` | vitest が書いた、TypeScript の入力と出力 |
| `modeled-sources.txt` | 写したファイルの blob |
