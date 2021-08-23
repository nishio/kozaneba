export const run_user_script = () => {
  const user_script = localStorage.getItem("onLoad");
  if (user_script !== null) {
    console.log("Running user script:\n```\n" + user_script + "\n```");
    // eslint-disable-next-line no-eval
    eval(user_script);
  }
};
