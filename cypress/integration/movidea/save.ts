import "firebase/auth";
describe("save", () => {
  // it("Adds document to test_hello_world collection of Firestore", () => {
  //   cy.callFirestore("add", "test_hello_world", { some: "value" });
  // });
  it("main", () => {
    cy.visit("/#blank");
    cy.viewport(500, 500);

    cy.movidea((m) => {
      m.toUseEmulator();
    });

    cy.testid("dev-menu").click();
    cy.contains("Trigger Cloud Save").click();
    cy.testid("continue-as-anonymous-user").click();
    cy.testid("login-status").contains("signed in as anonymous user");
  });
});
