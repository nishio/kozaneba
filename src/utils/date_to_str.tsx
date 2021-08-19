export const date_to_str = (date: number) => {
  const d = new Date(date);
  const Y = d.getFullYear();
  const M = (d.getMonth() + 1).toString().padStart(2, "0");
  const D = d.getDate().toString().padStart(2, "0");
  const H = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  const s = `${Y}-${M}-${D} ${H}:${m}`;
  return s;
};
