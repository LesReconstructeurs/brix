const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize({ organizationParticipants, pagination }) {
    return new Serializer('organization-participants', {
      id: 'id',
      attributes: ['firstName', 'lastName', 'participationCount'],
      meta: pagination,
    }).serialize(organizationParticipants);
  },
};