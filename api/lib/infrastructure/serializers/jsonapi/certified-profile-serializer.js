const { Serializer } = require('jsonapi-serializer');
const kebabCase = require('lodash/kebabCase');

const typeForAttribute = (attribute) => {
  return kebabCase(attribute);
};

module.exports = {
  serialize(certifiedProfile) {
    return new Serializer('certified-profiles', {
      typeForAttribute,
      attributes: ['userId', 'certifiedSkills', 'certifiedTubes', 'certifiedCompetences', 'certifiedAreas'],
      certifiedSkills: {
        ref: 'id',
        included: true,
        attributes: ['name', 'tubeId', 'hasBeenAskedInCertif', 'difficulty'],
      },
      certifiedTubes: {
        ref: 'id',
        included: true,
        attributes: ['name', 'competenceId'],
      },
      certifiedCompetences: {
        ref: 'id',
        included: true,
        attributes: ['name', 'areaId', 'origin'],
      },
      certifiedAreas: {
        ref: 'id',
        included: true,
        attributes: ['name', 'color'],
      },
    }).serialize(certifiedProfile);
  },
};
