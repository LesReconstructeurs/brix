const buildAssessment = require('./build-assessment');
const buildUser = require('./build-user');
const buildCampaignParticipation = require('./build-campaign-participation');
const buildOrganizationLearner = require('./build-organization-learner');

module.exports = function buildAssessmentFromParticipation(campaignParticipation, organizationLearner, user) {
  const userId = buildUser(user).id;
  const organizationLearnerId = buildOrganizationLearner(organizationLearner).id;
  const campaignParticipationId = buildCampaignParticipation({
    ...campaignParticipation,
    userId,
    organizationLearnerId,
  }).id;

  return buildAssessment({ userId, campaignParticipationId });
};
