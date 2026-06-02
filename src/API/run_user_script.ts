import { dev_log } from "../utils/dev";

export const run_user_script = () => {
  const user_script = localStorage.getItem("onLoad");
  if (user_script === null) {
    return;
  }

  dev_log("Running user script:\n```\n" + user_script + "\n```");
  try {
    // eslint-disable-next-line no-eval
    eval(user_script);
  } catch (error) {
    console.error("Failed to run user script from localStorage.onLoad", error);
  }
};
