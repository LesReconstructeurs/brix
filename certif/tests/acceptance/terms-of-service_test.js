import { module, test } from 'qunit';
import { currentURL, visit, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { currentSession } from 'ember-simple-auth/test-support';
import {
  createCertificationPointOfContactWithTermsOfServiceNotAccepted,
  createCertificationPointOfContactWithTermsOfServiceAccepted,
  authenticateSession,
} from '../helpers/test-init';
import { visit as visitScreen } from '@1024pix/ember-testing-library';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | terms-of-service', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let certificationPointOfContact;

  test('it should redirect certificationPointOfContact to login page if not logged in', async function (assert) {
    // when
    await visit('/cgu');

    // then
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(currentURL(), '/connexion');
    assert.notOk(
      currentSession(this.application).get('isAuthenticated'),
      'The certificationPointOfContact is still unauthenticated'
    );
  });

  module(
    'When certificationPointOfContact is authenticated and has not yet accepted terms of service',
    function (hooks) {
      hooks.beforeEach(async () => {
        certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceNotAccepted();

        await authenticateSession(certificationPointOfContact.id);
      });

      test('it should send request for saving Pix-certif terms of service acceptation when submitting', async function (assert) {
        // given
        const previousPixCertifTermsOfServiceVal = certificationPointOfContact.pixCertifTermsOfServiceAccepted;
        const screen = await visitScreen('/cgu');

        // when
        await click(screen.getByRole('button', { name: 'J’accepte les conditions d’utilisation' }));

        // then
        certificationPointOfContact.reload();
        const actualPixCertifTermsOfServiceVal = certificationPointOfContact.pixCertifTermsOfServiceAccepted;
        assert.true(actualPixCertifTermsOfServiceVal);
        assert.false(previousPixCertifTermsOfServiceVal);
      });

      test('it should redirect to session list after saving terms of service acceptation', async function (assert) {
        // given
        const screen = await visitScreen('/cgu');

        // when
        await click(screen.getByRole('button', { name: 'J’accepte les conditions d’utilisation' }));

        // then
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(currentURL(), '/sessions/liste');
      });

      test('it should not be possible to visit another page if cgu are not accepted', async function (assert) {
        // given
        await visit('/cgu');

        // when
        await visit('/campagnes');

        // then
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(currentURL(), '/cgu');
      });
    }
  );

  module('When certificationPointOfContact has already accepted terms of service', function (hooks) {
    hooks.beforeEach(async () => {
      certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceAccepted();

      await authenticateSession(certificationPointOfContact.id);
    });

    test('it should redirect to session list', async function (assert) {
      // when
      await visit('/cgu');

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), '/sessions/liste');
    });
  });
});
