import styled from "styled-components";
import { updateGlobal } from "../Global/updateGlobal";

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

const SAMPLE_LINES = `words
short phrases
You can convert longer sentences into kozane.
The font size is automatically adjusted depends on its length.
font size
auto adjust
I recommend using a short, concise expression of your thought.
use concise expression
Kozaneba
digital stationery
organize your thought
Kozane
小札
small plate
Ba
場
large space
sticky notes
whiteboard
digital Kozane
infinite Ba
move Kozane
drag
two-finger gestures
scroll and zoom the Ba
select multiple objects
auto save
to the cloud
don't classify
organize
classify
categorize
store
recombine
組み替え
rearrange
並び替え
組み=group
並び=order
替え=change
discover unexpected relationships
organized into a structure
rigid subjective classification
suffocate and die
content
your personal interest
Tadao Umesao
Kozane Method
Classification is not the goal
1969
The Art of Intellectual Production

`;
const openPrefilledDialog = () => {
  updateGlobal((g) => {
    g.add_kozane_text = SAMPLE_LINES;
    g.dialog = "AddKozane";
  });
};
export const tutorial_pages = [
  <div>
    <H>Welcome to Kozaneba!</H>
    <p>Kozaneba is digital stationery to organize your thought.</p>
    <p>
      You are currently in the tutorial mode. If you do not need tutorial, you
      can close this dialog now.
    </p>
    <p>Please click `Next` button...</p>
  </div>,
  <div>
    <H>digital stationery to organize your thought</H>
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
    <Gyazo
      url="https://gyazo.com/afe024068b9f42f1aa04b1fe404daa5d"
      key="statusbar"
    />
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
    <Gyazo
      url="https://gyazo.com/cbf3d0f3c616fc2a5575d7d648db6883"
      key="add_kozane"
    />
  </div>,
  <div>
    <H>Let's move Kozane!</H>
    <p>
      You can move a group by dragging it. You can move a kozane out from its
      belonging group and into another group.
    </p>
    <Gyazo
      url="https://gyazo.com/030902caab04818679b6db3e510e570b"
      key="move_kozane"
    />
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
    <Gyazo
      url="https://gyazo.com/7988397249341e8a42570e47a2f22b6b"
      key="object menu"
    />
  </div>,
  <div>
    <H>Automatic font size adjustment</H>
    <p>
      You can convert words, short phrases, or longer sentences into kozane. The
      font size is automatically adjusted depends on its length.
    </p>
    <p>I recommend using a short, concise expression of your thought.</p>
    <p>
      <button
        onClick={openPrefilledDialog}
        data-testid="tutorial-open-prefilled-dialog"
      >
        Click me
      </button>{" "}
      to open the pre-filled `Add Kozane` dialog. It makes a lot of kozane to
      further explanation.
    </p>
    <Gyazo
      url="https://gyazo.com/6c9609965b35a4183d1759cc9b1452d7"
      key="adjust_size"
    />
  </div>,
  <div>
    <H>You can ungroup</H>
    <p>You can convert a group into individual kozane.</p>
    <Gyazo
      url="https://gyazo.com/17b9d7a64afb62d61cfcd0f355cda15a"
      key="ungroup"
    />
  </div>,
  <div>
    <H>Let's select objects</H>
    <p>You can select multiple objects and make them into a new group.</p>
    <Gyazo
      url="https://gyazo.com/43fe6d98037a2d91a94618ca3a736978"
      key="select objects"
    />
  </div>,
  <div>
    <H>It's not saved yet!</H>
    <p>
      Notice, the Ba is not saved yet! In typical use cases, Kozaneba
      automatically saves the Ba to the cloud. Let's see how to enable auto-save
      on the next page.
    </p>
    <Gyazo
      url="https://gyazo.com/6f34fd9f2cda800a56ab77429323d39c"
      key="not saved"
    />
  </div>,
  <div>
    <H>Let's enable auto-save</H>
    <p>
      To enable auto-save, you need to create a user account. You can sign in
      using Google integration or create an anonymous account.
    </p>
    <Gyazo
      url="https://gyazo.com/57c3ed5edc084a00522b447352d98980"
      key="enable autosave"
    />
  </div>,
  <div>
    <H>Saved?</H>
    <p>
      After enabling auto-save, you can see the cloud status icon and the user
      status icon on the status bar changed. The `check mark` on the status bar
      indicates that saved all local changes.
    </p>
    <Gyazo
      url="https://gyazo.com/06f2ecff545249e4aed63f74a85fb584"
      key="saved"
    />
  </div>,
  <div>
    <H>Tutorial Finished🎉</H>
    <p>Now you finished all tutorials. Congratulation!! </p>
    <p>
      The following pages will explain the advanced features and the philosophy
      behind Kozaneba.
    </p>
  </div>,
  <div>
    <H>Don't classify, organize!</H>
    <p>
      Some people try to classify kozane. There is a misconception that kozane
      is a tool to categorize and store information.
    </p>
    <p>
      Kozane is a tool to recombine and rearrange information. By doing this, we
      often find connections between kozane that seem to have nothing related to
      each other. After discovering unexpected relationships, kozane is
      organized into a structure that you did not anticipate beforehand.{" "}
    </p>
    <p>
      If you put the kozane into a rigid subjective classification, they will
      suffocate and die. Don't classify kozane by its content, but organize them
      by your personal interest.
    </p>
    <p>
      (This page is a digest from a book by Tadao Umesao, who invented Kozane
      Method. Reference: "Classification is not the goal" from Tadao Umesao
      (1969) "The Art of Intellectual Production" p.57)
    </p>
  </div>,
  <div>
    <H>We need the practice to use stationery effectively</H>
    <p>
      You can use a pencil and a keyboard. You were not born with the ability to
      use that stationery. The stationery enhances human intelligence more than
      thinking without it. But to use it effectively, we need practice.
    </p>
    <p>
      Skills are not acquired by reading a textbook. They are developed by
      actually using the skill. Here I recommend some practices.
    </p>
    <p></p>
    <p>
      <b>Practice A:</b> In the previous tutorial, I made the contents of the
      tutorial into kozane. Add your thought as some kozane. And then
      re-organize them.
    </p>
    <p>
      <b>Practice B: </b>
      Read another article and create kozane from it. It should not be an
      instruction manual for a machine but an article that contains the author's
      opinion. Add your opinion as kozane. Then organize the whole kozane.
    </p>
    <p>
      <b>Practice C:</b>Make 100 kozane about what you find fun and what you
      find interesting. Then organize them.
    </p>
    <p>
      Some people will feel the practice C is easier than practice B. They are
      already familiar with expressing their thought. It is another important
      skill. Some people almost hung up with practice C. They even feel
      difficult to add their thought in A and B. In that case, try Practice D.
    </p>
    <p>
      <b>Practice D: </b>Read 3 articles and create kozane from them. Then
      organize the whole kozane. Choosing articles by the same author is easier
      than articles by different authors.
    </p>
  </div>,
];
// open/close group
// add title on group
