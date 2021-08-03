import { useGlobal } from "reactn";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faCheckCircle,
  faCloud,
  faTimes,
  faCloudUploadAlt,
  faCloudDownloadAlt,
} from "@fortawesome/free-solid-svg-icons";

export const StatusBar = () => {
  const [statusBar] = useGlobal("statusBar");
  let contents = null;
  if (statusBar.type === "loading") {
    contents = <FontAwesomeIcon icon={faSpinner} spin={true} />;
  } else if (statusBar.type === "done") {
    contents = (
      <FontAwesomeIcon icon={faCheckCircle} style={{ margin: "5px" }} />
    );
  } else if (statusBar.type === "no-connection") {
    contents = (
      <span style={{ margin: "5px" }}>
        <FontAwesomeIcon icon={faCloud} />
        <FontAwesomeIcon icon={faTimes} />
      </span>
    );
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
          overflow: "hidden",
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
        {contents}
      </div>
    </div>
  );
};
