const { expect, sinon, catchErr } = require('../../../test-helper');
const { handleChallengeRequested } = require('../../../../lib/domain/events')._forTestOnly.handlers;
const ChallengeRequested = require('../../../../lib/domain/events/ChallengeRequested');

describe('Unit | Domain | Events | handle-challenge-requested', () => {

  describe('#handleChallengeRequested', () => {
    const now = new Date('2019-01-01T05:06:07Z');
    let clock;

    beforeEach(() => {
      clock = sinon.useFakeTimers(now);
    });

    afterEach(() => {
      clock.restore();
    });

    const domainTransaction = Symbol('a DomainTransaction');

    const assessmentRepository = {
      updateLastQuestionDate: sinon.stub(),
    };
    const dependencies = {
      assessmentRepository,
    };

    it('fails when event is not of correct type', async () => {
      // given
      const event = 'not an event of the correct type';
      // when / then
      const error = await catchErr(handleChallengeRequested)(
        { event, ...dependencies, domainTransaction },
      );

      // then
      expect(error).not.to.be.null;
    });

    it('updates assessment lastQuestionDate', async () => {
      // given
      const event = new ChallengeRequested({ assessmentId: 'assessmentId' });
      const lastQuestionDate = new Date();

      // when
      await handleChallengeRequested({ event, ...dependencies, domainTransaction });

      // then
      expect(assessmentRepository.updateLastQuestionDate).to.be.calledWith({ id: 'assessmentId', lastQuestionDate });
    });
  });
});

