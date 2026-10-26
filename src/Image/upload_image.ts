import { auth, storage } from "../Cloud/init_firebase";

const EXTENSIONS: { [type: string]: string } = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
};

// Uploads to images/<uid>/<uuid>.<ext> and returns the download URL.
// The URL carries a token, so anyone who has it can see the image, the same
// as anyone who has the Ba ID can see the Ba.
export const upload_image = async (blob: Blob): Promise<string> => {
  const user = auth.currentUser;
  if (user === null) throw new Error("upload_image: not signed in");
  const ext = EXTENSIONS[blob.type] ?? "bin";
  const ref = storage.ref(`images/${user.uid}/${crypto.randomUUID()}.${ext}`);
  await ref.put(blob, { contentType: blob.type });
  return ref.getDownloadURL();
};
