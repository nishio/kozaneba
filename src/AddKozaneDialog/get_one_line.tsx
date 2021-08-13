export const get_one_line = (
  multiline: string
): { multiline: string; line: string } => {
  let line;
  let m = multiline.match(/^((?:[^\r\n]|\r(?!\n))*)\n(.*)$/s);
  if (m != null) {
    line = m[1];
    multiline = m[2];
  } else {
    line = multiline;
    multiline = "";
  }
  // trim spaces
  line = line.replace(/(^\s+)|(\s+$)/g, "");
  return { multiline, line };
};
