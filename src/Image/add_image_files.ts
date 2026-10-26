import { add_item } from "../API/add_item";
import { not_login_then_show_dialog } from "../Cloud/not_login_then_show_dialog";
import { get_center_of_screen } from "../dimension/get_center_of_screen";
import { TWorldCoord } from "../dimension/world_to_screen";
import { create_gyazo_item } from "../utils/add_gyazo_item";
import { mark_local_changed } from "../utils/mark_local_changed";
import { set_status } from "../utils/set_status";
import { shrink_image } from "./shrink_image";
import { upload_image } from "./upload_image";

export const image_files_from = (data: DataTransfer | null): File[] => {
  if (data === null) return [];
  return Array.from(data.files).filter((f) => f.type.startsWith("image/"));
};

// Several files dropped at once are placed diagonally so they don't overlap
// completely.
const STEP = 30;

export const add_image_files = async (
  files: File[],
  position: TWorldCoord = get_center_of_screen(),
) => {
  if (not_login_then_show_dialog()) return;
  set_status("uploading");
  try {
    for (const [i, file] of files.entries()) {
      const url = await upload_image(await shrink_image(file));
      const item = create_gyazo_item(url);
      item.position = [
        position[0] + i * STEP,
        position[1] + i * STEP,
      ] as TWorldCoord;
      add_item(item);
      mark_local_changed();
    }
    set_status("done");
  } catch (error) {
    console.error(error);
    set_status("done");
    alert(`Failed to upload the image: ${error}`);
  }
};
