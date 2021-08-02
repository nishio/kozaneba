import { useGlobal } from "reactn";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

export const StatusBar = () => {
  const [statusBar] = useGlobal("statusBar");
  let contents = null;
  if (statusBar.type === "text") {
    contents = <span>{statusBar.text} </span>;
  } else if (statusBar.type === "loading") {
    contents = <FontAwesomeIcon icon={faSpinner} spin={true} />;
  }
  contents = (
    <FontAwesomeIcon icon={faSpinner} spin={true} style={{ margin: "5px" }} />
  );

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
