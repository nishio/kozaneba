// from url to human-readable text
export const url_to_text = (url: string) => {
  const u = new URL(url);
  const items = u.pathname.split("/");
  const last = items[items.length - 1] ?? items[items.length - 2];
  if (last === undefined || last === "") {
    return u.hostname;
  }
  return decodeURIComponent(last);
};
