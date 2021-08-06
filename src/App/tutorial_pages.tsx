import styled from "styled-components";

const H = styled.h2`
  margin-top: 0;
`;

const WidthCheck = () => {
  const width = window.innerWidth;
  if (width >= 600) {
    return null;
  }
  return (
    <p>
      <span style={{ color: "red" }}>*NOTICE*</span> The width of your device is{" "}
      {width} pixels. It is too small than expected.
    </p>
  );
};

const Gyazo: React.FC<{ url: string }> = ({ url }) => {
  const raw_url = url + "/raw";
  return <img src={raw_url} alt="" />;
};

export const tutorial_pages = [
  <div>
    <H>Welcome to Kozaneba!</H>
    <p>You are currently in the tutorial mode.</p>
    <p>If you do not need tutorial, you can close this dialog now.</p>
    <p>Please click `Next` button...</p>
  </div>,
  <div>
    <H>Kozaneba is a tool to organize your thought</H>
    <p>
      To organize your thought, we use Kozane(小札, small plate) and Ba(場,
      large space).
    </p>
    <p>
      You may have seen similar methods using sticky notes and a whiteboard. The
      origin of those methods is before the invention of sticky notes.
    </p>
    <p>
      Kozaneba is a new member of the method family, which uses digital Kozane
      and infinite Ba.
    </p>
    <WidthCheck />
    <p>Please click `Next` button...</p>
  </div>,
  <div>
    <p>
      You can open this <b>tutorial dialog</b> by clicking the icon on
      right-bottom <b>status bar</b>.
    </p>
    <Gyazo url="https://gyazo.com/afe024068b9f42f1aa04b1fe404daa5d"></Gyazo>
    <p>Let's close and open this dialog.</p>
  </div>,
  <div>
    <H>Let's add some Kozane!</H>
  </div>,
];
