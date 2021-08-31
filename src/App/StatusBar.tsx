import { useGlobal } from "reactn";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faCheckCircle,
  faCloud,
  faTimes,
  faCloudUploadAlt,
  faCloudDownloadAlt,
  faUserSlash,
  faUser,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import { updateGlobal } from "../Global/updateGlobal";
import { dev_log } from "../utils/dev";

const addTooltip = (children: JSX.Element, text: string, testid: string) => {
  return (
    <span className="tooltip" style={{ margin: "5px" }}>
      {children}
      <span className="tooltiptext" data-testid={testid}>
        {text}
      </span>
    </span>
  );
};
export const StatusBar = () => {
  const [statusBar] = useGlobal("statusBar");
  const [user] = useGlobal("user");
  const [cloud_ba] = useGlobal("cloud_ba");
  const [usingFirestoreEmulator] = useGlobal("usingFirestoreEmulator");

  dev_log("render StatusBar", statusBar);
  let contents = null;
  if (statusBar.type === "loading") {
    contents = <FontAwesomeIcon icon={faSpinner} spin={true} />;
  } else if (statusBar.type === "done") {
    contents = addTooltip(
      <FontAwesomeIcon icon={faCheckCircle} />,
      "done",
      "save-status"
    );
  } else if (statusBar.type === "no-connection") {
    contents = <span style={{ margin: "5px" }}></span>;
  } else if (statusBar.type === "uploading") {
    contents = addTooltip(
      <>
        <FontAwesomeIcon icon={faCloudUploadAlt} />
        <FontAwesomeIcon icon={faSpinner} spin={true} />
      </>,
      "uploading",
      "save-status"
    );
  } else if (statusBar.type === "downloading") {
    contents = addTooltip(
      <>
        <FontAwesomeIcon icon={faCloudDownloadAlt} />
        <FontAwesomeIcon icon={faSpinner} spin={true} />
      </>,
      "downloading",
      "save-status"
    );
  } else if (statusBar.type === "text") {
    contents = <span>{statusBar.text} </span>;
  }

  let cloudStatus = null;
  if (cloud_ba === "") {
    cloudStatus = addTooltip(
      <span>
        <FontAwesomeIcon icon={faCloud} />
        <FontAwesomeIcon
          icon={faTimes}
          color="white"
          style={{ marginLeft: "-14px", fontSize: "10px" }}
        />
      </span>,
      "not saved yet",
      "cloud-status"
    );
  } else {
    cloudStatus = addTooltip(
      <span>
        <FontAwesomeIcon icon={faCloud} />
        {usingFirestoreEmulator ? "E" : ""}
      </span>,
      "saveing to the cloud",
      "cloud-status"
    );
  }

  let userStatus = null;
  if (user === null) {
    userStatus = addTooltip(
      <FontAwesomeIcon icon={faUserSlash} />,
      "not signed in",
      "login-status"
    );
  } else if (user.isAnonymous) {
    userStatus = addTooltip(
      <FontAwesomeIcon icon={faUser} />,
      "signed in as anonymous user",
      "login-status"
    );
  } else if (user.photoURL !== null) {
    userStatus = addTooltip(
      <img src={user.photoURL} alt="" width="16px" />,
      user.displayName ?? "user with no display name",
      "login-status"
    );
  } else {
    userStatus = addTooltip(
      <FontAwesomeIcon icon={faUser} />,
      user.displayName ?? "user with no display name",
      "login-status"
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        right: 0,
        bottom: 0,
        height: "28px",
        display: "flex",
      }}
    >
      <div
        style={{
          paddingLeft: "10px",
          paddingRight: "10px",
          // overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            borderTopLeftRadius: "5px",
            border: "black solid 1px",
            borderBottom: 0,
            borderRight: 0,
            opacity: 0.5,
            backgroundColor: "#eee",
            width: "100%",
            height: "100%",
          }}
        ></div>
        <div style={{ position: "relative" }}>
          <span style={{ margin: "5px" }}>
            <TutorialStatus />
            {userStatus}
            {cloudStatus}
            {contents}
          </span>
        </div>
      </div>
    </div>
  );
};

const TutorialStatus = () => {
  const [in_tutorial] = useGlobal("in_tutorial");
  if (in_tutorial) {
    return addTooltip(
      <FontAwesomeIcon
        icon={faQuestionCircle}
        data-testid="tutorial-status"
        onClick={() => {
          updateGlobal((g) => {
            g.dialog = "Tutorial";
          });
        }}
      />,
      "open tutorial",
      "tutorial-status-tooltip"
    );
  } else {
    return addTooltip(
      <FontAwesomeIcon
        icon={faQuestionCircle}
        data-testid="tutorial-status"
        onClick={() => {
          updateGlobal((g) => {
            g.dialog = "Help";
          });
        }}
      />,
      "open help",
      "tutorial-status-tooltip"
    );
  }
};
