import { fit_image_size } from "./fit_image_size";

// Large photos are resized before upload. GIFs are kept as they are so that
// animations survive.
export const shrink_image = async (file: Blob): Promise<Blob> => {
  if (file.type === "image/gif") return file;
  const bitmap = await createImageBitmap(file);
  const size = fit_image_size(bitmap.width, bitmap.height);
  if (size === null) {
    bitmap.close();
    return file;
  }
  const [width, height] = size;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  // Screenshots stay PNG so that text stays sharp; everything else is JPEG.
  const type = file.type === "image/png" ? "image/png" : "image/jpeg";
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
      type,
      0.9,
    );
  });
};
