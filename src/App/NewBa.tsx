import { useEffect } from "react";
import { useGlobal } from "../Global/ReactnCompat";
import { initial_save } from "../Cloud/initial_save";
import { updateGlobal } from "../Global/updateGlobal";
import { Blank } from "./Blank";

export const NewBa = () => {
  const [user] = useGlobal("user");
  const [cloud_ba] = useGlobal("cloud_ba");
  useEffect(() => {
    updateGlobal((g) => {
      // wait for login
      g.statusBar.type = "downloading";
      g.dialog = "Loading";
    });
  }, []);
  useEffect(() => {
    if (cloud_ba === "" && user !== null) {
      initial_save();
    }
  }, [cloud_ba, user]);
  return <Blank />;
};
