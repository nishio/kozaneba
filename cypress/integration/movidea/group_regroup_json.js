describe("group, simple, read from JSON", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.fixture("group_regroup_json.json").then((json) => {
      cy.window()
        .its("movidea")
        .then((movidea) => {
          setTimeout(() => {
            movidea.setGlobal(movidea.importRegroupJSON(json));
            movidea.setGlobal({
              scale: 0.05,
              trans_x: -8478.724335797999,
              trans_y: -814.0828777889735,
            });
          });
        });
    });
  });

  it("position", () => {
    cy.viewport(500, 500);
    // cy.get("div[data-testid='1']").should((x) => {
    //   expect(x[0].getBoundingClientRect().x).equal(30);
    //   expect(x[0].getBoundingClientRect().y).equal(150);
    // });
    // cy.get("div[data-testid='2']").should((x) => {
    //   window.a = x;
    //   expect(x[0].getBoundingClientRect().x).equal(80);
    //   expect(x[0].getBoundingClientRect().y).equal(200);
    // });
  });
});
