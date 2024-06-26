const { UserNotAuthorizedToAccessEntityError } = require('../errors');
const Scorecard = require('../models/Scorecard');

module.exports = async function getScorecard({
  authenticatedUserId,
  scorecardId,
  scorecardService,
  competenceRepository,
  competenceEvaluationRepository,
  knowledgeElementRepository,
  locale,
}) {
  const { userId, competenceId } = Scorecard.parseId(scorecardId);

  if (authenticatedUserId !== userId) {
    throw new UserNotAuthorizedToAccessEntityError();
  }

  return scorecardService.computeScorecard({
    userId: authenticatedUserId,
    competenceId,
    competenceRepository,
    competenceEvaluationRepository,
    knowledgeElementRepository,
    locale,
  });
};
