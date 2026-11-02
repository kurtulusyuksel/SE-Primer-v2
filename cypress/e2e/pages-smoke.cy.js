const pagesUrl = Cypress.expose('PAGES_URL');
const expectedSha = Cypress.expose('MODEL_SHA');

describe('yayin duman testi (gecici)', () => {
  it('alt yolda model laboratuvari gercek WASM ile acilir', function () {
    if (!pagesUrl) this.skip();
    cy.visit(`${pagesUrl}?model-lab`);
    cy.get('[data-cy=infer]', { timeout: 30000 }).click();
    cy.get('[data-cy=p]', { timeout: 45000 }).should('exist');
    if (expectedSha) cy.get('[data-cy=model-sha]').should('have.text', expectedSha);
  });
});
