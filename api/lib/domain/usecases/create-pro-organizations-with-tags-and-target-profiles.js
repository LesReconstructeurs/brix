const { isEmpty, uniqBy } = require('lodash');
const bluebird = require('bluebird');
const Organization = require('../models/Organization');
const OrganizationTag = require('../models/OrganizationTag');
const organizationValidator = require('../validators/organization-with-tags-and-target-profiles-script');

const {
  ManyOrganizationsFoundError,
  OrganizationAlreadyExistError,
  OrganizationTagNotFound,
  ObjectValidationError,
  TargetProfileInvalidError,
} = require('../errors');

const SEPARATOR = '_';
const organizationInvitationService = require('../../domain/services/organization-invitation-service');

module.exports = async function createProOrganizationsWithTagsAndTargetProfiles({
  organizations,
  domainTransaction,
  organizationRepository,
  tagRepository,
  targetProfileShareRepository,
  organizationTagRepository,
  organizationInvitationRepository,
}) {
  if (isEmpty(organizations)) {
    throw new ObjectValidationError('Les organisations ne sont pas renseignées.');
  }

  _checkIfOrganizationsDataAreUnique(organizations);

  for (const organization of organizations) {
    organizationValidator.validate(organization);
  }

  await _checkIfOrganizationsAlreadyExistInDatabase(organizations, organizationRepository);

  const organizationsData = _mapOrganizationsData(organizations);

  const allTags = await tagRepository.findAll();

  let createdOrganizations = null;

  await domainTransaction.execute(async (domainTransaction) => {
    const organizationsToCreate = Array.from(organizationsData.values()).map((data) => data.organization);

    createdOrganizations = await organizationRepository.batchCreateProOrganizations(
      organizationsToCreate,
      domainTransaction
    );

    const organizationsTags = createdOrganizations.flatMap(({ id, externalId, name }) => {
      return organizationsData.get(externalId).tags.map((tagName) => {
        const foundTag = allTags.find((tagInDB) => tagInDB.name === tagName.toUpperCase());
        if (foundTag) {
          return new OrganizationTag({ organizationId: id, tagId: foundTag.id });
        } else {
          throw new OrganizationTagNotFound(`Le tag ${tagName} de l'organisation ${name} n'existe pas.`);
        }
      });
    });

    await organizationTagRepository.batchCreate(organizationsTags, domainTransaction);

    const organizationsTargetProfiles = createdOrganizations.flatMap(({ id, externalId }) => {
      return organizationsData
        .get(externalId)
        .targetProfiles.map((targetProfileId) => ({ organizationId: id, targetProfileId }));
    });

    try {
      await targetProfileShareRepository.batchAddTargetProfilesToOrganization(
        organizationsTargetProfiles,
        domainTransaction
      );
    } catch (error) {
      if (error.constraint === 'target_profile_shares_targetprofileid_foreign') {
        const targetProfileId = error.detail.match(/\d+/g);
        throw new TargetProfileInvalidError(`Le profil cible ${targetProfileId} n'existe pas.`);
      }
      throw error;
    }
  });

  const createdOrganizationsWithEmail = createdOrganizations
    .map(({ id, externalId, name }) => {
      const { organization } = organizationsData.get(externalId);
      return {
        email: organization?.email,
        externalId,
        id,
        name,
      };
    })
    .filter((organization) => !!organization.email);

  await bluebird.mapSeries(createdOrganizationsWithEmail, (organization) => {
    const { locale, organizationInvitationRole } = organizationsData.get(organization.externalId);
    return organizationInvitationService.createProOrganizationInvitation({
      organizationRepository,
      organizationInvitationRepository,
      organizationId: organization.id,
      name: organization.name,
      email: organization.email,
      role: organizationInvitationRole?.toUpperCase(),
      locale,
    });
  });

  return createdOrganizations;
};

function _checkIfOrganizationsDataAreUnique(organizations) {
  const uniqOrganizations = uniqBy(organizations, 'externalId');

  if (uniqOrganizations.length !== organizations.length) {
    throw new ManyOrganizationsFoundError('Une organisation apparaît plusieurs fois.');
  }
}

async function _checkIfOrganizationsAlreadyExistInDatabase(organizations, organizationRepository) {
  const foundOrganizations = await organizationRepository.findByExternalIdsFetchingIdsOnly(
    organizations.map((organization) => organization.externalId)
  );

  if (!isEmpty(foundOrganizations)) {
    const foundOrganizationIds = foundOrganizations.map((foundOrganization) => foundOrganization.externalId);
    const message = `Les organisations avec les externalIds suivants : ${foundOrganizationIds.join(
      ', '
    )} existent déjà.`;
    throw new OrganizationAlreadyExistError(message);
  }
}

function _mapOrganizationsData(organizations) {
  const mapOrganizationByExternalId = new Map();

  for (const organization of organizations) {
    mapOrganizationByExternalId.set(organization.externalId, {
      organization: new Organization({
        ...organization,
        type: Organization.types.PRO,
      }),
      tags: organization.tags.split(SEPARATOR),
      targetProfiles: organization.targetProfiles.split(SEPARATOR).filter((targetProfile) => !!targetProfile.trim()),
      organizationInvitationRole: organization.organizationInvitationRole,
      locale: organization.locale,
    });
  }

  return mapOrganizationByExternalId;
}