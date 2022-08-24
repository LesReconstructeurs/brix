import EmberObject from '@ember/object';
import Service from '@ember/service';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | login page', function () {
  setupTest();

  describe('#authenticate', function () {
    context('when user is not authenticated', function () {
      const authenticateStub = sinon.stub().resolves();

      let sessionStub;
      let storeStub;
      let route;

      const foundUser = EmberObject.create({ id: 12 });
      const expectedAuthenticator = 'authenticator:oauth2';
      const password = 'azerty';
      const scope = 'mon-pix';

      beforeEach(async function () {
        sessionStub = Service.create({
          authenticate: authenticateStub,
          prohibitAuthentication: sinon.stub(),
        });
        const queryRecordStub = sinon.stub().resolves(foundUser);
        storeStub = Service.create({
          queryRecord: queryRecordStub,
        });

        route = this.owner.lookup('route:authentication/login');
        route.set('store', storeStub);
        route.set('session', sessionStub);
        sinon.stub(route, 'transitionTo').throws('Must not be called');
        await route.beforeModel({ to: {} });
      });

      it('should authenticate the user given email and password', async function () {
        // given
        const login = 'email@example.net';

        // when
        await route.actions.authenticate.call(route, login, password);

        // then
        sinon.assert.calledWith(authenticateStub, expectedAuthenticator, { login, password, scope });
      });

      it('should authenticate the user even if email contains spaces', async function () {
        // given
        const emailWithSpaces = '  email@example.net  ';
        const trimedEmail = emailWithSpaces.trim();

        // when
        await route.actions.authenticate.call(route, emailWithSpaces, password);

        // then
        sinon.assert.calledWith(authenticateStub, expectedAuthenticator, { login: trimedEmail, password, scope });
      });
    });
  });

  describe('#updateExpiredPassword', function () {
    it('should redirect to password update page with token', async function () {
      // given
      const passwordResetToken = 'PASSWORD_RESET_TOKEN';
      const route = this.owner.lookup('route:authentication/login');
      const createRecordStub = sinon.stub();
      const storeStub = { createRecord: createRecordStub };

      route.set('store', storeStub);
      route.router = { replaceWith: sinon.stub() };

      // when
      await route.actions.updateExpiredPassword.call(route, passwordResetToken);

      // then
      sinon.assert.calledWith(createRecordStub, 'reset-expired-password-demand', {
        passwordResetToken: 'PASSWORD_RESET_TOKEN',
      });
    });
  });
});