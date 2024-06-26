const { expect, sinon } = require('../../../test-helper');
const certificationCandidateRepository = require('../../../../lib/infrastructure/repositories/certification-candidate-repository');
const getSessionCertificationCandidates = require('../../../../lib/domain/usecases/get-session-certification-candidates');

describe('Unit | Domain | Use Cases | get-session-certification-candidates', function () {
  const sessionId = 'sessionId';
  const certificationCandidates = 'candidates';

  beforeEach(function () {
    // given
    sinon
      .stub(certificationCandidateRepository, 'findBySessionId')
      .withArgs(sessionId)
      .resolves(certificationCandidates);
  });

  it('should return the certification candidates', async function () {
    // when
    const actualCandidates = await getSessionCertificationCandidates({ sessionId, certificationCandidateRepository });

    // then
    expect(actualCandidates).to.equal(certificationCandidates);
  });
});
