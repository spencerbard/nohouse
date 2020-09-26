describe("Signup Page", () => {
  it("Signup", () => {
    cy.visit("/signup");
    cy.get("[data-cy=name]").type("Spencer Bard");
    cy.get("[data-cy=email]").type("sbard26@gmail.com");
    cy.get("[data-cy=password]").type("spencer1");
    cy.get("[data-cy=confirm]").type("spencer1");
    cy.get("[data-cy=submit]").should("not.be.disabled");
    cy.get("[data-cy=submit]").click();
  });
});
