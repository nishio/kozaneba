export const check_all_items = (
  items: any[],
  check: (item: any) => boolean,
  message: string
) => {
  const ret = items.every((item: any) => {
    const ok = check(item);
    if (!ok) {
      console.error(message, item);
      return false;
    }
    return true;
  });
  return ret;
};
