export const modify_image_url = (url: string) => {
  // Gyazo URL is not the link to image itself
  if (url.startsWith("https://gyazo.com/")) {
    const items = url.split("/");
    if (items.length === 4) {
      return url + "/thumb/400";
    } else if (items.length === 6 && items[4] === "thumb") {
      items[5] = "400";
      return items.join("/");
    }
    return url;
  }
  return url;
};
