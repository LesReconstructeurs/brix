const _ = require('lodash');
const { knex } = require('../../../db/knex-database-connection');
const ShareableCertificate = require('../../domain/models/ShareableCertificate');
const AssessmentResult = require('../../domain/models/AssessmentResult');

const { NotFoundError } = require('../../../lib/domain/errors');
const competenceTreeRepository = require('./competence-tree-repository');
const ResultCompetenceTree = require('../../domain/models/ResultCompetenceTree');
const CertifiedBadges = require('../../domain/read-models/CertifiedBadges');

module.exports = {
  async getByVerificationCode(verificationCode, { locale } = {}) {
    const shareableCertificateDTO = await _selectShareableCertificates()
      .groupBy('certification-courses.id', 'sessions.id', 'assessments.id', 'assessment-results.id')
      .where({ verificationCode })
      .first();

    if (!shareableCertificateDTO) {
      throw new NotFoundError(`There is no certification course with verification code "${verificationCode}"`);
    }

    const competenceTree = await competenceTreeRepository.get({ locale });

    const certifiedBadges = await _getCertifiedBadges(shareableCertificateDTO.id);

    return _toDomain({ shareableCertificateDTO, competenceTree, certifiedBadges });
  },
};

function _selectShareableCertificates() {
  return knex
    .select({
      id: 'certification-courses.id',
      firstName: 'certification-courses.firstName',
      lastName: 'certification-courses.lastName',
      birthdate: 'certification-courses.birthdate',
      birthplace: 'certification-courses.birthplace',
      isPublished: 'certification-courses.isPublished',
      userId: 'certification-courses.userId',
      date: 'certification-courses.createdAt',
      deliveredAt: 'sessions.publishedAt',
      certificationCenter: 'sessions.certificationCenter',
      maxReachableLevelOnCertificationDate: 'certification-courses.maxReachableLevelOnCertificationDate',
      pixScore: 'assessment-results.pixScore',
      assessmentResultId: 'assessment-results.id',
      competenceMarks: knex.raw(`
        json_agg(
          json_build_object('score', "competence-marks".score, 'level', "competence-marks".level, 'competence_code', "competence-marks"."competence_code")
          ORDER BY "competence-marks"."competence_code" asc
        )`),
    })
    .from('certification-courses')
    .join('assessments', 'assessments.certificationCourseId', 'certification-courses.id')
    .join('assessment-results', 'assessment-results.assessmentId', 'assessments.id')
    .join('competence-marks', 'competence-marks.assessmentResultId', 'assessment-results.id')
    .join('sessions', 'sessions.id', 'certification-courses.sessionId')
    .modify(_filterMostRecentValidatedAssessmentResult)
    .where('certification-courses.isPublished', true)
    .where('certification-courses.isCancelled', false);
}

function _filterMostRecentValidatedAssessmentResult(qb) {
  return qb
    .whereNotExists(
      knex
        .select(1)
        .from({ 'last-assessment-results': 'assessment-results' })
        .where('last-assessment-results.status', AssessmentResult.status.VALIDATED)
        .whereRaw('"last-assessment-results"."assessmentId" = assessments.id')
        .whereRaw('"assessment-results"."createdAt" < "last-assessment-results"."createdAt"')
    )
    .where('assessment-results.status', AssessmentResult.status.VALIDATED);
}

async function _getCertifiedBadges(certificationCourseId) {
  const complementaryCertificationCourseResults = await knex
    .select(
      'complementary-certification-course-results.partnerKey',
      'complementary-certification-course-results.source',
      'complementary-certification-course-results.acquired',
      'complementary-certification-course-results.complementaryCertificationCourseId',
      'complementary-certification-badges.imageUrl',
      'complementary-certification-badges.label',
      'complementary-certification-badges.level',
      'complementary-certification-badges.certificateMessage',
      'complementary-certification-badges.temporaryCertificateMessage',
      'complementary-certifications.hasExternalJury'
    )
    .from('complementary-certification-course-results')
    .innerJoin(
      'complementary-certification-courses',
      'complementary-certification-courses.id',
      'complementary-certification-course-results.complementaryCertificationCourseId'
    )
    .innerJoin('badges', 'badges.key', 'complementary-certification-course-results.partnerKey')
    .innerJoin('complementary-certification-badges', 'complementary-certification-badges.badgeId', 'badges.id')
    .innerJoin(
      'complementary-certifications',
      'complementary-certifications.id',
      'complementary-certification-badges.complementaryCertificationId'
    )
    .where({ certificationCourseId })
    .orderBy('partnerKey');

  return new CertifiedBadges({
    complementaryCertificationCourseResults,
  }).getAcquiredCertifiedBadgesDTO();
}

function _toDomain({ shareableCertificateDTO, competenceTree, certifiedBadges }) {
  const resultCompetenceTree = ResultCompetenceTree.generateTreeFromCompetenceMarks({
    competenceTree,
    competenceMarks: _.compact(shareableCertificateDTO.competenceMarks),
    certificationId: shareableCertificateDTO.id,
    assessmentResultId: shareableCertificateDTO.assessmentResultId,
  });

  return new ShareableCertificate({
    ...shareableCertificateDTO,
    resultCompetenceTree,
    certifiedBadgeImages: certifiedBadges,
  });
}
