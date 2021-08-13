export const piece_to_kozane = (itemStore: { [key: string]: object }) => {
  Object.entries(itemStore).forEach(([key, value]) => {
    // @ts-ignore
    if (value.type === "piece") {
      itemStore[key] = { ...value, type: "kozane" };
    }
  });
  return itemStore;
};

export const title_to_text = (itemStore: { [key: string]: object }) => {
  Object.entries(itemStore).forEach(([key, value]) => {
    // @ts-ignore
    if (value.type === "group" && value.text === undefined) {
      // @ts-ignore
      itemStore[key] = { ...value, text: value.title };
    }
  });
  return itemStore;
};

export const upgrade = (itemStore: { [key: string]: object }) => {
  itemStore = piece_to_kozane(itemStore);
  itemStore = title_to_text(itemStore);
  return itemStore;
};
