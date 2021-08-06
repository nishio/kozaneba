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
      {width} pixels. It is too small than expected. It is better to use another
      device as wide as possible.
    </p>
  );
};

const Gyazo: React.FC<{ url: string }> = ({ url }) => {
  const raw_url = url + "/raw";
  return <img src={raw_url} alt="" style={{ maxWidth: "100%" }} />;
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
    <p>
      The three line button on the top left corner is for main manu. Let's show
      `Add Kozane` dialog.
    </p>
    <p>
      By clicking ADD KOZANE button, Kozaneba makes each line into one kozane
      and puts all newly added kozane in a group.
    </p>
    <Gyazo url="https://gyazo.com/cbf3d0f3c616fc2a5575d7d648db6883" />
  </div>,
  <div>
    <H>Let's move Kozane!</H>
    <p>
      You can move a group by dragging it. You can move a kozane out from its
      belonging group and into another group.
    </p>
    <Gyazo url="https://gyazo.com/030902caab04818679b6db3e510e570b" />
  </div>,
  <div>
    <H>Automatic font size adjustment</H>
    <p>
      You can convert words, short phrases, or longer sentences into kozane. The
      font size is automatically adjusted depends on its length.
    </p>
    <p>I recommend using a short, concise expression of your thought.</p>
    <Gyazo url="https://gyazo.com/6c9609965b35a4183d1759cc9b1452d7" />
  </div>,
  <div>
    <H>Let's scroll and zoom the Ba</H>
    <p>With two-finger gestures, you can scroll and zoom the Ba.</p>
    <iframe
      width="560"
      height="315"
      src="https://www.youtube.com/embed/FvZvZ1jVKrk"
      title="YouTube video player"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    ></iframe>
    <p>
      (For Windows users: On Windows, the scroll of the Ba is sometimes locked
      horizontally/vertically. It is a known issue. )
    </p>
  </div>,
  <div>
    <H>Let's click to show menu</H>
    <p>By clicking an object, the menu to handle the object appears.</p>
    <Gyazo url="https://gyazo.com/7988397249341e8a42570e47a2f22b6b" />
  </div>,
  <div>
    <H>Let's select objects</H>
    <p>You can select multiple objects and make them into a new group.</p>
    <Gyazo url="https://gyazo.com/43fe6d98037a2d91a94618ca3a736978" />
  </div>,
  <div>
    <H>It's not saved yet!</H>
    <p>
      Notice, the Ba is not saved yet! In typical use cases, Kozaneba
      automatically saves the Ba to the cloud. Let's see how to enable auto-save
      on the next page.
    </p>
    <Gyazo url="https://gyazo.com/6f34fd9f2cda800a56ab77429323d39c" />
  </div>,
  <div>
    <H>Let's enable auto-save</H>
    <p>
      To enable auto-save, you need to create a user account. You can sign in
      using Google integration or create an anonymous account.
    </p>
    <Gyazo url="https://gyazo.com/6f34fd9f2cda800a56ab77429323d39c" />
  </div>,
];
