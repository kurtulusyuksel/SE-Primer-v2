describe('v2 — gerçek WASM / Python oracle diferansiyel testleri', () => {
  it('5 referansı aynı model SHA ile <1e-4 farkla çalıştırır', () => {
    cy.readFile('tests/parite.json').then(oracle => {
      cy.visit('/?model-lab');
      for (const sample of oracle.cases) {
        cy.get('[data-cy=features]').clear().type(sample.features.join(','));
        cy.get('[data-cy=infer]').click();
        cy.get('[data-cy=p]', { timeout: 45000 }).should(element => {
          expect(Math.abs(Number(element.text()) - sample.p)).to.be.lessThan(oracle.tolerance);
        });
        cy.get('[data-cy=decision]').should('have.text', String(sample.ipucu_gerekli));
        cy.get('[data-cy=model-sha]').should('have.text', oracle.model_sha256);
      }
    });
  });

  it('özellik aralıkları dışında kalan girdiyi reddeder', () => {
    cy.visit('/?model-lab');
    cy.get('[data-cy=features]').clear().type('0,-1,0,0,1');
    cy.get('[data-cy=infer]').click();
    cy.get('[data-cy=model-error]', { timeout: 45000 }).should('contain.text', 'Gecersiz model girdisi');
  });

  it('değiştirilmiş model hash değerini reddeder', () => {
    cy.readFile('model/config.json').then(config => {
      cy.intercept('GET', '/model/config.json', { ...config, model_sha256: '0'.repeat(64) });
    });
    cy.visit('/?model-lab');
    cy.get('[data-cy=infer]').click();
    cy.get('[data-cy=model-error]').should('contain.text', 'SHA256');
  });
});

function start(level = 'YENİ BAŞLAYAN') {
  cy.contains(level, { matchCase: false }).click();
  cy.contains('Kriz Odasına Bağlan', { matchCase: false }).click();
}
function clockVisit() {
  cy.visit('/', { onBeforeLoad(win) {
    cy.stub(win.performance, 'now').callsFake(() => win.Date.now());
  }});
  cy.clock(Date.now(), ['Date', 'setInterval', 'clearInterval']);
}

describe('v2 — modelin oyun davranışına etkisi', () => {
  it('aynı sahnede hızlı deneyimli profil müdahalesiz, uzun bekleme ise kriz freni', () => {
    clockVisit();
    start('DENEYİMLİ MÜHENDİS');
    cy.get('[data-cy=live-p]', { timeout: 45000 }).should('exist');
    cy.get('[data-cy=tutor-banner]').should('not.exist');
    // Dört gerçek mentor açma eylemi + 45 saniye: sayaç sıfıra ulaşmadan müdahale.
    for (let index = 0; index < 4; index++) {
      cy.contains('SOKRATİK AI MENTOR').click();
      cy.contains('SOKRATİK AI MENTOR').click();
    }
    cy.contains('SOKRATİK AI MENTOR').click();
    cy.tick(45000);
    cy.get('[data-cy=tutor-banner]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-cy=timer-paused]').should('be.visible');
    cy.get('[data-cy=countdown]').should('have.text', '0:15');
    cy.tick(5000);
    cy.get('[data-cy=countdown]').should('have.text', '0:15');
    cy.screenshot('kriz-freni', { capture: 'fullPage' });
    cy.contains('A ŞIKKINI DEVREYE AL', { matchCase: false }).click();
    cy.contains('Sonraki Kriz Adımına Geç', { matchCase: false }).click();
    cy.get('[data-cy=tutor-banner]').should('not.exist');
    cy.get('[data-cy=countdown]').should('have.text', '1:00');
    cy.tick(1000);
    cy.get('[data-cy=countdown]').should('have.text', '0:59');
  });

  it('shadow tahmin hesaplar ama otomatik müdahale etmez', () => {
    cy.intercept('/model-release.json', { source: 'local', mode: 'shadow', percentage: 5, repo_id: null, revision: null });
    clockVisit(); start();
    cy.get('[data-cy=live-p]', { timeout: 45000 }).should('exist');
    cy.tick(120000);
    cy.get('[data-cy=live-p]').should(element => expect(Number(element.text().split('%')[1])).to.be.greaterThan(60));
    cy.get('[data-cy=tutor-banner]').should('not.exist');
  });

  it('model 404 olduğunda normal karar akışı sürer', () => {
    cy.intercept('/model/model.onnx', { statusCode: 404, body: '' });
    cy.visit('/'); start();
    cy.get('[data-cy=model-status]', { timeout: 15000 }).should('be.visible');
    cy.contains('A ŞIKKINI DEVREYE AL', { matchCase: false }).click();
    cy.contains('Sonraki Kriz Adımına Geç', { matchCase: false }).should('be.visible');
  });

  it('gerçek oturumda bağımsız etiket olmadan kayıt yok; 3 karar 1 oturumdur', () => {
    cy.visit('/');
    cy.get('[data-cy=collection-mode]').check(); start();
    cy.get('[data-cy=label-panel]').should('be.visible');
    cy.contains('A ŞIKKINI DEVREYE AL', { matchCase: false }).should('be.disabled');
    for (let scene = 1; scene <= 3; scene++) {
      cy.get('[data-cy=label-no]').click();
      cy.get('[data-cy=label-state]').should('contain.text', 'Etiket seçildi');
      cy.contains('A ŞIKKINI DEVREYE AL', { matchCase: false }).should('not.be.disabled').click();
      cy.get('[data-cy=tutor-banner]').should('not.exist');
      if (scene < 3) cy.contains('Sonraki Kriz Adımına Geç', { matchCase: false }).click();
    }
    cy.window().then(win => {
      const rows = JSON.parse(win.localStorage.getItem('primer-v2-decisions'));
      expect(rows).to.have.length(3);
      expect(new Set(rows.map(row => row.oturum_id)).size).to.equal(1);
      expect(rows.map(row => row.features[4])).to.deep.equal([1, 2, 3]);
      expect(rows.every(row => row.kaynak === 'gercek' && row.ipucu_gerekli === 0)).to.equal(true);
      expect(rows[0]).to.have.all.keys('oturum_id', 'kaynak', 'features', 'ipucu_gerekli');
    });
  });
});


describe('v2 — yayın sözleşmesi ve mobil görünüm', () => {
  it('hareketli main revision ile HF modelini yüklemeyi reddeder', () => {
    cy.intercept('/model-release.json', { source: 'huggingface', mode: 'active', percentage: 100,
      repo_id: 'kurtulus7182/se-primer-kriz-freni', revision: 'main' });
    cy.visit('/?model-lab');
    cy.get('[data-cy=infer]').click();
    cy.get('[data-cy=model-error]').should('contain.text', 'commit SHA');
  });

  it('canary yüzde 0 iken yüksek olasılık otomatik müdahale yapmaz', () => {
    cy.intercept('/model-release.json', { source: 'local', mode: 'canary', percentage: 0, repo_id: null, revision: null });
    clockVisit(); start();
    cy.get('[data-cy=live-p]', { timeout: 45000 }).should('exist');
    cy.tick(120000);
    cy.get('[data-cy=live-p]').should(element => expect(Number(element.text().split('%')[1])).to.be.greaterThan(60));
    cy.get('[data-cy=tutor-banner]').should('not.exist');
  });

  it('tamamlanmış oturum sayacı üç sahnelik oyunu bir oturum sayar', () => {
    cy.visit('/', { onBeforeLoad(win) {
      const rows = [1, 2, 3].map(scene => ({
        oturum_id: 'test-oturum', kaynak: 'gercek', features: [0, 10, 0, 0, scene], ipucu_gerekli: 0,
      }));
      win.localStorage.setItem('primer-v2-decisions', JSON.stringify(rows));
    }});
    cy.get('[data-cy=completed-sessions]').should('contain.text', '1 / 15');
  });

  it('veri toplama modu sekme yenilenince açık kalır', () => {
    cy.visit('/');
    cy.get('[data-cy=collection-mode]').check();
    cy.get('[data-cy=collection-state]').should('contain.text', 'AÇIK');
    cy.reload();
    cy.get('[data-cy=collection-mode]').should('be.checked');
    cy.get('[data-cy=collection-state]').should('contain.text', 'AÇIK');
  });

  it('kayıt kapalıyken biten oyun CSV dışında kalır ve uyarı gösterir', () => {
    cy.visit('/');
    start();
    cy.get('[data-cy=collection-status]').should('contain.text', 'Kayıt kapalı');
    for (let scene = 1; scene <= 3; scene++) {
      cy.contains('A ŞIKKINI DEVREYE AL', { matchCase: false }).click();
      if (scene < 3) cy.contains('Sonraki Kriz Adımına Geç', { matchCase: false }).click();
      else cy.contains('Post-Mortem', { matchCase: false }).click();
    }
    cy.get('[data-cy=session-saved]').should('contain.text', 'kaydedilmedi');
    cy.window().then(win => {
      expect(win.localStorage.getItem('primer-v2-decisions')).to.be.null;
    });
  });

  it('dar ekranda veri toplama kontrolü kullanılabilir', () => {
    cy.viewport(390, 844);
    cy.visit('/');
    cy.get('[data-cy=collection-mode]').check().should('be.checked');
    cy.screenshot('veri-toplama-mobil', { capture: 'fullPage' });
    start();
    cy.get('[data-cy=label-yes]').should('be.visible');
    cy.document().then(document => {
      expect(document.documentElement.scrollWidth).to.be.at.most(392);
    });
  });
});
