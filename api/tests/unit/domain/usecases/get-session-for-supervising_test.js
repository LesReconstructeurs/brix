const { expect, sinon, domainBuilder } = require('../../../test-helper');
const getSessionForSupervising = require('../../../../lib/domain/usecases/get-session-for-supervising');

describe('Unit | UseCase | get-session-for-supervising', function () {
  context('when the session exists', function () {
    it('should fetch and return the session from repository', async function () {
      // given
      const expectedSession = domainBuilder.buildSessionForSupervising();
      const sessionForSupervisingRepository = { get: sinon.stub() };
      sessionForSupervisingRepository.get.resolves(expectedSession);

      // when
      const actualSession = await getSessionForSupervising({ sessionId: 1, sessionForSupervisingRepository });

      // then
      expect(actualSession).to.equal(expectedSession);
    });
  });
});
