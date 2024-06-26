const { sinon, expect, domainBuilder, catchErr } = require('../../../test-helper');
const { UserNotAuthorizedToAccessEntityError } = require('../../../../lib/domain/errors');
const CampaignParticipationResultsShared = require('../../../../lib/domain/events/CampaignParticipationResultsShared');
const shareCampaignResult = require('../../../../lib/domain/usecases/share-campaign-result');

describe('Unit | UseCase | share-campaign-result', function () {
  let campaignParticipationRepository;
  let userId;
  let campaignParticipationId;

  beforeEach(function () {
    campaignParticipationRepository = {
      get: sinon.stub(),
      updateWithSnapshot: sinon.stub(),
    };
    userId = 123;
    campaignParticipationId = 456;
  });

  context('when user is not the owner of the campaign participation', function () {
    it('throws a UserNotAuthorizedToAccessEntityError error ', async function () {
      // given
      const domainTransaction = Symbol('transaction');
      campaignParticipationRepository.get.resolves({ userId: userId + 1 });

      // when
      const error = await catchErr(shareCampaignResult)({
        userId,
        campaignParticipationId,
        campaignParticipationRepository,
        domainTransaction,
      });

      // then
      expect(error).to.be.instanceOf(UserNotAuthorizedToAccessEntityError);
    });
  });

  context('when user is the owner of the campaign participation', function () {
    it('updates the campaign participation', async function () {
      // given
      const domainTransaction = Symbol('transaction');
      const campaignParticipation = domainBuilder.buildCampaignParticipation({ id: campaignParticipationId, userId });
      sinon.stub(campaignParticipation, 'share');
      campaignParticipationRepository.get
        .withArgs(campaignParticipationId, domainTransaction)
        .resolves(campaignParticipation);

      // when
      await shareCampaignResult({
        userId,
        campaignParticipationId,
        campaignParticipationRepository,
        domainTransaction,
      });

      // then
      expect(campaignParticipation.share).to.have.been.called;
      expect(campaignParticipationRepository.updateWithSnapshot).to.have.been.calledWithExactly(
        campaignParticipation,
        domainTransaction
      );
    });

    it('returns the CampaignParticipationResultsShared event', async function () {
      // given
      const domainTransaction = Symbol('transaction');
      const campaignParticipation = domainBuilder.buildCampaignParticipation({ id: campaignParticipationId, userId });
      sinon.stub(campaignParticipation, 'share');

      campaignParticipationRepository.get.resolves(campaignParticipation);

      // when
      const actualEvent = await shareCampaignResult({
        userId,
        campaignParticipationId,
        campaignParticipationRepository,
        domainTransaction,
      });

      // then
      expect(actualEvent).to.deep.equal({ campaignParticipationId });
      expect(actualEvent).to.be.instanceOf(CampaignParticipationResultsShared);
    });
  });
});
