export type HelpPage = { title: string; body: JSX.Element };
export const tutorial_pages: HelpPage[] = [
  {
    title: "Don't classify, organize!",
    body: (
      <div>
        <p>
          Some people try to classify kozane. There is a misconception that
          kozane is a tool to categorize and store information.
        </p>
        <p>
          Kozane is a tool to recombine and rearrange information. By doing
          this, we often find connections between kozane that seem to have
          nothing related to each other. After discovering unexpected
          relationships, kozane is organized into a structure that you did not
          anticipate beforehand.
        </p>
        <p>
          Kozane is like fish. If you put them into where they can not swim,
          they will die. Don't classify kozane by its content, but organize them
          by your personal interest.
        </p>
        <p>
          (This page is a digest from a book by Tadao Umesao, who invented
          Kozane Method. Reference: "Classification is not the goal" from Tadao
          Umesao (1969) "The Art of Intellectual Production" p.57)
        </p>
      </div>
    ),
  },
];
