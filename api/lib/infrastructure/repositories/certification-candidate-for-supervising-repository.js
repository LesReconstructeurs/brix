const { knex } = require('../../../db/knex-database-connection');
const { NotFoundError } = require('../../domain/errors');
const CertificationCandidateForSupervising = require('../../domain/models/CertificationCandidateForSupervising');

module.exports = {
  async get(certificationCandidateId) {
    const result = await knex('certification-candidates')
      .select('certification-candidates.*', 'assessments.state AS assessmentStatus')
      .leftJoin('certification-courses', function () {
        this.on('certification-courses.sessionId', '=', 'certification-candidates.sessionId');
        this.on('certification-courses.userId', '=', 'certification-candidates.userId');
      })
      .leftJoin('assessments', 'assessments.certificationCourseId', 'certification-courses.id')
      .where({ 'certification-candidates.id': certificationCandidateId })
      .first();
    return new CertificationCandidateForSupervising({ ...result });
  },

  async update(certificationCandidateForSupervising) {
    const result = await knex('certification-candidates')
      .where({
        id: certificationCandidateForSupervising.id,
      })
      .update({ authorizedToStart: certificationCandidateForSupervising.authorizedToStart });

    if (result === 0) {
      throw new NotFoundError('Aucun candidat trouvé');
    }
  },
};
