const { expect, databaseBuilder, domainBuilder, mockLearningContent, knex } = require('../../../test-helper');
const _ = require('lodash');

const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const organizationRepository = require('../../../../lib/infrastructure/repositories/organization-repository');
const organizationService = require('../../../../lib/domain/services/organization-service');

const createCampaign = require('../../../../lib/domain/usecases/create-campaign');

const Campaign = require('../../../../lib/domain/models/Campaign');

describe('Integration | UseCases | create-campaign', () => {

  let userId;
  let organizationId;
  let targetProfileId;

  beforeEach(async () => {
    organizationId = databaseBuilder.factory.buildOrganization({ canCollectProfiles: true }).id;
    userId = databaseBuilder.factory.buildUser().id;

    targetProfileId = databaseBuilder.factory.buildTargetProfile({ ownerOrganizationId: organizationId }).id;

    databaseBuilder.factory.buildMembership({
      organizationId, userId,
    });

    await databaseBuilder.commit();

    const learningContent = {
      skills: [{ id: 'recSkill1' }],
    };

    mockLearningContent(learningContent);
  });

  afterEach(() => {
    return knex('campaigns').delete();
  });

  it('should save a new campaign of type ASSESSMENT', async () => {
    // given
    const campaign = domainBuilder.buildCampaign.ofTypeAssessment({ creatorId: userId, organizationId, targetProfileId });

    const expectedAttributes = ['type', 'title', 'idPixLabel', 'name', 'organizationId',
      'creatorId', 'isRestricted', 'customLandingPageText', 'archivedAt', 'campaignCollectiveResult', 'campaignReport',
      'organizationLogoUrl', 'organizationName', 'targetProfileId' ];

    // when
    const result = await createCampaign({ campaign, campaignRepository, userRepository, organizationRepository, organizationService });

    // then
    expect(result).to.be.an.instanceOf(Campaign);

    expect(_.pick(result, expectedAttributes)).to.deep.equal(_.pick(campaign, expectedAttributes));

    expect('code').to.be.ok;
    expect('id').to.be.ok;
  });

  it('should save a new campaign of type PROFILES_COLLECTION', async () => {
    // given
    const campaign = domainBuilder.buildCampaign.ofTypeProfilesCollection({ creatorId: userId, organizationId });

    const expectedAttributes = ['type', 'title', 'idPixLabel', 'name', 'organizationId',
      'creatorId', 'isRestricted', 'customLandingPageText', 'archivedAt', 'campaignCollectiveResult', 'campaignReport',
      'organizationLogoUrl', 'organizationName', 'targetProfile', 'targetProfileId' ];

    // when
    const result = await createCampaign({ campaign, campaignRepository, userRepository, organizationRepository, organizationService });

    // then
    expect(result).to.be.an.instanceOf(Campaign);

    expect(_.pick(result, expectedAttributes)).to.deep.equal(_.pick(campaign, expectedAttributes));

    expect('code').to.be.ok;
    expect('id').to.be.ok;

  });
});
