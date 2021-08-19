import { setGlobal } from "reactn";
import { updateGlobal } from "../../Global/updateGlobal";
import { HelpPage } from "./help_pages";
import { SAMPLE_LINES } from "./SAMPLE_LINES";

const WidthCheck = () => {
  const width = window.innerWidth;
  if (width >= 600) {
    return null;
  }
  return (
    <p>
      <span style={{ color: "red" }}>
        *NOTICE* The width of your device is {width} pixels. It is too small
        than expected. It is better to use another device as wide as possible.
      </span>
    </p>
  );
};

const Gyazo: React.FC<{ url: string }> = ({ url }) => {
  const raw_url = url + "/raw";
  return <img src={raw_url} alt="" style={{ maxWidth: "100%" }} />;
};

const openPrefilledDialog = () => {
  updateGlobal((g) => {
    g.add_kozane_text = SAMPLE_LINES;
    g.dialog = "AddKozane";
  });
};

const finishTutorialButton = (
  <button
    onClick={() => {
      setGlobal({ in_tutorial: false, dialog: "" });
    }}
  >
    finish the tutorial
  </button>
);

export const tutorial_pages: HelpPage[] = [
  {
    title: "Welcome to Kozaneba!",
    body: (
      <div>
        <p>Kozaneba is digital stationery to organize your thought.</p>
        <p>
          You are currently in the tutorial mode. If you do not need tutorial,
          you can {finishTutorialButton} now.
        </p>
        <p>Please click `Next` button...</p>
      </div>
    ),
  },
  {
    title: "digital stationery to organize your thought",
    body: (
      <div>
        <p>
          To organize your thought, we use Kozane(小札, small plate) and Ba(場,
          large space).
        </p>
        <p>
          You may have seen similar methods using sticky notes and a whiteboard.
          The origin of those methods is before the invention of sticky notes.
        </p>
        <p>
          Kozaneba is a new member of the method family, which uses digital
          Kozane and infinite Ba.
        </p>
        <WidthCheck />
        <p>Please click `Next` button...</p>
      </div>
    ),
  },
  {
    title: "You can open the tutorial",
    body: (
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
      </div>
    ),
  },
  {
    title: "Let's add some Kozane!",
    body: (
      <div>
        <p>
          The three line button on the top left corner is for main manu. Let's
          show `Add Kozane` dialog.
        </p>
        <p>
          By clicking ADD KOZANE button, Kozaneba makes each line into one
          kozane and puts all newly added kozane in a group.
        </p>
        <Gyazo
          url="https://gyazo.com/cbf3d0f3c616fc2a5575d7d648db6883"
          key="add_kozane"
        />
        <p>Now let's close the tutorial and try to add some kozane!</p>
      </div>
    ),
  },
  {
    title: "Let's move Kozane!",
    body: (
      <div>
        <p>
          You can move a group by dragging it. You can move a kozane out from
          its belonging group and into another group.
        </p>
        <Gyazo
          url="https://gyazo.com/030902caab04818679b6db3e510e570b"
          key="move_kozane"
        />
      </div>
    ),
  },
  {
    title: "Let's scroll and zoom the Ba",
    body: (
      <div>
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
          If you don't have a touchpad, you can use a wheel to move vertically,
          shift+wheel to horizontal, and ctrl+wheel to zoom.
        </p>
      </div>
    ),
  },
  {
    title: "Let's click to show context menu",
    body: (
      <div>
        <p>By clicking an object, the menu to handle the object appears.</p>
        <Gyazo
          url="https://gyazo.com/7988397249341e8a42570e47a2f22b6b"
          key="object menu"
        />
      </div>
    ),
  },
  {
    title: "Automatic font size adjustment",
    body: (
      <div>
        <p>
          You can convert words, short phrases, or longer sentences into kozane.
          The font size is automatically adjusted depends on its length.
        </p>
        <p>I recommend using a short, concise expression of your thought.</p>
        <p>
          <button
            onClick={openPrefilledDialog}
            data-testid="tutorial-open-prefilled-dialog"
          >
            Click me
          </button>{" "}
          to open the pre-filled `Add Kozane` dialog. It makes a lot of kozane
          to further explanation.
        </p>
        <Gyazo
          url="https://gyazo.com/6c9609965b35a4183d1759cc9b1452d7"
          key="adjust_size"
        />
      </div>
    ),
  },
  {
    title: "You can ungroup a group",
    body: (
      <div>
        <p>You can convert a group into individual kozane.</p>
        <Gyazo
          url="https://gyazo.com/17b9d7a64afb62d61cfcd0f355cda15a"
          key="ungroup"
        />
      </div>
    ),
  },
  {
    title: "Let's select objects!",
    body: (
      <div>
        <p>You can select multiple objects and make them into a new group.</p>
        <Gyazo
          url="https://gyazo.com/43fe6d98037a2d91a94618ca3a736978"
          key="select objects"
        />
      </div>
    ),
  },
  {
    title: "It's not saved yet!",
    body: (
      <div>
        <p>
          Notice, the Ba is not saved yet! In typical use cases, Kozaneba
          automatically saves the Ba to the cloud. Let's see how to enable
          auto-save on the next page.
        </p>
        <Gyazo
          url="https://gyazo.com/6f34fd9f2cda800a56ab77429323d39c"
          key="not saved"
        />
      </div>
    ),
  },
  {
    title: "Let's enable auto-save!",
    body: (
      <div>
        <p>
          To enable auto-save, you need to create a user account. You can sign
          in using Google integration or create an anonymous account.
        </p>
        <Gyazo
          url="https://gyazo.com/57c3ed5edc084a00522b447352d98980"
          key="enable autosave"
        />
      </div>
    ),
  },
  {
    title: "Saved?",
    body: (
      <div>
        <p>
          After enabling auto-save, you can see the cloud status icon and the
          user status icon on the status bar changed. The `check mark` on the
          status bar indicates that saved all local changes.
        </p>
        <Gyazo
          url="https://gyazo.com/06f2ecff545249e4aed63f74a85fb584"
          key="saved"
        />
      </div>
    ),
  },
  {
    title: "Tutorial Finished🎉",
    body: (
      <div>
        <p>Now you learned how to use Kozaneba! Congratulation!!</p>
        <p>
          Next, on the last page of the tutorial, I recommend some practices.
        </p>
      </div>
    ),
  },
  {
    title: "We need the practice to use stationery effectively",
    body: (
      <div>
        <p>
          You can use a pencil and a keyboard. You were not born with the
          ability to use that stationery. The stationery enhances human
          intelligence more than thinking without it. But to use it effectively,
          we need practice.
        </p>
        <p>
          Skills are not acquired by reading a textbook. They are developed by
          actually using the skill. Here I recommend some practices.
        </p>
        <p></p>
        <p>
          <b>Practice A:</b> In the previous tutorial, I made the contents of
          the tutorial into kozane. Add your thought as some kozane. And then
          re-organize them.
        </p>
        <p>
          <b>Practice B: </b>
          Read another article and create kozane from it. It should not be an
          instruction manual for a machine but an article that contains the
          author's opinion. Add your opinion as kozane. Then organize the whole
          kozane.
        </p>
        <p>
          <b>Practice C:</b>Make 100 kozane about what you find fun and what you
          find interesting. Then organize them.
        </p>
        <p>
          Some people will feel the practice C is easier than practice B. They
          are already familiar with expressing their thought. It is another
          important skill. Some people almost hung up with practice C. They even
          feel difficult to add their thought in A and B. In that case, try
          Practice D.
        </p>
        <p>
          <b>Practice D: </b>Read 3 articles and create kozane from them. Then
          organize the whole kozane. Choosing articles by the same author is
          easier than articles by different authors.
        </p>
      </div>
    ),
  },
];
