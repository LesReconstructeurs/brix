const buildCertificationCourse = require('./build-certification-course');
const buildUser = require('./build-user');
const databaseBuffer = require('../database-buffer');
const Assessment = require('../../../lib/domain/models/Assessment');
const _ = require('lodash');

module.exports = function buildAssessment({
  id = databaseBuffer.getNextId(),
  courseId = 'recDefaultCourseId',
  certificationCourseId,
  userId,
  type = Assessment.types.COMPETENCE_EVALUATION,
  state = Assessment.states.COMPLETED,
  isImproving = false,
  lastQuestionDate = new Date(),
  lastChallengeId = null,
  lastQuestionState = Assessment.statesOfLastQuestion.ASKED,
  competenceId = 'recCompetenceId',
  campaignParticipationId = null,
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2020-01-02'),
  method,
} = {}) {
  if (type !== Assessment.types.DEMO) {
    userId = _.isUndefined(userId) ? buildUser().id : userId;
  }

  if (type === Assessment.types.CERTIFICATION) {
    certificationCourseId = _.isUndefined(certificationCourseId)
      ? buildCertificationCourse({ userId }).id
      : certificationCourseId;
  }

  const values = {
    id,
    courseId,
    certificationCourseId,
    userId,
    type,
    isImproving,
    state,
    lastQuestionDate,
    lastChallengeId,
    lastQuestionState,
    createdAt,
    updatedAt,
    competenceId,
    campaignParticipationId,
    method,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'assessments',
    values,
  });
};
