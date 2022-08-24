const { expect, sinon, HttpTestServer, generateValidRequestAuthorizationHeader } = require('../../../../test-helper');
const oidcController = require('../../../../../lib/application/authentication/oidc/oidc-controller');
const { featureToggles } = require('../../../../../lib/config');
const moduleUnderTest = require('../../../../../lib/application/authentication/oidc');
const {
  UserNotFoundError,
  AuthenticationKeyExpired,
  DifferentExternalIdentifierError,
} = require('../../../../../lib/domain/errors');

describe('Integration | Application | Route | OidcRouter', function () {
  let server;

  describe('GET /api/oidc/redirect-logout-url', function () {
    beforeEach(async function () {
      sinon.stub(oidcController, 'getRedirectLogoutUrl').callsFake((request, h) => h.response('ok').code(200));
      server = new HttpTestServer();
      server.setupAuthentication();
      await server.register(moduleUnderTest);
    });

    it('should return a response with HTTP status code 200', async function () {
      // given & when
      const { statusCode } = await server.requestObject({
        method: 'GET',
        url: '/api/oidc/redirect-logout-url?identity_provider=POLE_EMPLOI&logout_url_uuid=b45cb781-4e9a-49b6-8c7e-ff5f02e07720',
        headers: { authorization: generateValidRequestAuthorizationHeader() },
      });

      // then
      expect(statusCode).to.equal(200);
    });

    context('when missing required parameters', function () {
      context('all', function () {
        it('should return a response with HTTP status code 400', async function () {
          // given & when
          const { statusCode } = await server.requestObject({
            method: 'GET',
            url: '/api/oidc/redirect-logout-url',
            headers: { authorization: generateValidRequestAuthorizationHeader() },
          });

          // then
          expect(statusCode).to.equal(400);
        });
      });

      context('identity_provider', function () {
        it('should return a response with HTTP status code 400', async function () {
          // given & when
          const { statusCode } = await server.requestObject({
            method: 'GET',
            url: '/api/oidc/redirect-logout-url?logout_url_uuid=b45cb781-4e9a-49b6-8c7e-ff5f02e07720',
            headers: { authorization: generateValidRequestAuthorizationHeader() },
          });

          // then
          expect(statusCode).to.equal(400);
        });
      });

      context('logout_url_uuid', function () {
        it('should return a response with HTTP status code 400', async function () {
          // given & when
          const { statusCode } = await server.requestObject({
            method: 'GET',
            url: '/api/oidc/redirect-logout-url?identity_provider=POLE_EMPLOI',
            headers: { authorization: generateValidRequestAuthorizationHeader() },
          });

          // then
          expect(statusCode).to.equal(400);
        });
      });
    });

    context('when identity_provider parameter is not POLE_EMPLOI', function () {
      it('should return a response with HTTP status code 400', async function () {
        // given & when
        const { statusCode } = await server.requestObject({
          method: 'GET',
          url: '/api/oidc/redirect-logout-url?identity_provider=MY_IDP&logout_url_uuid=b45cb781-4e9a-49b6-8c7e-ff5f02e07720',
          headers: { authorization: generateValidRequestAuthorizationHeader() },
        });

        // then
        expect(statusCode).to.equal(400);
      });
    });
  });

  describe('POST /api/oidc/token-reconciliation', function () {
    context('error cases', function () {
      context('when user is not found', function () {
        it('should return a response with HTTP status code 404', async function () {
          // given
          sinon.stub(oidcController, 'findUserForReconciliation').rejects(new UserNotFoundError());
          const httpTestServer = new HttpTestServer();
          featureToggles.isSsoAccountReconciliationEnabled = true;
          httpTestServer.setupAuthentication();
          await httpTestServer.register(moduleUnderTest);

          const response = await httpTestServer.requestObject({
            method: 'POST',
            url: '/api/oidc/token-reconciliation',
            payload: {
              data: {
                attributes: {
                  email: 'eva.poree@example.net',
                  password: 'pix123',
                  'identity-provider': 'POLE_EMPLOI',
                  'authentication-key': '123abc',
                },
              },
            },
          });

          // then
          expect(response.statusCode).to.equal(404);
          expect(response.result.errors[0].detail).to.equal('Ce compte est introuvable.');
        });
      });

      context('when authentication key expired', function () {
        it('should return a response with HTTP status code 401', async function () {
          // given
          sinon.stub(oidcController, 'findUserForReconciliation').rejects(new AuthenticationKeyExpired());
          const httpTestServer = new HttpTestServer();
          featureToggles.isSsoAccountReconciliationEnabled = true;
          httpTestServer.setupAuthentication();
          await httpTestServer.register(moduleUnderTest);

          const response = await httpTestServer.request('POST', `/api/oidc/token-reconciliation`, {
            data: {
              attributes: {
                email: 'eva.poree@example.net',
                password: 'pix123',
                'identity-provider': 'POLE_EMPLOI',
                'authentication-key': '123abc',
              },
            },
          });

          // then
          expect(response.statusCode).to.equal(401);
          expect(response.result.errors[0].detail).to.equal('This authentication key has expired.');
        });
      });

      context('when external identity id and external identifier are different', function () {
        it('should return a response with HTTP status code 412', async function () {
          // given
          sinon.stub(oidcController, 'findUserForReconciliation').rejects(new DifferentExternalIdentifierError());
          const httpTestServer = new HttpTestServer();
          featureToggles.isSsoAccountReconciliationEnabled = true;
          httpTestServer.setupAuthentication();
          await httpTestServer.register(moduleUnderTest);

          const response = await httpTestServer.request('POST', `/api/oidc/token-reconciliation`, {
            data: {
              attributes: {
                email: 'eva.poree@example.net',
                password: 'pix123',
                'identity-provider': 'POLE_EMPLOI',
                'authentication-key': '123abc',
              },
            },
          });

          // then
          expect(response.statusCode).to.equal(412);
          expect(response.result.errors[0].detail).to.equal(
            "La valeur de l'externalIdentifier de la méthode de connexion ne correspond pas à celui reçu par le partenaire."
          );
        });
      });
    });
  });
});