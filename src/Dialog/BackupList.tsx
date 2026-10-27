import { useEffect, useState } from "react";
import { useGlobal } from "reactn";
import { list_backups } from "../Cloud/backup_store";
import { TBackupMeta } from "../Cloud/backup_policy";
import { restore_backup } from "../Cloud/restore_backup";
import { can_write } from "../utils/can_write";
import { date_to_str } from "../utils/date_to_str";

// Local backups of the current Ba (D1 / D8), in the Ba dialog.
export const BackupList = () => {
  const [cloud_ba] = useGlobal("cloud_ba");
  const [language] = useGlobal("language");
  const [backups, setBackups] = useState<TBackupMeta[] | null>(null);
  const [restored, setRestored] = useState<number | null>(null);
  const ja = language.startsWith("ja");

  useEffect(() => {
    if (cloud_ba === "") return;
    let alive = true;
    list_backups(cloud_ba)
      .then((xs) => {
        if (alive) setBackups(xs);
      })
      .catch(() => {
        if (alive) setBackups([]);
      });
    return () => {
      alive = false;
    };
  }, [cloud_ba, restored]);

  if (cloud_ba === "" || !can_write()) return null;

  const onRestore = (m: TBackupMeta) => {
    restore_backup(m.id).then((ok) => {
      if (ok) setRestored(m.saved_at);
    });
  };

  return (
    <details data-testid="backup-list">
      <summary>{ja ? "この端末のバックアップから戻す" : "Restore from backups on this device"}</summary>
      <p style={{ fontSize: "small", maxWidth: "40em" }}>
        {ja
          ? "保存のたびに、この端末（ブラウザ）にも場の写しを残しています。「読み込む」を押すと、今の場の中身がその版に置き換わり、いつもどおりクラウドに保存されます。今の中身もこの一覧に残るので、読み込みは取り消せます。"
          : "Each save also keeps a copy of the Ba on this device (browser). Load replaces the contents of this Ba with that version, and it is saved to the cloud as usual. The current contents are kept in this list too, so a load can be undone."}
      </p>
      {restored !== null ? (
        <p data-testid="backup-restored">
          {ja
            ? `${date_to_str(restored, true)} の版を読み込みました。`
            : `Loaded the version of ${date_to_str(restored, true)}.`}
        </p>
      ) : null}
      {backups === null ? null : backups.length === 0 ? (
        <p>{ja ? "バックアップはまだありません。" : "No backups yet."}</p>
      ) : (
        <ul style={{ maxHeight: "30vh", overflowY: "auto", paddingLeft: "1em" }}>
          {backups.map((m) => (
            <li key={m.id}>
              {date_to_str(m.saved_at, true)} ({m.n_items}
              {ja ? " 個" : m.n_items === 1 ? " item" : " items"},{" "}
              {Math.ceil(m.size / 1024)} KB){" "}
              <button onClick={() => onRestore(m)}>{ja ? "読み込む" : "Load"}</button>
            </li>
          ))}
        </ul>
      )}
    </details>
  );
};
