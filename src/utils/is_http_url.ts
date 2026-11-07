// Only http(s) URLs may be opened from items; a shared ba can carry any string
// (e.g. "javascript:...") in url fields.
export const is_http_url = (s: string | undefined): s is string => {
  if (s === undefined) return false;
  try {
    const protocol = new URL(s).protocol;
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
};
