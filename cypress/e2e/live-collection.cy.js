const pagesUrl = Cypress.expose('PAGES_URL');

describe('canlı veri toplama akışı (isteğe bağlı)', () => {
  it('veri toplama modunda üç sahne kaydedilir ve sayaç artar', function () {
    if (!pagesUrl) this.skip();
    cy.visit(`${pagesUrl}`);
    cy.clearLocalStorage();
    cy.reload();
    cy.get('[data-cy=collection-mode]', { timeout: 20000 }).check();
    cy.get('[data-cy=collection-state]').should('contain.text', 'AÇIK');
    cy.contains('YENİ BAŞLAYAN', { matchCase: false }).click();
    cy.contains('Kriz Odasına Bağlan', { matchCase: false }).click();

    for (let step = 1; step <= 3; step++) {
      cy.get('[data-cy=label-no]', { timeout: 15000 }).click();
      cy.contains('A ŞIKKINI DEVREYE AL', { matchCase: false }).click();
      cy.wait(1200);
      if (step < 3) {
        cy.contains('Sonraki Kriz Adımına Geç', { matchCase: false }).click();
      } else {
        cy.contains('Post-Mortem', { matchCase: false }).click();
      }
    }

    cy.get('[data-cy=session-saved]').should('contain.text', 'kaydedildi (3/3)');
    cy.contains('Tekrar Başla', { matchCase: false }).click();
    cy.get('[data-cy=saved-count]').should('contain', '3');
    cy.get('[data-cy=completed-sessions]').should('contain', '1 / 15');
  });
});
