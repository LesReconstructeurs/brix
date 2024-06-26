const _ = require('lodash');
const { SCO_MIDDLE_SCHOOL_ID } = require('../../db/seeds/data/organizations-sco-builder');
const OrganizationLearner = require('../../lib/domain/models/OrganizationLearner');
const { OrganizationLearnersCouldNotBeSavedError } = require('../../lib/domain/errors');
const DomainTransaction = require('../../lib/infrastructure/DomainTransaction');
const { knex, disconnect } = require('../../db/knex-database-connection');

function _buildOrganizationLearner(iteration) {
  const birthdates = ['2001-01-05', '2002-11-15', '1995-06-25'];
  const divisions = ['5eme', '4eme', '3eme'];
  return new OrganizationLearner({
    firstName: `someFirstName${iteration}`,
    lastName: `someLastName${iteration}`,
    birthdate: birthdates[_.random(0, 2)],
    division: divisions[_.random(0, 2)],
    organizationId: SCO_MIDDLE_SCHOOL_ID,
  });
}

async function addManyStudentsToScoCertificationCenter(numberOfStudents) {
  const manyStudents = _.times(numberOfStudents, _buildOrganizationLearner);
  try {
    await knex
      .batchInsert('organization-learners', manyStudents)
      .transacting(DomainTransaction.emptyTransaction().knexTransaction);
  } catch (err) {
    throw new OrganizationLearnersCouldNotBeSavedError();
  }
}

const isLaunchedFromCommandLine = require.main === module;

async function main() {
  console.log('Starting adding SCO students to certification center.');

  const numberOfStudents = process.argv[2];

  await addManyStudentsToScoCertificationCenter(numberOfStudents);

  console.log('\nDone.');
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      console.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

module.exports = {
  addManyStudentsToScoCertificationCenter,
};
