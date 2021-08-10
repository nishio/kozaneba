export const piece_to_kozane = (itemStore: { [key: string]: object }) => {
  Object.entries(itemStore).forEach(([key, value]) => {
    // @ts-ignore
    if (value.type === "piece") {
      itemStore[key] = { ...value, type: "kozane" };
    }
  });
  return itemStore;
};
