const _ = require('lodash');
const bluebird = require('bluebird');
const skillRepository = require('../../../../lib/infrastructure/repositories/skill-repository');
const competenceRepository = require('../../../../lib/infrastructure/repositories/competence-repository');
const challengeRepository = require('../../../../lib/infrastructure/repositories/challenge-repository');
let allChallenges = [];
let allPixCompetences = [];
let allDroitCompetences = [];
const skillsByCompetenceId = {};

async function makeUserPixCertifiable({ userId, countCertifiableCompetences, levelOnEachCompetence, databaseBuilder }) {
  await _cacheLearningContent();
  const pickedCompetences = _pickRandomPixCompetences(countCertifiableCompetences);
  _.each(pickedCompetences, (competence) => {
    _makePixCompetenceCertifiable({ userId, databaseBuilder, competence, levelOnEachCompetence });
  });
}

async function makeUserPixDroitCertifiable({ userId, databaseBuilder }) {
  await _cacheLearningContent();
  _.each(allDroitCompetences, (competence) => {
    _makePlusCompetenceCertifiable({ userId, databaseBuilder, competence });
  });
}

async function _cacheLearningContent() {
  if (allChallenges.length === 0) {
    const allCompetences = await competenceRepository.list();
    allChallenges = await challengeRepository.list();
    allPixCompetences = _.filter(allCompetences, { origin: 'Pix' });
    allDroitCompetences = _.filter(allCompetences, { origin: 'Droit' });
    await bluebird.mapSeries(allCompetences, async (competence) => {
      skillsByCompetenceId[competence.id] = await skillRepository.findActiveByCompetenceId(competence.id);
    });
  }
}

function _pickRandomPixCompetences(countCompetences) {
  const shuffledCompetences = _.sortBy(allPixCompetences, () => _.random(0, 100));
  return _.slice(shuffledCompetences, 0, countCompetences);
}

function _makePixCompetenceCertifiable({ databaseBuilder, userId, competence, levelOnEachCompetence }) {
  const skillsToValidate = _findSkillsToValidateSpecificLevel(competence, levelOnEachCompetence);
  const assessmentId = databaseBuilder.factory.buildAssessment({
    userId,
    type: 'COMPETENCE_EVALUATION',
    state: 'completed',
  }).id;
  _.each(skillsToValidate, (skill) => {
    _addAnswerAndKnowledgeElementForSkill({ assessmentId, userId, skill, databaseBuilder });
  });
}

function _makePlusCompetenceCertifiable({ databaseBuilder, userId, competence }) {
  const skillsToValidate = skillsByCompetenceId[competence.id];
  const assessmentId = databaseBuilder.factory.buildAssessment({
    userId,
    type: 'COMPETENCE_EVALUATION',
    state: 'completed',
  }).id;
  _.each(skillsToValidate, (skill) => {
    _addAnswerAndKnowledgeElementForSkill({ assessmentId, userId, skill, databaseBuilder });
  });
}

function _findSkillsToValidateSpecificLevel(competence, expectedLevel) {
  const skills = skillsByCompetenceId[competence.id];
  const orderedByDifficultySkills = _(skills)
    .map((skill) => {
      skill.difficulty = parseInt(skill.name.slice(-1));
      return skill;
    })
    .sortBy('difficulty')
    .value();
  const pickedSkills = [];
  let pixScore = 0;
  while ((pixScore < 8 * expectedLevel || pickedSkills.length < 3) && orderedByDifficultySkills.length > 0) {
    const currentSkill = orderedByDifficultySkills.shift();
    pixScore += currentSkill.pixValue;
    pickedSkills.push(currentSkill);
  }
  return pickedSkills;
}

function _addAnswerAndKnowledgeElementForSkill({ assessmentId, userId, skill, databaseBuilder }) {
  const challenge = _findFirstChallengeValidatedBySkillId(skill.id);
  const answerId = databaseBuilder.factory.buildAnswer({
    value: 'dummy value',
    result: 'ok',
    assessmentId,
    challengeId: challenge.id,
    createdAt: new Date(),
    updatedAt: new Date(),
    timeout: null,
    resultDetails: 'dummy value',
  }).id;
  databaseBuilder.factory.buildKnowledgeElement({
    source: 'direct',
    status: 'validated',
    answerId,
    assessmentId,
    skillId: skill.id,
    createdAt: new Date(),
    earnedPix: skill.pixValue,
    userId,
    competenceId: skill.competenceId,
  });
}

function _findFirstChallengeValidatedBySkillId(skillId) {
  return _.find(allChallenges, { status: 'validé', skill: { id: skillId } });
}

module.exports = { makeUserPixCertifiable, makeUserPixDroitCertifiable };