describe("group, simple, read from JSON", () => {
  beforeEach(() => {
    cy.visit("/#blank");
    cy.fixture("group_regroup_json.json").then((json) => {
      cy.window()
        .its("movidea")
        .then((movidea) => {
          setTimeout(() => {
            movidea.setGlobal(movidea.importRegroupJSON(json));
            movidea.setGlobal({
              scale: 0.25,
              trans_x: -5891.603451566465,
              trans_y: -433.93161227995006,
            });
          });
        });
    });
  });

  it("position", () => {
    cy.viewport(800, 500);
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
