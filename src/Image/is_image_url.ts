const IMAGE_EXTENSIONS = /\.(png|jpe?g|gif|webp)$/i;

// URLs that become an image item when pasted. Gyazo pages are not images
// themselves; modify_image_url turns them into thumbnails.
export const is_image_url = (text: string): boolean => {
  if (text.startsWith("https://gyazo.com/")) return true;
  // Kept as before: a trailing ".png" makes anything an image, e.g. a favicon
  // URL with "#.png" appended.
  if (text.endsWith(".png")) return true;
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    return false;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return false;
  if (
    url.hostname === "firebasestorage.googleapis.com" &&
    url.searchParams.get("alt") === "media"
  ) {
    return true;
  }
  return IMAGE_EXTENSIONS.test(url.pathname);
};
