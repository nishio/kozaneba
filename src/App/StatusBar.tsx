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
} from "@fortawesome/free-solid-svg-icons";

const addTooltip = (children: JSX.Element, text: string, testid: string) => {
  return (
    <span className="tooltip">
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

  let contents = null;
  if (statusBar.type === "loading") {
    contents = <FontAwesomeIcon icon={faSpinner} spin={true} />;
  } else if (statusBar.type === "done") {
    contents = (
      <FontAwesomeIcon icon={faCheckCircle} style={{ margin: "5px" }} />
    );
  } else if (statusBar.type === "no-connection") {
    contents = <span style={{ margin: "5px" }}></span>;
  } else if (statusBar.type === "uploading") {
    contents = (
      <span style={{ margin: "5px" }}>
        <FontAwesomeIcon icon={faCloudUploadAlt} />
        <FontAwesomeIcon icon={faSpinner} spin={true} />
      </span>
    );
  } else if (statusBar.type === "downloading") {
    contents = (
      <span style={{ margin: "5px" }}>
        <FontAwesomeIcon icon={faCloudDownloadAlt} />
        <FontAwesomeIcon icon={faSpinner} spin={true} />
      </span>
    );
  } else if (statusBar.type === "text") {
    contents = <span>{statusBar.text} </span>;
  }

  let cloudStatus = null;
  if (cloud_ba === "") {
    cloudStatus = addTooltip(
      <span style={{ margin: "5px" }}>
        <FontAwesomeIcon icon={faCloud} />
        <FontAwesomeIcon
          icon={faTimes}
          color="white"
          style={{ marginLeft: "-14px", fontSize: "10px" }}
        />
      </span>,
      "not save on cloud",
      "cloud-status"
    );
  } else {
    cloudStatus = addTooltip(
      <span style={{ margin: "5px" }}>
        <FontAwesomeIcon icon={faCloud} />
      </span>,
      "saved on cloud",
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
          {userStatus}
          {cloudStatus}
          {contents}
        </div>
      </div>
    </div>
  );
};
