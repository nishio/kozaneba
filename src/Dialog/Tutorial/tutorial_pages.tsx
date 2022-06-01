import { setGlobal, useGlobal } from "reactn";
import { in_readonly_mode } from "../../AppBar/MainMenu/MainMenu";
import { updateGlobal } from "../../Global/updateGlobal";
import { HelpPage } from "./help_pages";
import { SAMPLE_LINES } from "./SAMPLE_LINES";

const WidthCheck = () => {
  const [lang] = useGlobal("language");

  const width = window.innerWidth;
  if (width >= 600) {
    return null;
  }

  if (lang === "ja") {
    return (
      <p>
        <span style={{ color: "red" }}>
          注意: あなたのデバイスの横幅は {width}{" "}
          ピクセルで、想定より小さいです。
          Kozanebaは広い画面でこざねを動かして思考を整理するものなので、もっと広い画面のデバイスを使うことがおすすめです。
        </span>
      </p>
    );
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
    translate: {
      ja: {
        title: "Kozanebaへようこそ!",
        body: (
          <div>
            <p>
              Kozaneba(こざねば)は、あなたの思考を整理するためのデジタル文房具です。。
            </p>
            <p>
              現在はチュートリアルモードになっています。もしチュートリアルが必要ない場合は
              {finishTutorialButton}をクリックしてください。
            </p>
            <p>`Next`ボタンをクリックしてください...。</p>
          </div>
        ),
      },
    },
  },
  {
    title: "Kozaneba is digital stationery to organize your thought",
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
    translate: {
      ja: {
        title: "Kozanebaは、あなたの思考を整理するためのデジタル文房具です",
        body: (
          <div>
            <p>
              Kozanebaでは思考を整理するために、「こざね」（小札、小さな札）と「場」（大きな空間）を使います。
            </p>
            <p>
              付箋やホワイトボードを使って行う手法を見たことがあるかもしれませんね。
              これらの元になったこざね法やKJ法は、付箋が発明されるより前に生まれました。
            </p>
            <p>
              Kozanebaは、デジタルこざねとサイズ無制限の場を使って思考を整理する手法です。
            </p>
            <WidthCheck />
          </div>
        ),
      },
    },
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
    translate: {
      ja: {
        title: "チュートリアルを開く",
        body: (
          <div>
            <p>
              右下の<b>ステータスバー</b>のアイコンをクリックすると、この
              <b>チュートリアルダイアログ</b>を開くことができます。
            </p>
            <Gyazo
              url="https://gyazo.com/afe024068b9f42f1aa04b1fe404daa5d"
              key="statusbar"
            />
            <p>このダイアログを閉じたり開いたりしてみましょう。</p>
          </div>
        ),
      },
    },
  },
  {
    title: "Let's add some Kozane!",
    body: (
      <div>
        <p>
          The three line button on the top left corner is for main menu. Let's
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
    translate: {
      ja: {
        title: "こざねの追加をしよう!",
        body: (
          <div>
            <p>
              左上の三本線のボタンは、メインメニューです。「Add
              Kozane」ダイアログを表示しましょう。
            </p>
            <p>
              ADD
              KOZANEボタンをクリックすると、Kozanebaは各行を1つのこざねにします。新しく追加されたこざねはグループにまとまっています。
            </p>
            <Gyazo
              url="https://gyazo.com/cbf3d0f3c616fc2a5575d7d648db6883"
              key="add_kozane"
            />
            <p>
              それでは、チュートリアルウインドウを閉じて、実際にこざねを追加してみましょう。
            </p>
          </div>
        ),
      },
    },
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
    translate: {
      ja: {
        title: "こざねを動かしてみよう",
        body: (
          <div>
            <p>
              こざねやグループはドラッグすると移動できます。こざねを所属するグループから別のグループに移動させることもできます。
            </p>
            <Gyazo
              url="https://gyazo.com/030902caab04818679b6db3e510e570b"
              key="move_kozane"
            />
          </div>
        ),
      },
    },
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
        <p>
          If you don't have a wheel, you can use Arrow keys or the WASD keys to
          move. You can also use the Space key to view the entire content and
          the B key to zoom in.
        </p>
      </div>
    ),
    translate: {
      ja: {
        title: "Baのスクロールとズームをしよう",
        body: (
          <div>
            <p>
              二本指のジェスチャーで、Baをスクロールしたり、ズームしたりできます。
            </p>
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
              タッチパッドがない場合は、ホイールで縦移動、shift+ホイールで横移動、ctrl+ホイールでズームすることができます。
            </p>
            <p>
              矢印キーやWASDキーでも移動することができます。また、Spaceキーでコンテンツ全体を表示し、Bキーでズームインすることができます。
            </p>
          </div>
        ),
      },
    },
  },
  {
    title: "Let's click to show context menu",
    body: (
      <div>
        <p>
          By clicking an object, the menu to handle the object appears.You can
          delete the clicked object and make the important object bigger.
        </p>
        <Gyazo
          url="https://gyazo.com/ded56b27aab3057542d576d46239b559"
          key="object menu"
        />
      </div>
    ),
    translate: {
      ja: {
        title: "クリックしてコンテキストメニューを表示しよう",
        body: (
          <div>
            <p>
              こざねやグループなどの「オブジェクト」をクリックすると、そのオブジェクトを扱うためのメニューが表示されます。
              クリックしたオブジェクトを削除したり、重要なオブジェクトを大きくしたりすることができます。
            </p>
            <Gyazo
              url="https://gyazo.com/ded56b27aab3057542d576d46239b559"
              key="object menu"
            />
          </div>
        ),
      },
    },
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
          for further explanation.
        </p>
        <Gyazo
          url="https://gyazo.com/6c9609965b35a4183d1759cc9b1452d7"
          key="adjust_size"
        />
      </div>
    ),
    translate: {
      ja: {
        title: "フォントサイズの自動調整",
        body: (
          <div>
            <p>
              単語や短いフレーズ、長い文章を、こざねに変換することができます。文字の大きさは、長さに応じて自動的に調整されます。
            </p>
            <p>思っていることを短く簡潔に表現するのがおすすめです。</p>
            <p>
              <button
                onClick={openPrefilledDialog}
                data-testid="tutorial-open-prefilled-dialog"
              >
                これをクリック
              </button>
              すると、あらかじめ入力されたAdd
              Kozaneダイアログが表示されます。今後の説明のために、たくさんのこざねを作ります。
            </p>
            <Gyazo
              url="https://gyazo.com/6c9609965b35a4183d1759cc9b1452d7"
              key="adjust_size"
            />
          </div>
        ),
      },
    },
  },
  {
    title: "Let's ungroup the group!",
    body: (
      <div>
        <p>You can convert a group into individual kozane.</p>
        <Gyazo
          url="https://gyazo.com/17b9d7a64afb62d61cfcd0f355cda15a"
          key="ungroup"
        />
      </div>
    ),
    translate: {
      ja: {
        title: "グループを解除しよう!",
        body: (
          <div>
            <p>グループを個別のこざねにすることができます。</p>
            <Gyazo
              url="https://gyazo.com/17b9d7a64afb62d61cfcd0f355cda15a"
              key="ungroup"
            />
          </div>
        ),
      },
    },
  },
  {
    title: "Let's select objects and make them into a group!",
    body: (
      <div>
        <p>You can select multiple objects and make them into a new group.</p>
        <Gyazo
          url="https://gyazo.com/43fe6d98037a2d91a94618ca3a736978"
          key="select objects"
        />
      </div>
    ),
    translate: {
      ja: {
        title: "オブジェクトを選択してグループにしてみよう!",
        body: (
          <div>
            <p>
              複数のオブジェクトを選択して、新しいグループにすることができます。
            </p>
            <Gyazo
              url="https://gyazo.com/43fe6d98037a2d91a94618ca3a736978"
              key="select objects"
            />
          </div>
        ),
      },
    },
  },
  {
    title: "Let's close and open a group!",
    body: (
      <div>
        <p>You can close the group.</p>
        <p>
          In the process of organizing your thoughts, you will often find some
          kozane that are not so important. They don't need to be on the screen
          now, but you don't want to delete them because you might use them
          later. In such a case, you can make such kozane temporarily invisible
          by closing the group.
        </p>
        <Gyazo url="https://gyazo.com/e7bd72693b5259a03de28de403eb992d" />
      </div>
    ),
    translate: {
      ja: {
        title: "グループを閉じたり開いたりしよう",
        body: (
          <div>
            <p>グループを閉じることができます。</p>
            <p>
              考えを整理する過程で「このこざねはあまり重要ではないな」と感じることはよくあります。
              今は画面に表示する必要はないですが、後で使うかもしれないから消したくない、と思ったとしましょう。
              そんなときは、グループを閉じることで、一時的にこざねを見えなくすることができます。
            </p>
            <Gyazo url="https://gyazo.com/e7bd72693b5259a03de28de403eb992d" />
          </div>
        ),
      },
    },
  },

  {
    title: "Let's edit group nameplate!",
    body: (
      <div>
        <p>You can put a nameplate on a closed group.</p>
        <p>
          If there is no nameplate, the closed group uses all its contents as a
          nameplate. The nameplate appears as the group title when the group is
          open. It becomes a new Kozane when the group is ungrouped.
        </p>
        <Gyazo url="https://gyazo.com/aba547cf9ebab645e0cda2eed939fb89" />
      </div>
    ),

    translate: {
      ja: {
        title: "グループの表札を編集しよう",
        body: (
          <div>
            <p>閉じたグループに表札をつけることができます。</p>
            <p>
              表札がない場合は、閉じたグループの内容をすべて表札として使用します。
              表札はグループが開いているときはグループタイトルとして表示されます。
              表札はグループが解除されると新しいこざねになります。
            </p>
            <Gyazo url="https://gyazo.com/aba547cf9ebab645e0cda2eed939fb89" />
          </div>
        ),
      },
    },
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
        {in_readonly_mode() ? (
          <p>
            Now you are in read-only mode. By enabling auto-save, Kozaneba makes
            an editable copy for you.
          </p>
        ) : null}
      </div>
    ),
    translate: {
      ja: {
        title: "まだ保存されていません！",
        body: (
          <div>
            <p>
              注意: Baはまだ保存されていません！
              一般的な使用法では、KozanebaはBaをクラウドに自動的に保存します。
              次のページでは、自動保存を有効にする方法を見てみましょう。
            </p>
            <Gyazo
              url="https://gyazo.com/6f34fd9f2cda800a56ab77429323d39c"
              key="not saved"
            />
            {in_readonly_mode() ? (
              <p>
                あなたは今、読み取り専用モードで他人のBaを開いています。
                自動保存を有効にすると、あなたが変更可能なコピーを作成します。元のBaを上書きすることはありません。
              </p>
            ) : null}
          </div>
        ),
      },
    },
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
    translate: {
      ja: {
        title: "自動保存を有効にしよう",
        body: (
          <div>
            <p>
              自動保存を有効にするには、ユーザーアカウントを作成する必要があります。
              Google連携を使ってサインインするか、匿名のアカウントを作成することができます。
            </p>
            <Gyazo
              url="https://gyazo.com/57c3ed5edc084a00522b447352d98980"
              key="enable autosave"
            />
          </div>
        ),
      },
    },
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
        <p></p>
        <Gyazo url="https://gyazo.com/06f2ecff545249e4aed63f74a85fb584" />
      </div>
    ),
    translate: {
      ja: {
        title: "保存できましたか？",
        body: (
          <div>
            <p>
              自動保存を有効にすると、ステータスバーのクラウド状態のアイコンとユーザー状態のアイコンが変化します。
              ステータスバーの「チェックマーク」は、ローカルの変更がすべて保存されたことを示しています。
            </p>
            <p></p>
            <Gyazo url="https://gyazo.com/06f2ecff545249e4aed63f74a85fb584" />
          </div>
        ),
      },
    },
  },
  {
    title: "Let's open the saved Ba",
    body: (
      <div>
        <p>
          You may find the URL changed like "/#edit=XXX". You can open the saved
          Ba by the URL. The URL grants write-permission. Currently, there is no
          way to share read-only, coming soon.
        </p>
        <p>
          In the User dialog, you can see all Ba which you have
          write-permission.
        </p>
        <Gyazo url="https://gyazo.com/d05e3effdf4935a29d5107386b3758ff" />
      </div>
    ),
    translate: {
      ja: {
        title: "保存されたBaを開いてみましょう。",
        body: (
          <div>
            <p>
              URLが「/#edit=XXX」のように変更されているのがわかると思います。そのURLで保存したBaを開くことができます。
              URLには書き込み権限が付与されています。
            </p>
            <p>
              Userダイアログでは，自分が書き込み権限を持っているすべてのBaを見ることができます。
            </p>
            <Gyazo url="https://gyazo.com/d05e3effdf4935a29d5107386b3758ff" />
          </div>
        ),
      },
    },
  },
  {
    title: "Tutorial Finished🎉",
    body: (
      <div>
        <p>Now you learned how to use Kozaneba! Congratulation!!</p>
        <p>
          You can send any questions and comments from the "Send Feedback" menu.
          It automatically attaches the Ba data. You can also join and talk in
          the{" "}
          <a href="https://scrapbox.io/kozaneba-forum/" target="blank">
            forum
          </a>
          .
        </p>
        <p>
          Next, on the last page of the tutorial, I recommend some practices.
        </p>
      </div>
    ),
    translate: {
      ja: {
        title: "以上でチュートリアルは終了です🎉",
        body: (
          <div>
            <p>
              これで、Kozanebaの使い方がわかりましたね。おめでとうございます。
            </p>
            <p>
              ご質問やご意見があれば、"Send Feedback
              "メニューからお寄せください。自動的にBaデータが添付されます。
              また、
              <a href="https://scrapbox.io/kozaneba-forum-jp/" target="blank">
                フォーラム
              </a>
              に参加して話すこともできます。
            </p>
            <p>次のページでは、いくつかの練習方法を紹介しています。</p>
          </div>
        ),
      },
    },
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
    translate: {
      ja: {
        title: "文房具を効果的に使うための練習が必要です",
        body: (
          <div>
            <p>
              あなたは鉛筆やキーボードを使うことができます。文房具は、それを使わずに考えるよりも、人間の知性を高めてくれます。
              しかし、その文房具を使う能力は、生まれつきではありません。それを効果的に使うためには、練習が必要です。
            </p>
            <p>
              スキルは、教科書を読んで身につくものではありません。
              そのスキルを実際に使うことで身につくのです。ここでは、いくつかの練習方法を紹介します。
            </p>
            <p></p>
            <p>
              <b>練習方法A: </b>
              前回のチュートリアルでは、チュートリアルの内容を「こざね」にしました。
              あなたの考えを、いくつかのこざねとして加えてください。そして、それらを再整理してください。
            </p>
            <p>
              <b>練習方法B: </b>
              別の記事を読み、そこからこざねを作ります。機械の取扱説明書ではなく、著者の意見が書かれた記事であること。
              自分の意見をコザネとして加える。そして、こざね全体を整理する。
            </p>
            <p>
              <b>練習方法C: </b>
              自分が楽しいと思ったこと、面白いと思ったことを25個のこざねにして、それを整理します。
              整理しているうちに新しいことを思いついたらどんどん追加しましょう。
            </p>
            <p>
              人によっては、練習Bよりも練習Cの方が簡単だと感じるでしょう。自分の考えを表現することにすでに慣れているからです。
              これはもう一つの重要なスキルです。
              中には、練習Cで挫折しそうになる人もいます。AやBで自分の考えを加えるのが難しいと感じる人もいます。
              自分の考えを表現することに不慣れなのでしょう。
              そのような場合には、練習Dを試してみてください。{" "}
            </p>
            <p>
              <b>練習方法 D: </b>
              3つの記事を読み、その記事からこざねを作ります。そして、こざね全体を整理します。
              同じ著者の記事を選ぶと、異なる著者の記事をまとめるよりも簡単です。
            </p>
          </div>
        ),
      },
    },
  },
];
