import { getGlobal } from "reactn";
import { state_to_docdate } from "../Cloud/state_to_docdate";
import { close_menu_and_dialog } from "../utils/close_menu";
import {
  build_static_html,
  make_static_html_filename,
} from "./build_static_html";

export const download_static_html = () => {
  const state = getGlobal();
  const doc = state_to_docdate(state);
  const title = state.title || "Kozaneba Ba";
  const html = build_static_html(doc, { title });
  const filename = make_static_html_filename(title);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
  close_menu_and_dialog();
};
