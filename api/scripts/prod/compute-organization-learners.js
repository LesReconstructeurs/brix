// Usage: node compute-organization-learners.js

const { knex } = require('../../db/knex-database-connection');
const bluebird = require('bluebird');
const DomainTransaction = require('../../lib/infrastructure/DomainTransaction');
const campaignParticipationRepository = require('../../lib/infrastructure/repositories/campaign-participation-repository');
const schoolingRegistrationRepository = require('../../lib/infrastructure/repositories/schooling-registration-repository');

let count;
let total;
let logEnable;
async function computeOrganizationLearners(concurrency = 1, log = true) {
  logEnable = log;
  const campaignParticipations = await knex('campaign-participations')
    .select(
      'campaign-participations.id',
      'campaign-participations.userId',
      'campaigns.organizationId',
      'users.firstName',
      'users.lastName',
      'organizations.isManagingStudents'
    )
    .join('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
    .join('users', 'users.id', 'campaign-participations.userId')
    .join('organizations', 'organizations.id', 'campaigns.organizationId')
    .leftJoin('schooling-registrations', function () {
      this.on({ 'campaign-participations.userId': 'schooling-registrations.userId' }).andOn({
        'campaigns.organizationId': 'schooling-registrations.organizationId',
      });
    })
    .where({ 'campaign-participations.schoolingRegistrationId': null });
  count = 0;
  total = campaignParticipations.length;
  _log(`Participations à traiter : ${total}`);

  await bluebird.map(campaignParticipations, _computeOrganizationLearners, { concurrency });
}

async function _computeOrganizationLearners(campaignParticipation) {
  await DomainTransaction.execute(async (domainTransaction) => {
    const schoolingRegistrationId = await _getOrCreateTrainee({ campaignParticipation, domainTransaction });
    await campaignParticipationRepository.update(
      { id: campaignParticipation.id, schoolingRegistrationId },
      domainTransaction
    );
  });

  count++;
  _log(`${count} / ${total}`);
}

async function _getOrCreateTrainee({ campaignParticipation, domainTransaction }) {
  const { userId, organizationId, firstName, lastName, isManagingStudents } = campaignParticipation;
  const schoolingRegistration = await schoolingRegistrationRepository.findOneByUserIdAndOrganizationId({
    userId,
    organizationId,
    domainTransaction,
  });
  if (schoolingRegistration) {
    return schoolingRegistration.id;
  }

  const [newlyCreatedSchoolingRegistrationId] = await domainTransaction
    .knexTransaction('schooling-registrations')
    .insert({ userId, organizationId, firstName, lastName, isDisabled: isManagingStudents })
    .returning('id');
  return newlyCreatedSchoolingRegistrationId;
}

module.exports = computeOrganizationLearners;

let exitCode;
const SUCCESS = 0;
const FAILURE = 1;
const concurrency = parseInt(process.argv[2]);

if (require.main === module) {
  computeOrganizationLearners(concurrency).then(handleSuccess).catch(handleError).finally(exit);
}

function handleSuccess() {
  exitCode = SUCCESS;
}

function handleError(err) {
  console.error(err);
  exitCode = FAILURE;
}

function exit() {
  console.log('code', exitCode);
  process.exit(exitCode);
}

function _log(message) {
  if (logEnable) {
    console.log(message);
  }
}
